const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const Joi = require('joi');

const app = express();
const port = 3009;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// SQLite database connection
const db = new sqlite3.Database('./src/db/database.db', (err) => {
  if (err) {
    console.error('Error when connecting to database:', err.message);
  } else {
    console.log('Connected to the database successfully');
  }
});

// Validation schemas
// login min char = 1, password = 1
const loginSchema = Joi.object({
  login: Joi.string().min(1).required(),
  password: Joi.string().min(1).required(),
});

const workSchema = Joi.object({
  userId: Joi.number().integer().required(),
  startDate: Joi.date().iso().required(),
  startTime: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).required(), // 24-hour time format
  endDate: Joi.date().iso().required(),
  endTime: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).required(), // 24-hour time format
  workType: Joi.string().required(),
  additionalInfo: Joi.string().optional().allow(''),
});

const updateWorkSchema = Joi.object({
  id: Joi.number().integer().required(),
  user_id: Joi.number().integer().required(),
  start_date: Joi.date().iso().required(),
  start_time: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
  end_date: Joi.date().iso().required(),
  end_time: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
  work_type: Joi.string().required(),
  additional_info: Joi.string().optional().allow(''),
});

// Middleware for validation
const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateWork = (req, res, next) => {
  const { error } = workSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateUpdateWork = (req, res, next) => {
  const { error } = updateWorkSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

// Authenticate user
app.post('/api/login', validateLogin, (req, res) => {
  const { login, password } = req.body;
  db.get(`
      SELECT * FROM Logins WHERE login = ? AND password = ?
  `, [login, password], (err, row) => {
      if (err) {
          console.error('Error querying login:', err.message);
          return res.status(500).json({ error: 'Database error' });
      }
      if (row) {
          res.status(200).json({ id: row.id, name: row.name, position: row.position });
      } else {
          res.status(401).json({ error: 'Invalid login or password' });
      }
  });
});

// Create work record
app.post('/api/work', validateWork, (req, res) => {
  const { userId, startDate, startTime, endDate, endTime, workType, additionalInfo } = req.body;

  // Convert dates and times to Date objects for comparison
  const startDateTime = new Date(`${startDate}T${startTime}`);
  const endDateTime = new Date(`${endDate}T${endTime}`);

  // Check if end date is before start date
  if (endDateTime <= startDateTime) {
    return res.status(400).json({ error: 'S :: End date and time must be after start date and time' });
  }

  const query = `
    INSERT INTO WorkRecords (user_id, start_time, end_time, start_date, end_date, work_type, additional_info)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [userId, startTime, endTime, startDate, endDate, workType, additionalInfo], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Work record created successfully' });
  });
});


// Get work records
app.get('/api/works', (req, res) => {
  const userId = req.query.userId;
  const month = req.query.month;
  const year = req.query.year;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  let query = `SELECT * FROM WorkRecords WHERE user_id = ?`;
  const queryParams = [userId];

  if (month && year) {
    query += ` AND strftime('%m', start_date) = ? AND strftime('%Y', start_date) = ?`;
    queryParams.push(month, year);
  }

  console.log(`Executing query: ${query} with params: ${queryParams}`);

  db.all(query, queryParams, (err, rows) => {
    if (err) {
      console.error('Error querying work records:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    // console.log('Query result:', rows);
    res.status(200).json(rows);
  });
});

// Update work record
app.put('/api/works/:id', validateUpdateWork, (req, res) => {
  const { id } = req.params;
  const { user_id, start_date, start_time, end_date, end_time, work_type, additional_info } = req.body;

  // Конвертируем даты и времена в объекты Date для сравнения
  const startDateTime = new Date(`${start_date}T${start_time}`);
  const endDateTime = new Date(`${end_date}T${end_time}`);

  // Проверка, что дата окончания не раньше даты начала
  if (endDateTime <= startDateTime) {

    return res.status(400).json({ error: 'End date and time must be after start date and time' });
  }

  // Запрос на получение текущих данных для проверки
  const getQuery = 'SELECT start_date, start_time FROM WorkRecords WHERE id = ?';
  db.get(getQuery, [id], (err, row) => {
    if (err) {
      console.error('Error querying work record:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Work record not found' });
    }

    // Если текущие данные не соответствуют новым данным, проверяем логику
    const currentStartDateTime = new Date(`${row.start_date}T${row.start_time}`);
    if (endDateTime <= currentStartDateTime) {
      return res.status(400).json({ error: 'End date and time must be after start date and time' });
    }

    // Запрос на обновление записи
    const updateQuery = `
      UPDATE WorkRecords
      SET user_id = ?, start_date = ?, start_time = ?, end_date = ?, end_time = ?, work_type = ?, additional_info = ?
      WHERE id = ?
    `;

    db.run(updateQuery, [user_id, start_date, start_time, end_date, end_time, work_type, additional_info, id], function(err) {
      if (err) {
        console.error('Error updating work record:', err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Work record not found' });
      }
      res.status(200).json({ message: 'Work record updated successfully' });
    });
  });
});

// Delete work record
app.delete('/api/works/:id', (req, res) => {
  const { id } = req.params;

  // Delete query
  const deleteQuery = 'DELETE FROM WorkRecords WHERE id = ?';

  db.run(deleteQuery, [id], function(err) {
    if (err) {
      console.error('Error deleting work record:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Work record not found' });
    }
    res.status(200).json({ message: 'Work record deleted successfully' });
  });
});

// Get user group_id by user id
app.get('/api/user/group/:id', (req, res) => {
  const userId = req.params.id;

  const query = `
    SELECT group_id FROM Logins WHERE id = ?
  `;

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error('Error querying user group:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    //console.log(`User ID: ${userId} has Group ID: ${row.group_id}`);

    res.status(200).json({ group_id: row.group_id });
  });
});

// Get clients (users with group_id 2 or 3)
app.get('/api/clients', (req, res) => {
  const query = `
    SELECT id, name FROM Logins WHERE group_id IN (2, 3)
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error querying clients:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json(rows);
  });
});



// Endpoint for checking server online status
app.get('/api/status', cors(), (req, res) => {
  res.status(200).json({ status: '200' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
