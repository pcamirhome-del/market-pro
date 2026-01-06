
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu, X, Bell, LogOut, Search, Plus, 
  Trash2, Printer, FileSpreadsheet, Settings as SettingsIcon,
  Package, ShoppingCart, List, Send, Users as UsersIcon, ChevronRight,
  ShieldCheck, LayoutDashboard, Database, CreditCard, UserPlus, Wifi, WifiOff,
  Edit3, CheckCircle2, AlertCircle, History, Wallet, Tag, Bookmark, ScanLine
} from 'lucide-react';
import { User, Company, Invoice, Sale, AppSettings, Product, Role, InvoiceItem, Payment } from './types';

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

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const navigateToOrder = (company: Company) => {
    setPrefilledInvoiceCompany(company);
    setCurrentView('createInvoice');
  };

  const renderView = () => {
    switch (currentView) {
      case 'pos': return <POSView settings={settings} companies={companies} onSaveSale={(sale) => setSales(prev => [...prev, sale])} sales={sales} invoices={invoices} />;
      case 'createInvoice': return <CreateInvoiceView companies={companies} nextId={nextInvoiceId} prefilledCompany={prefilledInvoiceCompany} onSave={(inv) => { setInvoices(prev => [...prev, inv]); setNextInvoiceId(prev => prev + 1); setPrefilledInvoiceCompany(null); }} onCancel={() => setPrefilledInvoiceCompany(null)} />;
      case 'orders': return <OrdersView invoices={invoices} setInvoices={setInvoices} settings={settings} />;
      case 'priceLists': return <PriceListsView companies={companies} setCompanies={setCompanies} nextCode={nextCompanyCode} setNextCode={setNextCompanyCode} />;
      case 'offers': return <OffersView companies={companies} setCompanies={setCompanies} settings={settings} />;
      case 'shelfPrices': return <ShelfPriceView companies={companies} settings={settings} />;
      case 'stock': return <StockView companies={companies} invoices={invoices} sales={sales} />;
      case 'sales': return <SalesHistoryView sales={sales} settings={settings} />;
      case 'settings': return <SettingsView settings={settings} setSettings={setSettings} users={users} setUsers={setUsers} />;
      default: return <POSView settings={settings} companies={companies} onSaveSale={(sale) => setSales(prev => [...prev, sale])} sales={sales} invoices={invoices} />;
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
          <nav className="space-y-2 overflow-y-auto max-h-[70vh] px-1">
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
          <NotificationBell lowStockCount={lowStockItems.length} lowStockItems={lowStockItems} onOrder={navigateToOrder} />
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
    <span className="font-bold text-sm tracking-wide text-right flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
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
          <div className="absolute left-0 mt-4 w-80 glass-card rounded-[2rem] z-50 p-6 shadow-2xl animate-fade-in border border-white/10 max-h-[80vh] overflow-y-auto">
            <h3 className="font-black text-sm text-blue-400 mb-6 flex items-center gap-2"><AlertCircle size={16}/> إشعارات النظام</h3>
            {lowStockItems.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6 font-bold">لا توجد إشعارات حالياً</p>
            ) : (
              <div className="space-y-4">
                {lowStockItems.map((entry, idx) => (
                  <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="font-bold text-xs mb-1">نقص مخزون: {entry.company.name}</p>
                    <p className="text-[10px] text-gray-500 mb-3">الأصناف: {entry.items.length}</p>
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
    if (!confirm('هل أنت متأكد من حفظ هذه العملية؟ سيتم ترحيل البيانات وتحديث المخزن فوراً.')) return;
    onSaveSale({ id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString(), items, totalValue: total, received, change });
    setItems([]); setReceived(0); alert('تم حفظ عملية البيع بنجاح');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      <div className="lg:col-span-2 space-y-6 md:space-y-8">
        <div className="glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] space-y-6">
          <h2 className="text-xl md:text-2xl font-black flex items-center gap-3"><ShoppingCart className="text-blue-400"/> كاشير المبيعات اليومية</h2>
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
             <h3 className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">الأصناف المطلوبة بالفاتورة</h3>
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
                    <td className="p-4 text-center">
                      <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="p-2 text-red-400 hover:bg-red-400/20 rounded-xl"><Trash2 size={18}/></button>
                    </td>
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
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest text-right">المبلغ المستلم من العميل</label>
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

const OffersView: React.FC<{ companies: Company[], setCompanies: React.Dispatch<React.SetStateAction<Company[]>>, settings: AppSettings }> = ({ companies, setCompanies, settings }) => {
  const [selectedCompId, setSelectedCompId] = useState('');
  const [search, setSearch] = useState('');
  const [barcodeSearch, setBarcodeSearch] = useState('');

  const company = companies.find(c => c.id === selectedCompId);
  
  const updateOfferPrice = (pCode: string, price: number) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === selectedCompId) {
        return {
          ...c,
          products: c.products.map(p => p.code === pCode ? { ...p, offerPrice: price } : p)
        };
      }
      return c;
    }));
  };

  const filteredProducts = useMemo(() => {
    if (!company) return [];
    return company.products.filter(p => 
      p.name.includes(search) || p.code.includes(search)
    );
  }, [company, search]);

  const barcodeProduct = useMemo(() => {
    if (!barcodeSearch) return null;
    let found = null;
    companies.forEach(c => {
      const p = c.products.find(prod => prod.code === barcodeSearch);
      if (p) found = { p, cId: c.id };
    });
    return found;
  }, [barcodeSearch, companies]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="glass-card p-10 rounded-[3rem] text-center space-y-8">
        <h2 className="text-3xl font-black flex items-center justify-center gap-3"><Tag className="text-blue-400"/> إدارة أسعار العروض</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 text-right">
            <label className="block text-xs font-black text-gray-500">اختر الشركة</label>
            <select 
              className="w-full px-6 py-4 rounded-2xl iphone-input outline-none bg-blue-900/20"
              value={selectedCompId}
              onChange={(e) => setSelectedCompId(e.target.value)}
            >
              <option value="">-- اختر شركة --</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-4 text-right">
            <label className="block text-xs font-black text-gray-500">بحث بالباركود المباشر</label>
            <div className="relative">
              <ScanLine className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
              <input 
                type="text" 
                placeholder="مرر الباركود هنا..." 
                className="w-full pr-12 pl-6 py-4 rounded-2xl iphone-input outline-none"
                value={barcodeSearch}
                onChange={(e) => setBarcodeSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {barcodeProduct && (
        <div className="glass-card p-8 rounded-[2rem] border-blue-500/30 animate-fade-in bg-blue-600/5">
          <h3 className="font-black text-lg mb-6 text-right">تعديل سعر العرض لهذا الصنف</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            <div className="text-right"><p className="text-[10px] text-gray-500">اسم الصنف</p><p className="font-bold">{barcodeProduct.p.name}</p></div>
            <div className="text-right"><p className="text-[10px] text-gray-500">سعر القائمة</p><p className="font-bold">{barcodeProduct.p.priceAfterTax.toFixed(2)}</p></div>
            <div className="text-right"><p className="text-[10px] text-gray-500">سعر المكسب ({settings.profitMargin}%)</p><p className="font-bold">{(barcodeProduct.p.priceAfterTax * (1 + settings.profitMargin/100)).toFixed(2)}</p></div>
            <div className="text-right">
              <p className="text-[10px] text-blue-400 font-black">سعر العرض المخصص</p>
              <input 
                type="number" 
                className="w-full px-4 py-2 rounded-xl iphone-input outline-none text-center font-black"
                defaultValue={barcodeProduct.p.offerPrice}
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  setCompanies(prev => prev.map(c => c.id === barcodeProduct.cId ? { ...c, products: c.products.map(pr => pr.code === barcodeProduct.p.code ? { ...pr, offerPrice: val } : pr) } : c));
                  alert('تم الحفظ بنجاح');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {company && (
        <div className="glass-card rounded-[2.5rem] overflow-hidden animate-fade-in">
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
             <h3 className="font-black text-xl">{company.name} - قائمة المنتجات</h3>
             <div className="relative w-full md:w-64">
               <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
               <input type="text" placeholder="بحث بالاسم..." className="w-full pr-10 pl-4 py-2 rounded-xl iphone-input outline-none text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-white/5"><tr className="text-gray-500"><th className="p-4">اسم الصنف</th><th className="p-4">سعر الشركة</th><th className="p-4">سعر المكسب</th><th className="p-4">سعر العرض</th><th className="p-4">حفظ</th></tr></thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map(p => {
                  const profitPrice = p.priceAfterTax * (1 + settings.profitMargin / 100);
                  return (
                    <tr key={p.code} className="hover:bg-white/5">
                      <td className="p-4 font-bold">{p.name} <span className="block text-[9px] text-gray-500">{p.code}</span></td>
                      <td className="p-4">{p.priceAfterTax.toFixed(2)}</td>
                      <td className="p-4">{profitPrice.toFixed(2)}</td>
                      <td className="p-4">
                        <input 
                          type="number" 
                          id={`offer-${p.code}`}
                          placeholder="---" 
                          className="w-20 px-2 py-1 rounded bg-black/30 border border-white/10 outline-none text-center text-blue-400 font-bold" 
                          defaultValue={p.offerPrice}
                        />
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => {
                            const val = Number((document.getElementById(`offer-${p.code}`) as HTMLInputElement).value);
                            updateOfferPrice(p.code, val);
                            alert('تم حفظ سعر العرض للصنف: ' + p.name);
                          }}
                          className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                          <CheckCircle2 size={16}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const ShelfPriceView: React.FC<{ companies: Company[], settings: AppSettings }> = ({ companies, settings }) => {
  const [compId, setCompId] = useState('');
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());

  const company = companies.find(c => c.id === compId);

  const toggleSelect = (code: string) => {
    const next = new Set(selectedCodes);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    setSelectedCodes(next);
  };

  const handlePrint = () => {
    const items = company?.products.filter(p => selectedCodes.has(p.code)) || [];
    if (items.length === 0) return alert('الرجاء اختيار أصناف للطباعة');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html dir="rtl" lang="ar">
      <head>
        <title>طباعة أسعار الرف</title>
        <style>
          body { font-family: 'Arial', sans-serif; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 20px; }
          .tag { border: 2px solid #000; padding: 15px; border-radius: 8px; text-align: center; height: 180px; display: flex; flex-direction: column; justify-content: space-between; position: relative; }
          .market-name { font-size: 14px; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .item-name { font-size: 16px; margin: 10px 0; }
          .price-row { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
          .price { font-size: 24px; font-weight: 900; color: #000; }
          .barcode { font-size: 10px; font-family: 'monospace'; }
          .date { font-size: 8px; color: #666; position: absolute; bottom: 5px; right: 10px; }
        </style>
      </head>
      <body>
        ${items.map(p => {
          const curPrice = p.offerPrice && p.offerPrice > 0 
            ? p.offerPrice 
            : p.priceAfterTax * (1 + settings.profitMargin / 100);
          return `
            <div class="tag">
              <div class="market-name">${settings.programName}</div>
              <div class="item-name">${p.name}</div>
              <div class="price-row">
                <div class="price">${curPrice.toFixed(2)} ج.م</div>
                <div class="barcode">#${p.code}</div>
              </div>
              <div class="date">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</div>
            </div>
          `;
        }).join('')}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-right">
      <div className="glass-card p-10 rounded-[3rem] text-center space-y-6">
        <h2 className="text-3xl font-black flex items-center justify-center gap-3"><Bookmark className="text-blue-400"/> طباعة أسعار الرف (شيلف)</h2>
        <div className="max-w-md mx-auto space-y-4">
           <label className="block text-xs font-black text-gray-500">اختر الشركة الموردة</label>
           <select 
             className="w-full px-6 py-4 rounded-2xl iphone-input outline-none bg-blue-900/20"
             value={compId}
             onChange={(e) => { setCompId(e.target.value); setSelectedCodes(new Set()); }}
           >
             <option value="">-- اختر شركة --</option>
             {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
           </select>
        </div>
      </div>

      {company && (
        <div className="glass-card rounded-[2.5rem] overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-white/5"><tr className="text-gray-500"><th className="p-4">اسم الصنف</th><th className="p-4">الباركود</th><th className="p-4">سعر البيع الحالي</th><th className="p-4 text-center">اختيار</th></tr></thead>
              <tbody className="divide-y divide-white/5">
                {company.products.map(p => {
                   const curPrice = p.offerPrice && p.offerPrice > 0 
                    ? p.offerPrice 
                    : p.priceAfterTax * (1 + settings.profitMargin / 100);
                   return (
                    <tr key={p.code} className={`hover:bg-white/5 transition-all ${selectedCodes.has(p.code) ? 'bg-blue-600/10' : ''}`}>
                      <td className="p-4 font-bold">{p.name}</td>
                      <td className="p-4 font-mono text-gray-500">{p.code}</td>
                      <td className="p-4 font-black text-blue-400">{curPrice.toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 accent-blue-600 rounded" 
                          checked={selectedCodes.has(p.code)}
                          onChange={() => toggleSelect(p.code)}
                        />
                      </td>
                    </tr>
                   );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-8 border-t border-white/5 flex gap-4">
            <button onClick={handlePrint} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2"><Printer size={20}/> طباعة الملصقات</button>
            <button className="flex-1 py-4 glass rounded-2xl font-black flex items-center justify-center gap-2"><FileSpreadsheet size={20}/> تصدير Excel</button>
          </div>
        </div>
      )}
    </div>
  );
};

const SalesHistoryView: React.FC<{ sales: Sale[], settings: AppSettings }> = ({ sales, settings }) => {
  const [filterType, setFilterType] = useState<'day' | 'range' | 'all'>('all');
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');

  const filteredSales = useMemo(() => {
    if (filterType === 'all') return sales;
    return sales.filter(s => {
      const sDate = new Date(s.date).toLocaleDateString('en-CA');
      if (filterType === 'day') return sDate === date1;
      if (filterType === 'range') return sDate >= date1 && sDate <= date2;
      return true;
    });
  }, [sales, filterType, date1, date2]);

  const totalValue = filteredSales.reduce((a, b) => a + b.totalValue, 0);

  return (
    <div className="space-y-8 text-right">
      <div className="glass-card p-10 rounded-[3rem] space-y-8">
        <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3"><LayoutDashboard className="text-blue-400"/> سجل المبيعات والأرباح</h2>
        
        <div className="flex flex-wrap gap-6 items-end justify-end">
           <div className="space-y-2">
             <label className="block text-[10px] font-black text-gray-500">نوع البحث</label>
             <select className="px-4 py-2 rounded-xl iphone-input outline-none text-xs bg-blue-900/20" value={filterType} onChange={(e:any) => setFilterType(e.target.value)}>
                <option value="all">عرض الكل</option>
                <option value="day">يوم محدد</option>
                <option value="range">فترة محددة</option>
             </select>
           </div>
           {filterType === 'day' && (
             <div className="space-y-2">
               <label className="block text-[10px] font-black text-gray-500">التاريخ</label>
               <input type="date" className="px-4 py-2 rounded-xl iphone-input outline-none text-xs" value={date1} onChange={(e) => setDate1(e.target.value)} />
             </div>
           )}
           {filterType === 'range' && (
             <>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-500">من تاريخ</label>
                <input type="date" className="px-4 py-2 rounded-xl iphone-input outline-none text-xs" value={date1} onChange={(e) => setDate1(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-500">إلى تاريخ</label>
                <input type="date" className="px-4 py-2 rounded-xl iphone-input outline-none text-xs" value={date2} onChange={(e) => setDate2(e.target.value)} />
              </div>
             </>
           )}
           <div className="flex gap-2">
             <button onClick={() => window.print()} className="p-3 glass rounded-xl text-blue-400"><Printer size={20}/></button>
             <button className="p-3 glass rounded-xl text-green-400"><FileSpreadsheet size={20}/></button>
           </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex justify-between items-center">
          <div className="text-right">
             <p className="text-[10px] text-gray-500 font-black">إجمالي مبيعات الفترة</p>
             <p className="text-4xl font-black text-green-400">{totalValue.toFixed(2)} <span className="text-xs">ج.م</span></p>
          </div>
          <div className="text-left">
             <p className="text-[10px] text-gray-500 font-black">عدد العمليات</p>
             <p className="text-2xl font-black">{filteredSales.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSales.map(s => (
          <div key={s.id} className="glass-card p-6 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all">
             <div className="flex justify-between mb-4">
               <span className="text-xs text-blue-400 font-black">#{s.id}</span>
               <span className="text-[10px] text-gray-500">{new Date(s.date).toLocaleDateString('ar-EG')}</span>
             </div>
             <div className="text-right space-y-1 mb-6">
                <p className="text-2xl font-black">{s.totalValue.toFixed(2)} <span className="text-[10px]">ج.م</span></p>
                <p className="text-[9px] text-gray-500 font-bold tracking-widest">{new Date(s.date).toLocaleTimeString('ar-EG')}</p>
             </div>
             <div className="border-t border-white/5 pt-4 flex justify-between items-center text-[10px]">
               <span className="text-gray-500">تم استلام: {s.received.toFixed(2)}</span>
               <span className="text-green-400 font-bold">الباقي: {s.change.toFixed(2)}</span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CreateInvoiceView: React.FC<{ companies: Company[], nextId: number, prefilledCompany?: Company | null, onSave: (inv: Invoice) => void, onCancel: () => void }> = ({ companies, nextId, prefilledCompany, onSave, onCancel }) => {
  const [selectedComp, setSelectedComp] = useState<Company | null>(prefilledCompany || null);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [prodCode, setProdCode] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (prefilledCompany) setSelectedComp(prefilledCompany);
  }, [prefilledCompany]);

  const addProd = () => {
    const p = selectedComp?.products.find(x => x.code === prodCode);
    if (p) {
      setItems([...items, { code: p.code, name: p.name, price: p.priceBeforeTax, quantity: qty, total: p.priceBeforeTax * qty }]);
      setProdCode(''); setQty(1);
    } else alert('هذا الصنف غير مسجل في قائمة أسعار هذه الشركة');
  };

  const total = items.reduce((a, b) => a + b.total, 0);

  const finalize = () => {
    if (!selectedComp || items.length === 0) return;
    if (!confirm('هل تريد ترحيل الفاتورة؟ سيتم تسجيلها في الأوردارات المرحلة.')) return;
    onSave({ 
      id: nextId, 
      companyId: selectedComp.id, 
      companyName: selectedComp.name, 
      date: new Date().toLocaleDateString('ar-EG'), 
      items, 
      totalValue: total, 
      status: 'لم يتم التسليم', 
      payments: [], 
      paidAmount: 0, 
      remaining: total 
    });
    setSelectedComp(null); setItems([]);
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
           </div>
        </div>
      ) : (
        <div className="glass-card p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] animate-fade-in space-y-8">
          <div className="flex justify-between items-center border-b border-white/5 pb-6">
            <h3 className="text-xl md:text-2xl font-black">فاتورة: {selectedComp.name} <span className="text-blue-400 mr-2">#{nextId}</span></h3>
            <button onClick={() => { setSelectedComp(null); onCancel(); }} className="text-gray-500 hover:text-white"><X size={24}/></button>
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
              <thead><tr className="text-gray-500 text-xs border-b border-white/5"><th className="p-4 text-right">الصنف</th><th className="p-4">سعر التوريد (قائمة)</th><th className="p-4">الكمية</th><th className="p-4">الإجمالي</th></tr></thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-right">{it.name}</td>
                    <td className="p-4">{it.price.toFixed(2)}</td>
                    <td className="p-4">{it.quantity}</td>
                    <td className="p-4 font-black">{it.total.toFixed(2)}</td>
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

const PriceListsView: React.FC<{ companies: Company[], setCompanies: React.Dispatch<React.SetStateAction<Company[]>>, nextCode: number, setNextCode: React.Dispatch<React.SetStateAction<number>> }> = ({ companies, setCompanies, nextCode, setNextCode }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [name, setName] = useState('');
  const [prods, setProds] = useState<Partial<Product>[]>([]);

  const openAdd = () => { setEditingCompany(null); setName(''); setProds([]); setShowAdd(true); };
  const openEdit = (c: Company) => { setEditingCompany(c); setName(c.name); setProds(c.products); setShowAdd(true); };

  const save = () => {
    if (!name) return;
    const updatedProducts = prods.map(p => ({
      code: p.code || '',
      name: p.name || '',
      priceBeforeTax: p.priceBeforeTax || 0,
      priceAfterTax: (p.priceBeforeTax || 0) * 1.14,
      stock: p.stock || 0,
      minThreshold: p.minThreshold || 5,
      offerPrice: p.offerPrice || 0
    }));

    if (editingCompany) {
      setCompanies(companies.map(c => c.id === editingCompany.id ? { ...c, name, products: updatedProducts } : c));
      alert('تم تحديث بيانات الشركة بنجاح');
    } else {
      const nC: Company = { 
        id: Math.random().toString(), 
        name, 
        code: nextCode.toString(), 
        createdAt: new Date().toLocaleDateString('ar-EG') + ' ' + new Date().toLocaleTimeString('ar-EG'),
        products: updatedProducts
      };
      setCompanies([...companies, nC]); 
      setNextCode(prev => prev + 1); 
      alert('تم تسجيل الشركة بنجاح');
    }
    setShowAdd(false);
  };

  const deleteCompany = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الشركة؟ سيتم حذف كافة قوائم الأسعار المرتبطة بها.')) {
      setCompanies(companies.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-black text-right w-full">قوائم أسعار الموردين والشركات</h2>
        <button onClick={openAdd} className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all whitespace-nowrap"><Plus size={24}/> شركة جديدة</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(c => (
          <div key={c.id} className="glass-card p-6 md:p-8 rounded-[2rem] space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 bg-blue-600/10 text-[8px] font-black text-blue-400">{c.createdAt}</div>
            <div className="pt-4 flex justify-between items-center">
               <h3 className="text-xl font-bold">{c.name}</h3>
               <span className="text-[10px] bg-white/5 px-3 py-1 rounded-full text-gray-400">كود: {c.code}</span>
            </div>
            <p className="text-xs text-gray-500">{c.products.length} صنف مسجل في القائمة</p>
            <div className="pt-4 border-t border-white/5 flex gap-2">
               <button onClick={() => openEdit(c)} className="flex-1 py-3 glass rounded-xl text-[10px] font-black hover:bg-white/10 flex items-center justify-center gap-1"><Edit3 size={14}/> تعديل</button>
               <button onClick={() => deleteCompany(c.id)} className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="absolute inset-0 bg-black/70" onClick={() => setShowAdd(false)} />
           <div className="glass-card w-full max-w-4xl rounded-[2.5rem] p-8 md:p-10 relative z-10 space-y-8 animate-fade-in overflow-y-auto max-h-[90vh]">
             <div className="flex justify-between items-center">
               <button onClick={() => setShowAdd(false)} className="p-2 text-gray-500"><X size={24}/></button>
               <h3 className="text-2xl font-black text-right">{editingCompany ? 'تعديل بيانات الشركة' : 'بيانات الشركة الجديدة'}</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="اسم الشركة / المورد" className="w-full px-6 py-4 rounded-2xl iphone-input outline-none text-right" value={name} onChange={(e) => setName(e.target.value)} />
                <input type="text" readOnly className="w-full px-6 py-4 rounded-2xl glass outline-none text-gray-500 text-right" value={editingCompany ? `كود الشركة: ${editingCompany.code}` : `كود الشركة المسلسل: ${nextCode}`} />
             </div>
             <div className="flex justify-between items-center pt-6">
                <div className="flex gap-2">
                  <button onClick={() => window.print()} className="px-4 py-2 glass rounded-xl text-xs font-bold flex items-center gap-2"><Printer size={16}/> طباعة</button>
                </div>
                <button onClick={() => setProds([...prods, {code:'', name:'', priceBeforeTax: 0, minThreshold: 5}])} className="px-6 py-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl font-black text-sm flex justify-center items-center gap-2"><Plus size={18}/> إضافة صنف</button>
             </div>
             <div className="space-y-3">
                {prods.map((p, i) => (
                  <div key={i} className="grid grid-cols-1 lg:grid-cols-5 gap-2 p-3 bg-white/5 rounded-2xl border border-white/5 items-center">
                    <input type="text" placeholder="الكود" className="px-4 py-2 rounded-xl iphone-input outline-none text-xs text-right font-mono" value={p.code} onChange={(e) => { const n = [...prods]; n[i].code = e.target.value; setProds(n); }} />
                    <input type="text" placeholder="الاسم" className="px-4 py-2 rounded-xl iphone-input outline-none text-xs text-right" value={p.name} onChange={(e) => { const n = [...prods]; n[i].name = e.target.value; setProds(n); }} />
                    <input type="number" placeholder="سعر القائمة" className="px-4 py-2 rounded-xl iphone-input outline-none text-xs text-center" value={p.priceBeforeTax} onChange={(e) => { const n = [...prods]; n[i].priceBeforeTax = Number(e.target.value); setProds(n); }} />
                    <div className="px-4 py-2 rounded-xl glass text-xs text-center text-blue-400 font-bold">{((p.priceBeforeTax || 0) * 1.14).toFixed(2)}</div>
                    <div className="flex gap-2">
                      <input type="number" placeholder="5" className="flex-1 px-4 py-2 rounded-xl iphone-input outline-none text-xs text-center" value={p.minThreshold} onChange={(e) => { const n = [...prods]; n[i].minThreshold = Number(e.target.value); setProds(n); }} />
                      <button onClick={() => setProds(prods.filter((_, idx) => idx !== i))} className="p-2 text-red-400"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
             </div>
             <button onClick={save} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl active:scale-95 transition-all">حفظ البيانات</button>
           </div>
        </div>
      )}
    </div>
  );
};

const StockView: React.FC<{ companies: Company[], invoices: Invoice[], sales: Sale[] }> = ({ companies, invoices, sales }) => {
  const [companyId, setCompanyId] = useState<string>('all');
  const [searchCode, setSearchCode] = useState('');

  const stockData = useMemo(() => {
    let data: any[] = [];
    companies.forEach(comp => {
      if (companyId !== 'all' && comp.id !== companyId) return;
      comp.products.forEach(prod => {
        if (searchCode && !prod.code.includes(searchCode)) return;
        const totalReceived = invoices
          .filter(inv => inv.status === 'تم التسليم' && inv.companyId === comp.id)
          .reduce((sum, inv) => {
            const item = inv.items.find(it => it.code === prod.code);
            return sum + (item ? item.quantity : 0);
          }, 0);
        const totalSold = sales.reduce((sum, sale) => {
          const item = sale.items.find(it => it.code === prod.code);
          return sum + (item ? item.quantity : 0);
        }, 0);
        const currentStock = totalReceived - totalSold;
        data.push({ ...prod, cName: comp.name, currentStock });
      });
    });
    return data;
  }, [companies, invoices, sales, companyId, searchCode]);

  return (
    <div className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-10 text-right">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3"><Package className="text-blue-500"/> إدارة المخزون والكميات</h2>
        <div className="flex flex-wrap gap-4 w-full md:w-auto justify-end">
          <select 
            className="px-6 py-4 rounded-2xl iphone-input outline-none bg-blue-900/20 text-xs"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
          >
            <option value="all">كل الشركات الموردة</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
            <input 
              type="text" placeholder="بحث بالكود..." 
              className="pr-12 pl-6 py-4 rounded-2xl iphone-input outline-none text-xs text-right"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right min-w-[700px]">
          <thead><tr className="text-gray-500 text-xs border-b border-white/5"><th className="p-4 text-right">اسم الصنف</th><th className="p-4">الشركة الموردة</th><th className="p-4">الكمية الحالية</th><th className="p-4">سعر البيع</th></tr></thead>
          <tbody>
            {stockData.map((p, i) => (
              <tr key={i} className="border-b border-white/5 group hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-right">{p.name} <span className="block text-[10px] text-gray-500 font-normal">#{p.code}</span></td>
                <td className="p-4 text-xs">{p.cName}</td>
                <td className="p-4">
                  <span className={`px-4 py-1 rounded-full text-[10px] font-bold ${p.currentStock > (p.minThreshold || 5) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {p.currentStock} قطعة
                  </span>
                </td>
                <td className="p-4 font-black text-blue-400">{p.priceAfterTax.toFixed(2)} ج.م</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const OrdersView: React.FC<{ invoices: Invoice[], setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>, settings: AppSettings }> = ({ invoices, setInvoices }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const filtered = invoices.filter(inv => inv.companyName.includes(search) || inv.id.toString().includes(search));

  const addPayment = (id: number) => {
    if (paymentAmount <= 0) return;
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        const newPaid = inv.paidAmount + paymentAmount;
        const newRem = Math.max(0, inv.totalValue - newPaid);
        const newPayments = [...inv.payments, { amount: paymentAmount, date: new Date().toLocaleDateString('ar-EG') }];
        return { ...inv, paidAmount: newPaid, remaining: newRem, payments: newPayments };
      }
      return inv;
    }));
    setPaymentAmount(0);
    alert('تم تسجيل الدفعة بنجاح');
  };

  return (
    <div className="space-y-8 text-right">
      <div className="glass-card p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-black flex items-center gap-3"><List className="text-blue-400"/> الأوردارات المرحلة</h2>
        <div className="relative w-full max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
          <input type="text" placeholder="بحث..." className="w-full pr-12 pl-6 py-3 rounded-2xl iphone-input outline-none text-sm text-right" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(inv => (
          <div key={inv.id} onClick={() => setSelected(inv)} className="glass-card p-6 rounded-[2rem] cursor-pointer border border-transparent hover:border-blue-500/40 transition-all active:scale-[0.98]">
            <div className="flex justify-between mb-4">
               <span className="text-xs font-black text-blue-400">ف #{inv.id}</span>
               <div className="flex gap-2">
                 {inv.remaining === 0 && <span className="text-[9px] px-2 py-1 rounded-full bg-green-500/20 text-green-400 font-black">مدفوع</span>}
                 {inv.paidAmount > 0 && inv.remaining > 0 && <span className="text-[9px] px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 font-black">مجزأة</span>}
               </div>
            </div>
            <h3 className="text-lg font-bold mb-1">{inv.companyName}</h3>
            <p className="text-[10px] text-gray-500 mb-6">المتبقي: {inv.remaining.toFixed(2)} ج.م</p>
          </div>
        ))}
      </div>
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelected(null)} />
          <div className="glass-card w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-10 relative z-10 border-white/10">
            <h2 className="text-2xl font-black mb-10">تفاصيل الطلبية #{selected.id}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
               <div className="lg:col-span-2 space-y-4">
                  {selected.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span>{it.total.toFixed(2)} ج.م</span>
                      <span>{it.name} (x{it.quantity})</span>
                    </div>
                  ))}
               </div>
               <div className="space-y-4">
                  <div className="flex gap-2">
                    <button onClick={() => addPayment(selected.id)} className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold">دفع</button>
                    <input type="number" placeholder="المبلغ" className="flex-1 px-4 py-2 rounded-xl iphone-input outline-none text-xs text-center" value={paymentAmount} onChange={(e) => setPaymentAmount(Number(e.target.value))} />
                  </div>
                  <div className="space-y-1">
                     {selected.payments.map((p, i) => (
                       <div key={i} className="flex justify-between text-[10px] p-2 bg-white/5 rounded-lg">
                         <span>{p.amount.toFixed(2)}</span>
                         <span>{p.date}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsView: React.FC<{ settings: AppSettings, setSettings: React.Dispatch<React.SetStateAction<AppSettings>>, users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>> }> = ({ settings, setSettings, users, setUsers }) => {
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
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-right">
      <div className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-10">
        <h3 className="text-2xl font-black flex items-center gap-3 justify-end"><SettingsIcon className="text-blue-400"/> إعدادات النظام</h3>
        <div className="space-y-6">
          <div><label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">اسم البرنامج</label><input type="text" className="w-full px-6 py-4 rounded-2xl iphone-input outline-none text-right" value={settings.programName} onChange={e => setSettings({...settings, programName: e.target.value})} /></div>
          <div><label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">نسبة الربح %</label><input type="number" className="w-full px-6 py-4 rounded-2xl iphone-input outline-none text-right" value={settings.profitMargin} onChange={e => setSettings({...settings, profitMargin: Number(e.target.value)})} /></div>
        </div>
      </div>
      <div className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-10">
         <h3 className="text-2xl font-black flex items-center gap-3 justify-end"><UsersIcon className="text-blue-400"/> الموظفين</h3>
         <div className="space-y-4">
            {users.map(u => (
              <div key={u.id} className="p-4 glass rounded-2xl flex justify-between items-center border border-white/5">
                <button className="text-red-400" onClick={() => u.username !== 'admin' && setUsers(users.filter(x => x.id !== u.id))}><Trash2 size={16}/></button>
                <div className="text-right">
                  <p className="font-bold text-sm">{u.username}</p>
                  <p className="text-[10px] text-blue-400">{u.role}</p>
                </div>
              </div>
            ))}
            <button onClick={() => setShowAddUser(true)} className="w-full py-4 bg-blue-600/20 text-blue-400 rounded-2xl font-black text-sm border border-blue-500/30 transition-all flex items-center justify-center gap-2">
              <UserPlus size={18}/> إضافة موظف
            </button>
         </div>
      </div>
      {showAddUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="absolute inset-0 bg-black/70" onClick={() => setShowAddUser(false)} />
           <form onSubmit={handleAddUser} className="glass-card w-full max-w-md rounded-[2.5rem] p-8 relative z-10 space-y-6 animate-fade-in text-right">
              <h3 className="text-2xl font-black text-center mb-8">إضافة حساب جديد</h3>
              <input type="text" placeholder="اسم المستخدم" className="w-full px-6 py-3 rounded-xl iphone-input outline-none text-right" required value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
              <input type="password" placeholder="كلمة المرور" className="w-full px-6 py-3 rounded-xl iphone-input outline-none text-right" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              <select className="w-full px-6 py-3 rounded-xl iphone-input outline-none bg-[#0f172a] text-right" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as Role})}>
                <option value="موظف">موظف مبيعات</option>
                <option value="مدير">مدير نظام</option>
              </select>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-black shadow-lg mt-4">تأكيد الإضافة</button>
           </form>
        </div>
      )}
    </div>
  );
};

const WelcomeToast: React.FC<{ username: string }> = ({ username }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (username) { setVisible(true); const timer = setTimeout(() => setVisible(false), 4000); return () => clearTimeout(timer); }
  }, [username]);
  if (!visible) return null;
  return (
    <div className="fixed bottom-4 left-4 glass px-6 py-4 rounded-2xl shadow-2xl z-[100] border border-blue-500/30 flex items-center gap-4 animate-fade-in">
      <div className="text-right">
        <h4 className="font-black text-white text-sm">مرحباً بك، {username}!</h4>
      </div>
    </div>
  );
};

export default App;
