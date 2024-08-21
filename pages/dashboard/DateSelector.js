import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateSelector = ({ selectedDate, onChange }) => {
  return (
    <DatePicker
      selected={selectedDate}
      onChange={onChange}
      dateFormat="dd/MM/yyyy"
      className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block w-full p-2.5 focus:outline-none focus:shadow-outline"
    />
  );
};

export default DateSelector;
