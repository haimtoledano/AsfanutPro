import React from 'react';
import { CollectibleItem, StoreProfile } from '../types';
import { AlertTriangle } from './Icons';

interface ProductViewProps {
  item: CollectibleItem;
  profile: StoreProfile;
  onBack: () => void;
}

const ProductView: React.FC<ProductViewProps> = ({ item, profile, onBack }) => {
  const brandColor = profile.themeColor || '#2563eb';

  const handleContact = () => {
    // Construct email subject and body
    const subject = `התעניינות בפריט: ${item.analysis?.itemName}`;
    const body = `שלום ${profile.ownerName},%0D%0A%0D%0Aאני מעוניין בפריט "${item.analysis?.itemName}" (שנה: ${item.analysis?.year}) שראיתי באתר שלך במחיר ${item.userPrice} ש"ח.%0D%0A%0D%0Aאשמח לתאם בדיקה ורכישה.%0D%0A%0D%0Aתודה.`;
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-6 flex items-center text-slate-600 font-medium transition-colors hover:opacity-75"
        >
          &rarr; חזרה לחנות
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Image Gallery */}
            <div className="bg-slate-100 p-6 md:p-10 flex flex-col gap-6">
              <div className="relative group">
                <img 
                  src={item.frontImage} 
                  className="w-full rounded-xl shadow-lg hover:shadow-2xl transition-shadow cursor-zoom-in" 
                  alt="Front side" 
                />
                <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">צד קדמי</span>
              </div>
              <div className="relative group">
                <img 
                  src={item.backImage} 
                  className="w-full rounded-xl shadow-lg hover:shadow-2xl transition-shadow cursor-zoom-in" 
                  alt="Back side" 
                />
                <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">צד אחורי</span>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-8 md:p-12 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">{item.type}</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">{item.analysis?.origin}</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{item.analysis?.itemName}</h1>
              <p className="text-xl text-slate-500 mb-8">שנת הנפקה: {item.analysis?.year}</p>

              <div className="prose prose-slate mb-8">
                <h3 className="text-lg font-bold text-slate-800 mb-2">תיאור הפריט</h3>
                <p className="text-slate-600 leading-relaxed">{item.analysis?.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="block text-xs text-slate-400 mb-1">מצב משוער</span>
                  <span className="font-bold text-slate-800">{item.analysis?.conditionGrade}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="block text-xs text-slate-400 mb-1">הערכת שווי שוק</span>
                  <span className="font-bold text-slate-800">{item.analysis?.estimatedValueRange}</span>
                </div>
              </div>

              {item.analysis?.anomalies && item.analysis.anomalies.length > 0 && (
                <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <h4 className="flex items-center gap-2 font-bold text-amber-800 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    הערות מיוחדות / חריגות
                  </h4>
                  <ul className="list-disc list-inside text-sm text-amber-900 space-y-1">
                    {item.analysis.anomalies.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto pt-8 border-t border-slate-100">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="block text-sm text-slate-500 mb-1">מחיר למכירה:</span>
                    <span className="text-4xl font-black" style={{ color: brandColor }}>{item.userPrice} ₪</span>
                  </div>
                </div>

                <div className="space-y-3">
                   <button 
                    onClick={handleContact}
                    className="w-full py-4 text-white rounded-xl font-bold text-lg hover:opacity-90 shadow-lg transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: brandColor }}
                   >
                     צור קשר לרכישה
                   </button>
                   <div className="text-center text-sm text-slate-500">
                     ניתן לתאם בדיקה בכתובת: <span className="font-medium text-slate-700">{profile.address}</span>
                   </div>
                </div>
                
                {/* Legal Warning Box */}
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 leading-tight">
                  <strong>שים לב:</strong> הרכישה על אחריות הקונה בלבד. עליך לאמת את המטבע/הבול בתיאום מראש. המערכת מספקת הערכה ממוחשבת בלבד.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;