import React, { useState } from 'react';
import { AIAnalysisResult, ItemType, CollectibleItem } from '../types';

interface AnalysisViewProps {
  frontImage: string;
  backImage: string;
  analysis: AIAnalysisResult;
  type: ItemType;
  onSave: (item: CollectibleItem) => void;
  onCancel: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ 
  frontImage, 
  backImage, 
  analysis, 
  type, 
  onSave, 
  onCancel 
}) => {
  const [userPrice, setUserPrice] = useState('');

  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleSave = () => {
    if (!userPrice) return;
    
    const newItem: CollectibleItem = {
      id: generateId(),
      type,
      frontImage,
      backImage,
      analysis,
      userPrice,
      createdAt: Date.now()
    };
    onSave(newItem);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-blue-600 p-4 text-white text-center">
          <h2 className="text-2xl font-bold">תוצאות ניתוח AI</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Images */}
          <div className="bg-slate-100 p-6 flex flex-col gap-4 items-center justify-center border-b md:border-b-0 md:border-l border-slate-200">
            <div className="w-full aspect-square relative rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-white">
              <img src={frontImage} className="w-full h-full object-contain" alt="Front" />
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">קדמי</div>
            </div>
            <div className="w-full aspect-square relative rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-white">
              <img src={backImage} className="w-full h-full object-contain" alt="Back" />
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">אחורי</div>
            </div>
          </div>

          {/* Data */}
          <div className="p-6 md:p-8 flex flex-col h-full">
            <div className="flex-1">
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-slate-800 mb-1">{analysis.itemName}</h3>
                <div className="flex gap-2 text-sm font-medium">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{type}</span>
                  <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded">{analysis.origin}</span>
                  <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded">{analysis.year}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <span className="block text-xs font-bold text-amber-600 uppercase mb-1">מצב הפריט</span>
                  <p className="text-lg font-medium text-slate-800">{analysis.conditionGrade}</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700 mb-2">תיאור ופרטים נוספים</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{analysis.description}</p>
                </div>

                {analysis.anomalies.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-700 mb-2">חריגות וליקויים שזוהו</h4>
                    <ul className="list-disc list-inside text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                      {analysis.anomalies.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <span className="block text-xs font-bold text-green-700 uppercase mb-1">הערכת שווי שוק (משוער)</span>
                  <p className="text-2xl font-bold text-slate-800">{analysis.estimatedValueRange}</p>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="border-t pt-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">המחיר המבוקש שלך (בשקלים)</label>
              <div className="flex gap-4">
                 <input 
                  type="number" 
                  value={userPrice}
                  onChange={(e) => setUserPrice(e.target.value)}
                  placeholder="לדוגמה: 150"
                  className="flex-1 p-3 border border-slate-300 rounded-xl text-lg font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 mb-4">
                * המחיר שתקבע הוא המחיר שיוצג לקונה.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={onCancel}
                  className="py-3 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  בטל
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!userPrice}
                  className={`py-3 rounded-xl font-bold text-white shadow transition ${!userPrice ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  שמור למאגר
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Disclaimer Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-500 text-center">
          המערכת מספקת הערכה ממוחשבת בלבד. הרכישה על אחריות הקונה ועליו האחריות לאמת את המטבע/הבול בתיאום מראש.
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
