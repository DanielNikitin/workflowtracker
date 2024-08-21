import React from 'react';

const TimeSelector = ({ hour, minute, onHourChange, onMinuteChange }) => {
  return (
    <div className="flex gap-4">
      <select
        value={hour}
        onChange={onHourChange}
        className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 focus:outline-none focus:shadow-outline"
        required
      >
        {[...Array(24).keys()].map(hour => (
          <option key={hour} value={String(hour).padStart(2, '0')}>
            {String(hour).padStart(2, '0')}
          </option>
        ))}
      </select>
      <select
        value={minute}
        onChange={onMinuteChange}
        className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 focus:outline-none focus:shadow-outline"
        required
      >
        {[...Array(60).keys()].map(minute => (
          <option key={minute} value={String(minute).padStart(2, '0')}>
            {String(minute).padStart(2, '0')}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeSelector;
