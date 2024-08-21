// Highway Client

import React, { useState, useEffect } from 'react';

const Home = () => {
  const [serverStatus, setServerStatus] = useState('Checking...');

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const response = await fetch('http://localhost:3009/api/status');
        setSuccessMessage('');
        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }
        setServerStatus('Online');
        setSuccessMessage('Server online');
        setShowSuccessMessage(true);

        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      } catch (error) {
        setServerStatus('Offline');
        setErrorMessage('Failed to fetch status');
      }
    };

    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 15000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="bg-primary/60 h-full">
      <div className="w-full h-full absolute left-5 bottom-0">
        <div className="flex flex-col justify-center xl:pt-12 xl:text-left h-full container mx-auto">
          <p className={`text-5xl font-bold`}>
            Highway
          </p>
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