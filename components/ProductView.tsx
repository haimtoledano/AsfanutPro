
import React, { useState } from 'react';
import { CollectibleItem, StoreProfile } from '../types';
import { AlertTriangle, ZoomIn, X, Share2, DollarSign } from './Icons';

interface ProductViewProps {
  item: CollectibleItem;
  profile: StoreProfile;
  onBack: () => void;
}

const ProductView: React.FC<ProductViewProps> = ({ item, profile, onBack }) => {
  const brandColor = profile.themeColor || '#2563eb';
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const isSold = item.status === 'SOLD';

  const handleContact = () => {
    // Construct email subject and body
    const subject = `התעניינות בפריט: ${item.analysis?.itemName}`;
    const body = `שלום ${profile.ownerName},%0D%0A%0D%0Aאני מעוניין בפריט "${item.analysis?.itemName}" (שנה: ${item.analysis?.year}) שראיתי באתר שלך במחיר ${item.userPrice} ש"ח.%0D%0A%0D%0Aאשמח לתאם בדיקה ורכישה.%0D%0A%0D%0Aתודה.`;
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  const handleMakeOffer = () => {
    const subject = `הצעת מחיר עבור: ${item.analysis?.itemName}`;
    const body = `שלום ${profile.ownerName},%0D%0A%0D%0Aאני מעוניין להציע מחיר אחר עבור הפריט "${item.analysis?.itemName}" (מחיר מבוקש: ${item.userPrice} ש"ח).%0D%0A%0D%0Aההצעה שלי היא: [הכנס מחיר כאן] ש"ח.%0D%0A%0D%0Aאשמח לשמוע ממך.%0D%0Aתודה.`;
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  const handleShare = (platform: 'whatsapp' | 'facebook') => {
    const url = window.location.href; // In a real app this would be a permalink
    const text = `תראו את הפריט המדהים הזה: ${item.analysis?.itemName} במחיר ${item.userPrice} ש"ח!`;
    
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    } else {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      {/* Lightbox Modal */}
      {zoomImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <button 
             onClick={() => setZoomImage(null)}
             className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
           >
             <X className="w-8 h-8" />
           </button>
           <img 
             src={zoomImage} 
             alt="Zoomed view" 
             className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-2xl"
           />
           <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
             <span className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm text-sm">
               לחץ מחוץ לתמונה או על ה-X לסגירה
             </span>
           </div>
           <div 
             className="absolute inset-0 -z-10" 
             onClick={() => setZoomImage(null)}
           />
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-6 flex items-center text-slate-600 font-medium transition-colors hover:opacity-75"
        >
          &rarr; חזרה לחנות
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative">
          {isSold && (
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20 overflow-hidden">
               <div className="absolute top-10 -left-10 bg-red-600 text-white w-40 text-center py-2 font-bold shadow-lg -rotate-45">
                 נמכר
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Image Gallery */}
            <div className="bg-slate-50 p-6 md:p-10 flex flex-col gap-6 items-center justify-center border-b md:border-b-0 md:border-l border-slate-100">
              <div 
                className="relative group w-full bg-white rounded-xl shadow-sm border border-slate-200 p-4 cursor-pointer"
                onClick={() => setZoomImage(item.frontImage)}
              >
                <div className="aspect-square flex items-center justify-center overflow-hidden">
                    <img 
                    src={item.frontImage} 
                    className={`max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105 ${isSold ? 'grayscale opacity-80' : ''}`}
                    alt="Front side" 
                    />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                   <ZoomIn className="w-10 h-10 text-white drop-shadow-md" />
                </div>
                <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">צד קדמי</span>
              </div>

              <div 
                className="relative group w-full bg-white rounded-xl shadow-sm border border-slate-200 p-4 cursor-pointer"
                onClick={() => setZoomImage(item.backImage)}
              >
                <div className="aspect-square flex items-center justify-center overflow-hidden">
                    <img 
                    src={item.backImage} 
                    className={`max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105 ${isSold ? 'grayscale opacity-80' : ''}`}
                    alt="Back side" 
                    />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                   <ZoomIn className="w-10 h-10 text-white drop-shadow-md" />
                </div>
                <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">צד אחורי</span>
              </div>
              
              <div className="text-xs text-slate-400 flex items-center gap-1">
                 <ZoomIn className="w-3 h-3" />
                 לחץ על תמונה להגדלה
              </div>
            </div>

            {/* Product Details */}
            <div className="p-8 md:p-12 flex flex-col">
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">{item.type}</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">{item.analysis?.origin}</span>
                  </div>
                  
                  {/* Share Buttons */}
                  <div className="flex gap-2">
                     <button onClick={() => handleShare('whatsapp')} className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition" title="שתף בוואטסאפ">
                        <Share2 className="w-5 h-5" />
                     </button>
                     <button onClick={() => handleShare('facebook')} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition" title="שתף בפייסבוק">
                        <Share2 className="w-5 h-5" />
                     </button>
                  </div>
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
                    <span className="block text-sm text-slate-500 mb-1">{isSold ? 'נמכר במחיר:' : 'מחיר למכירה:'}</span>
                    <span className={`text-4xl font-black ${isSold ? 'line-through text-slate-300' : ''}`} style={!isSold ? { color: brandColor } : {}}>{item.userPrice} ₪</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                   {!isSold && (
                    <>
                       <button 
                        onClick={handleContact}
                        className="w-full py-4 text-white rounded-xl font-bold text-lg hover:opacity-90 shadow-lg transition-all flex items-center justify-center gap-2"
                        style={{ backgroundColor: brandColor }}
                       >
                         צור קשר לרכישה
                       </button>
                       <button 
                        onClick={handleMakeOffer}
                        className="w-full py-3 bg-white border-2 text-slate-700 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        style={{ borderColor: brandColor, color: brandColor }}
                       >
                         <DollarSign className="w-5 h-5" />
                         הצע מחיר אחר
                       </button>
                    </>
                   )}
                   
                   {isSold && (
                     <div className="w-full py-4 bg-slate-100 text-slate-500 rounded-xl font-bold text-lg text-center cursor-not-allowed">
                       הפריט נמכר
                     </div>
                   )}

                   <div className="text-center text-sm text-slate-500 mt-2">
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
