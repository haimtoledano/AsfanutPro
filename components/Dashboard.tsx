
import React from 'react';
import { CollectibleItem, StoreProfile } from '../types';
import { Plus, Scale, Edit } from './Icons';

interface DashboardProps {
  items: CollectibleItem[];
  profile: StoreProfile;
  onAddItem: () => void;
  onEditItem: (item: CollectibleItem) => void;
  onDeleteItem: (id: string) => void;
  onViewLegal: () => void;
  onEditProfile: () => void;
  onGoToStore: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  items, 
  profile, 
  onAddItem, 
  onEditItem,
  onDeleteItem,
  onViewLegal,
  onEditProfile,
  onGoToStore
}) => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          {profile.logoUrl ? (
            <img src={profile.logoUrl} alt={profile.storeName} className="w-16 h-16 rounded-full object-contain bg-slate-50 border-2 border-slate-200" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
              {profile.storeName.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{profile.storeName}</h1>
            <p className="text-slate-500 text-sm">בבעלות {profile.ownerName} (מצב ניהול)</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 justify-center md:justify-end">
           <button 
             onClick={onGoToStore}
             className="px-4 py-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg font-bold transition-colors"
           >
             תצוגה מקדימה לחנות
           </button>
           <button 
            onClick={onEditProfile}
            className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
          >
            הגדרות
          </button>
          <button 
            onClick={onViewLegal}
            className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
          >
            משפטי
          </button>
          <button 
            onClick={onAddItem}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-colors flex items-center gap-2"
            style={{ backgroundColor: profile.themeColor }}
          >
            <Plus className="w-5 h-5" />
            פריט חדש
          </button>
        </div>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <Scale className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-medium text-slate-600">האוסף שלך ריק כרגע</h3>
          <p className="text-slate-400 mb-6">התחל לסרוק מטבעות ובולים כדי לבנות את הקטלוג שלך</p>
          <button 
            onClick={onAddItem}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
            style={{ backgroundColor: profile.themeColor }}
          >
            הוסף את הפריט הראשון
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="relative h-48 bg-white grid grid-cols-2 gap-0 border-b border-slate-100">
                 <div className="flex items-center justify-center p-2 bg-slate-50">
                    <img src={item.frontImage} className="w-full h-full object-contain" alt="Front" />
                 </div>
                 <div className="flex items-center justify-center p-2 bg-slate-50 border-r border-slate-100">
                    <img src={item.backImage} className="w-full h-full object-contain" alt="Back" />
                 </div>
                 <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                   {item.type}
                 </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{item.analysis?.itemName}</h3>
                </div>
                
                <div className="space-y-2 text-sm text-slate-600 mb-4 flex-1">
                  <div className="flex justify-between">
                    <span>שנה:</span>
                    <span className="font-medium">{item.analysis?.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>מצב:</span>
                    <span className="font-medium text-amber-600">{item.analysis?.conditionGrade}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 mt-auto">
                   <div className="flex justify-between items-end mb-3">
                     <span className="text-xs text-slate-400">המחיר שלי:</span>
                     <span className="text-xl font-bold" style={{ color: profile.themeColor || '#2563eb' }}>{item.userPrice} ₪</span>
                   </div>
                   <div className="flex gap-2">
                     <button 
                      onClick={() => onEditItem(item)}
                      className="flex-1 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-sm transition-colors flex items-center justify-center gap-1"
                     >
                       <Edit className="w-4 h-4" />
                       ערוך
                     </button>
                     <button 
                      onClick={() => onDeleteItem(item.id)}
                      className="flex-1 py-2 text-red-500 hover:bg-red-50 rounded text-sm transition-colors border border-transparent hover:border-red-100"
                     >
                       מחק
                     </button>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
