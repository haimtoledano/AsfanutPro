import React, { useState } from 'react';
import { ViewState } from '../types';

interface LegalProps {
  onBack: () => void;
}

const Legal: React.FC<LegalProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'accessibility'>('terms');

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto my-8 border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">מרכז משפטי ומידע</h2>
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 underline">חזור</button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('terms')}
          className={`px-4 py-2 font-medium ${activeTab === 'terms' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
        >
          תנאי שימוש
        </button>
        <button 
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 font-medium ${activeTab === 'privacy' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
        >
          מדיניות פרטיות
        </button>
        <button 
          onClick={() => setActiveTab('accessibility')}
          className={`px-4 py-2 font-medium ${activeTab === 'accessibility' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
        >
          הצהרת נגישות
        </button>
      </div>

      <div className="h-96 overflow-y-auto p-4 bg-slate-50 rounded border border-slate-100 text-slate-700 leading-relaxed text-sm">
        {activeTab === 'terms' && (
          <div>
            <h3 className="text-lg font-bold mb-3">תנאי שימוש ודיסקליימר משפטי</h3>
            <p className="mb-4">
              <strong>אזהרה חשובה:</strong> המערכת מספקת הערכות שווי וניתוח פריטים (מטבעות ובולים) באמצעות בינה מלאכותית (AI). 
              הערכות אלו הן בגדר חוות דעת ממוחשבת בלבד ואינן מהוות תחליף לבדיקה פיזית על ידי שמאי מוסמך או מומחה בתחום.
            </p>
            <p className="mb-4">
              <strong>אחריות הקונה:</strong> כל רכישה המתבצעת בעקבות שימוש במערכת זו הינה על אחריות הקונה בלבד. 
              על הקונה מוטלת האחריות המלאה לאמת את מקוריות המטבע/הבול, מצבו וערכו לפני ביצוע התשלום.
            </p>
            <p className="mb-4">
              <strong>תיאום בדיקה:</strong> מומלץ לקונים לתאם פגישה פיזית לבדיקת הפריט לפני הרכישה. המוכר מתחייב לאפשר בדיקה כזו בתיאום מראש.
            </p>
            <p className="mb-4">
              בעלי האתר והמערכת אינם נושאים באחריות לכל נזק ישיר או עקיף, כספי או אחר, שייגרם כתוצאה מהסתמכות על המידע המוצג במערכת.
            </p>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div>
            <h3 className="text-lg font-bold mb-3">מדיניות פרטיות</h3>
            <p className="mb-4">
              אנו מכבדים את פרטיותך. מסמך זה מפרט את אופן איסוף והשימוש במידע במערכת.
            </p>
            <ul className="list-disc pr-5 mb-4 space-y-2">
              <li><strong>מידע אישי:</strong> פרטי החנות (שם, טלפון, אימייל) נשמרים באופן מקומי בדפדפן שלך (LocalStorage) ואינם מועברים לשרתים צד ג' ללא אישור מפורש.</li>
              <li><strong>תמונות:</strong> תמונות המטבעות/בולים נשלחות ל-Google Gemini API לצורך ניתוח בלבד.</li>
              <li><strong>שימוש במידע:</strong> המידע משמש אך ורק לתפעול השוטף של המערכת, יצירת קטלוג המכירה וניתוח הפריטים.</li>
            </ul>
          </div>
        )}

        {activeTab === 'accessibility' && (
          <div>
            <h3 className="text-lg font-bold mb-3">הצהרת נגישות</h3>
            <p className="mb-4">
              אנו פועלים רבות על מנת להנגיש את המערכת לכלל האוכלוסייה, כולל אנשים עם מוגבלויות, בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות ותקנות הנגישות.
            </p>
            <h4 className="font-bold mb-2">התאמות שבוצעו:</h4>
            <ul className="list-disc pr-5 mb-4 space-y-2">
              <li>ניווט מקלדת מלא.</li>
              <li>תמיכה בקוראי מסך.</li>
              <li>ניגודיות צבעים גבוהה לקריאות מיטבית.</li>
              <li>טפסים נגישים עם תוויות ברורות.</li>
            </ul>
            <p className="mb-4">
              אם נתקלתם בבעיית נגישות, אנא צרו עמנו קשר בפרטי הקשר המופיעים בעמוד ההגדרות, ואנו נטפל בפנייה בהקדם האפשרי.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Legal;