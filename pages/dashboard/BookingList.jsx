// BookingList.jsx

import React, { useState, useEffect } from 'react';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookingList();
  }, []);

  const fetchBookingList = async () => {
    try {
      const response = await fetch('http://localhost:3009/api/bookings');
      if (!response.ok) {
        throw new Error('Failed to fetch booking list');
      }
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching booking list:', error);
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-4">Booking List</h2>
      <ul>
      {bookings.map((booking) => (
  <li key={booking.id} className="mb-2">
    <strong>{booking.name}</strong> - {booking.specialist} - {Array.isArray(booking.selectedServices) ? booking.selectedServices.join(', ') : booking.selectedServices} - {booking.selectedDate} - {booking.selectedTime}
  </li>
))}

      </ul>
    </div>
  );
};

export default BookingList;