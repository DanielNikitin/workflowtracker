import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Home = () => {

  const [serverStatus, setServerStatus] = useState('Checking...');
  const [wasOnline, setWasOnline] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const response = await fetch('https://api2.dcg.ee/api/status');

        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }

        setServerStatus('Online');

        if (!wasOnline) {
          setSuccessMessage('Server online');
          setShowSuccessMessage(true);
          setWasOnline(true);

          setTimeout(() => {
            setShowSuccessMessage(false);
          }, 3000);
        }

      } catch (error) {
        setServerStatus('Offline');
        setErrorMessage('Failed to fetch status');
        setWasOnline(false);
      }
    };

    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 15000);
    return () => clearInterval(interval);
  }, [wasOnline]); // зависимость, чтобы useEffect реагировал на изменение wasOnline

  
  return (
    <div className="bg-primary/60 h-full">
      <div className="w-full h-full absolute left-5 bottom-0">
        <div className="flex flex-col justify-center xl:pt-12 xl:text-left h-full container mx-auto">
          <Link href="/dashboard">
            <span className="text-5xl font-roboto text-gray-400">
              Highway
            </span>
          </Link>
        </div>
      </div>

      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default Home;
