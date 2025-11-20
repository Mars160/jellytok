import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { jellyfinApi } from '../services/jellyfin';
import type { Library } from '../types';
import { Settings as SettingsIcon, LogOut, Save, Server, User as UserIcon, Library as LibraryIcon, Filter } from 'lucide-react';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const {
    serverUrl,
    user,
    selectedLibraryId,
    filters,
    setServerUrl,
    setUser,
    setSelectedLibraryId,
    setFilter,
    reset,
  } = useStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && serverUrl) {
      loadLibraries();
    }
  }, [user, serverUrl]);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const userData = await jellyfinApi.authenticate(username, password);
      setUser(userData);
    } catch (err) {
      setError('Login failed. Check URL and credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadLibraries = async () => {
    if (!user) return;
    try {
      const libs = await jellyfinApi.getViews(user.Id);
      setLibraries(libs);
    } catch (err) {
      console.error('Failed to load libraries', err);
    }
  };

  const handleSave = () => {
    if (serverUrl && user && selectedLibraryId) {
      navigate('/');
    } else {
      setError('Please complete all configurations.');
    }
  };

  const handleLogout = () => {
    reset();
    setUsername('');
    setPassword('');
    setLibraries([]);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col gap-6 max-w-md mx-auto">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon /> Settings
        </h1>
        {user && (
          <button onClick={handleLogout} className="text-red-500">
            <LogOut />
          </button>
        )}
      </header>

      {/* Server Config */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Server size={20} /> Server
        </h2>
        <input
          type="text"
          placeholder="Server URL (e.g., http://192.168.1.10:8096)"
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </section>

      {/* Login */}
      {!user && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <UserIcon size={20} /> Login
          </h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg"
          />
          <button
            onClick={handleLogin}
            disabled={loading || !serverUrl}
            className="w-full bg-blue-600 p-3 rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </section>
      )}

      {/* Library Selection */}
      {user && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <LibraryIcon size={20} /> Library
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {libraries.map((lib) => (
              <button
                key={lib.Id}
                onClick={() => setSelectedLibraryId(lib.Id)}
                className={`p-3 rounded-lg border ${
                  selectedLibraryId === lib.Id
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-gray-900 border-gray-700'
                }`}
              >
                {lib.Name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      {user && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Filter size={20} /> Filters
          </h2>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Play Status</label>
            <div className="flex bg-gray-900 rounded-lg p-1">
              {['All', 'Unplayed', 'Played'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilter('playStatus', opt)}
                  className={`flex-1 py-2 rounded-md text-sm ${
                    filters.playStatus === opt ? 'bg-gray-700' : ''
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Favorites</label>
            <div className="flex bg-gray-900 rounded-lg p-1">
              {['All', 'Favorites', 'NonFavorites'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilter('favoriteStatus', opt)}
                  className={`flex-1 py-2 rounded-md text-sm ${
                    filters.favoriteStatus === opt ? 'bg-gray-700' : ''
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Sorting</label>
            <div className="flex bg-gray-900 rounded-lg p-1">
              {['Shuffle', 'DateDesc', 'DateAsc'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilter('sorting', opt)}
                  className={`flex-1 py-2 rounded-md text-sm ${
                    filters.sorting === opt ? 'bg-gray-700' : ''
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {error && <p className="text-red-500 text-center">{error}</p>}

      {user && selectedLibraryId && (
        <button
          onClick={handleSave}
          className="w-full bg-green-600 p-4 rounded-lg font-bold flex items-center justify-center gap-2 mt-4"
        >
          <Save /> Start Watching
        </button>
      )}
    </div>
  );
};
