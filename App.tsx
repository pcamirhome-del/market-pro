
import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Bell, LogOut, Search, Plus, 
  Trash2, Printer, FileSpreadsheet, Settings as SettingsIcon,
  Package, ShoppingCart, List, Send, Users as UsersIcon, ChevronRight,
  ShieldCheck, LayoutDashboard, Database, CreditCard
} from 'lucide-react';
import { User, Company, Invoice, Sale, AppSettings, Product, Role, InvoiceItem } from './types';

const INITIAL_SETTINGS: AppSettings = {
  programName: 'Market Pro',
  profitMargin: 14,
  sideMenuNames: {
    'pos': 'المبيعات اليومية',
    'createInvoice': 'إنشاء فاتورة',
    'orders': 'الأوردارات المرحلة',
    'priceLists': 'قوائم أسعار الشركات',
    'stock': 'المخزون',
    'sales': 'المبيعات',
    'settings': 'الإعدادات'
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

  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'admin', password: 'admin', role: 'مدير', phone: '0100000000', address: 'Cairo', startDate: new Date().toLocaleDateString(), permissions: ['pos', 'createInvoice', 'orders', 'priceLists', 'stock', 'sales'] }
  ]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [nextInvoiceId, setNextInvoiceId] = useState(1000);
  const [nextCompanyCode, setNextCompanyCode] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
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
    <div className={`min-h-screen ${isGlassTheme ? 'bg-[#0f172a] text-white' : 'bg-gray-100 text-gray-900'} relative transition-all duration-500`}>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed top-0 right-0 h-full w-72 glass-card z-50 transform transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl rounded-l-[2rem]`}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{settings.programName}</h2>
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

      <header className="glass sticky top-0 z-30 shadow-xl px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><Menu size={28} /></button>
          <div className="hidden sm:block">
            <h1 className="font-black text-xl">{settings.programName}</h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">مرحباً {currentUser?.username}</p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-xl font-black font-mono">
            {dateTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            {dateTime.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setIsGlassTheme(!isGlassTheme)} className="p-2 text-[10px] font-black glass rounded-lg hover:bg-white/10">THEME</button>
          <button className="p-2 hover:bg-white/10 rounded-xl relative"><Bell size={20} /><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span></button>
          <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-400/20 rounded-xl"><LogOut size={20} /></button>
        </div>
      </header>

      <main className="p-6 md:p-10 max-w-[1600px] mx-auto animate-fade-in">
        {renderView()}
      </main>

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
    <span className="font-bold text-sm tracking-wide">{label}</span>
    {active && <ChevronRight size={16} className="mr-auto opacity-50" />}
  </button>
);

const LoginScreen: React.FC<{ onLogin: (u: string, p: string) => void, programName: string }> = ({ onLogin, programName }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#020617] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full"></div>

      <div className="glass-card p-12 rounded-[3rem] w-full max-w-md mx-4 animate-fade-in border border-white/10 text-center relative z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 mb-8 shadow-2xl">
          <ShieldCheck size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">{programName}</h1>
        <p className="text-gray-400 text-sm font-medium mb-10">برجاء إدخال بيانات الدخول</p>
        
        <form onSubmit={(e) => { e.preventDefault(); onLogin(username, password); }} className="space-y-4 text-right">
          <input type="text" placeholder="اسم المستخدم" className="w-full px-6 py-5 rounded-2xl iphone-input outline-none text-lg" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="password" placeholder="كلمة المرور" className="w-full px-6 py-5 rounded-2xl iphone-input outline-none text-lg" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xl hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all active:scale-[0.98] mt-4">
            دخول النظام
          </button>
        </form>
      </div>
    </div>
  );
};

// Views 
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
    } else { alert('المنتج غير موجود'); }
  };

  const total = items.reduce((acc, item) => acc + item.total, 0);
  const change = received > 0 ? received - total : 0;

  const handleSave = () => {
    if (items.length === 0) return;
    onSaveSale({ id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString(), items, totalValue: total, received, change });
    setItems([]); setReceived(0); alert('تم تسجيل المبيعة بنجاح');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-3"><ShoppingCart className="text-blue-400"/> البيع المباشر</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input type="text" placeholder="كود الصنف أو الباركود" className="flex-1 px-6 py-4 rounded-2xl iphone-input outline-none text-lg" value={currentCode} onChange={(e) => setCurrentCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addItem()} />
            <div className="flex gap-4">
              <input type="number" placeholder="الكمية" className="w-24 px-6 py-4 rounded-2xl iphone-input outline-none text-lg text-center" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
              <button onClick={addItem} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-95 transition-all">إضافة</button>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
             <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs">سلة المشتريات</h3>
             <button onClick={() => setItems([])} className="text-xs text-red-400 font-bold hover:underline">مسح الكل</button>
          </div>
          <div className="overflow-x-auto p-4 max-h-[500px] overflow-y-auto">
            <table className="w-full text-right">
              <thead><tr className="text-gray-500 text-sm"><th className="p-4">الصنف</th><th className="p-4">السعر</th><th className="p-4">الكمية</th><th className="p-4">الإجمالي</th><th className="p-4 text-center">حذف</th></tr></thead>
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
            {items.length === 0 && <div className="p-20 text-center text-gray-500 font-medium">الفاتورة فارغة حالياً</div>}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="glass-card p-10 rounded-[3rem] space-y-8 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border-blue-500/20">
          <div className="text-center">
             <p className="text-xs font-black text-blue-400 mb-2 uppercase tracking-widest">المطلوب سداده</p>
             <h3 className="text-6xl font-black tracking-tighter">{total.toFixed(2)} <span className="text-xl">ج.م</span></h3>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">المبلغ المدفوع</label>
              <input type="number" className="w-full px-8 py-5 rounded-3xl bg-white/5 border border-white/10 text-white text-3xl font-black text-center outline-none focus:border-blue-500" placeholder="0.00" value={received || ''} onChange={(e) => setReceived(Number(e.target.value))} />
            </div>
            <div className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/5">
              <span className="text-sm font-bold text-gray-400">الباقي للعميل:</span>
              <span className="text-3xl font-black text-green-400">{change.toFixed(2)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => window.print()} className="py-5 glass hover:bg-white/20 rounded-2xl font-black flex items-center justify-center gap-2"><Printer size={22}/> طباعة</button>
            <button onClick={handleSave} className="py-5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl active:scale-95 transition-all">حفظ (F12)</button>
          </div>
        </div>
      </div>
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
    } else alert('الصنف غير مسجل لهذه الشركة');
  };

  const total = items.reduce((a, b) => a + b.total, 0);

  const finalize = () => {
    if (!selectedComp || items.length === 0) return;
    onSave({ id: nextId, companyId: selectedComp.id, companyName: selectedComp.name, date: new Date().toLocaleDateString(), items, totalValue: total, status: 'لم يتم التسليم', payments: [], paidAmount: 0, remaining: total });
    setSelectedComp(null); setItems([]); alert('تم ترحيل الفاتورة');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {!selectedComp ? (
        <div className="glass-card p-10 rounded-[3rem] text-center space-y-8">
           <div className="inline-flex p-5 rounded-3xl bg-blue-500/20 text-blue-400"><Send size={40}/></div>
           <h2 className="text-3xl font-black">إنشاء فاتورة مشتريات</h2>
           <div className="relative max-w-md mx-auto">
             <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
             <input type="text" placeholder="ابحث عن شركة..." className="w-full pr-12 pl-6 py-4 rounded-2xl iphone-input outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto p-2">
             {companies.filter(c => c.name.includes(search)).map(c => (
               <button key={c.id} onClick={() => setSelectedComp(c)} className="p-5 glass hover:bg-blue-600/20 rounded-2xl text-right font-bold transition-all border border-white/5">
                 {c.name} <span className="block text-[10px] text-gray-500 font-normal">كود: {c.code}</span>
               </button>
             ))}
           </div>
        </div>
      ) : (
        <div className="glass-card p-10 rounded-[3rem] animate-fade-in space-y-8">
          <div className="flex justify-between items-center border-b border-white/5 pb-6">
            <h3 className="text-2xl font-black">فاتورة: {selectedComp.name} <span className="text-blue-400 ml-2">#{nextId}</span></h3>
            <button onClick={() => setSelectedComp(null)} className="text-gray-500 hover:text-white"><X size={24}/></button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
            <input type="text" placeholder="كود الصنف" className="flex-1 px-5 py-3 rounded-xl iphone-input outline-none" value={prodCode} onChange={(e) => setProdCode(e.target.value)} />
            <input type="number" placeholder="الكمية" className="w-24 px-5 py-3 rounded-xl iphone-input outline-none text-center" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
            <button onClick={addProd} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">إضافة</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead><tr className="text-gray-500 text-xs border-b border-white/5"><th className="p-4">الصنف</th><th className="p-4">السعر</th><th className="p-4">الكمية</th><th className="p-4">الإجمالي</th></tr></thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold">{it.name}</td><td className="p-4">{it.price}</td><td className="p-4">{it.quantity}</td><td className="p-4 font-black">{it.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center p-6 bg-blue-600/20 rounded-3xl border border-blue-500/20">
             <span className="font-bold text-gray-300">إجمالي قيمة الفاتورة:</span>
             <span className="text-3xl font-black">{total.toFixed(2)} ج.م</span>
          </div>
          <button onClick={finalize} className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-xl shadow-xl shadow-green-600/20 transition-all active:scale-95">حفظ وترحيل الطلبية</button>
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
        <h2 className="text-2xl font-black flex items-center gap-3"><List className="text-blue-400"/> الأوردارات</h2>
        <div className="relative w-full max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
          <input type="text" placeholder="بحث برقم الفاتورة أو الشركة..." className="w-full pr-12 pl-6 py-3 rounded-2xl iphone-input outline-none text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(inv => (
          <div key={inv.id} onClick={() => setSelected(inv)} className="glass-card p-6 rounded-[2rem] cursor-pointer hover:border-blue-500/40 transition-all active:scale-[0.98]">
            <div className="flex justify-between mb-4">
               <span className="text-xs font-black text-blue-400">#{inv.id}</span>
               <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${inv.status === 'تم التسليم' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{inv.status}</span>
            </div>
            <h3 className="text-lg font-bold mb-1">{inv.companyName}</h3>
            <p className="text-[10px] text-gray-500 mb-6">{inv.date}</p>
            <div className="flex justify-between items-center border-t border-white/5 pt-4">
              <span className="font-black text-xl">{inv.totalValue.toFixed(2)} <span className="text-[10px]">ج.م</span></span>
              <button className="text-[10px] font-black hover:text-blue-400 transition-colors">عرض التفاصيل</button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelected(null)} />
          <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-10 relative z-10 border-white/10">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black">تفاصيل الفاتورة #{selected.id}</h2>
              <button onClick={() => setSelected(null)}><X size={32} className="text-gray-500 hover:text-white"/></button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">الحالة</p>
                <button onClick={() => updateStatus(selected.id, selected.status === 'تم التسليم' ? 'لم يتم التسليم' : 'تم التسليم')} className={`text-sm font-black w-full py-2 rounded-xl ${selected.status === 'تم التسليم' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                  {selected.status}
                </button>
              </div>
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">القيمة الإجمالية</p>
                <p className="text-2xl font-black">{selected.totalValue.toFixed(2)}</p>
              </div>
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">المدفوع</p>
                <p className="text-2xl font-black text-green-400">{selected.paidAmount.toFixed(2)}</p>
              </div>
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-red-400">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">المتبقي</p>
                <p className="text-2xl font-black">{selected.remaining.toFixed(2)}</p>
              </div>
            </div>
            <div className="space-y-4 mb-10">
               <h4 className="font-black text-sm uppercase tracking-widest text-gray-500 border-b border-white/5 pb-2">سجل الأصناف</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {selected.items.map((it, idx) => (
                   <div key={idx} className="flex justify-between items-center bg-white/3 p-4 rounded-2xl border border-white/5">
                     <div><p className="font-bold">{it.name}</p><p className="text-[10px] text-gray-500">الكمية: {it.quantity} | السعر: {it.price}</p></div>
                     <span className="font-black text-blue-400">{it.total} ج.م</span>
                   </div>
                 ))}
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button className="py-5 glass hover:bg-white/10 rounded-2xl font-black flex items-center justify-center gap-2"><Printer size={22}/> طباعة</button>
               <button className="py-5 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-500/20"><FileSpreadsheet size={22}/> تصدير EXCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PriceListsView: React.FC<{ companies: Company[], setCompanies: React.Dispatch<React.SetStateAction<Company[]>>, nextCode: number, setNextCode: React.Dispatch<React.SetStateAction<number>> }> = ({ companies, setCompanies, nextCode, setNextCode }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [prods, setProds] = useState<{code:string, name:string, price:number}[]>([]);

  const save = () => {
    if (!name) return;
    const nC: Company = { id: Math.random().toString(), name, code: nextCode.toString(), products: prods.map(p => ({ code: p.code, name: p.name, priceBeforeTax: p.price, priceAfterTax: p.price * 1.14, stock: 0 })) };
    setCompanies([...companies, nC]); setNextCode(prev => prev + 1); setShowAdd(false); setName(''); setProds([]);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black">قوائم الموردين</h2>
        <button onClick={() => setShowAdd(true)} className="px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black flex items-center gap-2 shadow-xl shadow-blue-500/20 hover:scale-105 transition-all"><Plus size={24}/> إضافة شركة</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(c => (
          <div key={c.id} className="glass-card p-8 rounded-[2.5rem] space-y-4">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-bold">{c.name}</h3>
               <span className="text-[10px] bg-white/5 px-3 py-1 rounded-full text-gray-400">#{c.code}</span>
            </div>
            <p className="text-xs text-gray-500">{c.products.length} صنف مسجل</p>
            <div className="pt-4 border-t border-white/5 flex gap-2">
               <button className="flex-1 py-3 glass rounded-xl text-[10px] font-black hover:bg-white/10">عرض القائمة</button>
               <button className="p-3 bg-red-500/10 text-red-400 rounded-xl"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>
      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="absolute inset-0 bg-black/70" onClick={() => setShowAdd(false)} />
           <div className="glass-card w-full max-w-2xl rounded-[3rem] p-10 relative z-10 space-y-8">
             <h3 className="text-2xl font-black">تسجيل شركة جديدة</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="اسم الشركة" className="w-full px-6 py-4 rounded-2xl iphone-input outline-none" value={name} onChange={(e) => setName(e.target.value)} />
                <input type="text" readOnly className="w-full px-6 py-4 rounded-2xl glass outline-none text-gray-500" value={`كود تلقائي: ${nextCode}`} />
             </div>
             <button onClick={() => setProds([...prods, {code:'', name:'', price: 0}])} className="w-full py-4 glass rounded-2xl font-black text-blue-400 flex justify-center items-center gap-2"><Plus size={20}/> إضافة صنف للقائمة</button>
             <div className="max-h-[300px] overflow-y-auto space-y-2">
                {prods.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" placeholder="كود" className="w-20 px-4 py-2 rounded-xl iphone-input outline-none text-xs" onChange={(e) => { const n = [...prods]; n[i].code = e.target.value; setProds(n); }} />
                    <input type="text" placeholder="اسم الصنف" className="flex-1 px-4 py-2 rounded-xl iphone-input outline-none text-xs" onChange={(e) => { const n = [...prods]; n[i].name = e.target.value; setProds(n); }} />
                    <input type="number" placeholder="سعر" className="w-20 px-4 py-2 rounded-xl iphone-input outline-none text-xs" onChange={(e) => { const n = [...prods]; n[i].price = Number(e.target.value); setProds(n); }} />
                  </div>
                ))}
             </div>
             <button onClick={save} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all">حفظ البيانات</button>
           </div>
        </div>
      )}
    </div>
  );
};

// Simplified views for the rest to avoid massive code block, maintaining logic
const StockView: React.FC<{ companies: Company[], invoices: Invoice[] }> = ({ companies }) => (
  <div className="glass-card p-10 rounded-[3rem] space-y-10">
    <div className="flex justify-between items-center"><h2 className="text-3xl font-black">المخزون والكميات</h2><Package size={40} className="text-blue-500"/></div>
    <div className="overflow-x-auto">
      <table className="w-full text-right">
        <thead><tr className="text-gray-500 text-xs border-b border-white/5"><th className="p-4">الصنف</th><th className="p-4">الشركة</th><th className="p-4">المخزون</th><th className="p-4">السعر</th></tr></thead>
        <tbody>
          {companies.flatMap(c => c.products.map(p => ({ ...p, cName: c.name }))).map((p, i) => (
            <tr key={i} className="border-b border-white/5 group hover:bg-white/5 transition-colors">
              <td className="p-4 font-bold">{p.name}</td><td className="p-4 text-xs">{p.cName}</td>
              <td className="p-4"><span className={`px-3 py-1 rounded-full text-[10px] font-bold ${p.stock > 10 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{p.stock}</span></td>
              <td className="p-4 font-black text-blue-400">{p.priceAfterTax.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SalesHistoryView: React.FC<{ sales: Sale[], companies: Company[] }> = ({ sales }) => (
  <div className="space-y-8">
    <h2 className="text-3xl font-black">سجل المبيعات اليومية</h2>
    {sales.length === 0 ? <div className="glass-card p-20 text-center text-gray-500 rounded-[3rem]">لا توجد مبيعات مسجلة لهذا اليوم</div> : 
      sales.map(s => (
        <div key={s.id} className="glass-card p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 animate-fade-in">
           <div><p className="text-blue-400 font-black mb-1 text-sm tracking-widest">#{s.id}</p><p className="text-[10px] text-gray-500">{new Date(s.date).toLocaleString('ar-EG')}</p></div>
           <div className="flex-1 flex gap-2 overflow-x-auto">
             {s.items.map((it, i) => <span key={i} className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold border border-white/5 whitespace-nowrap">{it.name} x{it.quantity}</span>)}
           </div>
           <div className="text-center md:text-left"><p className="text-[10px] text-gray-500 uppercase font-black mb-1">الإجمالي</p><p className="text-3xl font-black">{s.totalValue.toFixed(2)} ج.م</p></div>
        </div>
      ))
    }
  </div>
);

const SettingsView: React.FC<{ settings: AppSettings, setSettings: React.Dispatch<React.SetStateAction<AppSettings>>, users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>> }> = ({ settings, setSettings, users, setUsers }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
    <div className="glass-card p-10 rounded-[3rem] space-y-10">
      <h3 className="text-2xl font-black flex items-center gap-3"><SettingsIcon className="text-blue-400"/> إعدادات النظام</h3>
      <div className="space-y-6">
        <div><label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">اسم البرنامج</label><input type="text" className="w-full px-6 py-4 rounded-2xl iphone-input outline-none" value={settings.programName} onChange={e => setSettings({...settings, programName: e.target.value})} /></div>
        <div><label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">نسبة الربح %</label><input type="number" className="w-full px-6 py-4 rounded-2xl iphone-input outline-none" value={settings.profitMargin} onChange={e => setSettings({...settings, profitMargin: Number(e.target.value)})} /></div>
      </div>
    </div>
    <div className="glass-card p-10 rounded-[3rem] space-y-10">
       <h3 className="text-2xl font-black flex items-center gap-3"><UsersIcon className="text-blue-400"/> إدارة الموظفين</h3>
       <div className="space-y-4">
          {users.map(u => (
            <div key={u.id} className="p-5 glass rounded-2xl flex justify-between items-center border border-white/5">
              <div><p className="font-bold">{u.username}</p><p className="text-[10px] text-blue-400">{u.role}</p></div>
              <div className="flex gap-2">
                <button className="p-2 glass text-blue-400 rounded-xl"><ShieldCheck size={18}/></button>
                <button className="p-2 glass text-red-400 rounded-xl" onClick={() => u.username !== 'admin' && setUsers(users.filter(x => x.id !== u.id))}><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
          <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/5 transition-all">إضافة حساب جديد</button>
       </div>
    </div>
  </div>
);

const WelcomeToast: React.FC<{ username: string }> = ({ username }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (username) { setVisible(true); const timer = setTimeout(() => setVisible(false), 4000); return () => clearTimeout(timer); }
  }, [username]);
  if (!visible) return null;
  return (
    <div className="fixed bottom-12 left-12 glass px-8 py-5 rounded-[2rem] shadow-2xl z-[100] border border-blue-500/30 flex items-center gap-4 animate-fade-in">
      <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg"><ShieldCheck className="text-white" /></div>
      <div><h4 className="font-black text-white">مرحباً {username}!</h4><p className="text-xs text-blue-400">النظام جاهز للاستخدام أونلاين</p></div>
    </div>
  );
};

export default App;
