// Оптимизировал отображение создания анкеты и отобаржение таблицы
// Добавил скролл для режима Горизонтали
// Раскидал некоторый код по файлам
// Переделал формат отображения даты в создании/отображении списка/редактировании
// Проверил все функции что есть в приложении на работоспособность
// Добавил отображение ID записи
// Высота списка регулируется при помощи параметра max-h-screen
// Сортировка выполнена по дате, от меньшего к большему
// Исправил баг с переключением страницы и отображением кол-ва работ в таблице

import React, { useState, useEffect } from 'react';
import DateSelector from './DateSelector';
import TimeSelector from './TimeSelector';
import { format } from 'date-fns';

// Функция для расчета общего времени работы
const calculateTotalTime = (startDate, endDate, startTime, endTime) => {
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);
  const differenceInMilliseconds = end - start;

  const hours = Math.floor(differenceInMilliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
};

// Кастомный хук для определения ориентации экрана
const useOrientation = () => {
  const [isPortrait, setIsPortrait] = useState(window.matchMedia('(orientation: portrait)').matches);

  useEffect(() => {
    const handleOrientationChange = (e) => {
      setIsPortrait(e.matches);
    };

    const mediaQuery = window.matchMedia('(orientation: portrait)');
    mediaQuery.addListener(handleOrientationChange);

    return () => {
      mediaQuery.removeListener(handleOrientationChange);
    };
  }, []);

  return isPortrait;
};

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

  const isPortrait = useOrientation();

  const fetchWorks = async () => {
    setLoading(true);
    try {
      const formattedMonth = selectedMonth.toString().padStart(2, '0');
      const response = await fetch(`http://localhost:3009/api/works?userId=${userId}&month=${formattedMonth}&year=${selectedYear}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch works');
      }
      const data = await response.json();
      //console.log('Fetched works:', data);
      setWorks(data);
    } catch (error) {
      //console.error('Error fetching works:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWorks();
  }, [userId, selectedMonth, selectedYear]);

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
        // Когда условие выполнено, обновить данные в состоянии и закрыть форму редактирования
        fetchWorks(); // Перезагрузка списка работ
        setIsEditing(false);
        onSuccess('Work Successfully Saved');
      }

    } catch (error) {
      //console.error('ERROR:', error);
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
          // Когда условие выполнено, обновить данные в состоянии и закрыть форму редактирования
          fetchWorks(); // Перезагрузка списка работ
          setIsEditing(false);
          onSuccess('Work Successfully Deleted');
        }
  
      } catch (error) {
        //console.error('ERROR:', error);
      }
    };

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
      
      {isPortrait && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-95 z-[999]">
          <div className="text-white text-center">
            <p>Please rotate your device to landscape mode for a better view.</p>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center gap-4 mb-4">

          <div>
            <label className="block text-white mb-2">Месяц:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-gray-800 text-white p-2 rounded"
            >
              {[...Array(12).keys()].map((i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('en', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white mb-2">Год:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-gray-800 text-white p-2 rounded"
            >
              {[2024, 2025].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white mb-2">Список:</label>
            <select
              value={worksPerPage}
              onChange={handleWorksPerPageChange}
              className="bg-gray-800 text-white p-2 rounded"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={60}>60</option>
              <option value={90}>90</option>
            </select>
          </div>

          {!isPortrait ? (
            <div className="flex gap-14 mt-7">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`text-3xl font-bold rounded ${currentPage === 1 ? 'text-gray-400' : 'text-gray-800'}`}
              >
                {'<'}
              </button>
              
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`text-3xl font-bold rounded ${currentPage === totalPages ? 'text-gray-400' : 'text-gray-800'}`}
              >
                {'>'}
              </button>
            </div>
            ) : null}

        </div>
      </div>

      {works.length === 0 ? (
        <p>No work records found</p>
      ) : (
        <div className="overflow-auto scrollbar-none xl:max-h-[585px] sm:max-h-[265px]">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
              <th className="sticky top-0 bg-gray-500 px-6 py-2 text-left text-xs font-roboto text-gray-300 uppercase tracking-wide">ID</th>
                <th className="sticky top-0 bg-gray-500 px-6 py-2 text-left text-xs font-roboto text-gray-300 uppercase tracking-wide">Start Date</th>
                <th className="sticky top-0 bg-gray-500 px-6 py-2 text-left text-xs font-roboto text-gray-300 uppercase tracking-wide">Start Time</th>
                <th className="sticky top-0 bg-gray-500 px-6 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wide">End Date</th>
                <th className="sticky top-0 bg-gray-500 px-6 py-2 text-left text-xs font-roboto text-gray-300 uppercase tracking-wide">End Time</th>
                <th className="sticky top-0 bg-gray-500 px-6 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wide">Work Type</th>
                <th className="sticky top-0 bg-gray-500 px-6 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wide">Additional Info</th>
                <th className="sticky top-0 bg-gray-500 px-6 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wide">Total Time</th>
                <th className="sticky top-0 bg-gray-500 px-6 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {paginatedWorks.map((work) => {
                  const formattedStartDate = format(new Date(work.start_date), 'dd/MM/yyyy');
                  const formattedEndDate = format(new Date(work.end_date), 'dd/MM/yyyy');

                  return (
                      <tr key={work.id} className="text-white">
                          <td className="px-4 py-2">{work.id}</td>
                          <td className="px-4 py-2">{formattedStartDate}</td>
                          <td className="px-4 py-2">{work.start_time}</td>
                          <td className="px-4 py-2">{formattedEndDate}</td>
                          <td className="px-4 py-2">{work.end_time}</td>
                          <td className="px-4 py-2">{work.work_type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {work.additional_info || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {calculateTotalTime(work.start_date, work.end_date, work.start_time, work.end_time)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                  onClick={() => handleEdit(work)}
                                  className="text-slate-500 hover:text-slate-700 mr-2"
                              >
                                  Edit
                              </button>
                          </td>
                      </tr>
                    );
                })}
            </tbody>

          </table>
        </div>
      )}

      {/* Edit Work Modal */}
      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">

          <div className="bg-gray-900 p-6 rounded shadow-lg xl:w-[30%] sm:w-[90%] md:w-[80%] sm:h-auto">
            
            {/* START DATE */}
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col xl:w-[48%] sm:w-full">
                <label className="text-white mb-2 text-sm">Start Date:</label>
                  <DateSelector
                  selectedDate={new Date(editingWork.start_date)}
                  // yyyy-mm-dd формат для записи в БД
                  onChange={(date) => handleChange({ target: { name: 'start_date', value: format(date, 'yyyy-MM-dd') } })}
                />
              </div>

              {/* START TIME */}
              <div className="flex flex-col xl:w-[48%] sm:w-full">
                <label className="text-white mb-2 text-sm">Start Time:</label>
                  <div className="flex gap-2">
                    <TimeSelector
                    hour={editingWork.start_time.split(':')[0]}
                    minute={editingWork.start_time.split(':')[1]}
                    onHourChange={(e) => handleTimeChange('start_hour', e.target.value)}
                    onMinuteChange={(e) => handleTimeChange('start_minute', e.target.value)}
                    />
                  </div>
              </div>
            </div>

            {/* END DATE */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex flex-col xl:w-[48%] sm:w-full">
                <label className="text-white mb-2 text-sm">End Date:</label>
                  <DateSelector
                  selectedDate={new Date(editingWork.end_date)}
                  onChange={(date) => handleChange({ target: { name: 'end_date', value: format(date, 'yyyy-MM-dd') } })}
                  />
              </div>

              {/* END TIME */}
              <div className="flex flex-col xl:w-[48%] sm:w-full">
                <label className="text-white mb-2 text-sm">End Time:</label>
                <div className="flex gap-2">
                  <TimeSelector
                  hour={editingWork.end_time.split(':')[0]}
                  minute={editingWork.end_time.split(':')[1]}
                  onHourChange={(e) => handleTimeChange('end_hour', e.target.value)}
                  onMinuteChange={(e) => handleTimeChange('end_minute', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* WORK TYPE */}
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex flex-col xl:w-[48%] sm:w-full">
                <label className="text-white mb-2 text-sm">Work Type:</label>
                <input
                  type="text"
                  name="work_type"
                  value={editingWork.work_type}
                  onChange={handleChange}
                  className="bg-gray-700 text-white p-2 rounded text-sm"
                />
              </div>

              {/* ADDITIONAL INFO */ }
              <div className="flex flex-col xl:w-[48%] sm:w-full">
                <label className="text-white mb-2 text-sm">Additional Info:</label>
                <input
                  type="text"
                  name="additional_info"
                  value={editingWork.additional_info || ''}
                  onChange={handleChange}
                  className="bg-gray-700 text-white p-2 rounded text-sm"
                />
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-start mt-4">
              <button onClick={handleSave} className="bg-green-500 hover:bg-green-700 text-white p-2 rounded mr-2">Save</button>
              <button onClick={() => setIsEditing(false)} className="bg-slate-500 hover:bg-slate-700 text-white p-2 rounded mr-2">Cancel</button>
              <button onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white p-2 rounded">Delete</button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default WorkList;