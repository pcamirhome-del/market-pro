
import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Bell, LogOut, Search, Plus, 
  Trash2, Printer, FileSpreadsheet, Settings as SettingsIcon,
  Package, ShoppingCart, List, Send, Users as UsersIcon, ChevronRight,
  ShieldCheck, LayoutDashboard, Database, CreditCard, UserPlus, Wifi, WifiOff
} from 'lucide-react';
import { User, Company, Invoice, Sale, AppSettings, Product, Role, InvoiceItem } from './types';

const INITIAL_SETTINGS: AppSettings = {
  programName: 'Market Pro | ماركت برو',
  profitMargin: 14,
  sideMenuNames: {
    'pos': 'المبيعات اليومية',
    'createInvoice': 'إنشاء فاتورة مشتريات',
    'orders': 'الأوردارات المرحلة',
    'priceLists': 'قوائم أسعار الشركات',
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

  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'admin', password: 'admin', role: 'مدير', phone: '0100000000', address: 'القاهرة', startDate: new Date().toLocaleDateString(), permissions: ['pos', 'createInvoice', 'orders', 'priceLists', 'stock', 'sales'] }
  ]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [nextInvoiceId, setNextInvoiceId] = useState(1000);
  const [nextCompanyCode, setNextCompanyCode] = useState(10);

  useEffect(() => {
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

  const handleLogin = (u: string, p: string) => {
    const user = users.find(usr => usr.username === u && usr.password === p);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
    } else {
      alert('خطأ في اسم المستخدم أو كلمة المرور');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} programName={settings.programName} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'pos': return <POSView settings={settings} companies={companies} onSaveSale={(sale) => setSales(prev => [...prev, sale])} />;
      case 'createInvoice': return <CreateInvoiceView companies={companies} nextId={nextInvoiceId} onSave={(inv) => { setInvoices(prev => [...prev, inv]); setNextInvoiceId(prev => prev + 1); }} />;
      case 'orders': return <OrdersView invoices={invoices} setInvoices={setInvoices} settings={settings} />;
      case 'priceLists': return <PriceListsView companies={companies} setCompanies={setCompanies} nextCode={nextCompanyCode} setNextCode={setNextCompanyCode} />;
      case 'stock': return <StockView companies={companies} invoices={invoices} />;
      case 'sales': return <SalesHistoryView sales={sales} companies={companies} />;
      case 'settings': return <SettingsView settings={settings} setSettings={setSettings} users={users} setUsers={setUsers} />;
      default: return <POSView settings={settings} companies={companies} onSaveSale={(sale) => setSales(prev => [...prev, sale])} />;
    }
  };

  return (
    <div className={`min-h-screen ${isGlassTheme ? 'bg-[#0f172a] text-white' : 'bg-gray-100 text-gray-900'} relative transition-all duration-500 flex flex-col overflow-x-hidden`}>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed top-0 right-0 h-full w-72 glass-card z-50 transform transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl rounded-l-[2rem]`}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">القائمة</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
          </div>
          <nav className="space-y-2">
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
             <span className="text-[10px] font-bold hidden sm:block">{isOnline ? 'متصل' : 'غير متصل'}</span>
          </div>
          <button onClick={() => setIsGlassTheme(!isGlassTheme)} className="hidden sm:block p-2 text-[9px] font-black glass rounded-lg hover:bg-white/10">المظهر</button>
          <button className="p-2 hover:bg-white/10 rounded-xl relative"><Bell size={20} /><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span></button>
          <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-400/20 rounded-xl"><LogOut size={20} /></button>
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
    case 'stock': return <Package size={20}/>;
    case 'sales': return <LayoutDashboard size={20}/>;
    case 'settings': return <SettingsIcon size={20}/>;
    default: return <Package size={20}/>;
  }
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
    <div className={active ? 'text-white' : 'text-blue-400'}>{icon}</div>
    <span className="font-bold text-sm tracking-wide text-right flex-1">{label}</span>
  </button>
);

const LoginScreen: React.FC<{ onLogin: (u: string, p: string) => void, programName: string }> = ({ onLogin, programName }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#020617] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full"></div>

      <div className="glass-card p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] w-full max-w-md mx-4 animate-fade-in border border-white/10 text-center relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 mb-8 shadow-2xl">
          <ShieldCheck size={40} className="text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">{programName}</h1>
        <p className="text-gray-400 text-sm font-medium mb-10">تسجيل الدخول إلى لوحة التحكم</p>
        
        <form onSubmit={(e) => { e.preventDefault(); onLogin(username, password); }} className="space-y-4 text-right">
          <div className="space-y-1">
             <input type="text" placeholder="اسم المستخدم" className="w-full px-6 py-4 rounded-2xl iphone-input outline-none text-lg" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="space-y-1">
             <input type="password" placeholder="كلمة المرور" className="w-full px-6 py-4 rounded-2xl iphone-input outline-none text-lg" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xl hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all active:scale-[0.98] mt-4">
            دخول النظام
          </button>
        </form>
        <p className="mt-8 text-xs text-gray-500 font-bold">مع تحيات المطور Amir Lamay</p>
      </div>
    </div>
  );
};

// POS VIEW
const POSView: React.FC<{ settings: AppSettings, companies: Company[], onSaveSale: (s: Sale) => void }> = ({ settings, companies, onSaveSale }) => {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [currentCode, setCurrentCode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [received, setReceived] = useState<number>(0);

  const addItem = () => {
    let foundProduct: Product | null = null;
    companies.forEach(c => {
      const p = c.products.find(prod => prod.code === currentCode);
      if (p) foundProduct = p;
    });

    if (foundProduct) {
      const prod = foundProduct as Product;
      const salePrice = prod.priceAfterTax * (1 + settings.profitMargin / 100);
      setItems(prev => [...prev, { code: prod.code, name: prod.name, price: salePrice, quantity: quantity, total: salePrice * quantity }]);
      setCurrentCode('');
      setQuantity(1);
    } else { alert('هذا الكود غير مسجل في قوائم أسعار الشركات'); }
  };

  const total = items.reduce((acc, item) => acc + item.total, 0);
  const change = received > 0 ? received - total : 0;

  const handleSave = () => {
    if (items.length === 0) return;
    onSaveSale({ id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString(), items, totalValue: total, received, change });
    setItems([]); setReceived(0); alert('تم حفظ عملية البيع وتحديث المخزن');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      <div className="lg:col-span-2 space-y-6 md:space-y-8">
        <div className="glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] space-y-6">
          <h2 className="text-xl md:text-2xl font-black flex items-center gap-3"><ShoppingCart className="text-blue-400"/> كاشير المبيعات</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input type="text" placeholder="أدخل كود الصنف أو الباركود" className="flex-1 px-6 py-4 rounded-2xl iphone-input outline-none text-lg text-right" value={currentCode} onChange={(e) => setCurrentCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addItem()} />
            <div className="flex gap-4">
              <input type="number" placeholder="الكمية" className="w-24 px-4 py-4 rounded-2xl iphone-input outline-none text-lg text-center" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
              <button onClick={addItem} className="px-8 md:px-10 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl active:scale-95 transition-all">إضافة</button>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
             <h3 className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">الأصناف المطلوبة</h3>
             <button onClick={() => setItems([])} className="text-xs text-red-400 font-bold hover:underline">تفريغ الفاتورة</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[600px]">
              <thead><tr className="text-gray-500 text-xs md:text-sm"><th className="p-4">الصنف</th><th className="p-4">سعر البيع</th><th className="p-4">الكمية</th><th className="p-4">الإجمالي</th><th className="p-4 text-center">إجراء</th></tr></thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold">{item.name} <span className="block text-[10px] text-gray-500 font-normal">#{item.code}</span></td>
                    <td className="p-4">{item.price.toFixed(2)}</td>
                    <td className="p-4">{item.quantity}</td>
                    <td className="p-4 font-black text-blue-400">{item.total.toFixed(2)}</td>
                    <td className="p-4 text-center"><button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="p-2 text-red-400 hover:bg-red-400/20 rounded-xl"><Trash2 size={18}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && <div className="p-16 text-center text-gray-500 font-medium">لا توجد أصناف في الفاتورة حالياً</div>}
          </div>
        </div>
      </div>

      <div className="space-y-6 md:space-y-8">
        <div className="glass-card p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] space-y-8 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border-blue-500/20">
          <div className="text-center">
             <p className="text-[10px] font-black text-blue-400 mb-2 uppercase tracking-widest">المجموع النهائي</p>
             <h3 className="text-5xl md:text-6xl font-black tracking-tighter">{total.toFixed(2)} <span className="text-xl">ج.م</span></h3>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">المبلغ المستلم من العميل</label>
              <input type="number" className="w-full px-8 py-5 rounded-3xl bg-white/5 border border-white/10 text-white text-3xl font-black text-center outline-none focus:border-blue-500" placeholder="0.00" value={received || ''} onChange={(e) => setReceived(Number(e.target.value))} />
            </div>
            <div className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/5">
              <span className="text-sm font-bold text-gray-400">الباقي للعميل:</span>
              <span className="text-3xl font-black text-green-400">{change.toFixed(2)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => window.print()} className="py-4 glass hover:bg-white/20 rounded-2xl font-black flex items-center justify-center gap-2 text-xs md:text-base"><Printer size={20}/> طباعة</button>
            <button onClick={handleSave} className="py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl active:scale-95 transition-all text-xs md:text-base">حفظ الفاتورة</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// SETTINGS VIEW (UPDATED)
const SettingsView: React.FC<{ settings: AppSettings, setSettings: React.Dispatch<React.SetStateAction<AppSettings>>, users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>> }> = ({ settings, setSettings, users, setUsers }) => {
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'موظف' as Role, phone: '', address: '' });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const userToAdd: User = {
      ...newUser,
      id: Math.random().toString(36).substr(2, 9),
      startDate: new Date().toLocaleDateString(),
      permissions: ['pos', 'createInvoice', 'orders']
    };
    setUsers([...users, userToAdd]);
    setShowAddUser(false);
    setNewUser({ username: '', password: '', role: 'موظف', phone: '', address: '' });
    alert('تم إنشاء الحساب بنجاح');
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-10">
        <h3 className="text-2xl font-black flex items-center gap-3"><SettingsIcon className="text-blue-400"/> إعدادات النظام الأساسية</h3>
        <div className="space-y-6">
          <div><label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">اسم البرنامج</label><input type="text" className="w-full px-6 py-4 rounded-2xl iphone-input outline-none text-right" value={settings.programName} onChange={e => setSettings({...settings, programName: e.target.value})} /></div>
          <div><label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">نسبة الربح المضافة %</label><input type="number" className="w-full px-6 py-4 rounded-2xl iphone-input outline-none text-right" value={settings.profitMargin} onChange={e => setSettings({...settings, profitMargin: Number(e.target.value)})} /></div>
        </div>

        <div className="pt-8 border-t border-white/5">
          <h4 className="text-lg font-black mb-6 flex items-center gap-2"><List size={18} className="text-blue-400" /> تعديل مسميات القائمة الجانبية</h4>
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
         <h3 className="text-2xl font-black flex items-center gap-3"><UsersIcon className="text-blue-400"/> إدارة حسابات الموظفين</h3>
         <div className="space-y-4">
            {users.map(u => (
              <div key={u.id} className="p-5 glass rounded-2xl flex justify-between items-center border border-white/5">
                <div className="text-right">
                  <p className="font-bold">{u.username}</p>
                  <p className="text-[10px] text-blue-400 font-bold">{u.role} | {u.startDate}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 glass text-red-400 rounded-xl" onClick={() => u.username !== 'admin' && setUsers(users.filter(x => x.id !== u.id))} title="حذف الحساب"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
            <button onClick={() => setShowAddUser(true)} className="w-full py-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-2xl font-black text-sm border border-blue-500/30 transition-all flex items-center justify-center gap-2">
              <UserPlus size={20}/> إنشاء حساب موظف جديد
            </button>
         </div>
      </div>

      {showAddUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="absolute inset-0 bg-black/70" onClick={() => setShowAddUser(false)} />
           <form onSubmit={handleAddUser} className="glass-card w-full max-w-md rounded-[2.5rem] p-8 relative z-10 space-y-6 animate-fade-in">
              <h3 className="text-2xl font-black text-center">إضافة حساب جديد</h3>
              <div className="space-y-4 text-right">
                <input type="text" placeholder="اسم المستخدم" className="w-full px-6 py-3 rounded-xl iphone-input outline-none" required value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                <input type="password" placeholder="كلمة المرور" className="w-full px-6 py-3 rounded-xl iphone-input outline-none" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                <select className="w-full px-6 py-3 rounded-xl iphone-input outline-none bg-[#0f172a]" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as Role})}>
                  <option value="موظف">موظف مبيعات</option>
                  <option value="مدير">مدير نظام</option>
                </select>
                <input type="text" placeholder="رقم الهاتف" className="w-full px-6 py-3 rounded-xl iphone-input outline-none" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
                <input type="text" placeholder="العنوان" className="w-full px-6 py-3 rounded-xl iphone-input outline-none" value={newUser.address} onChange={e => setNewUser({...newUser, address: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddUser(false)} className="flex-1 py-4 glass rounded-xl font-bold">إلغاء</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black shadow-lg">تأكيد الإضافة</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

// Shared Components
const PriceListsView: React.FC<{ companies: Company[], setCompanies: React.Dispatch<React.SetStateAction<Company[]>>, nextCode: number, setNextCode: React.Dispatch<React.SetStateAction<number>> }> = ({ companies, setCompanies, nextCode, setNextCode }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [prods, setProds] = useState<{code:string, name:string, price:number}[]>([]);

  const save = () => {
    if (!name) return;
    const nC: Company = { id: Math.random().toString(), name, code: nextCode.toString(), products: prods.map(p => ({ code: p.code, name: p.name, priceBeforeTax: p.price, priceAfterTax: p.price * 1.14, stock: 0 })) };
    setCompanies([...companies, nC]); setNextCode(prev => prev + 1); setShowAdd(false); setName(''); setProds([]); alert('تم تسجيل الشركة وأصنافها بنجاح');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-black">قوائم أسعار الموردين</h2>
        <button onClick={() => setShowAdd(true)} className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all"><Plus size={24}/> تسجيل شركة جديدة</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(c => (
          <div key={c.id} className="glass-card p-6 md:p-8 rounded-[2rem] space-y-4">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-bold">{c.name}</h3>
               <span className="text-[10px] bg-white/5 px-3 py-1 rounded-full text-gray-400">كود: {c.code}</span>
            </div>
            <p className="text-xs text-gray-500">{c.products.length} صنف مسجل في القائمة</p>
            <div className="pt-4 border-t border-white/5 flex gap-2">
               <button className="flex-1 py-3 glass rounded-xl text-[10px] font-black hover:bg-white/10">عرض الأصناف</button>
               <button className="p-3 bg-red-500/10 text-red-400 rounded-xl" onClick={() => setCompanies(companies.filter(x => x.id !== c.id))}><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
        {companies.length === 0 && <div className="col-span-full p-20 glass rounded-[2.5rem] text-center text-gray-500 font-bold">لم يتم تسجيل أي شركات موردة بعد</div>}
      </div>
      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="absolute inset-0 bg-black/70" onClick={() => setShowAdd(false)} />
           <div className="glass-card w-full max-w-2xl rounded-[2.5rem] p-8 md:p-10 relative z-10 space-y-8 animate-fade-in overflow-y-auto max-h-[90vh]">
             <h3 className="text-2xl font-black text-right">بيانات الشركة الجديدة</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="اسم الشركة / المورد" className="w-full px-6 py-4 rounded-2xl iphone-input outline-none text-right" value={name} onChange={(e) => setName(e.target.value)} />
                <input type="text" readOnly className="w-full px-6 py-4 rounded-2xl glass outline-none text-gray-500 text-right" value={`كود الشركة المسلسل: ${nextCode}`} />
             </div>
             <button onClick={() => setProds([...prods, {code:'', name:'', price: 0}])} className="w-full py-4 glass border-dashed border-2 border-white/10 rounded-2xl font-black text-blue-400 flex justify-center items-center gap-2"><Plus size={20}/> إضافة صنف جديد لهذه الشركة</button>
             <div className="space-y-3">
                {prods.map((p, i) => (
                  <div key={i} className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-2xl border border-white/5">
                    <input type="text" placeholder="كود الصنف" className="flex-1 min-w-[100px] px-4 py-2 rounded-xl iphone-input outline-none text-xs text-right" onChange={(e) => { const n = [...prods]; n[i].code = e.target.value; setProds(n); }} />
                    <input type="text" placeholder="اسم الصنف" className="flex-[2] min-w-[150px] px-4 py-2 rounded-xl iphone-input outline-none text-xs text-right" onChange={(e) => { const n = [...prods]; n[i].name = e.target.value; setProds(n); }} />
                    <input type="number" placeholder="السعر" className="flex-1 min-w-[80px] px-4 py-2 rounded-xl iphone-input outline-none text-xs text-center" onChange={(e) => { const n = [...prods]; n[i].price = Number(e.target.value); setProds(n); }} />
                    <button onClick={() => setProds(prods.filter((_, idx) => idx !== i))} className="p-2 text-red-400"><Trash2 size={16}/></button>
                  </div>
                ))}
             </div>
             <button onClick={save} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl active:scale-95 transition-all">حفظ وإضافة القائمة</button>
           </div>
        </div>
      )}
    </div>
  );
};

const CreateInvoiceView: React.FC<{ companies: Company[], nextId: number, onSave: (inv: Invoice) => void }> = ({ companies, nextId, onSave }) => {
  const [selectedComp, setSelectedComp] = useState<Company | null>(null);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [prodCode, setProdCode] = useState('');
  const [qty, setQty] = useState(1);

  const addProd = () => {
    const p = selectedComp?.products.find(x => x.code === prodCode);
    if (p) {
      setItems([...items, { code: p.code, name: p.name, price: p.priceAfterTax, quantity: qty, total: p.priceAfterTax * qty }]);
      setProdCode(''); setQty(1);
    } else alert('هذا الصنف غير مسجل في قائمة أسعار هذه الشركة');
  };

  const total = items.reduce((a, b) => a + b.total, 0);

  const finalize = () => {
    if (!selectedComp || items.length === 0) return;
    onSave({ id: nextId, companyId: selectedComp.id, companyName: selectedComp.name, date: new Date().toLocaleDateString(), items, totalValue: total, status: 'لم يتم التسليم', payments: [], paidAmount: 0, remaining: total });
    setSelectedComp(null); setItems([]); alert('تم ترحيل الفاتورة للأوردارات المرحلة');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {!selectedComp ? (
        <div className="glass-card p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] text-center space-y-8">
           <div className="inline-flex p-5 rounded-3xl bg-blue-500/20 text-blue-400"><Send size={40}/></div>
           <h2 className="text-2xl md:text-3xl font-black">إنشاء طلبية توريد جديدة</h2>
           <p className="text-gray-500">اختر الشركة الموردة لبدء إضافة الأصناف</p>
           <div className="relative max-w-md mx-auto">
             <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
             <input type="text" placeholder="ابحث باسم الشركة..." className="w-full pr-12 pl-6 py-4 rounded-2xl iphone-input outline-none text-right" value={search} onChange={(e) => setSearch(e.target.value)} />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto p-2">
             {companies.filter(c => c.name.includes(search)).map(c => (
               <button key={c.id} onClick={() => setSelectedComp(c)} className="p-6 glass hover:bg-blue-600/20 rounded-2xl text-right font-bold transition-all border border-white/5">
                 {c.name} <span className="block text-[10px] text-gray-500 font-normal">كود الشركة: {c.code}</span>
               </button>
             ))}
             {companies.length === 0 && <div className="col-span-2 py-10 text-gray-500">يجب تسجيل شركات أولاً من "قوائم الأسعار"</div>}
           </div>
        </div>
      ) : (
        <div className="glass-card p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] animate-fade-in space-y-8">
          <div className="flex justify-between items-center border-b border-white/5 pb-6">
            <h3 className="text-xl md:text-2xl font-black">فاتورة: {selectedComp.name} <span className="text-blue-400 mr-2">#{nextId}</span></h3>
            <button onClick={() => setSelectedComp(null)} className="text-gray-500 hover:text-white"><X size={24}/></button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 bg-white/5 p-4 md:p-6 rounded-3xl border border-white/5">
            <input type="text" placeholder="كود الصنف من القائمة" className="flex-1 px-5 py-3 rounded-xl iphone-input outline-none text-right" value={prodCode} onChange={(e) => setProdCode(e.target.value)} />
            <div className="flex gap-4">
              <input type="number" placeholder="الكمية" className="w-24 px-5 py-3 rounded-xl iphone-input outline-none text-center" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
              <button onClick={addProd} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg">إضافة</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[500px]">
              <thead><tr className="text-gray-500 text-xs border-b border-white/5"><th className="p-4">الصنف</th><th className="p-4">سعر التوريد</th><th className="p-4">الكمية</th><th className="p-4">الإجمالي</th></tr></thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold">{it.name}</td><td className="p-4">{it.price.toFixed(2)}</td><td className="p-4">{it.quantity}</td><td className="p-4 font-black">{it.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center p-6 bg-blue-600/20 rounded-3xl border border-blue-500/20">
             <span className="font-bold text-gray-300">إجمالي قيمة الفاتورة:</span>
             <span className="text-2xl md:text-3xl font-black">{total.toFixed(2)} ج.م</span>
          </div>
          <button onClick={finalize} className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95">حفظ وترحيل الطلبية</button>
        </div>
      )}
    </div>
  );
};

const OrdersView: React.FC<{ invoices: Invoice[], setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>, settings: AppSettings }> = ({ invoices, setInvoices }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Invoice | null>(null);

  const filtered = invoices.filter(inv => inv.companyName.includes(search) || inv.id.toString().includes(search));

  const updateStatus = (id: number, status: any) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
    if (selected?.id === id) setSelected(s => s ? { ...s, status } : null);
  };

  return (
    <div className="space-y-8">
      <div className="glass-card p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-black flex items-center gap-3"><List className="text-blue-400"/> الأوردارات المرحلة</h2>
        <div className="relative w-full max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
          <input type="text" placeholder="بحث برقم الفاتورة أو الشركة..." className="w-full pr-12 pl-6 py-3 rounded-2xl iphone-input outline-none text-sm text-right" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(inv => (
          <div key={inv.id} onClick={() => setSelected(inv)} className="glass-card p-6 rounded-[2rem] cursor-pointer border border-transparent hover:border-blue-500/40 transition-all active:scale-[0.98]">
            <div className="flex justify-between mb-4">
               <span className="text-xs font-black text-blue-400">ف #{inv.id}</span>
               <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${inv.status === 'تم التسليم' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{inv.status}</span>
            </div>
            <h3 className="text-lg font-bold mb-1 text-right">{inv.companyName}</h3>
            <p className="text-[10px] text-gray-500 mb-6 text-right">{inv.date}</p>
            <div className="flex justify-between items-center border-t border-white/5 pt-4">
              <span className="font-black text-xl">{inv.totalValue.toFixed(2)} <span className="text-[10px]">ج.م</span></span>
              <button className="text-[10px] font-black hover:text-blue-400 transition-colors">عرض وتفاصيل</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full py-20 text-center text-gray-500">لا توجد أوردارات مرحلة بهذا البحث</div>}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelected(null)} />
          <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 relative z-10 border-white/10">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl md:text-3xl font-black">تفاصيل الطلبية #{selected.id}</h2>
              <button onClick={() => setSelected(null)}><X size={32} className="text-gray-500 hover:text-white"/></button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <div className="bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/5 text-right">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">حالة الاستلام</p>
                <button onClick={() => updateStatus(selected.id, selected.status === 'تم التسليم' ? 'لم يتم التسليم' : 'تم التسليم')} className={`text-xs md:text-sm font-black w-full py-2 rounded-xl transition-colors ${selected.status === 'تم التسليم' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                  {selected.status}
                </button>
              </div>
              <div className="bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/5 text-right">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">القيمة الكلية</p>
                <p className="text-xl md:text-2xl font-black">{selected.totalValue.toFixed(2)}</p>
              </div>
              <div className="bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/5 text-right">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">المبلغ المدفوع</p>
                <p className="text-xl md:text-2xl font-black text-green-400">{selected.paidAmount.toFixed(2)}</p>
              </div>
              <div className="bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/5 text-right">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">المتبقي للتسوية</p>
                <p className="text-xl md:text-2xl font-black text-red-400">{selected.remaining.toFixed(2)}</p>
              </div>
            </div>
            <div className="space-y-4 mb-10">
               <h4 className="font-black text-sm uppercase tracking-widest text-gray-500 border-b border-white/5 pb-2 text-right">قائمة الأصناف المطلوبة</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                 {selected.items.map((it, idx) => (
                   <div key={idx} className="flex justify-between items-center bg-white/3 p-4 rounded-2xl border border-white/5">
                     <span className="font-black text-blue-400">{it.total.toFixed(2)} ج.م</span>
                     <div><p className="font-bold">{it.name}</p><p className="text-[10px] text-gray-500">الكمية: {it.quantity} | السعر: {it.price.toFixed(2)}</p></div>
                   </div>
                 ))}
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button onClick={() => window.print()} className="py-5 glass hover:bg-white/10 rounded-2xl font-black flex items-center justify-center gap-2"><Printer size={22}/> طباعة الفاتورة</button>
               <button className="py-5 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl"><FileSpreadsheet size={22}/> تصدير EXCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StockView: React.FC<{ companies: Company[], invoices: Invoice[] }> = ({ companies }) => (
  <div className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-10">
    <div className="flex justify-between items-center"><h2 className="text-2xl md:text-3xl font-black">إدارة المخزون والكميات</h2><Package size={40} className="text-blue-500"/></div>
    <div className="overflow-x-auto">
      <table className="w-full text-right min-w-[700px]">
        <thead><tr className="text-gray-500 text-xs border-b border-white/5"><th className="p-4">اسم الصنف</th><th className="p-4">الشركة الموردة</th><th className="p-4">الكمية الحالية</th><th className="p-4">سعر البيع المقترح</th></tr></thead>
        <tbody>
          {companies.flatMap(c => c.products.map(p => ({ ...p, cName: c.name }))).map((p, i) => (
            <tr key={i} className="border-b border-white/5 group hover:bg-white/5 transition-colors">
              <td className="p-4 font-bold">{p.name} <span className="block text-[10px] text-gray-500 font-normal">#{p.code}</span></td>
              <td className="p-4 text-xs">{p.cName}</td>
              <td className="p-4"><span className={`px-4 py-1 rounded-full text-[10px] font-bold ${p.stock > 10 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{p.stock} قطعة</span></td>
              <td className="p-4 font-black text-blue-400">{p.priceAfterTax.toFixed(2)} ج.م</td>
            </tr>
          ))}
          {companies.length === 0 && <tr><td colSpan={4} className="p-20 text-center text-gray-500 font-bold">المخزن فارغ تماماً. قم بتسجيل قوائم الأسعار أولاً.</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
);

const SalesHistoryView: React.FC<{ sales: Sale[], companies: Company[] }> = ({ sales }) => (
  <div className="space-y-8 text-right">
    <h2 className="text-2xl md:text-3xl font-black">سجل المبيعات اليومية والأرباح</h2>
    {sales.length === 0 ? <div className="glass-card p-20 text-center text-gray-500 rounded-[2.5rem] md:rounded-[3rem]">لا توجد مبيعات مسجلة في سجلات اليوم حتى الآن</div> : 
      sales.map(s => (
        <div key={s.id} className="glass-card p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 animate-fade-in border border-white/5">
           <div className="text-center md:text-right w-full md:w-auto">
             <p className="text-blue-400 font-black mb-1 text-sm tracking-widest">مبيعة #{s.id}</p>
             <p className="text-[10px] text-gray-500">{new Date(s.date).toLocaleString('ar-EG')}</p>
           </div>
           <div className="flex-1 flex gap-2 overflow-x-auto w-full md:w-auto py-2">
             {s.items.map((it, i) => <span key={i} className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold border border-white/5 whitespace-nowrap">{it.name} (x{it.quantity})</span>)}
           </div>
           <div className="text-center md:text-left w-full md:w-auto border-t md:border-t-0 md:border-r border-white/10 pt-4 md:pt-0 md:pr-6">
             <p className="text-[10px] text-gray-500 uppercase font-black mb-1">إجمالي العملية</p>
             <p className="text-2xl md:text-3xl font-black">{s.totalValue.toFixed(2)} ج.م</p>
           </div>
        </div>
      ))
    }
  </div>
);

const WelcomeToast: React.FC<{ username: string }> = ({ username }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (username) { setVisible(true); const timer = setTimeout(() => setVisible(false), 4000); return () => clearTimeout(timer); }
  }, [username]);
  if (!visible) return null;
  return (
    <div className="fixed bottom-4 md:bottom-12 left-4 md:left-12 glass px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-[2rem] shadow-2xl z-[100] border border-blue-500/30 flex items-center gap-4 animate-fade-in">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg"><ShieldCheck className="text-white" /></div>
      <div className="text-right">
        <h4 className="font-black text-white text-sm md:text-base">مرحباً بك، {username}!</h4>
        <p className="text-[10px] md:text-xs text-blue-400">النظام الآن في وضع المزامنة السحابية</p>
      </div>
    </div>
  );
};

export default App;
