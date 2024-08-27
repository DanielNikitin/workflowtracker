// index.js
import React, { useState, useEffect } from 'react';
import CreateWorkForm from './CreateWorkForm';
import WorkList from './WorkList';
import Sidebar from './Sidebar';

const Dashboard = () => {
  const [showCreateWorkForm, setCreateWorkForm] = useState(false);
  const [showWorkList, setShowWorkList] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  
  const [successMessage, setSuccessMessage] = useState('');
  const [processMessage, setProcessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [serverStatus, setServerStatus] = useState('Checking...');

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginButton, setShowLoginButton] = useState(false);

  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const response = await fetch('https://api.dcg.ee:3009/api/status');
        if (response.ok) {
          setServerStatus('Online');
          setTimeout(() => {
            setShowLoginButton(true);
          }, 1000);
        } else {
          setServerStatus('Offline');
        }
      } catch (error) {
        console.error('Error checking server status:', error);
        setServerStatus('Offline');
      }
    };

    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('https://api.dcg.ee:3009/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      if (response.ok) {
        const user = await response.json();
        setIsLoggedIn(true);
        setUserId(user.id);
        setUserName(user.name);
        setSuccessMessage(`Hi :: ${user.name}!`);
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        const errorMessage = await response.json();
        setErrorMessage(errorMessage.error || 'Incorrect login or password.');
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Something went wrong, try again');
      setIsLoggedIn(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSuccessMessage('');
    setErrorMessage('');
    // Redirect to login page or another appropriate page
  };

  const handleAddWorkSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const handleProcess = (message) => {
    setProcessMessage(message);
    setTimeout(() => {
      setProcessMessage('');
    }, 0);
  };

  const handleAddWorkError = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage('');
    }, 3000);
  };

  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
    setShowOverlay(prev => !prev);
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-gray-600 min-h-screen flex items-center justify-center">
        <div className="bg-primary/70 w-96 py-6 px-8 flex flex-col items-center rounded-lg">
          <h1 className="text-4xl font-bold text-white mb-6">LOGIN</h1>
          <input
            type="text"
            placeholder="Login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="input-field mb-4 bg-primary/10"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field mb-4 bg-primary/10"
          />
          {serverStatus === 'Checking...' && (
            <p className="text-white mb-4">
              Checking<span className="animate-pulse">...</span>
            </p>
          )}
          {showLoginButton && (
            <button onClick={handleLogin} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Login
            </button>
          )}
          {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-600 min-h-screen flex">
      {/* Sidebar settings, Props */}
      <Sidebar
        showSidebar={showSidebar}
        toggleSidebar={toggleSidebar}
        showCreateWorkForm={showCreateWorkForm}
        setCreateWorkForm={setCreateWorkForm}
        showWorkList={showWorkList}
        setShowWorkList={setShowWorkList}
        handleLogout={handleLogout}
        userName={userName}
      />

      {/* Props for Buttons */}
      <div className={`flex-grow transition-all duration-300 ${showSidebar ? 'ml-40' : 'ml-0'} relative`}>
        {showCreateWorkForm && (
          <CreateWorkForm
            onSuccess={handleAddWorkSuccess}
            onProcess={handleProcess}
            onError={handleAddWorkError}
            defaultName={userName}
            userId={userId}
            onClose={() => setCreateWorkForm(false)}
          />
        )}

        {showWorkList && (
          <WorkList
            onSuccess={handleAddWorkSuccess}
            onProcess={handleProcess}
            onError={handleAddWorkError}
            userId={userId}
          />
        )}

        {successMessage && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-[99999]">
            {successMessage}
          </div>
        )}

        {processMessage && (
          <div className="fixed bottom-4 right-4 bg-yellow-500 text-white p-4 rounded-lg shadow-lg z-[99999]">
            {processMessage}
          </div>
        )}

        {errorMessage && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-99999">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Open Close Menu Button */}
      <button
        className={`fixed bottom-4 left-2 text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline z-50 
          ${showSidebar ? 'bg-emerald-500' : 'bg-emerald-600 animate-pulse'} transition-colors duration-300`}
        onClick={toggleSidebar}
      >
        {showSidebar ? '' : ''}
      </button>
    </div>
  );
};

export default Dashboard;
