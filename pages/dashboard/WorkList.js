import React, { useState, useEffect } from 'react';

import RenderTable from './RenderTable';
import RenderCards from './RenderCards';

const WorkList = ({ onSuccess, onProcess, onError, userId }) => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year

  const [currentPage, setCurrentPage] = useState(1);
  const [worksPerPage, setWorksPerPage] = useState(30);

  const [editingWork, setEditingWork] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [expandedWorkId, setExpandedWorkId] = useState(null);

  const fetchWorks = async () => {
    setLoading(true);
    try {
      const formattedMonth = selectedMonth.toString().padStart(2, '0');
      const response = await fetch(`http://localhost:3009/api/works?userId=${userId}&month=${formattedMonth}&year=${selectedYear}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch works');
      }
      const data = await response.json();
      setWorks(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWorks();
  }, [userId, selectedMonth, selectedYear]);

  useEffect(() => {
    if (loading) {
      onProcess('Loading...');
    }
  }, [loading, onProcess]);

  useEffect(() => {
    if (error) {
      onError('Error:', { error });
    }
  }, [error, onError]);

  const handleRefresh = () => {
    setLoading(true);
    setCurrentPage(1); // Reset to first page on refresh
    fetchWorks(); // Re-fetch works with current selections
  };

  const handleEdit = (work) => {
    setEditingWork(work); // Устанавливаем текущую редактируемую запись
    setIsEditing(true);   // Показать форму редактирования
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    setEditingWork((prevWork) => {
      const newWork = { ...prevWork };
      if (name.includes('start_')) {
        const [type, part] = name.split('_');
        if (type === 'start') {
          if (part === 'date') {
            newWork.start_date = value;
          } else if (part === 'hour' || part === 'minute') {
            const [hours, minutes] = newWork.start_time.split(':');
            newWork.start_time = part === 'hour' ? `${value}:${minutes}` : `${hours}:${value}`;
          }
        }

      } else if (name.includes('end_')) {
        const [type, part] = name.split('_');
        if (type === 'end') {
          if (part === 'date') {
            newWork.end_date = value;
          } else if (part === 'hour' || part === 'minute') {
            const [hours, minutes] = newWork.end_time.split(':');
            newWork.end_time = part === 'hour' ? `${value}:${minutes}` : `${hours}:${value}`;
          }
        }
      } else {
        newWork[name] = value;
      }
      return newWork;
    });
  };

  const handleTimeChange = (name, value) => {
    setEditingWork((prevWork) => {
      const newWork = { ...prevWork };
      if (name === 'start_hour' || name === 'start_minute') {
        const [hour, minute] = newWork.start_time.split(':');
        newWork.start_time = name === 'start_hour' ? `${value}:${minute}` : `${hour}:${value}`;
      } else if (name === 'end_hour' || name === 'end_minute') {
        const [hour, minute] = newWork.end_time.split(':');
        newWork.end_time = name === 'end_hour' ? `${value}:${minute}` : `${hour}:${value}`;
      }
      return newWork;
    });
  };
  
  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:3009/api/works/${editingWork.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingWork),
      });
  
      if (!response.ok) {
        const errorMessage = await response.json();
        onError(errorMessage.error);
        throw new Error(`${errorMessage.error}`);
      } else {
        fetchWorks(); // Перезагрузка списка работ
        setIsEditing(false);
        onSuccess('Work Successfully Saved');
      }
    } catch (error) {
      console.error('ERROR:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:3009/api/works/${editingWork.id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const errorMessage = await response.json();
        onError(errorMessage.error);
        throw new Error(`${errorMessage.error}`);
      } else {
        fetchWorks(); // Перезагрузка списка работ
        setIsEditing(false);
        onError('Work Successfully Deleted');
      }
    } catch (error) {
      console.error('ERROR:', error);
    }
  };

  const handleToggleExpand = (id) => {
    setExpandedWorkId(expandedWorkId === id ? null : id);
  };

  // Обработчик изменения количества работ на странице
  const handleWorksPerPageChange = (e) => {
    setWorksPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Сбрасываем текущую страницу на первую
  };

  // Calculate pagination
  const totalPages = Math.ceil(works.length / worksPerPage);
  const paginatedWorks = works
    .slice((currentPage - 1) * worksPerPage, currentPage * worksPerPage)
    .sort((a, b) => new Date(`${a.start_date}T${a.start_time}`) - new Date(`${b.start_date}T${b.start_time}`));

  return (
    <div className="mt-4 px-4">

      {/* Render Table */ }
      <div className="sm:hidden xl:block">
        <RenderTable
          works={works} // Передаем полный список работ
          paginatedWorks={paginatedWorks} // Передаем только текущую страницу
          currentPage={currentPage}
          totalPages={totalPages}
          worksPerPage={worksPerPage}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          setSelectedMonth={setSelectedMonth}
          handleEdit={handleEdit}
          handleChange={handleChange}
          handleSave={handleSave}
          handleDelete={handleDelete}
          handleTimeChange={handleTimeChange}
          handleWorksPerPageChange={handleWorksPerPageChange}
          setCurrentPage={setCurrentPage}
          isEditing={isEditing}
          editingWork={editingWork}
          setIsEditing={setIsEditing}

          loading={loading} // Передаем состояние загрузки
          error={error} // Передаем ошибки
        />
      </div>

      {/* Render Card */}
      <div className="xl:hidden sm:block">
        <RenderCards
          works={works} // Передаем полный список работ
          paginatedWorks={paginatedWorks} // Передаем только текущую страницу
          currentPage={currentPage}
          totalPages={totalPages}
          worksPerPage={worksPerPage}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          setSelectedMonth={setSelectedMonth}
          handleEdit={handleEdit}
          handleTimeChange={handleTimeChange}
          handleWorksPerPageChange={handleWorksPerPageChange}
          setCurrentPage={setCurrentPage}
          isEditing={isEditing}
          editingWork={editingWork}
          setIsEditing={setIsEditing}
          handleChange={handleChange}
          handleSave={handleSave}
          handleDelete={handleDelete}

          expandedWorkId={expandedWorkId}
          handleToggleExpand={handleToggleExpand}

          loading={loading} // Передаем состояние загрузки
          error={error} // Передаем ошибки
        />
      </div>

    </div>
  );
};

export default WorkList;
