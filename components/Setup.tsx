import React, { useState } from 'react';
import { StoreProfile } from '../types';
import { Settings } from './Icons';
import { analyzeLogoColor } from '../services/gemini';

interface SetupProps {
  initialProfile: StoreProfile | null;
  onSave: (profile: StoreProfile) => void;
}

const Setup: React.FC<SetupProps> = ({ initialProfile, onSave }) => {
  const [profile, setProfile] = useState<StoreProfile>(initialProfile || {
    storeName: '',
    logoUrl: null,
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    termsAccepted: false,
    password: '',
    themeColor: '#2563eb' // Default blue
  });
  
  const [suggestedColors, setSuggestedColors] = useState<string[]>([]);
  const [isAnalyzingColor, setIsAnalyzingColor] = useState(false);

  const handleChange = (field: keyof StoreProfile, value: string | boolean) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfile(prev => ({ ...prev, logoUrl: result }));
        setSuggestedColors([]); // Reset previous suggestions
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeColors = async () => {
    if (!profile.logoUrl) return;
    setIsAnalyzingColor(true);
    try {
      const colors = await analyzeLogoColor(profile.logoUrl);
      setSuggestedColors(colors);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingColor(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.termsAccepted && profile.password) {
      onSave(profile);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-slate-100 my-8">
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-blue-50 rounded-full mb-4">
          <Settings className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">הגדרת חנות</h1>
        <p className="text-slate-500 mt-2">הזן את פרטי העסק שלך כדי להתחיל להשתמש במערכת</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Logo and Branding Section */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="font-bold text-slate-700 mb-4">מיתוג ועיצוב</h3>
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo Upload */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-32 h-32 rounded-full bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-blue-500 transition-colors cursor-pointer group shadow-sm">
                {profile.logoUrl ? (
                  <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm text-slate-400 text-center px-2">העלה לוגו</span>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoUpload} 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-xs text-slate-500">לחץ להעלאת תמונה</span>
            </div>

            {/* Color Selection */}
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-2">צבע ראשי לחנות</label>
              
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="color"
                  value={profile.themeColor || '#2563eb'}
                  onChange={(e) => handleChange('themeColor', e.target.value)}
                  className="h-10 w-20 rounded cursor-pointer border border-slate-300"
                />
                <span className="text-sm font-mono text-slate-500">{profile.themeColor}</span>
              </div>

              {profile.logoUrl && (
                <div>
                   {suggestedColors.length === 0 ? (
                     <button
                       type="button"
                       onClick={handleAnalyzeColors}
                       disabled={isAnalyzingColor}
                       className="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
                     >
                       {isAnalyzingColor ? 'מנתח צבעים...' : '✨ הצע צבעים מהלוגו באמצעות AI'}
                     </button>
                   ) : (
                     <div className="mt-2">
                       <span className="text-xs text-slate-500 block mb-1">צבעים שהוצעו מהלוגו:</span>
                       <div className="flex gap-2">
                         {suggestedColors.map((color) => (
                           <button
                             key={color}
                             type="button"
                             onClick={() => handleChange('themeColor', color)}
                             className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform ring-1 ring-slate-200"
                             style={{ backgroundColor: color }}
                             title={`בחר צבע ${color}`}
                           />
                         ))}
                       </div>
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Store Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">שם החנות</label>
            <input
              type="text"
              required
              value={profile.storeName}
              onChange={(e) => handleChange('storeName', e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="אוסף הזהב שלי"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">שם בעלים</label>
            <input
              type="text"
              required
              value={profile.ownerName}
              onChange={(e) => handleChange('ownerName', e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ישראל ישראלי"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">טלפון</label>
            <input
              type="tel"
              required
              value={profile.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="050-1234567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">אימייל</label>
            <input
              type="email"
              required
              value={profile.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="example@store.com"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">כתובת</label>
          <input
            type="text"
            required
            value={profile.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="רחוב הרצל 1, תל אביב"
          />
        </div>

        {/* Security */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <label className="block text-sm font-bold text-slate-700 mb-1">סיסמת ניהול (חובה)</label>
          <input
            type="password"
            required
            value={profile.password || ''}
            onChange={(e) => handleChange('password', e.target.value)}
            className="w-full p-3 rounded-lg border border-red-200 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
            placeholder="בחר סיסמה חזקה להגנה על אזור הניהול"
          />
          <p className="text-xs text-slate-500 mt-1">סיסמה זו תשמש אותך לכניסה לממשק הוספת המוצרים.</p>
        </div>

        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
          <input
            type="checkbox"
            id="terms"
            required
            checked={profile.termsAccepted}
            onChange={(e) => handleChange('termsAccepted', e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <label htmlFor="terms" className="text-sm text-slate-600">
            אני מאשר כי קראתי את תנאי השימוש, הצהרת הנגישות ומדיניות הפרטיות, וכי כל המידע המוזן הוא נכון ומדויק.
          </label>
        </div>

        <button
          type="submit"
          disabled={!profile.termsAccepted || !profile.password}
          className={`w-full py-3 rounded-xl font-bold text-lg shadow transition-colors ${profile.termsAccepted && profile.password ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
          style={profile.termsAccepted && profile.password && profile.themeColor ? { backgroundColor: profile.themeColor } : {}}
        >
          {initialProfile ? 'עדכן פרטים' : 'צור חנות'}
        </button>
      </form>
    </div>
  );
};

export default Setup;