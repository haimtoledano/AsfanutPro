
import React, { useState } from 'react';
import { CollectibleItem, StoreProfile, ItemType } from '../types';
import { Scale, Lock, Search, Filter } from './Icons';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ItemType | 'ALL'>('ALL');

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.analysis?.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.analysis?.year.includes(searchTerm) ||
      item.analysis?.origin.includes(searchTerm);
    
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Sort: Available first, then Sold
  filteredItems.sort((a, b) => {
    if (a.status === 'SOLD' && b.status !== 'SOLD') return 1;
    if (a.status !== 'SOLD' && b.status === 'SOLD') return -1;
    return 0;
  });

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
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-slate-800 border-r-4 pr-3 flex items-center gap-2" style={{ borderColor: brandColor }}>
            פריטים למכירה
            <span className="text-sm font-normal text-slate-400 px-2 bg-slate-100 rounded-full">{filteredItems.length}</span>
          </h2>

          <div className="flex gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="חיפוש..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-9 pl-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
             </div>
             <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200">
                <Filter className="w-4 h-4 text-slate-500" />
                <select 
                  value={typeFilter} 
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">הכל</option>
                  <option value={ItemType.COIN}>מטבעות</option>
                  <option value={ItemType.STAMP}>בולים</option>
                </select>
             </div>
          </div>
        </div>
        
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Scale className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-medium text-slate-600">לא נמצאו פריטים</h3>
            <p className="text-slate-400">נסה לשנות את החיפוש או חזור מאוחר יותר</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => onViewProduct(item)}
                className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 overflow-hidden transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${item.status === 'SOLD' ? 'grayscale opacity-90' : ''}`}
              >
                <div className="relative h-64 bg-slate-50 p-4 flex items-center justify-center overflow-hidden border-b border-slate-100">
                   <img 
                    src={item.frontImage} 
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 mix-blend-multiply" 
                    alt="Collectible Front" 
                   />
                   <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-slate-100 z-10">
                     {item.type}
                   </div>
                   {item.status === 'SOLD' && (
                     <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center z-20 backdrop-blur-[1px]">
                       <span className="bg-red-600 text-white px-6 py-2 font-bold text-xl rotate-[-12deg] shadow-xl border-4 border-white tracking-wider">נמכר</span>
                     </div>
                   )}
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
                       <span className={`text-2xl font-bold ${item.status === 'SOLD' ? 'line-through text-slate-400' : ''}`} style={item.status !== 'SOLD' ? { color: brandColor } : {}}>
                         {item.userPrice} ₪
                       </span>
                     </div>
                     <span className="text-sm font-medium hover:underline" style={{ color: brandColor }}>
                       {item.status === 'SOLD' ? 'צפה בפריט' : 'לפרטים ורכישה \u2190'}
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
