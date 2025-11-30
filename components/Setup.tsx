
import React, { useState } from 'react';
import { StoreProfile } from '../types';
import { Settings, Lock } from './Icons';
import { analyzeLogoColor } from '../services/gemini';
import { APP_CONFIG } from '../config';

interface SetupProps {
  initialProfile: StoreProfile | null;
  onSave: (profile: StoreProfile) => void;
  onCancel?: () => void;
}

const Setup: React.FC<SetupProps> = ({ initialProfile, onSave, onCancel }) => {
  const [profile, setProfile] = useState<StoreProfile>(initialProfile || {
    storeName: '',
    logoUrl: null,
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    termsAccepted: false,
    password: '',
    themeColor: APP_CONFIG.defaultThemeColor,
    apiKey: ''
  });
  
  const [suggestedColors, setSuggestedColors] = useState<string[]>([]);
  const [isAnalyzingColor, setIsAnalyzingColor] = useState(false);
  const [useCustomDesign, setUseCustomDesign] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
    
    // If user hasn't entered a key yet, warn them
    if (!profile.apiKey) {
      alert("אנא הזן מפתח API (Google Gemini API Key) בסעיף ההגדרות למטה כדי להשתמש ב-AI.");
      return;
    }

    setIsAnalyzingColor(true);
    try {
      // Pass the current key from state because it might not be saved in DB yet
      const colors = await analyzeLogoColor(profile.logoUrl, profile.apiKey);
      setSuggestedColors(colors);
    } catch (e) {
      console.error(e);
      alert("שגיאה בניתוח הצבעים. וודא שמפתח ה-API תקין.");
    } finally {
      setIsAnalyzingColor(false);
    }
  };

  const resetDesign = () => {
    setSuggestedColors([]);
    setProfile(prev => ({ ...prev, themeColor: APP_CONFIG.defaultThemeColor }));
    setUseCustomDesign(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.termsAccepted && profile.password && profile.apiKey) {
      setIsSaving(true);
      try {
        await onSave(profile);
      } catch (e) {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-slate-100 my-8">
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-blue-50 rounded-full mb-4">
          <Settings className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">
          {initialProfile ? 'עדכון פרטי חנות' : 'הגדרת חנות'}
        </h1>
        <p className="text-slate-500 mt-2">הזן את פרטי העסק שלך והגדרות המערכת</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* API Key Configuration - High Priority */}
        <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-md">
          <div className="flex items-center gap-2 mb-4 text-amber-400">
             <Lock className="w-5 h-5" />
             <h3 className="font-bold">הגדרות חיבור ל-AI (חובה)</h3>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-slate-300 mb-1">Google Gemini API Key</label>
            <input
              type="password"
              required
              value={profile.apiKey || ''}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-sm"
              placeholder="AIzaSy..."
            />
            <p className="text-xs text-slate-400 mt-2">
              המערכת דורשת מפתח API פעיל כדי לבצע זיהוי תמונות והערכת שווי.
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline mr-1">
                 לחץ כאן להנפקת מפתח בחינם.
              </a>
            </p>
          </div>
        </div>

        {/* Logo and Branding Section */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700">מיתוג ועיצוב</h3>
            <button 
              type="button" 
              onClick={resetDesign}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              אפס לברירת מחדל
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo Upload */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-32 h-32 rounded-full bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-blue-500 transition-colors cursor-pointer group shadow-sm">
                {profile.logoUrl ? (
                  <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
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
                  value={profile.themeColor || APP_CONFIG.defaultThemeColor}
                  onChange={(e) => {
                    handleChange('themeColor', e.target.value);
                    setUseCustomDesign(true);
                  }}
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
                             onClick={() => {
                               handleChange('themeColor', color);
                               setUseCustomDesign(true);
                             }}
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

        {/* Security Password */}
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

        <div className="flex gap-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl font-bold text-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              ביטול
            </button>
          )}
          
          <button
            type="submit"
            disabled={!profile.termsAccepted || !profile.password || !profile.apiKey || isSaving}
            className={`flex-1 py-3 rounded-xl font-bold text-lg shadow transition-colors flex items-center justify-center gap-2 ${profile.termsAccepted && profile.password && profile.apiKey && !isSaving ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
            style={profile.termsAccepted && profile.password && profile.apiKey && profile.themeColor && !isSaving ? { backgroundColor: profile.themeColor } : {}}
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                שומר נתונים...
              </>
            ) : (
              initialProfile ? 'עדכן פרטים' : 'צור חנות'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Setup;
