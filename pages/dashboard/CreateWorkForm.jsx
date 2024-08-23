import React, { useState } from 'react';
import DateSelector from './DateSelector';
import TimeSelector from './TimeSelector';
import { format } from 'date-fns';

const CreateWorkForm = ({ onSuccess, onError, defaultName, userId, onClose }) => {
  const [name, setName] = useState(defaultName || '');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startHour, setStartHour] = useState('00');
  const [startMinute, setStartMinute] = useState('00');
  const [endHour, setEndHour] = useState('00');
  const [endMinute, setEndMinute] = useState('00');
  const [workType, setWorkType] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitTimeout, setSubmitTimeout] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (submitTimeout) return;

    if (!workType) {
      onError('Please select a work type');
      return;
    }

    if (!startHour || !startMinute || !endHour || !endMinute) {
      onError('Please provide valid start and end times');
      return;
    }

    const newWorkData = {
      userId,
      startDate: format(startDate, 'yyyy-MM-dd'),
      startTime: `${startHour}:${startMinute}`,
      endDate: format(endDate, 'yyyy-MM-dd'),
      endTime: `${endHour}:${endMinute}`,
      workType,
      additionalInfo,
    };

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:3009/api/work', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWorkData),
      });

      if (response.ok) {
        onSuccess('Work successfully created');
        setSubmitTimeout(true);
        setTimeout(() => {
          setSubmitTimeout(false);
          setIsSubmitting(false);
          setName(defaultName || '');
          setStartDate(new Date());
          setEndDate(new Date());
          setStartHour('00');
          setStartMinute('00');
          setEndHour('00');
          setEndMinute('00');
          setWorkType('');
          setAdditionalInfo('');
        }, 2000);
      } else {
        const errorMessage = await response.json();
        console.error('ERROR:', errorMessage.error);
        onError(errorMessage.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('ERROR:', error);
      onError('Something went wrong, try again');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-[500px] h-full">
        <h2 className="text-2xl mb-6 text-white">Создать рабочую анкету</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-white">
                Имя
              </label>
              <input
                type="text"
                id="name"
                className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 focus:outline-none focus:shadow-outline"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block mb-2 text-sm font-medium text-white">
                Дата начала работы
              </label>
              <DateSelector selectedDate={startDate} onChange={setStartDate} />
            </div>

            <div>
              <label htmlFor="startTime" className="block mb-2 text-sm font-medium text-white">
                Время начала
              </label>
              <TimeSelector 
                hour={startHour} 
                minute={startMinute} 
                onHourChange={(e) => setStartHour(e.target.value)} 
                onMinuteChange={(e) => setStartMinute(e.target.value)} 
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block mb-2 text-sm font-medium text-white">
                Дата окончания работы
              </label>
              <DateSelector selectedDate={endDate} onChange={setEndDate} />
            </div>

            <div>
              <label htmlFor="endTime" className="block mb-2 text-sm font-medium text-white">
                Время окончания
              </label>
              <TimeSelector 
                hour={endHour} 
                minute={endMinute} 
                onHourChange={(e) => setEndHour(e.target.value)} 
                onMinuteChange={(e) => setEndMinute(e.target.value)} 
              />
            </div>

            <div>
              <label htmlFor="workType" className="block mb-2 text-sm font-medium text-white">
                Тип работы
              </label>
              <select
                id="workType"
                className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 focus:outline-none focus:shadow-outline"
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                required
              >
                <option value="">Выберите тип работы</option>
                <option value="Прочее">Прочее</option>
                <option value="Ремонт">Ремонт</option>
                <option value="Обслуживание">Обслуживание</option>
                <option value="Стрижка газона">Стрижка газона</option>
                <option value="Укладка камня">Укладка камня</option>
                <option value="Осмотр">Осмотр</option>
              </select>
            </div>

            <div>
              <label htmlFor="additionalInfo" className="block mb-2 text-sm font-medium text-white">
                Доп. информация
              </label>
              <textarea
                id="additionalInfo"
                className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 focus:outline-none focus:shadow-outline max-h-[220px]"
                placeholder="Введите доп. информацию здесь..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between">
            
            <button
              type="button"
              className="text-gray-200 bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5"
              onClick={onClose}
            >
              Закрыть
            </button>

            <button
              type="submit"
              className="text-gray-200 bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
              disabled={isSubmitting || submitTimeout}
            >
              {isSubmitting ? 'Создание...' : 'Создать работу'}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkForm;
