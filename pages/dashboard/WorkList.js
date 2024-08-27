import React, { useState, useEffect } from 'react';
import RenderTable from './RenderTable';
import RenderCards from './RenderCards';
import RenderManagerTable from './RenderManagerTable';
import RenderManagerCards from './RenderManagerCards';

const WorkList = ({ onSuccess, onProcess, onError, userId }) => {
  const [userGroup, setUserGroup] = useState(null);
  const [selectedClient, setSelectedClient] = useState('');
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const [worksPerPage, setWorksPerPage] = useState(30);
  const [editingWork, setEditingWork] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedWorkId, setExpandedWorkId] = useState(null);
  const [totalTime, setTotalTime] = useState({ hours: 0, minutes: 0 });

  useEffect(() => {
    const fetchUserGroup = async () => {
      try {
        const response = await fetch(`https://api.dcg.ee:3009/api/user/group/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user group');
        }
        const data = await response.json();
        setUserGroup(data.group_id);
        
        // Установить выбранного клиента для обычного пользователя
        if (data.group_id === 3) {
          setSelectedClient(userId);
        }
      } catch (error) {
        console.error('Error fetching user group:', error);
      }
    };

    if (userId) {
      fetchUserGroup();
    }
  }, [userId]);

  const fetchWorks = async () => {
    // Если selectedClient пустой и это обычный пользователь, используем userId
    const clientToUse = selectedClient || userId;

    if (!clientToUse) return;

    setLoading(true);
    try {
      const formattedMonth = selectedMonth.toString().padStart(2, '0');
      const response = await fetch(`https://api.dcg.ee:3009/api/works?userId=${clientToUse}&month=${formattedMonth}&year=${selectedYear}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch works');
      }
      const data = await response.json();
      setWorks(data);
      calculateTotalTimeForMonth(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWorks();
  }, [userId, selectedMonth, selectedYear, selectedClient]);

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
    setCurrentPage(1);
    fetchWorks();
  };

  const handleEdit = (work) => {
    setEditingWork(work);
    setIsEditing(true);
  };

  const handleChange = (e) => {
    // export name and value from input/select field
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
      const response = await fetch(`https://api.dcg.ee:3009/api/works/${editingWork.id}`, {
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
        fetchWorks();
        setIsEditing(false);
        onSuccess('Work Successfully Saved');
      }
    } catch (error) {
      console.error('ERROR:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`https://api.dcg.ee:3009/api/works/${editingWork.id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const errorMessage = await response.json();
        onError(errorMessage.error);
        throw new Error(`${errorMessage.error}`);
      } else {
        fetchWorks();
        setIsEditing(false);
        onError('Work Successfully Deleted');
      }
    } catch (error) {
      console.error('ERROR:', error);
    }
  };

  // for sm size // phone mode
  const handleToggleExpand = (id) => {
    setExpandedWorkId(expandedWorkId === id ? null : id);
  };

  const handleWorksPerPageChange = (e) => {
    setWorksPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const calculateTotalTimeForMonth = (works) => {
    let totalMinutes = 0;
  
    works.forEach((work) => {
      const start = new Date(`${work.start_date}T${work.start_time}`);
      const end = new Date(`${work.end_date}T${work.end_time}`);
      const differenceInMinutes = (end - start) / (1000 * 60);
  
      totalMinutes += differenceInMinutes;
    });
  
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
  
    setTotalTime({ hours, minutes });
  };
  

  const totalPages = Math.ceil(works.length / worksPerPage);
  const paginatedWorks = works
    .slice((currentPage - 1) * worksPerPage, currentPage * worksPerPage)
    .sort((a, b) => new Date(`${a.start_date}T${a.start_time}`) - new Date(`${b.start_date}T${b.start_time}`));

  return (
    <div className="mt-4 px-4">
      {userGroup === 2 && (
        <>
        {/* Render Table */}
          <div className="sm:hidden xl:block">
            <RenderTable
              works={works}
              paginatedWorks={paginatedWorks}
              currentPage={currentPage}
              totalPages={totalPages}
              totalTime={totalTime}
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
              loading={loading}
              error={error}
            />
          </div>

          {/* Render Card */}
          <div className="xl:hidden sm:block">
            <RenderCards
              works={works}
              paginatedWorks={paginatedWorks}
              currentPage={currentPage}
              totalPages={totalPages}
              totalTime={totalTime}
              worksPerPage={worksPerPage}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              setSelectedMonth={setSelectedMonth}
              setSelectedClient={setSelectedClient}
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
        </>
      )}

      {userGroup === 3 && (
              <>
                {/* Render Manager Table */}
                <div className="sm:hidden xl:block">
                  <RenderManagerTable
                    works={works}
                    paginatedWorks={paginatedWorks}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalTime={totalTime}
                    worksPerPage={worksPerPage}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    setSelectedMonth={setSelectedMonth}
                    setSelectedClient={setSelectedClient}
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
                    loading={loading}
                    error={error}
                  />
                </div>

                {/* Render Card */}
                <div className="xl:hidden sm:block">
                  <RenderManagerCards
                    works={works}
                    paginatedWorks={paginatedWorks}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalTime={totalTime}
                    worksPerPage={worksPerPage}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    selectedClient={selectedClient}
                    setSelectedYear={setSelectedYear}
                    setSelectedMonth={setSelectedMonth}
                    setSelectedClient={setSelectedClient}
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
              </>
            )}

      {userGroup === null && <p>Loading user group...</p>}
    </div>
  );
};

export default WorkList;
