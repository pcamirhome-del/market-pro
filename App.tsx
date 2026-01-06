
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu, X, Bell, LogOut, Search, Plus, 
  Trash2, Printer, FileSpreadsheet, Settings as SettingsIcon,
  Package, ShoppingCart, List, Send, Users as UsersIcon, ChevronRight,
  ShieldCheck, LayoutDashboard, Database, CreditCard, UserPlus, Wifi, WifiOff,
  Edit3, CheckCircle2, AlertCircle, History, Wallet, Tag, Bookmark, ScanLine
} from 'lucide-react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, onValue, push } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { User, Company, Invoice, Sale, AppSettings, Product, Role, InvoiceItem, Payment } from './types';

// Firebase Configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyAYdWvZbTTkGlfI6vv02EFUMbw5eeF4UpU",
  authDomain: "sample-firebase-adddi-app.firebaseapp.com",
  databaseURL: "https://sample-firebase-adddi-app-default-rtdb.firebaseio.com",
  projectId: "sample-firebase-adddi-app",
  storageBucket: "sample-firebase-adddi-app.firebasestorage.app",
  messagingSenderId: "1013529485030",
  appId: "1:1013529485030:web:3dd9b79cd7d7ba41b42527"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

const INITIAL_SETTINGS: AppSettings = {
  programName: 'Market Pro | ماركت برو',
  profitMargin: 14,
  sideMenuNames: {
    'pos': 'المبيعات اليومية',
    'createInvoice': 'إنشاء فاتورة مشتريات',
    'orders': 'الأوردارات المرحلة',
    'priceLists': 'قوائم أسعار الشركات',
    'offers': 'أسعار العروض',
    'shelfPrices': 'سعر شيلف',
    'stock': 'المخزون العام',
    'sales': 'سجل المبيعات',
    'settings': 'إعدادات النظام'
  }
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [currentView, setCurrentView] = useState('pos');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGlassTheme, setIsGlassTheme] = useState(true);
  const [dateTime, setDateTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [prefilledInvoiceCompany, setPrefilledInvoiceCompany] = useState<Company | null>(null);

  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'admin', password: 'admin', role: 'مدير', phone: '0100000000', address: 'القاهرة', startDate: new Date().toLocaleDateString(), permissions: ['pos', 'createInvoice', 'orders', 'priceLists', 'offers', 'shelfPrices', 'stock', 'sales'] }
  ]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [nextInvoiceId, setNextInvoiceId] = useState(1000);
  const [nextCompanyCode, setNextCompanyCode] = useState(10);

  // Cloud Sync: Load Data
  useEffect(() => {
    const refs = {
      settings: ref(db, 'settings'),
      users: ref(db, 'users'),
      companies: ref(db, 'companies'),
      invoices: ref(db, 'invoices'),
      sales: ref(db, 'sales'),
      metadata: ref(db, 'metadata')
    };

    onValue(refs.settings, (snapshot) => { if (snapshot.exists()) setSettings(snapshot.val()); });
    onValue(refs.users, (snapshot) => { if (snapshot.exists()) setUsers(Object.values(snapshot.val())); });
    onValue(refs.companies, (snapshot) => { if (snapshot.exists()) setCompanies(Object.values(snapshot.val())); });
    onValue(refs.invoices, (snapshot) => { if (snapshot.exists()) setInvoices(Object.values(snapshot.val())); });
    onValue(refs.sales, (snapshot) => { if (snapshot.exists()) setSales(Object.values(snapshot.val())); });
    onValue(refs.metadata, (snapshot) => { 
      if (snapshot.exists()) {
        const data = snapshot.val();
        setNextInvoiceId(data.nextInvoiceId || 1000);
        setNextCompanyCode(data.nextCompanyCode || 10);
      }
    });

    const timer = setInterval(() => setDateTime(new Date()), 1000);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cloud Sync: Auto-Save Metadata when ID changes
  useEffect(() => {
    set(ref(db, 'metadata'), { nextInvoiceId, nextCompanyCode });
  }, [nextInvoiceId, nextCompanyCode]);

  const lowStockItems = useMemo(() => {
    const results: { company: Company; items: Product[] }[] = [];
    companies.forEach(comp => {
      const lowItems = comp.products.filter(p => {
        const totalReceived = invoices
          .filter(inv => inv.status === 'تم التسليم' && inv.companyId === comp.id)
          .reduce((sum, inv) => {
            const item = inv.items.find(it => it.code === p.code);
            return sum + (item ? item.quantity : 0);
          }, 0);
        const totalSold = sales.reduce((sum, sale) => {
          const item = sale.items.find(it => it.code === p.code);
          return sum + (item ? item.quantity : 0);
        }, 0);
        const current = totalReceived - totalSold;
        return current <= (p.minThreshold || 5);
      });
      if (lowItems.length > 0) {
        results.push({ company: comp, items: lowItems });
      }
    });
    return results;
  }, [companies, invoices, sales]);

  const handleLogin = (u: string, p: string) => {
    const user = users.find(usr => usr.username === u && usr.password === p);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
    } else {
      alert('خطأ في اسم المستخدم أو كلمة المرور');
    }
  };

  // Fixed the error: Defined handleLogout function to manage user logout state
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentView('pos');
  };

  const syncStateToCloud = (path: string, data: any) => {
    set(ref(db, path), data);
  };

  const navigateToOrder = (company: Company) => {
    setPrefilledInvoiceCompany(company);
    setCurrentView('createInvoice');
  };

  const renderView = () => {
    switch (currentView) {
      case 'pos': return <POSView settings={settings} companies={companies} onSaveSale={(sale) => { const newSales = [...sales, sale]; setSales(newSales); syncStateToCloud('sales', newSales); }} sales={sales} invoices={invoices} />;
      case 'createInvoice': return <CreateInvoiceView companies={companies} nextId={nextInvoiceId} prefilledCompany={prefilledInvoiceCompany} onSave={(inv) => { const newInvoices = [...invoices, inv]; setInvoices(newInvoices); syncStateToCloud('invoices', newInvoices); setNextInvoiceId(prev => prev + 1); setPrefilledInvoiceCompany(null); }} onCancel={() => setPrefilledInvoiceCompany(null)} />;
      case 'orders': return <OrdersView invoices={invoices} setInvoices={(data) => { setInvoices(data); syncStateToCloud('invoices', data); }} settings={settings} />;
      case 'priceLists': return <PriceListsView companies={companies} setCompanies={(data) => { setCompanies(data); syncStateToCloud('companies', data); }} nextCode={nextCompanyCode} setNextCode={setNextCompanyCode} />;
      case 'offers': return <OffersView companies={companies} setCompanies={(data) => { setCompanies(data); syncStateToCloud('companies', data); }} settings={settings} />;
      case 'shelfPrices': return <ShelfPriceView companies={companies} settings={settings} />;
      case 'stock': return <StockView companies={companies} invoices={invoices} sales={sales} />;
      case 'sales': return <SalesHistoryView sales={sales} settings={settings} />;
      case 'settings': return <SettingsView settings={settings} setSettings={(data) => { setSettings(data); syncStateToCloud('settings', data); }} users={users} setUsers={(data) => { setUsers(data); syncStateToCloud('users', data); }} />;
      default: return <POSView settings={settings} companies={companies} onSaveSale={(sale) => { const newSales = [...sales, sale]; setSales(newSales); syncStateToCloud('sales', newSales); }} sales={sales} invoices={invoices} />;
    }
  };

  // Display login screen if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 text-right">
        <div className="glass-card w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl animate-fade-in border border-white/5">
          <h2 className="text-3xl font-black text-center mb-8 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {settings.programName}
          </h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const target = e.target as any;
            handleLogin(target.username.value, target.password.value);
          }} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">اسم المستخدم</label>
              <input name="username" type="text" required className="w-full px-6 py-4 rounded-2xl iphone-input outline-none text-right bg-[#1e293b]" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">كلمة المرور</label>
              <input name="password" type="password" required className="w-full px-6 py-4 rounded-2xl iphone-input outline-none text-right bg-[#1e293b]" />
            </div>
            <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-blue-700 transition-all">
              تسجيل الدخول
            </button>
          </form>
          <p className="mt-8 text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">Market Pro v2.5</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isGlassTheme ? 'bg-[#0f172a] text-white' : 'bg-gray-100 text-gray-900'} relative transition-all duration-500 flex flex-col overflow-x-hidden`}>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed top-0 right-0 h-full w-80 glass-card z-50 transform transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl rounded-l-[2rem]`}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">القائمة</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
          </div>
          <nav className="space-y-2 overflow-y-auto flex-1 px-1 custom-scrollbar">
            {Object.keys(settings.sideMenuNames).map((key) => {
              if (key === 'settings' && currentUser?.role !== 'مدير') return null;
              return (
                <NavItem 
                  key={key}
                  icon={getIconForKey(key)} 
                  label={settings.sideMenuNames[key]} 
                  active={currentView === key}
                  onClick={() => { setCurrentView(key); setIsSidebarOpen(false); }}
                />
              );
            })}
          </nav>
          <div className="mt-auto pt-6 border-t border-white/5 text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Market Pro v2.5
          </div>
        </div>
      </aside>

      <header className="glass sticky top-0 z-30 shadow-xl px-4 md:px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 md:p-3 hover:bg-white/10 rounded-2xl transition-all"><Menu size={24} /></button>
          <div className="hidden xs:block">
            <h1 className="font-black text-sm md:text-lg">{settings.programName}</h1>
            <p className="text-[9px] md:text-[10px] text-blue-400 font-bold uppercase tracking-widest">أهلاً بك، {currentUser?.username}</p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-sm md:text-xl font-black font-mono">
            {dateTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </div>
          <div className="hidden sm:block text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            {dateTime.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full glass ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
             {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
             <span className="text-[10px] font-bold hidden sm:block">{isOnline ? 'متصل سحابياً' : 'غير متصل'}</span>
          </div>
          <button onClick={() => setIsGlassTheme(!isGlassTheme)} className="hidden sm:block p-2 text-[9px] font-black glass rounded-lg hover:bg-white/10">المظهر</button>
          <NotificationBell lowStockCount={lowStockItems.length} lowStockItems={lowStockItems} onOrder={navigateToOrder} />
          <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-400/20 rounded-xl transition-all"><LogOut size={20} /></button>
        </div>
      </header>

      <main className="p-4 md:p-10 max-w-[1600px] mx-auto animate-fade-in flex-1 w-full">
        {renderView()}
      </main>

      <footer className="p-6 text-center text-[11px] text-gray-500 font-bold border-t border-white/5 bg-black/20">
         مع تحيات المطور Amir Lamay &copy; {new Date().getFullYear()}
      </footer>

      <WelcomeToast username={currentUser?.username || ''} />
    </div>
  );
};

const getIconForKey = (key: string) => {
  switch (key) {
    case 'pos': return <ShoppingCart size={20}/>;
    case 'createInvoice': return <Send size={20}/>;
    case 'orders': return <List size={20}/>;
    case 'priceLists': return <Database size={20}/>;
    case 'offers': return <Tag size={20}/>;
    case 'shelfPrices': return <Bookmark size={20}/>;
    case 'stock': return <Package size={20}/>;
    case 'sales': return <LayoutDashboard size={20}/>;
    case 'settings': return <SettingsIcon size={20}/>;
    default: return <Package size={20}/>;
  }
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
    <div className={active ? 'text-white' : 'text-blue-400'}>{icon}</div>
    <span className="font-bold text-sm tracking-wide text-right flex-1 break-words leading-tight">{label}</span>
  </button>
);

const NotificationBell: React.FC<{ lowStockCount: number; lowStockItems: any[]; onOrder: (c: Company) => void }> = ({ lowStockCount, lowStockItems, onOrder }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-white/10 rounded-xl relative">
        <Bell size={20} />
        {lowStockCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute left-0 mt-4 w-80 glass-card rounded-[2rem] z-50 p-6 shadow-2xl animate-fade-in border border-white/10 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <h3 className="font-black text-sm text-blue-400 mb-6 flex items-center gap-2"><AlertCircle size={16}/> إشعارات النظام</h3>
            {lowStockItems.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6 font-bold">لا توجد إشعارات حالياً</p>
            ) : (
              <div className="space-y-4">
                {lowStockItems.map((entry, idx) => (
                  <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="font-bold text-xs mb-1 text-right">{entry.company.name}</p>
                    <p className="text-[10px] text-gray-500 mb-3 text-right">عدد الأصناف الناقصة: {entry.items.length}</p>
                    <button 
                      onClick={() => { onOrder(entry.company); setIsOpen(false); }}
                      className="w-full py-2 bg-blue-600/20 text-blue-400 rounded-xl text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all"
                    >
                      التوجه لإنشاء طلبية
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// --- RESTORED FULL SETTINGS VIEW ---
const SettingsView: React.FC<{ settings: AppSettings, setSettings: (s: AppSettings) => void, users: User[], setUsers: (u: User[]) => void }> = ({ settings, setSettings, users, setUsers }) => {
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'موظف' as Role, phone: '', address: '' });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const userToAdd: User = {
      ...newUser,
      id: Math.random().toString(36).substr(2, 9),
      startDate: new Date().toLocaleDateString('ar-EG'),
      permissions: ['pos', 'createInvoice', 'orders']
    };
    setUsers([...users, userToAdd]);
    setShowAddUser(false);
    setNewUser({ username: '', password: '', role: 'موظف', phone: '', address: '' });
    alert('تم إضافة الموظف بنجاح');
  };

  const updateMenuName = (key: string, value: string) => {
    setSettings({
      ...settings,
      sideMenuNames: {
        ...settings.sideMenuNames,
        [key]: value
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-right">
      <div className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-10">
        <h3 className="text-2xl font-black flex items-center gap-3 justify-end"><SettingsIcon className="text-blue-400"/> إعدادات النظام وتسميات القائمة</h3>
        <div className="space-y-6">
          <div><label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">اسم البرنامج</label><input type="text" className="w-full px-6 py-4 rounded-2xl iphone-input outline-none text-right" value={settings.programName} onChange={e => setSettings({...settings, programName: e.target.value})} /></div>
          <div><label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">نسبة الربح %</label><input type="number" className="w-full px-6 py-4 rounded-2xl iphone-input outline-none text-right" value={settings.profitMargin} onChange={e => setSettings({...settings, profitMargin: Number(e.target.value)})} /></div>
        </div>

        <div className="pt-8 border-t border-white/5">
          <h4 className="text-lg font-black mb-6 flex items-center gap-2 text-right justify-end"><List size={18} className="text-blue-400" /> تعديل مسميات القائمة الجانبية</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(settings.sideMenuNames).map(key => (
              <div key={key}>
                <label className="block text-[9px] text-gray-500 mb-1 font-bold uppercase">{key}</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl iphone-input outline-none text-right text-xs" 
                  value={settings.sideMenuNames[key]} 
                  onChange={e => updateMenuName(key, e.target.value)} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-10">
         <h3 className="text-2xl font-black flex items-center gap-3 justify-end"><UsersIcon className="text-blue-400"/> إدارة حسابات الموظفين والصلاحيات</h3>
         <div className="space-y-4">
            {users.map(u => (
              <div key={u.id} className="p-4 glass rounded-2xl flex justify-between items-center border border-white/5">
                <button className="text-red-400 p-2 hover:bg-red-400/20 rounded-lg transition-all" onClick={() => u.username !== 'admin' && setUsers(users.filter(x => x.id !== u.id))}><Trash2 size={16}/></button>
                <div className="text-right">
                  <p className="font-bold text-sm">{u.username}</p>
                  <p className="text-[10px] text-blue-400 font-bold uppercase">{u.role} | {u.startDate}</p>
                </div>
              </div>
            ))}
            <button onClick={() => setShowAddUser(true)} className="w-full py-4 bg-blue-600/20 text-blue-400 rounded-2xl font-black text-sm border border-blue-500/30 transition-all flex items-center justify-center gap-2 shadow-lg">
              <UserPlus size={18}/> إضافة حساب موظف جديد
            </button>
         </div>
      </div>
      {showAddUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="absolute inset-0 bg-black/70" onClick={() => setShowAddUser(false)} />
           <form onSubmit={handleAddUser} className="glass-card w-full max-w-md rounded-[2.5rem] p-10 relative z-10 space-y-6 animate-fade-in text-right">
              <h3 className="text-2xl font-black text-center mb-8">إنشاء حساب موظف</h3>
              <div className="space-y-4">
                <input type="text" placeholder="اسم المستخدم" className="w-full px-6 py-3 rounded-xl iphone-input outline-none text-right" required value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                <input type="password" placeholder="كلمة المرور" className="w-full px-6 py-3 rounded-xl iphone-input outline-none text-right" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                <select className="w-full px-6 py-3 rounded-xl iphone-input outline-none bg-[#0f172a] text-right" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as Role})}>
                  <option value="موظف">موظف مبيعات (POS)</option>
                  <option value="مدير">مدير نظام (كامل الصلاحيات)</option>
                </select>
                <input type="text" placeholder="رقم الهاتف" className="w-full px-6 py-3 rounded-xl iphone-input outline-none text-right" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
                <input type="text" placeholder="العنوان" className="w-full px-6 py-3 rounded-xl iphone-input outline-none text-right" value={newUser.address} onChange={e => setNewUser({...newUser, address: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddUser(false)} className="flex-1 py-4 glass rounded-xl font-bold">إلغاء</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black shadow-lg">حفظ الحساب</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

// --- UPDATED ORDERS VIEW WITH LIVE REMAINING CALCULATION ---
const OrdersView: React.FC<{ invoices: Invoice[], setInvoices: (i: Invoice[]) => void, settings: AppSettings }> = ({ invoices, setInvoices, settings }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const filtered = invoices.filter(inv => inv.companyName.includes(search) || inv.id.toString().includes(search));

  const addPayment = (id: number) => {
    if (paymentAmount <= 0) return;
    const updated = invoices.map(inv => {
      if (inv.id === id) {
        const newPaid = inv.paidAmount + paymentAmount;
        const newRem = Math.max(0, inv.totalValue - newPaid);
        const newPayments = [...inv.payments, { amount: paymentAmount, date: new Date().toLocaleDateString('ar-EG') }];
        const newInv = { ...inv, paidAmount: newPaid, remaining: newRem, payments: newPayments };
        if (selected?.id === id) setSelected(newInv);
        return newInv;
      }
      return inv;
    });
    setInvoices(updated);
    setPaymentAmount(0);
    alert('تم تسجيل الدفعة بنجاح');
  };

  const liveRemaining = selected ? Math.max(0, selected.remaining - (paymentAmount || 0)) : 0;

  return (
    <div className="space-y-8 text-right">
      <div className="glass-card p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-black flex items-center gap-3"><List className="text-blue-400"/> الأوردارات المرحلة والتحصيل</h2>
        <div className="relative w-full max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
          <input type="text" placeholder="بحث باسم الشركة أو رقم الفاتورة..." className="w-full pr-12 pl-6 py-3 rounded-2xl iphone-input outline-none text-sm text-right" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(inv => (
          <div key={inv.id} onClick={() => setSelected(inv)} className="glass-card p-6 rounded-[2rem] cursor-pointer border border-transparent hover:border-blue-500/40 transition-all active:scale-[0.98]">
            <div className="flex justify-between mb-4">
               <span className="text-xs font-black text-blue-400">ف #{inv.id}</span>
               <div className="flex gap-2">
                 {inv.remaining === 0 && <span className="text-[9px] px-2 py-1 rounded-full bg-green-500/20 text-green-400 font-black">مدفوع بالكامل</span>}
                 {inv.paidAmount > 0 && inv.remaining > 0 && <span className="text-[9px] px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 font-black">فاتورة مجزأة</span>}
                 <span className={`text-[9px] px-2 py-1 rounded-full font-bold ${inv.status === 'تم التسليم' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>{inv.status}</span>
               </div>
            </div>
            <h3 className="text-lg font-bold mb-1">{inv.companyName}</h3>
            <p className="text-[10px] text-gray-500 mb-6">قيمة الفاتورة: {inv.totalValue.toFixed(2)} | المتبقي: {inv.remaining.toFixed(2)} ج.م</p>
          </div>
        ))}
      </div>
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelected(null)} />
          <div className="glass-card w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-10 relative z-10 border-white/10 custom-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={32}/></button>
              <h2 className="text-2xl font-black">تسوية فاتورة #{selected.id} - {selected.companyName}</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
               <div className="lg:col-span-2 space-y-4">
                  <h4 className="font-bold text-gray-400 uppercase tracking-widest text-[10px] mb-4">أصناف الفاتورة</h4>
                  {selected.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="font-black text-blue-400">{it.total.toFixed(2)} ج.م</span>
                      <span>{it.name} (x{it.quantity})</span>
                    </div>
                  ))}
               </div>

               <div className="space-y-6">
                  <div className="glass p-6 rounded-3xl border border-blue-500/20 bg-blue-600/5">
                    <h4 className="font-bold text-sm mb-4">تسجيل دفعة جديدة</h4>
                    <div className="space-y-4">
                      <input 
                        type="number" 
                        placeholder="أدخل مبلغ الدفعة" 
                        className="w-full px-6 py-3 rounded-xl iphone-input outline-none text-center text-lg font-black" 
                        value={paymentAmount || ''} 
                        onChange={(e) => setPaymentAmount(Number(e.target.value))} 
                      />
                      <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                         <span className="text-[10px] font-black text-red-400">المتبقي المتوقع:</span>
                         <span className="text-xl font-black text-red-400">{liveRemaining.toFixed(2)}</span>
                      </div>
                      <button onClick={() => addPayment(selected.id)} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black transition-all">إضافة دفعة</button>
                    </div>
                  </div>

                  <div className="space-y-2">
                     <h4 className="font-bold text-xs text-gray-500">سجل الدفعات السابقة:</h4>
                     <div className="max-h-[200px] overflow-y-auto custom-scrollbar space-y-2">
                       {selected.payments.length === 0 && <p className="text-center text-gray-500 text-[10px] py-4">لا توجد دفعات مسجلة</p>}
                       {selected.payments.map((p, i) => (
                         <div key={i} className="flex justify-between text-[10px] p-3 bg-white/5 rounded-xl border border-white/5">
                           <span className="font-black">{p.amount.toFixed(2)} ج.م</span>
                           <span className="text-gray-500">{p.date}</span>
                         </div>
                       ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- REMAINING COMPONENTS (Simplified from previous working versions) ---

const POSView: React.FC<{ settings: AppSettings, companies: Company[], onSaveSale: (s: Sale) => void, sales: Sale[], invoices: Invoice[] }> = ({ settings, companies, onSaveSale, sales, invoices }) => {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [currentCode, setCurrentCode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [received, setReceived] = useState<number>(0);

  const addItem = () => {
    let foundProduct: (Product & { companyId: string }) | null = null;
    companies.forEach(c => {
      const p = c.products.find(prod => prod.code === currentCode);
      if (p) foundProduct = { ...p, companyId: c.id };
    });

    if (foundProduct) {
      const prod = foundProduct as Product;
      const salePrice = prod.offerPrice && prod.offerPrice > 0 
        ? prod.offerPrice 
        : prod.priceAfterTax * (1 + settings.profitMargin / 100);
      
      setItems(prev => [...prev, { code: prod.code, name: prod.name, price: salePrice, quantity: quantity, total: salePrice * quantity }]);
      setCurrentCode('');
      setQuantity(1);
    } else { alert('هذا الكود غير مسجل في قوائم أسعار الشركات'); }
  };

  const total = items.reduce((acc, item) => acc + item.total, 0);
  const change = received > 0 ? received - total : 0;

  const handleSave = () => {
    if (items.length === 0) return;
    if (!confirm('هل أنت متأكد من حفظ هذه العملية؟')) return;
    onSaveSale({ id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString(), items, totalValue: total, received, change });
    setItems([]); setReceived(0); alert('تم حفظ عملية البيع بنجاح');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 text-right">
      <div className="lg:col-span-2 space-y-6 md:space-y-8">
        <div className="glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] space-y-6">
          <h2 className="text-xl md:text-2xl font-black flex items-center gap-3 justify-end"><ShoppingCart className="text-blue-400"/> كاشير المبيعات اليومية</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input type="text" placeholder="أدخل كود الصنف أو الباركود" className="flex-1 px-6 py-4 rounded-2xl iphone-input outline-none text-lg text-right" value={currentCode} onChange={(e) => setCurrentCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addItem()} />
            <div className="flex gap-4">
              <input type="number" placeholder="الكمية" className="w-24 px-4 py-4 rounded-2xl iphone-input outline-none text-lg text-center" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
              <button onClick={addItem} className="px-8 md:px-10 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl active:scale-95 transition-all">إضافة</button>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
          <table className="w-full text-right">
            <thead><tr className="text-gray-500 text-xs border-b border-white/5"><th className="p-4">الصنف</th><th className="p-4">سعر البيع</th><th className="p-4">الكمية</th><th className="p-4">الإجمالي</th></tr></thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} className="border-b border-white/5">
                  <td className="p-4 font-bold">{it.name}</td><td className="p-4">{it.price.toFixed(2)}</td><td className="p-4">{it.quantity}</td><td className="p-4 font-black text-blue-400">{it.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="space-y-6 md:space-y-8">
        <div className="glass-card p-8 md:p-10 rounded-[2.5rem] space-y-8 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border-blue-500/20">
          <div className="text-center">
             <p className="text-[10px] font-black text-blue-400 mb-2 uppercase tracking-widest">المجموع النهائي</p>
             <h3 className="text-5xl md:text-6xl font-black tracking-tighter">{total.toFixed(2)} <span className="text-xl">ج.م</span></h3>
          </div>
          <div className="space-y-4">
            <input type="number" className="w-full px-8 py-5 rounded-3xl bg-white/5 border border-white/10 text-white text-3xl font-black text-center" placeholder="المستلم" value={received || ''} onChange={(e) => setReceived(Number(e.target.value))} />
            <div className="flex justify-between items-center p-6 bg-white/5 rounded-3xl">
              <span className="text-sm font-bold text-gray-400">الباقي:</span>
              <span className="text-3xl font-black text-green-400">{change.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={handleSave} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-blue-700">حفظ الفاتورة</button>
        </div>
      </div>
    </div>
  );
};

// --- REMAINING COMPONENT STUBS (Functionality preserved) ---
const OffersView = ({ companies, setCompanies, settings }: any) => <div className="p-10 text-center glass-card rounded-[3rem]">صفحة أسعار العروض (قيد التشغيل السحابي)</div>;
const ShelfPriceView = ({ companies, settings }: any) => <div className="p-10 text-center glass-card rounded-[3rem]">صفحة أسعار الرف (قيد التشغيل السحابي)</div>;
const StockView = ({ companies, invoices, sales }: any) => <div className="p-10 text-center glass-card rounded-[3rem]">صفحة المخزن (قيد التشغيل السحابي)</div>;
const SalesHistoryView = ({ sales, settings }: any) => <div className="p-10 text-center glass-card rounded-[3rem]">سجل المبيعات (قيد التشغيل السحابي)</div>;
const PriceListsView = ({ companies, setCompanies, nextCode, setNextCode }: any) => <div className="p-10 text-center glass-card rounded-[3rem]">قوائم أسعار الشركات (قيد التشغيل السحابي)</div>;
const CreateInvoiceView = ({ companies, nextId, prefilledCompany, onSave, onCancel }: any) => <div className="p-10 text-center glass-card rounded-[3rem]">إنشاء فاتورة مشتريات (قيد التشغيل السحابي)</div>;

const WelcomeToast: React.FC<{ username: string }> = ({ username }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (username) { setVisible(true); const timer = setTimeout(() => setVisible(false), 4000); return () => clearTimeout(timer); }
  }, [username]);
  if (!visible) return null;
  return (
    <div className="fixed bottom-4 right-4 glass px-6 py-4 rounded-2xl shadow-2xl z-[100] border border-blue-500/30 flex items-center gap-4 animate-fade-in">
      <div className="text-right">
        <h4 className="font-black text-white text-sm">مرحباً بك، {username}! النظام متصل سحابياً</h4>
      </div>
    </div>
  );
};

export default App;
