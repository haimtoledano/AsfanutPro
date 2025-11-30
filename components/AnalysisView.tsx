
import React, { useState, useEffect } from 'react';
import { AIAnalysisResult, ItemType, CollectibleItem, ItemStatus } from '../types';
import { RefreshCw, Wand2, Tag } from './Icons';
import { analyzeCollectibleItem } from '../services/gemini';

interface AnalysisViewProps {
  initialItem?: CollectibleItem; // For edit mode
  frontImage: string;
  backImage: string;
  analysis: AIAnalysisResult;
  type: ItemType;
  onSave: (item: CollectibleItem) => void;
  onCancel: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ 
  initialItem,
  frontImage, 
  backImage, 
  analysis: initialAnalysis, 
  type, 
  onSave, 
  onCancel 
}) => {
  // State for all editable fields
  const [itemName, setItemName] = useState(initialAnalysis.itemName);
  const [year, setYear] = useState(initialAnalysis.year);
  const [origin, setOrigin] = useState(initialAnalysis.origin);
  const [conditionGrade, setConditionGrade] = useState(initialAnalysis.conditionGrade);
  const [description, setDescription] = useState(initialAnalysis.description);
  const [estimatedValueRange, setEstimatedValueRange] = useState(initialAnalysis.estimatedValueRange);
  const [userPrice, setUserPrice] = useState(initialItem?.userPrice || '');
  const [anomalies, setAnomalies] = useState(initialAnalysis.anomalies);
  const [status, setStatus] = useState<ItemStatus>(initialItem?.status || 'AVAILABLE');
  
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Update state if props change (re-analysis from external not likely, but good practice)
  useEffect(() => {
    setItemName(initialAnalysis.itemName);
    setYear(initialAnalysis.year);
    setOrigin(initialAnalysis.origin);
    setConditionGrade(initialAnalysis.conditionGrade);
    setDescription(initialAnalysis.description);
    setEstimatedValueRange(initialAnalysis.estimatedValueRange);
    setAnomalies(initialAnalysis.anomalies);
  }, [initialAnalysis]);

  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleReanalyze = async () => {
    setIsReanalyzing(true);
    try {
      const result = await analyzeCollectibleItem(frontImage, backImage, type);
      // Update form fields with new result
      setItemName(result.itemName);
      setYear(result.year);
      setOrigin(result.origin);
      setConditionGrade(result.conditionGrade);
      setDescription(result.description);
      setEstimatedValueRange(result.estimatedValueRange);
      setAnomalies(result.anomalies);
    } catch (error) {
      console.error("Re-analysis failed", error);
      alert("שגיאה בביצוע ניתוח חוזר. אנא נסה שוב.");
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleSave = () => {
    if (!userPrice) return;
    
    // Construct the updated analysis object
    const updatedAnalysis: AIAnalysisResult = {
        itemName,
        year,
        origin,
        conditionGrade,
        description,
        estimatedValueRange,
        anomalies,
        confidenceScore: initialAnalysis.confidenceScore // Keep original or N/A
    };

    const newItem: CollectibleItem = {
      id: initialItem ? initialItem.id : generateId(),
      type,
      status, // Save selected status
      frontImage,
      backImage,
      analysis: updatedAnalysis,
      userPrice,
      createdAt: initialItem ? initialItem.createdAt : Date.now()
    };
    onSave(newItem);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-blue-600 p-4 text-white text-center flex justify-between items-center">
          <h2 className="text-2xl font-bold mx-auto">{initialItem ? 'עריכת פריט' : 'תוצאות ניתוח AI'}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Images */}
          <div className="bg-slate-50 p-6 flex flex-col gap-4 items-center justify-start border-b md:border-b-0 md:border-l border-slate-200">
            <div className="w-full aspect-square relative rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white p-2">
              <img src={frontImage} className="w-full h-full object-contain" alt="Front" />
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">קדמי</div>
            </div>
            <div className="w-full aspect-square relative rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white p-2">
              <img src={backImage} className="w-full h-full object-contain" alt="Back" />
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">אחורי</div>
            </div>
            
            <button 
              onClick={handleReanalyze}
              disabled={isReanalyzing}
              className="mt-4 w-full py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors border border-purple-200"
            >
              {isReanalyzing ? (
                <>מעבד...</>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  בצע ניתוח חוזר ב-AI
                </>
              )}
            </button>
            <p className="text-xs text-slate-500 text-center px-2">
              לחיצה על ניתוח חוזר תשלח את התמונות מחדש לבדיקה ותדרוס את השדות הקיימים.
            </p>
          </div>

          {/* Edit Form */}
          <div className="p-6 md:p-8 flex flex-col h-full overflow-y-auto">
            <div className="space-y-4 mb-8">
              
              {/* Status Selector */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                 <Tag className="w-5 h-5 text-slate-500" />
                 <label className="text-sm font-bold text-slate-700">סטטוס מכירה:</label>
                 <select 
                   value={status} 
                   onChange={(e) => setStatus(e.target.value as ItemStatus)}
                   className="flex-1 bg-white border border-slate-300 rounded p-1 text-sm font-medium"
                 >
                   <option value="AVAILABLE">זמין למכירה</option>
                   <option value="SOLD">נמכר</option>
                 </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">שם הפריט</label>
                <input 
                  type="text" 
                  value={itemName} 
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold text-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">מדינה/מקור</label>
                   <input 
                    type="text" 
                    value={origin} 
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 text-sm"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">שנה</label>
                   <input 
                    type="text" 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 text-sm"
                   />
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <label className="block text-xs font-bold text-amber-600 uppercase mb-1">מצב הפריט</label>
                <input 
                  type="text" 
                  value={conditionGrade} 
                  onChange={(e) => setConditionGrade(e.target.value)}
                  className="w-full p-2 bg-white border border-amber-200 rounded text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">תיאור</label>
                <textarea 
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 text-sm leading-relaxed resize-none"
                />
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <label className="block text-xs font-bold text-green-700 uppercase mb-1">הערכת שווי שוק (AI)</label>
                <input 
                  type="text" 
                  value={estimatedValueRange} 
                  onChange={(e) => setEstimatedValueRange(e.target.value)}
                  className="w-full p-2 bg-white border border-green-200 rounded text-slate-800 font-bold"
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="border-t pt-6 mt-auto">
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
                * המחיר שתקבע הוא המחיר שיוצג לקונה בחנות.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={onCancel}
                  className="py-3 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  ביטול
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!userPrice}
                  className={`py-3 rounded-xl font-bold text-white shadow transition ${!userPrice ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {initialItem ? 'עדכן פריט' : 'שמור למאגר'}
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
