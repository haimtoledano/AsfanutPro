import React, { useState } from 'react';
import { StoreProfile } from '../types';

interface LoginProps {
  profile: StoreProfile;
  onLoginSuccess: () => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ profile, onLoginSuccess, onBack }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === profile.password) {
      onLoginSuccess();
    } else {
      setError('הסיסמה שגויה. נסה שוב.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🔐
          </div>
          <h2 className="text-2xl font-bold text-slate-800">כניסת מנהל</h2>
          <p className="text-slate-500">הזן סיסמה לניהול החנות "{profile.storeName}"</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 transition-colors shadow-lg"
          >
            התחבר
          </button>
          
          <button
            type="button"
            onClick={onBack}
            className="w-full py-2 text-slate-500 hover:text-slate-800 text-sm"
          >
            חזרה לחנות
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;