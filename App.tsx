
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
          
          // DEEP LINKING CHECK
          // Check if there is a 'product' query param in the URL
          const urlParams = new URLSearchParams(window.location.search);
          const productId = urlParams.get('product');

          if (productId) {
            const product = savedItems.find(i => i.id === productId);
            if (product) {
              setSelectedProduct(product);
              setView('product');
            } else {
              // Product not found, default to storefront
              setView('storefront');
            }
          } else {
            // No deep link, default to storefront
            setView('storefront');
          }
          
          // Legacy check: If profile exists but no password, force setup to add password
          if (!savedProfile.password) {
            setView('setup');
          } 
        } else {
          // No profile, go to initial setup
          setView('setup');
        }
      } catch (error) {
        console.error("Failed to load data from DB", error);
        // If server is down, we might want to stay on setup but show error? 
        // For now, setup is the fallback.
        setView('setup');
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  const saveProfile = async (newProfile: StoreProfile) => {
    try {
      await saveProfileToDB(newProfile);
      setProfile(newProfile);
      setIsAuthenticated(true); // Auto login after setup/update
      
      // Slight delay to ensure state update before render switch
      setTimeout(() => {
          setView('dashboard');
      }, 100);
    } catch (error) {
      console.error(error);
      alert(`שגיאה בשמירת הפרופיל.\nאנא וודא שקובץ השרת (server.js) רץ ברקע.\n\nפרטים טכניים: ${error instanceof Error ? error.message : error}`);
    }
  };

  const saveItem = async (newItem: CollectibleItem) => {
    try {
      await saveItemToDB(newItem);
      // Reload items from DB to ensure sort order and consistency
      const updatedItems = await getItemsFromDB();
      setItems(updatedItems);
      setEditingContext(null);
      setView('dashboard');
    } catch (error) {
      console.error(error);
      alert(`שגיאה בשמירת הפריט.\nאנא וודא שהשרת מחובר.\n\nפרטים: ${error instanceof Error ? error.message : error}`);
    }
  };

  const deleteItem = async (id: string) => {
    if (confirm("האם אתה בטוח שברצונך למחוק פריט זה?")) {
      try {
        await deleteItemFromDB(id);
        const updatedItems = await getItemsFromDB();
        setItems(updatedItems);
      } catch (error) {
        alert("שגיאה במחיקת הפריט.");
      }
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
        <p className="text-slate-500 font-medium">טוען נתונים מהשרת...</p>
      </div>
    );
  }

  // View Routing Logic
  const renderView = () => {
    switch (view) {
      case 'setup':
        // If a profile exists but user is not authenticated, do not show setup.
        // Redirect to login or show login component.
        if (profile && !isAuthenticated) {
          return (
            <Login 
              profile={profile} 
              onLoginSuccess={() => {
                setIsAuthenticated(true);
                // Stay on setup if that was the intent, or go to dashboard?
                // Usually user comes here from Dashboard -> Settings, so they would be auth'd.
                // If they typed URL/forced state, we let them proceed to setup after login.
              }}
              onBack={() => setView('storefront')}
            />
          );
        }
        return (
          <Setup 
            initialProfile={profile} 
            onSave={saveProfile} 
            onCancel={profile ? () => setView('dashboard') : undefined} 
          />
        );
      
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
        <div className="bg-red-600 text-white p-3 text-center font-bold flex flex-col md:flex-row items-center justify-center gap-2 shadow-lg">
           <AlertTriangle className="w-5 h-5" />
           <span>
             שים לב: האתר לא מאובטח (HTTP). המצלמה והמיקרופון לא יעבדו בדומיין csgallery.co.il.
             <br className="md:hidden"/>
             אנא התקן תעודת SSL או גלוש דרך HTTPS.
           </span>
        </div>
      )}
      {renderView()}
    </div>
  );
};

export default App;
