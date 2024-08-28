import React, { useState } from 'react';
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

const RenderCards = ({
    works = [],
    paginatedWorks = [],
    currentPage = 1,
    totalPages = 1,
    totalTime = {},
    worksPerPage = 10,
    selectedMonth = 1,
    selectedYear = new Date().getFullYear(),
    setSelectedYear,
    setSelectedMonth,
    handleEdit,
    handleChange,
    handleSave,
    handleDelete,
    handleTimeChange,
    handleWorksPerPageChange,
    setCurrentPage,
    isPortrait,
    isEditing,
    editingWork = {},
    setIsEditing,
    expandedWorkId,
    handleToggleExpand
}) => {

    // Обработчик изменения выбранного месяца
    const handleMonthChange = (e) => {
        setSelectedMonth(parseInt(e.target.value));
        setCurrentPage(1); // Сбросить страницу на первую
    };

    return (
        <div className="p-1 overflow-y-auto max-h-screen">

            {/* Контейнер для выбора месяца и Total Time */}
            <div className="flex justify-between items-center mb-4">
                {/* Выбор месяца */}
                <div className="flex-1">
                    <label className="block text-white mb-2">Выберите месяц:</label>
                    <select
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        className="bg-gray-800 text-white p-2 rounded"
                    >
                        {[...Array(12).keys()].map((i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(0, i).toLocaleString('en', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </div>

              {/* Total Work time per current Month */}
              <div className="text-white font-bold mt-8">
                Total Time: {totalTime.hours || 0}h {totalTime.minutes || 0}m
              </div>
            </div>

            {/* Список карт */}
            <div className="max-h-screen">
                {paginatedWorks.length === 0 ? (
                    <p className="text-gray-300">Нет записей о работе</p>
                ) : (

                    paginatedWorks.map((work) => (
                        <div key={work.id} className="bg-gray-800 p-4 rounded-lg mb-2">
                            <div className="flex justify-between items-center">

                                <div>
                                    <p className="text-white text-lg font-medium">{work.work_type}</p>
                                    <p className="text-gray-400 text-sm">{format(new Date(work.start_date), 'dd/MM/yyyy')} - {format(new Date(work.end_date), 'dd/MM/yyyy')}</p>
                                </div>
                                <button onClick={() => handleToggleExpand(work.id)} className="text-gray-400 hover:text-gray-500">
                                    {expandedWorkId === work.id ? 'Скрыть' : 'Подробнее'}
                                </button>

                            </div>

                            {expandedWorkId === work.id && (

                                <div className="mt-4 text-gray-300 text-sm">
                                    <p><strong>ID:</strong> {work.id}</p>
                                    <p><strong>Start Time:</strong> {work.start_time}</p>
                                    <p><strong>End Time:</strong> {work.end_time}</p>
                                    <p><strong>Additional Info:</strong> {work.additional_info || 'N/A'}</p>
                                    <p><strong>Total Time:</strong> {calculateTotalTime(work.start_date, work.end_date, work.start_time, work.end_time)}</p>
                                    
                                    <div className="mt-2">

                                        <button onClick={() => handleEdit(work)} className="bg-gray-500 hover:bg-gray-700 text-white py-1 px-2 rounded mr-2">
                                            Edit
                                        </button>

                                        {/*
                                        <button onClick={() => handleDelete(work)} className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded">
                                            Delete
                                        </button>
                                        */}

                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Edit Modal Window */}
            {isEditing && (
                <div className="overflow-y-auto fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <div className="bg-gray-900 p-6 rounded shadow-lg w-full sm:w-3/4 md:w-1/2">
                        
                        <div className="flex flex-wrap gap-4">
                            
                            <div className="flex flex-col w-full">
                                <label className="text-white mb-2 text-sm">Start Date:</label>
                                <DateSelector
                                    selectedDate={new Date(editingWork.start_date)}
                                    onChange={(date) => handleChange({ target: { name: 'start_date', value: format(date, 'yyyy-MM-dd') } })}
                                />
                            </div>

                            <div className="flex flex-col w-full">
                                <label className="text-white mb-2 text-sm">Start Time:</label>
                                <div className="flex gap-2">
                                    <TimeSelector
                                        hour={editingWork.start_time?.split(':')[0] || ''}
                                        minute={editingWork.start_time?.split(':')[1] || ''}
                                        onHourChange={(e) => handleTimeChange('start_hour', e.target.value)}
                                        onMinuteChange={(e) => handleTimeChange('start_minute', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col w-full mt-4">
                                <label className="text-white mb-2 text-sm">End Date:</label>
                                <DateSelector
                                    selectedDate={new Date(editingWork.end_date)}
                                    onChange={(date) => handleChange({ target: { name: 'end_date', value: format(date, 'yyyy-MM-dd') } })}
                                />
                            </div>

                            <div className="flex flex-col w-full mt-4">
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

                            <div className="flex flex-col w-full mt-4">
                                <label className="text-white mb-2 text-sm">Work Type:</label>
                                <input
                                    type="text"
                                    name="work_type"
                                    value={editingWork.work_type}
                                    onChange={handleChange}
                                    className="bg-gray-700 text-white p-2 rounded text-sm"
                                />
                            </div>

                            <div className="flex flex-col w-full mt-4">
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
                        
                        <div className="flex justify-start mt-4">
                            <button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-700 text-white py-2 px-4 rounded mr-2">Save</button>
                            <button onClick={() => setIsEditing(false)} className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded mr-2">Cancel</button>
                            <button onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded">Delete</button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default RenderCards;