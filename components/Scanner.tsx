import React, { useState } from 'react';
import { Camera, Upload, AlertTriangle } from './Icons';
import { ItemType, AIAnalysisResult } from '../types';
import { analyzeCollectibleItem } from '../services/gemini';
import ImageEditor from './ImageEditor';

interface ScannerProps {
  onAnalysisComplete: (front: string, back: string, analysis: AIAnalysisResult, type: ItemType) => void;
  onCancel: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onAnalysisComplete, onCancel }) => {
  const [itemType, setItemType] = useState<ItemType>(ItemType.COIN);
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Editor State
  const [editingImage, setEditingImage] = useState<{data: string, side: 'front' | 'back'} | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Instead of setting image directly, open editor
        setEditingImage({
          data: reader.result as string,
          side: side
        });
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow same file selection again
    e.target.value = '';
  };

  const handleEditorSave = (editedData: string) => {
    if (editingImage) {
      if (editingImage.side === 'front') setFrontImage(editedData);
      else setBackImage(editedData);
    }
    setEditingImage(null);
  };

  const handleAnalyze = async () => {
    if (!frontImage || !backImage) {
      setError("חובה להעלות תמונה של שני הצדדים");
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await analyzeCollectibleItem(frontImage, backImage, itemType);
      onAnalysisComplete(frontImage, backImage, result, itemType);
    } catch (err) {
      console.error(err);
      setError("אירעה שגיאה בניתוח התמונה. אנא נסה שנית או וודא שהתמונה ברורה.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {editingImage && (
        <ImageEditor 
          imageBase64={editingImage.data}
          onSave={handleEditorSave}
          onCancel={() => setEditingImage(null)}
        />
      )}

      <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">הוספת פריט חדש</h2>
      
      {/* Type Selection */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setItemType(ItemType.COIN)}
          className={`px-6 py-3 rounded-full font-bold transition-colors ${itemType === ItemType.COIN ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-200 text-slate-600'}`}
        >
          מטבע
        </button>
        <button
          onClick={() => setItemType(ItemType.STAMP)}
          className={`px-6 py-3 rounded-full font-bold transition-colors ${itemType === ItemType.STAMP ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 text-slate-600'}`}
        >
          בול
        </button>
      </div>

      {/* Image Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[
          { label: "צד קדמי", value: frontImage, setter: 'front' as const },
          { label: "צד אחורי", value: backImage, setter: 'back' as const }
        ].map((side) => (
          <div key={side.label} className="flex flex-col items-center">
            <span className="mb-2 font-medium text-slate-600">{side.label}</span>
            <div className={`relative w-full aspect-square bg-slate-50 rounded-xl border-2 border-dashed ${side.value ? 'border-blue-500 bg-white' : 'border-slate-300'} flex items-center justify-center overflow-hidden group`}>
              {side.value ? (
                <>
                  <img src={side.value} alt={side.label} className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-bold bg-black/50 px-3 py-1 rounded-full text-sm">לחץ לעריכה/החלפה</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <Camera className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <span className="text-xs text-slate-400">לחץ לצילום או העלאה</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => handleImageUpload(e, side.setter)}
              />
            </div>
            {side.value && (
               <button 
                 onClick={() => setEditingImage({ data: side.value!, side: side.setter })}
                 className="mt-2 text-xs text-blue-600 hover:underline"
               >
                 ערוך תמונה שוב
               </button>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border-r-4 border-red-500 p-4 mb-6 rounded text-red-700 flex items-center">
          <AlertTriangle className="w-5 h-5 ml-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !frontImage || !backImage}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-md flex items-center justify-center gap-2 ${isAnalyzing || !frontImage || !backImage ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'}`}
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              מעבד נתונים ב-AI...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              בצע הערכת AI
            </>
          )}
        </button>
        
        <button 
          onClick={onCancel}
          disabled={isAnalyzing}
          className="text-slate-500 py-2 hover:text-slate-800 transition-colors"
        >
          ביטול
        </button>
      </div>
    </div>
  );
};

export default Scanner;