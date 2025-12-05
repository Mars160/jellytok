import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { jellyfinApi } from '../services/jellyfin';
import type { Library } from '../types';
import { Settings as SettingsIcon, LogOut, Save, Server, User as UserIcon, Library as LibraryIcon, Filter, Gauge } from 'lucide-react';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const {
    serverUrl,
    user,
    selectedLibraryId,
    filters,
    bitrate,
    directPlayFirst,
    setServerUrl,
    setUser,
    setSelectedLibraryId,
    toggleFilter,
    setSorting,
    setBitrate,
    setDirectPlayFirst,
    reset,
  } = useStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [commitHash, setCommitHash] = useState('');

  useEffect(() => {
    if (user && serverUrl) {
      loadLibraries();
    }
    // Try to get commit hash from env (Vite) or from public/commit.txt
    const viteHash = import.meta.env.VITE_COMMIT_HASH;
    if (viteHash) {
      setCommitHash(viteHash);
      return;
    }

    const fetchHash = async () => {
      try {
        const res = await fetch('/commit.txt');
        if (!res.ok) return;
        const text = (await res.text()).trim();
        setCommitHash(text);
      } catch (err) {
        // ignore
      }
    };
    fetchHash();
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
    <div className="h-screen overflow-y-auto bg-black text-white p-6 flex flex-col gap-6 max-w-md mx-auto">
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
            <Gauge size={20} /> Quality (Bitrate)
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Auto / Max', value: 100000000 },
              { label: '1080p (10 Mbps)', value: 10000000 },
              { label: '720p (4 Mbps)', value: 4000000 },
              { label: '480p (1.5 Mbps)', value: 1500000 },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setBitrate(opt.value)}
                className={`p-3 rounded-lg border text-sm ${
                  (bitrate || 100000000) === opt.value
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-gray-900 border-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-700 mt-2">
            <span className="text-sm">Direct Play First (Fallback to Transcode)</span>
            <button
              onClick={() => setDirectPlayFirst(!directPlayFirst)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                directPlayFirst ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  directPlayFirst ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <h2 className="text-xl font-semibold flex items-center gap-2 mt-6">
            <Filter size={20} /> Filters
          </h2>
          
          <div className="grid grid-cols-2 gap-2">
            {[
              'IsUnplayed',
              'IsPlayed',
              'IsFavorite',
              'IsResumable',
              'Likes',
              'Dislikes',
            ].map((opt) => (
              <button
                key={opt}
                onClick={() => toggleFilter(opt as any)}
                className={`py-2 px-3 rounded-md text-sm text-left ${
                  (filters.selected || []).includes(opt as any)
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-800 text-gray-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Sorting</label>
            <div className="flex bg-gray-900 rounded-lg p-1">
              {['Shuffle', 'DateDesc', 'DateAsc'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSorting(opt as any)}
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

      {/* Version / Commit Hash */}
      <div className="text-center text-xs text-gray-400 mt-4 pb-6">
        Version: {commitHash ? commitHash.slice(0, 7) : 'unknown'}
      </div>
    </div>
  );
};
