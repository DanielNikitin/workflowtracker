// components/Status.js

export const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:3009/api/status');
      if (response.ok) {
        return 'Server status: Online';
      } else {
        return 'Server status: Offline';
      }
    } catch (error) {
      console.error('Error checking server status:', error);
      return 'Server status: Offline';
    }
  };
  