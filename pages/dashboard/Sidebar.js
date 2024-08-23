// Sidebar.js
import React from 'react';

const Sidebar = ({
  showSidebar,
  toggleSidebar,
  showCreateWorkForm,
  setCreateWorkForm,
  showWorkList,
  setShowWorkList,
  handleLogout,
  userName,
}) => {
  return (

    <div>
      {/* Black overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-40"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 left-0 h-full bg-test_c2/50 transition-transform duration-300
          ${showSidebar ? 'translate-x-0' : '-translate-x-64'} w-40 z-50`}
      >
        <div className="flex flex-col p-4 h-full">
          <h1 className="text-2xl font-bold text-white mb-6">WorkFlow Tracker</h1>

          {/* User Name */}
          <div className="mb-2 text-white text-sm">
            {userName && <p>{userName}</p>}
          </div>

          <button
            className={`block w-full text-white font-bold py-2 px-4 rounded mb-4 focus:outline-none focus:shadow-outline ${showCreateWorkForm ? 'bg-emerald-700' : 'bg-gray-500'} hover:bg-emerald-700 transition-colors duration-300`}
            onClick={() => {
              setCreateWorkForm(!showCreateWorkForm);
              setShowWorkList(false);
            }}
          >
            Create Work
          </button>

          <button
            className={`block w-full text-white font-bold py-2 px-4 rounded mb-4 focus:outline-none focus:shadow-outline ${showWorkList ? 'bg-emerald-700' : 'bg-gray-500'} hover:bg-emerald-700 transition-colors duration-300`}
            onClick={() => {
              setShowWorkList(!showWorkList);
              setCreateWorkForm(false);
            }}
          >
            Work List
          </button>

          <button
            className="block w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-4 focus:outline-none focus:shadow-outline"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>
      </div>
    </div>
  );
};

export default Sidebar;
