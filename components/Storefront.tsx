import React from 'react';
import { CollectibleItem, StoreProfile } from '../types';
import { Scale, Lock } from './Icons';

interface StorefrontProps {
  items: CollectibleItem[];
  profile: StoreProfile;
  onViewProduct: (item: CollectibleItem) => void;
  onAdminLogin: () => void;
}

const Storefront: React.FC<StorefrontProps> = ({ 
  items, 
  profile, 
  onViewProduct,
  onAdminLogin
}) => {
  const brandColor = profile.themeColor || '#2563eb';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Public Header / Hero Section */}
      <div className="bg-white border-b border-slate-200 relative">
        {/* Admin Login Button - Top Left */}
        <button 
          onClick={onAdminLogin}
          className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors border border-slate-300"
          title="כניסת מנהל / העלאת פריטים"
        >
          <Lock className="w-4 h-4" />
          <span className="hidden md:inline">ניהול חנות</span>
        </button>

        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-right">
            {profile.logoUrl ? (
              <img 
                src={profile.logoUrl} 
                alt={profile.storeName} 
                className="w-32 h-32 md:w-56 md:h-56 rounded-full object-contain bg-slate-50 border-4 border-slate-100 shadow-lg" 
              />
            ) : (
              <div 
                className="w-32 h-32 md:w-56 md:h-56 rounded-full flex items-center justify-center text-white font-bold text-5xl md:text-7xl shadow-lg"
                style={{ backgroundColor: brandColor }}
              >
                {profile.storeName.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl md:text-6xl font-black text-slate-800 mb-4">{profile.storeName}</h1>
              <p className="text-xl md:text-2xl text-slate-600 mb-6 font-light">אוסף בולים ומטבעות נדירים ואותנטיים</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm md:text-base text-slate-500 font-medium">
                <span className="flex items-center gap-1">📍 {profile.address}</span>
                <span className="flex items-center gap-1">📞 {profile.phone}</span>
                <span className="flex items-center gap-1">📧 {profile.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <h2 className="text-2xl font-bold text-slate-800 mb-8 border-r-4 pr-3 flex items-center gap-2" style={{ borderColor: brandColor }}>
          פריטים למכירה
          <span className="text-sm font-normal text-slate-400 px-2 bg-slate-100 rounded-full">{items.length}</span>
        </h2>
        
        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Scale className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-medium text-slate-600">החנות מתעדכנת ברגעים אלו</h3>
            <p className="text-slate-400">אנא חיזרו מאוחר יותר לצפייה בפריטים חדשים</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <div 
                key={item.id} 
                onClick={() => onViewProduct(item)}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 overflow-hidden transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                <div className="relative h-64 bg-slate-50 p-4 flex items-center justify-center overflow-hidden border-b border-slate-100">
                   <img 
                    src={item.frontImage} 
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" 
                    alt="Collectible Front" 
                   />
                   <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-slate-100">
                     {item.type}
                   </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="font-bold text-xl text-slate-800 mb-1 line-clamp-1 transition-colors" style={{ color: 'inherit' }}>
                      {item.analysis?.itemName}
                    </h3>
                    <p className="text-slate-500 text-sm">{item.analysis?.origin} • {item.analysis?.year}</p>
                  </div>
                  
                  <div className="flex justify-between items-end border-t border-slate-100 pt-4">
                     <div className="flex flex-col">
                       <span className="text-xs text-slate-400 mb-1">מחיר מבוקש</span>
                       <span className="text-2xl font-bold" style={{ color: brandColor }}>{item.userPrice} ₪</span>
                     </div>
                     <span className="text-sm font-medium hover:underline" style={{ color: brandColor }}>
                       צפה בפרטים &larr;
                     </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Disclaimer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-12 border-t border-slate-800">
        <div className="container mx-auto px-4 max-w-4xl text-center text-sm leading-relaxed">
          <p className="font-bold text-slate-200 mb-2">דיסקליימר משפטי והצהרת אחריות</p>
          <p className="mb-4">
            כל המידע המוצג באתר זה, לרבות הערכות מצב ושווי פריטים, מבוסס על ניתוח בינה מלאכותית (AI) ואינו מהווה חוות דעת של שמאי מוסמך.
            רכישת הפריטים הינה על אחריות הקונה בלבד. על הקונה מוטלת האחריות המלאה לאמת את מקוריות המטבע/הבול, מצבו וערכו בבדיקה פיזית לפני ביצוע התשלום.
            החנות ובעליה אינם אחראים לכל אי-התאמה בין התיאור הממוחשב למצב בפועל.
          </p>
          <div className="flex justify-center gap-4 mb-6 text-slate-500">
             <button onClick={() => window.scrollTo(0,0)} className="hover:text-white">מדיניות פרטיות</button>
             <span>|</span>
             <button onClick={() => window.scrollTo(0,0)} className="hover:text-white">תנאי שימוש</button>
             <span>|</span>
             <button onClick={() => window.scrollTo(0,0)} className="hover:text-white">הצהרת נגישות</button>
          </div>
          <p className="mb-8">
            &copy; {new Date().getFullYear()} {profile.storeName}. כל הזכויות שמורות.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Storefront;