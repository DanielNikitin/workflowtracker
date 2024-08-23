import React, { useState, useEffect } from 'react';
import DateSelector from './DateSelector';
import TimeSelector from './TimeSelector';
import ExpandableText from './ExpandableText';
import { format } from 'date-fns';

const calculateTotalTime = (startDate, endDate, startTime, endTime) => {
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);
  const differenceInMilliseconds = end - start;

  const hours = Math.floor(differenceInMilliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
};

const RenderManagerTable = ({
  works,
  paginatedWorks,
  currentPage,
  totalPages,
  totalTime,
  worksPerPage,
  selectedMonth,
  selectedYear,
  selectedClient,
  setSelectedYear,
  setSelectedMonth,
  setSelectedClient,
  handleEdit,
  handleChange,
  handleSave,
  handleDelete,
  handleTimeChange,
  handleWorksPerPageChange,
  setCurrentPage,
  isEditing,
  editingWork,
  setIsEditing,
}) => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    // Fetch clients from the server
    fetch('http://localhost:3009/api/clients')
      .then(response => response.json())
      .then(data => setClients(data))
      .catch(error => console.error('Error fetching clients:', error));
  }, []);

  const handleClientChange = (e) => {
    const selectedId = e.target.value;
    setSelectedClient(selectedId);
    setCurrentPage(1); // Reset to first page on client change
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const openModal = (content) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent('');
  };

  return (
    <div className="mt-4 px-4">
      <div className="mb-4">
        <div className="flex items-center gap-4 mb-4">

          {/* Client Selector */}
          <div>
            <label className="block text-white mb-2">Клиент:</label>
                <select
                value={selectedClient}
                onChange={handleClientChange}
                className="bg-gray-800 text-white p-2 rounded"
                >
                <option value="">Выберите клиента</option>
                {clients.map(client => (
                    <option key={client.id} value={client.id}>
                    {client.name}
                    </option>
                ))}
                </select>
          </div>

          {/* Month Selector */}
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

              {/* Total Work time per current Month */}
              <div className="text-white font-bold">
                Total Time: {totalTime.hours}h {totalTime.minutes}m
              </div>
            </div>

        </div>
      </div>

      {works.length === 0 ? (
        <p>No work records found</p>
      ) : (
        <div className="overflow-auto scrollbar-none xl:max-h-[585px] sm:max-h-[265px]">
          <table className="xl:w-full divide-y divide-gray-700">
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

                          <td className="px-6 py-4 text-sm font-medium overflow-text">
                            <ExpandableText
                              text={work.additional_info || 'N/A'}
                              maxLength={20}
                              onMoreClick={() => openModal(work.additional_info || 'N/A')}
                            />
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

      {/* Modal for Additional Info */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-gray-900 p-6 rounded shadow-lg xl:w-[40%]">
            <h2 className="text-lg font-bold text-white mb-4">Additional Info</h2>
            <p className="text-white mb-4">{modalContent}</p>
            <button onClick={closeModal} className="bg-gray-500 hover:bg-gray-700 text-white p-2 rounded">Close</button>
          </div>
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
              <div className="flex flex-col xl:w-[48%]">
                <label className="text-white mb-2 text-sm">Additional Info:</label>
                <textarea
                  type="text"
                  name="additional_info"
                  value={editingWork.additional_info || ''}
                  onChange={handleChange}
                  className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 focus:outline-none focus:shadow-outline max-h-[400px]"
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

export default RenderManagerTable;
