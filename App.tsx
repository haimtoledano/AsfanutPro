import React, { useState, useEffect } from 'react';
import { ViewState, StoreProfile, CollectibleItem, ItemType, AIAnalysisResult } from './types';
import Setup from './components/Setup';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import AnalysisView from './components/AnalysisView';
import Legal from './components/Legal';
import Storefront from './components/Storefront';
import ProductView from './components/ProductView';
import Login from './components/Login';
import { AlertTriangle } from './components/Icons';
import { 
  getProfileFromDB, 
  getItemsFromDB, 
  saveProfileToDB, 
  saveItemToDB, 
  deleteItemFromDB 
} from './services/db';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('setup');
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [items, setItems] = useState<CollectibleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CollectibleItem | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSecure, setIsSecure] = useState(true);
  
  // State for analysis/editing workflow
  // Used for both NEW items (from scanner) and EDITING existing items
  const [editingContext, setEditingContext] = useState<{
    item?: CollectibleItem; // If present, we are editing. If undefined, it's new.
    front: string; 
    back: string; 
    result: AIAnalysisResult; 
    type: ItemType
  } | null>(null);

  useEffect(() => {
    // Check for secure context (HTTPS or localhost)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setIsSecure(false);
    }

    const initData = async () => {
      try {
        const savedProfile = await getProfileFromDB();
        const savedItems = await getItemsFromDB();

        setItems(savedItems);

        if (savedProfile) {
          setProfile(savedProfile);
          
          // If profile exists but no password (legacy), force setup to add password
          if (!savedProfile.password) {
            setView('setup');
          } else {
            // Default to storefront for public visitors
            setView('storefront');
          }
        } else {
          setView('setup');
        }
      } catch (error) {
        console.error("Failed to load data from DB", error);
        setView('setup');
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  const saveProfile = async (newProfile: StoreProfile) => {
    await saveProfileToDB(newProfile);
    setProfile(newProfile);
    setIsAuthenticated(true); // Auto login after setup/update
    
    // Slight delay to ensure state update before render switch
    setTimeout(() => {
        setView('dashboard');
    }, 100);
  };

  const saveItem = async (newItem: CollectibleItem) => {
    await saveItemToDB(newItem);
    // Reload items from DB to ensure sort order and consistency
    const updatedItems = await getItemsFromDB();
    setItems(updatedItems);
    setEditingContext(null);
    setView('dashboard');
  };

  const deleteItem = async (id: string) => {
    if (confirm("האם אתה בטוח שברצונך למחוק פריט זה?")) {
      await deleteItemFromDB(id);
      const updatedItems = await getItemsFromDB();
      setItems(updatedItems);
    }
  };

  const handleEditItem = (item: CollectibleItem) => {
    if (item.analysis) {
        setEditingContext({
            item: item,
            front: item.frontImage,
            back: item.backImage,
            result: item.analysis,
            type: item.type
        });
        setView('details');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">טוען נתונים...</p>
      </div>
    );
  }

  // View Routing Logic
  const renderView = () => {
    switch (view) {
      case 'setup':
        return <Setup initialProfile={profile} onSave={saveProfile} />;
      
      case 'login':
        return profile ? (
          <Login 
            profile={profile} 
            onLoginSuccess={() => {
              setIsAuthenticated(true);
              setView('dashboard');
            }}
            onBack={() => setView('storefront')}
          />
        ) : <Setup initialProfile={null} onSave={saveProfile} />;

      case 'dashboard':
        // Protect dashboard
        if (!isAuthenticated) return <Login profile={profile!} onLoginSuccess={() => {setIsAuthenticated(true); setView('dashboard');}} onBack={() => setView('storefront')} />;
        
        return profile ? (
          <Dashboard 
            items={items} 
            profile={profile}
            onAddItem={() => setView('scan')}
            onDeleteItem={deleteItem}
            onEditItem={handleEditItem}
            onViewLegal={() => setView('legal')}
            onEditProfile={() => setView('setup')}
            onGoToStore={() => setView('storefront')}
          />
        ) : null;
      
      case 'scan':
        if (!isAuthenticated) return <div onClick={() => setView('login')}>Unauthorized</div>;
        return (
          <Scanner 
            onCancel={() => setView('dashboard')}
            onAnalysisComplete={(front, back, result, type) => {
              setEditingContext({ front, back, result, type });
              setView('details');
            }} 
          />
        );

      case 'details':
        if (!isAuthenticated) return <div onClick={() => setView('login')}>Unauthorized</div>;
        return editingContext ? (
          <AnalysisView
            initialItem={editingContext.item}
            frontImage={editingContext.front}
            backImage={editingContext.back}
            analysis={editingContext.result}
            type={editingContext.type}
            onSave={saveItem}
            onCancel={() => setView('dashboard')}
          />
        ) : <div>Error: No analysis data</div>;

      case 'legal':
        return <Legal onBack={() => setView(isAuthenticated ? 'dashboard' : 'storefront')} />;

      case 'storefront':
        return profile ? (
          <Storefront 
            items={items} 
            profile={profile} 
            onViewProduct={(item) => {
              setSelectedProduct(item);
              setView('product');
            }}
            onAdminLogin={() => {
              if (isAuthenticated) {
                setView('dashboard');
              } else {
                setView('login');
              }
            }}
          />
        ) : <Setup initialProfile={null} onSave={saveProfile} />;

      case 'product':
        return selectedProduct && profile ? (
          <ProductView 
            item={selectedProduct} 
            profile={profile} 
            onBack={() => setView('storefront')} 
          />
        ) : null;

      default:
        return <div>Not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {!isSecure && (
        <div className="bg-red-600 text-white p-2 text-center text-sm font-bold flex items-center justify-center gap-2">
           <AlertTriangle className="w-4 h-4" />
           שים לב: האתר לא מאובטח (HTTP). המצלמה לא תעבוד. אנא עבור ל-HTTPS או Localhost.
        </div>
      )}
      {renderView()}
    </div>
  );
};

export default App;