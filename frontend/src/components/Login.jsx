import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState('ops');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    const authData = {
      role,
      username,
      loggedInAt: new Date().toISOString()
    };

    // Store auth data and trigger login (splash screen will show in App)
    localStorage.setItem('fedexOpsAuth', JSON.stringify(authData));
    onLogin(authData);
    
    // Navigate after splash screen completes (handled by App timeout)
    setTimeout(() => {
      navigate('/');
    }, 2500); // 2.5 seconds
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center bg-white rounded px-2 py-1 border border-gray-200">
            <span className="text-2xl font-bold tracking-tighter leading-none">
              <span className="text-[#4D148C]">Fed</span>
              <span className="text-[#FF6600]">Ex</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-3">OpsPulse Login</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to access operations tools</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="admin">Admin</option>
              <option value="ops">Ops Team</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="enter username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="enter password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md text-white bg-[#4D148C] hover:bg-[#3e0f73] transition-all"
          >
            <span className="material-icons text-sm mr-2">login</span>
            Sign In
          </button>
        </form>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          Admin has access to all modules. Ops Team has limited access.
        </div>
      </div>
    </div>
  );
};

export default Login;
