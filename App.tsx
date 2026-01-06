
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Menu, X, Bell, LogOut, Search, Plus, 
  Trash2, Printer, FileSpreadsheet, Settings as SettingsIcon,
  Package, ShoppingCart, List, Send, Users as UsersIcon, ChevronRight
} from 'lucide-react';
// Added InvoiceItem to the import list to fix the undefined type errors
import { User, Company, Invoice, Sale, AppSettings, Product, Role, InvoiceItem } from './types';

// Mock Initial State
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

  // Data State
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'admin', password: 'admin', role: 'مدير', phone: '0100000000', address: 'Cairo', startDate: new Date().toLocaleDateString(), permissions: ['pos', 'createInvoice', 'orders', 'priceLists', 'stock', 'sales'] }
  ]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [nextInvoiceId, setNextInvoiceId] = useState(1000);
  const [nextCompanyCode, setNextCompanyCode] = useState(10);

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Login Handler
  const handleLogin = (u: string, p: string) => {
    const user = users.find(usr => usr.username === u && usr.password === p);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      // Optional welcome message
    } else {
      alert('خطأ في اسم المستخدم أو كلمة المرور');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen ${isGlassTheme ? 'text-gray-800' : 'bg-gray-100 text-gray-900'} relative`}>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-64 glass z-50 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-bold text-blue-600">{settings.programName}</h2>
            <X className="cursor-pointer hover:text-red-500" onClick={() => setIsSidebarOpen(false)} />
          </div>
          <nav className="space-y-4">
            <NavItem 
              icon={<ShoppingCart size={20}/>} 
              label={settings.sideMenuNames['pos']} 
              active={currentView === 'pos'}
              onClick={() => { setCurrentView('pos'); setIsSidebarOpen(false); }}
            />
            <NavItem 
              icon={<Send size={20}/>} 
              label={settings.sideMenuNames['createInvoice']} 
              active={currentView === 'createInvoice'}
              onClick={() => { setCurrentView('createInvoice'); setIsSidebarOpen(false); }}
            />
            <NavItem 
              icon={<List size={20}/>} 
              label={settings.sideMenuNames['orders']} 
              active={currentView === 'orders'}
              onClick={() => { setCurrentView('orders'); setIsSidebarOpen(false); }}
            />
            <NavItem 
              icon={<Package size={20}/>} 
              label={settings.sideMenuNames['priceLists']} 
              active={currentView === 'priceLists'}
              onClick={() => { setCurrentView('priceLists'); setIsSidebarOpen(false); }}
            />
            <NavItem 
              icon={<Package size={20}/>} 
              label={settings.sideMenuNames['stock']} 
              active={currentView === 'stock'}
              onClick={() => { setCurrentView('stock'); setIsSidebarOpen(false); }}
            />
            <NavItem 
              icon={<UsersIcon size={20}/>} 
              label={settings.sideMenuNames['sales']} 
              active={currentView === 'sales'}
              onClick={() => { setCurrentView('sales'); setIsSidebarOpen(false); }}
            />
            {currentUser?.role === 'مدير' && (
              <NavItem 
                icon={<SettingsIcon size={20}/>} 
                label={settings.sideMenuNames['settings']} 
                active={currentView === 'settings'}
                onClick={() => { setCurrentView('settings'); setIsSidebarOpen(false); }}
              />
            )}
          </nav>
        </div>
      </aside>

      {/* Header */}
      <header className="glass sticky top-0 z-30 shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/30 rounded-full transition-colors">
            <Menu size={24} />
          </button>
          <div>
            <span className="font-bold text-lg text-blue-700">{settings.programName}</span>
            <span className="mr-3 text-sm font-medium text-gray-500 bg-white/50 px-2 py-0.5 rounded-full">{currentUser?.username}</span>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center">
          <div className="text-lg font-bold">
            {dateTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </div>
          <div className="text-xs text-gray-600">
            {dateTime.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsGlassTheme(!isGlassTheme)} 
            className="p-2 hover:bg-white/30 rounded-full text-xs font-bold"
          >
            استايل
          </button>
          <button className="p-2 hover:bg-white/30 rounded-full">
            <Bell size={20} />
          </button>
          <button onClick={handleLogout} className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {currentView === 'pos' && (
          <POSView 
            settings={settings} 
            companies={companies} 
            onSaveSale={(sale) => setSales(prev => [...prev, sale])}
          />
        )}
        {currentView === 'createInvoice' && (
          <CreateInvoiceView 
            companies={companies} 
            nextId={nextInvoiceId} 
            onSave={(inv) => {
              setInvoices(prev => [...prev, inv]);
              setNextInvoiceId(prev => prev + 1);
            }}
          />
        )}
        {currentView === 'orders' && (
          <OrdersView 
            invoices={invoices} 
            setInvoices={setInvoices} 
            settings={settings}
          />
        )}
        {currentView === 'priceLists' && (
          <PriceListsView 
            companies={companies} 
            setCompanies={setCompanies} 
            nextCode={nextCompanyCode} 
            setNextCode={setNextCompanyCode}
          />
        )}
        {currentView === 'stock' && (
          <StockView companies={companies} invoices={invoices} />
        )}
        {currentView === 'sales' && (
          <SalesHistoryView sales={sales} companies={companies} />
        )}
        {currentView === 'settings' && (
          <SettingsView 
            settings={settings} 
            setSettings={setSettings} 
            users={users} 
            setUsers={setUsers}
          />
        )}
      </main>

      {/* Login Welcome Toast */}
      <WelcomeToast username={currentUser?.username || ''} />
    </div>
  );
};

// --- Sub-Components ---

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'hover:bg-white/40'}`}
  >
    {icon}
    <span className="font-medium">{label}</span>
    {active && <ChevronRight size={16} className="mr-auto" />}
  </button>
);

const LoginScreen: React.FC<{ onLogin: (u: string, p: string) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex items-center justify-center min-h-screen bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover">
      <div className="glass p-10 rounded-[2rem] shadow-2xl w-full max-w-md mx-4 animate-fade-in border border-white/40">
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-3xl bg-blue-600 mb-4 shadow-xl shadow-blue-300">
            <Package size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Market Pro</h1>
          <p className="text-gray-600 mt-2">مرحباً بك في نظام الإدارة</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(username, password); }}>
          <div className="space-y-6">
            <div>
              <input 
                type="text" 
                placeholder="اسم المستخدم"
                className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/20 outline-none iphone-input text-lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="كلمة المرور"
                className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/20 outline-none iphone-input text-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 transform active:scale-95">
              تسجيل الدخول
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const WelcomeToast: React.FC<{ username: string }> = ({ username }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (username) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [username]);

  if (!visible) return null;
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-2xl shadow-xl z-[60] animate-bounce">
      <span className="font-bold text-blue-700">مرحباً {username}!</span>
    </div>
  );
};

// --- POS View ---
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
      const newItem: InvoiceItem = {
        code: prod.code,
        name: prod.name,
        price: salePrice,
        quantity: quantity,
        total: salePrice * quantity
      };
      setItems(prev => [...prev, newItem]);
      setCurrentCode('');
      setQuantity(1);
    } else {
      alert('المنتج غير موجود');
    }
  };

  const total = items.reduce((acc, item) => acc + item.total, 0);
  const change = received > 0 ? received - total : 0;

  const handleSave = () => {
    if (items.length === 0) return;
    onSaveSale({
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      items,
      totalValue: total,
      received,
      change
    });
    setItems([]);
    setReceived(0);
    alert('تم حفظ البيع بنجاح');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass p-6 rounded-3xl space-y-4">
          <h2 className="text-xl font-bold">نقطة البيع</h2>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="كود الصنف" 
              className="flex-1 px-4 py-3 rounded-xl bg-white/50 border outline-none iphone-input"
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
            />
            <input 
              type="number" 
              placeholder="الكمية" 
              className="w-24 px-4 py-3 rounded-xl bg-white/50 border outline-none iphone-input"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
            <button onClick={addItem} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">إضافة</button>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl overflow-hidden overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b">
                <th className="py-2">كود</th>
                <th className="py-2">الاسم</th>
                <th className="py-2">السعر</th>
                <th className="py-2">الكمية</th>
                <th className="py-2">الإجمالي</th>
                <th className="py-2">حذف</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-3">{item.code}</td>
                  <td className="py-3">{item.name}</td>
                  <td className="py-3">{item.price.toFixed(2)}</td>
                  <td className="py-3">{item.quantity}</td>
                  <td className="py-3 font-bold">{(item.total).toFixed(2)}</td>
                  <td className="py-3">
                    <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-red-500"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass p-6 rounded-3xl space-y-6 bg-blue-600 text-white">
          <div>
            <p className="text-sm opacity-80">إجمالي الفاتورة</p>
            <h3 className="text-5xl font-black">{total.toFixed(2)} <span className="text-xl">ج.م</span></h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm mb-1">المبلغ المستلم من العميل</p>
              <input 
                type="number" 
                className="w-full px-4 py-3 rounded-xl bg-white/20 border-white/30 text-white placeholder-white/50 outline-none text-2xl font-bold"
                placeholder="0.00"
                value={received}
                onChange={(e) => setReceived(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-between items-center bg-white/10 p-4 rounded-xl">
              <span>المتبقي للعميل:</span>
              <span className="text-2xl font-bold">{change.toFixed(2)} ج.م</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="flex-1 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold flex items-center justify-center gap-2"><Printer size={20}/> طباعة</button>
            <button onClick={handleSave} className="flex-1 py-3 bg-white text-blue-600 rounded-xl font-bold">حفظ</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Create Invoice View ---
const CreateInvoiceView: React.FC<{ companies: Company[], nextId: number, onSave: (inv: Invoice) => void }> = ({ companies, nextId, onSave }) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [productCode, setProductCode] = useState('');
  const [qty, setQty] = useState(1);

  const filteredCompanies = companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const addProductToInvoice = () => {
    if (!selectedCompany) return;
    const prod = selectedCompany.products.find(p => p.code === productCode);
    if (prod) {
      setInvoiceItems([...invoiceItems, {
        code: prod.code,
        name: prod.name,
        price: prod.priceAfterTax,
        quantity: qty,
        total: prod.priceAfterTax * qty
      }]);
      setProductCode('');
      setQty(1);
    } else {
      alert('المنتج غير موجود في قائمة أسعار هذه الشركة');
    }
  };

  const totalValue = invoiceItems.reduce((acc, item) => acc + item.total, 0);

  const handleFinalSave = () => {
    if (!selectedCompany || invoiceItems.length === 0) return;
    const newInvoice: Invoice = {
      id: nextId,
      companyId: selectedCompany.id,
      companyName: selectedCompany.name,
      date: new Date().toLocaleDateString(),
      items: invoiceItems,
      totalValue: totalValue,
      status: 'لم يتم التسليم',
      payments: [],
      paidAmount: 0,
      remaining: totalValue
    };
    onSave(newInvoice);
    setShowModal(false);
    setInvoiceItems([]);
    setSelectedCompany(null);
  };

  return (
    <div className="space-y-6">
      <div className="glass p-8 rounded-3xl max-w-2xl mx-auto text-center space-y-6">
        <h2 className="text-2xl font-bold">إنشاء فاتورة مشتريات جديدة</h2>
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
          <input 
            type="text" 
            placeholder="بحث عن اسم الشركة..." 
            className="w-full pr-12 pl-4 py-4 rounded-2xl bg-white/50 border outline-none iphone-input text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="max-h-64 overflow-y-auto space-y-2 border rounded-2xl p-2 bg-white/20">
          {filteredCompanies.map(c => (
            <button 
              key={c.id} 
              onClick={() => setSelectedCompany(c)}
              className={`w-full p-4 text-right rounded-xl transition-all ${selectedCompany?.id === c.id ? 'bg-blue-600 text-white' : 'hover:bg-white/40'}`}
            >
              {c.name} ({c.code})
            </button>
          ))}
        </div>

        <button 
          onClick={() => selectedCompany && setShowModal(true)}
          disabled={!selectedCompany}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg disabled:opacity-50 shadow-lg shadow-blue-200"
        >
          إنشاء
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="glass w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8 relative shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-600">تفاصيل الفاتورة #{nextId}</h2>
              <X className="cursor-pointer" onClick={() => setShowModal(false)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/40 p-4 rounded-2xl">
                <p className="text-gray-500 text-sm">اسم الشركة</p>
                <p className="font-bold text-lg">{selectedCompany?.name}</p>
              </div>
              <div className="bg-white/40 p-4 rounded-2xl">
                <p className="text-gray-500 text-sm">كود الشركة</p>
                <p className="font-bold text-lg">{selectedCompany?.code}</p>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <input 
                type="text" 
                placeholder="كود الصنف" 
                className="flex-1 px-4 py-3 rounded-xl border outline-none iphone-input bg-white"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
              />
              <input 
                type="number" 
                placeholder="الكمية" 
                className="w-24 px-4 py-3 rounded-xl border outline-none iphone-input bg-white"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
              <button onClick={addProductToInvoice} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">إضافة</button>
            </div>

            <table className="w-full mb-6">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-right">كود</th>
                  <th className="py-2 text-right">اسم الصنف</th>
                  <th className="py-2 text-right">السعر</th>
                  <th className="py-2 text-right">الكمية</th>
                  <th className="py-2 text-right">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{item.code}</td>
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">{item.price}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2 font-bold">{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center bg-blue-50 p-6 rounded-2xl mb-8">
              <span className="text-xl font-bold">إجمالي قيمة الفاتورة:</span>
              <span className="text-3xl font-black text-blue-700">{totalValue.toFixed(2)} ج.م</span>
            </div>

            <button onClick={handleFinalSave} className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-xl shadow-lg shadow-green-200">حفظ وترحيل</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Orders View ---
const OrdersView: React.FC<{ invoices: Invoice[], setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>, settings: AppSettings }> = ({ invoices, setInvoices, settings }) => {
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filtered = invoices.filter(inv => 
    inv.companyName.includes(search) || 
    inv.id.toString().includes(search) ||
    inv.items.some(it => it.name.includes(search))
  );

  const handleUpdateStatus = (id: number, status: 'تم التسليم' | 'لم يتم التسليم') => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
    if (selectedInvoice?.id === id) setSelectedInvoice(prev => prev ? { ...prev, status } : null);
  };

  const handleAddPayment = (id: number, amount: number) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        const newPayments = [...inv.payments, amount].slice(0, 3);
        const paid = newPayments.reduce((a, b) => a + b, 0);
        return { ...inv, payments: newPayments, paidAmount: paid, remaining: inv.totalValue - paid };
      }
      return inv;
    }));
    if (selectedInvoice?.id === id) {
      setSelectedInvoice(prev => {
        if (!prev) return null;
        const newPayments = [...prev.payments, amount].slice(0, 3);
        const paid = newPayments.reduce((a, b) => a + b, 0);
        return { ...prev, payments: newPayments, paidAmount: paid, remaining: prev.totalValue - paid };
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass p-6 rounded-3xl mb-8 flex flex-col md:flex-row gap-4 items-center">
        <h2 className="text-2xl font-bold text-blue-700 ml-4">الأوردارات المرحلة</h2>
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
          <input 
            type="text" 
            placeholder="بحث (اسم شركة، كود، رقم فاتورة، صنف)..." 
            className="w-full pr-12 pl-4 py-3 rounded-xl border outline-none iphone-input bg-white/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(inv => (
          <div 
            key={inv.id} 
            className="glass p-6 rounded-3xl cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => setSelectedInvoice(inv)}
          >
            <div className="flex justify-between mb-4">
              <span className="font-bold text-blue-600">#{inv.id}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${inv.status === 'تم التسليم' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {inv.status}
              </span>
            </div>
            <h3 className="text-lg font-bold mb-1">{inv.companyName}</h3>
            <p className="text-gray-500 text-sm mb-4">التاريخ: {inv.date}</p>
            <div className="flex justify-between items-center border-t pt-4">
              <span className="font-bold text-xl">{inv.totalValue.toFixed(2)} ج.م</span>
              <button className="text-blue-600 text-sm font-bold">عرض التفاصيل</button>
            </div>
          </div>
        ))}
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSelectedInvoice(null)} />
          <div className="glass w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8 relative shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">فاتورة #{selectedInvoice.id} - {selectedInvoice.companyName}</h2>
              <X className="cursor-pointer" onClick={() => setSelectedInvoice(null)} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/40 p-4 rounded-2xl">
                <p className="text-sm text-gray-500">حالة الطلب</p>
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => handleUpdateStatus(selectedInvoice.id, 'تم التسليم')}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${selectedInvoice.status === 'تم التسليم' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
                  >تم التسليم</button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedInvoice.id, 'لم يتم التسليم')}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${selectedInvoice.status === 'لم يتم التسليم' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  >لم يتم</button>
                </div>
              </div>
              <div className="bg-white/40 p-4 rounded-2xl">
                <p className="text-sm text-gray-500">إجمالي القيمة</p>
                <p className="text-lg font-bold">{selectedInvoice.totalValue.toFixed(2)}</p>
              </div>
              <div className="bg-white/40 p-4 rounded-2xl">
                <p className="text-sm text-gray-500">المدفوع</p>
                <p className="text-lg font-bold text-green-600">{selectedInvoice.paidAmount.toFixed(2)}</p>
              </div>
              <div className="bg-white/40 p-4 rounded-2xl">
                <p className="text-sm text-gray-500">المتبقي</p>
                <p className="text-lg font-bold text-red-600">{selectedInvoice.remaining.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <p className="font-bold">سجل الدفعات (بحد أقصى 3)</p>
              <div className="flex gap-4">
                {selectedInvoice.payments.length < 3 && (
                  <div className="flex-1 flex gap-2">
                    <input id="pay-amount" type="number" placeholder="قيمة الدفعة" className="flex-1 px-4 py-2 border rounded-xl outline-none" />
                    <button 
                      onClick={() => {
                        const el = document.getElementById('pay-amount') as HTMLInputElement;
                        if (el.value) handleAddPayment(selectedInvoice.id, Number(el.value));
                        el.value = '';
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold"
                    >إضافة دفعة</button>
                  </div>
                )}
                {selectedInvoice.payments.map((p, i) => (
                  <div key={i} className="bg-green-100 text-green-800 px-4 py-2 rounded-xl border border-green-200">
                    <p className="text-xs">دفعة {i+1}</p>
                    <p className="font-bold">{p.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8 overflow-x-auto">
               <table className="w-full text-right">
                <thead>
                  <tr className="border-b">
                    <th className="py-2">كود</th>
                    <th className="py-2">الاسم</th>
                    <th className="py-2">الكمية</th>
                    <th className="py-2">السعر</th>
                    <th className="py-2">المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((it, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2">{it.code}</td>
                      <td className="py-2">{it.name}</td>
                      <td className="py-2">{it.quantity}</td>
                      <td className="py-2">{it.price}</td>
                      <td className="py-2 font-bold">{it.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 py-4 bg-gray-800 text-white rounded-2xl flex items-center justify-center gap-2 font-bold"><Printer size={20}/> طباعة</button>
              <button className="flex-1 py-4 bg-green-700 text-white rounded-2xl flex items-center justify-center gap-2 font-bold"><FileSpreadsheet size={20}/> تصدير إكسيل</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Price Lists View ---
const PriceListsView: React.FC<{ companies: Company[], setCompanies: React.Dispatch<React.SetStateAction<Company[]>>, nextCode: number, setNextCode: React.Dispatch<React.SetStateAction<number>> }> = ({ companies, setCompanies, nextCode, setNextCode }) => {
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [compName, setCompName] = useState('');
  const [tempProducts, setTempProducts] = useState<{code:string, name:string, preTax:number, postTax:number}[]>([]);
  const [search, setSearch] = useState('');

  const addNewProductRow = () => {
    if (tempProducts.length >= 500) return;
    setTempProducts([...tempProducts, { code: '', name: '', preTax: 0, postTax: 0 }]);
  };

  const handleSaveCompany = () => {
    if (!compName) return;
    const newCompany: Company = {
      id: Math.random().toString(),
      name: compName,
      code: nextCode.toString(),
      products: tempProducts.map(p => ({
        code: p.code,
        name: p.name,
        priceBeforeTax: p.preTax,
        priceAfterTax: p.postTax,
        stock: 0
      }))
    };
    setCompanies([...companies, newCompany]);
    setNextCode(prev => prev + 1);
    setShowAddCompany(false);
    setCompName('');
    setTempProducts([]);
  };

  const filtered = companies.filter(c => c.name.includes(search) || c.code.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-700">قوائم أسعار الشركات</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
            <input 
              type="text" 
              placeholder="بحث عن قائمة..." 
              className="w-full pr-10 pl-4 py-2 rounded-xl border outline-none iphone-input bg-white/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={() => setShowAddCompany(true)} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200">
            <Plus size={20}/> أضف شركة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => (
          <div key={c.id} className="glass p-6 rounded-3xl group">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-bold text-gray-800">{c.name}</h3>
               <span className="text-xs bg-gray-200 px-2 py-1 rounded-lg">كود: {c.code}</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">{c.products.length} صنف مسجل</p>
            <div className="max-h-40 overflow-y-auto mb-4 border-t pt-4 space-y-2">
              {c.products.map((p, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span>{p.name}</span>
                  <span className="font-bold">{p.priceAfterTax} ج.م</span>
                </div>
              ))}
            </div>
            <button className="w-full py-2 bg-gray-100 hover:bg-blue-600 hover:text-white rounded-xl text-sm font-bold transition-all">فتح القائمة</button>
          </div>
        ))}
      </div>

      {showAddCompany && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowAddCompany(false)} />
          <div className="glass w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8 relative shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">إضافة شركة جديدة</h2>
              <X className="cursor-pointer" onClick={() => setShowAddCompany(false)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-bold mb-2">اسم الشركة</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border outline-none iphone-input bg-white"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">كود الشركة (تلقائي)</label>
                <input 
                  type="text" 
                  readOnly 
                  className="w-full px-4 py-3 rounded-xl border bg-gray-50 outline-none"
                  value={nextCode}
                />
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <h4 className="font-bold">قائمة الأصناف</h4>
                <button onClick={addNewProductRow} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-200 transition-colors">
                  <Plus size={18}/> أضف صنف
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2">كود الصنف</th>
                      <th className="py-2">اسم الصنف</th>
                      <th className="py-2">السعر قبل الضريبة</th>
                      <th className="py-2">القيمة بعد الضريبة</th>
                      <th className="py-2">حذف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tempProducts.map((p, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2">
                          <input 
                            type="text" 
                            className="w-full px-2 py-1 rounded border"
                            value={p.code}
                            onChange={(e) => {
                              const news = [...tempProducts];
                              news[idx].code = e.target.value;
                              setTempProducts(news);
                            }}
                          />
                        </td>
                        <td className="py-2">
                          <input 
                            type="text" 
                            className="w-full px-2 py-1 rounded border"
                            value={p.name}
                            onChange={(e) => {
                              const news = [...tempProducts];
                              news[idx].name = e.target.value;
                              setTempProducts(news);
                            }}
                          />
                        </td>
                        <td className="py-2">
                          <input 
                            type="number" 
                            className="w-full px-2 py-1 rounded border"
                            value={p.preTax}
                            onChange={(e) => {
                              const news = [...tempProducts];
                              news[idx].preTax = Number(e.target.value);
                              setTempProducts(news);
                            }}
                          />
                        </td>
                        <td className="py-2 font-bold text-blue-700">
                           <input 
                            type="number" 
                            className="w-full px-2 py-1 rounded border"
                            value={p.postTax}
                            onChange={(e) => {
                              const news = [...tempProducts];
                              news[idx].postTax = Number(e.target.value);
                              setTempProducts(news);
                            }}
                          />
                        </td>
                        <td className="py-2">
                          <button onClick={() => setTempProducts(tempProducts.filter((_, i) => i !== idx))} className="text-red-500"><Trash2 size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button onClick={handleSaveCompany} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xl shadow-lg shadow-blue-200">حفظ القائمة</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Stock View ---
const StockView: React.FC<{ companies: Company[], invoices: Invoice[] }> = ({ companies, invoices }) => {
  const [search, setSearch] = useState('');

  // Merge products from all companies and calculate their current stock
  const allProducts = companies.flatMap(c => c.products.map(p => ({
    ...p,
    companyName: c.name,
    companyCode: c.code
  })));

  const filtered = allProducts.filter(p => 
    p.name.includes(search) || 
    p.code.includes(search) || 
    p.companyName.includes(search)
  );

  return (
    <div className="space-y-6">
       <div className="glass p-6 rounded-3xl mb-8 flex flex-col md:flex-row gap-4 items-center">
        <h2 className="text-2xl font-bold text-blue-700 ml-4">المخزون والكميات</h2>
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
          <input 
            type="text" 
            placeholder="بحث عن صنف أو شركة..." 
            className="w-full pr-12 pl-4 py-3 rounded-xl border outline-none iphone-input bg-white/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden overflow-x-auto shadow-sm">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4">كود الصنف</th>
              <th className="p-4">اسم الصنف</th>
              <th className="p-4">الشركة</th>
              <th className="p-4">الكمية المتوفرة</th>
              <th className="p-4">سعر البيع</th>
              <th className="p-4">الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, idx) => (
              <tr key={idx} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                <td className="p-4">{p.code}</td>
                <td className="p-4 font-bold">{p.name}</td>
                <td className="p-4">{p.companyName}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${p.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-4 font-bold">{(p.priceAfterTax * 1.14).toFixed(2)} ج.م</td>
                <td className="p-4">
                   <button className="text-blue-600 font-bold text-sm">التاريخ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Sales History View ---
const SalesHistoryView: React.FC<{ sales: Sale[], companies: Company[] }> = ({ sales }) => {
  const [filter, setFilter] = useState('');
  
  return (
    <div className="space-y-6">
       <div className="glass p-6 rounded-3xl mb-8 flex flex-col md:flex-row gap-4 items-center">
        <h2 className="text-2xl font-bold text-blue-700 ml-4">سجل المبيعات</h2>
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
          <input 
            type="text" 
            placeholder="بحث في المبيعات..." 
            className="w-full pr-12 pl-4 py-3 rounded-xl border outline-none iphone-input bg-white/50"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {sales.map(s => (
          <div key={s.id} className="glass p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">{new Date(s.date).toLocaleString('ar-EG')}</span>
              <span className="text-xl font-bold text-blue-700">{s.totalValue.toFixed(2)} ج.م</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {s.items.map((it, i) => (
                <div key={i} className="bg-white/40 p-3 rounded-xl">
                  <p className="text-xs text-gray-500">{it.name}</p>
                  <p className="font-bold">الكمية: {it.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {sales.length === 0 && (
          <div className="text-center py-20 text-gray-400">لا توجد مبيعات مسجلة بعد</div>
        )}
      </div>
    </div>
  );
};

// --- Settings View ---
const SettingsView: React.FC<{ settings: AppSettings, setSettings: React.Dispatch<React.SetStateAction<AppSettings>>, users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>> }> = ({ settings, setSettings, users, setUsers }) => {
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({ role: 'موظف', permissions: ['pos'] });

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password) return;
    const user: User = {
      id: Math.random().toString(),
      username: newUser.username,
      password: newUser.password,
      role: newUser.role as Role,
      phone: newUser.phone || '',
      address: newUser.address || '',
      startDate: new Date().toLocaleDateString(),
      permissions: newUser.permissions || []
    };
    setUsers([...users, user]);
    setShowAddUser(false);
    setNewUser({ role: 'موظف', permissions: ['pos'] });
  };

  return (
    <div className="space-y-10">
      <div className="glass p-8 rounded-3xl">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3"><SettingsIcon className="text-blue-600"/> إعدادات البرنامج</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="block font-bold">اسم البرنامج</label>
            <input 
              type="text" 
              className="w-full px-6 py-4 rounded-2xl border outline-none iphone-input bg-white"
              value={settings.programName}
              onChange={(e) => setSettings({ ...settings, programName: e.target.value })}
            />
          </div>
          <div className="space-y-4">
            <label className="block font-bold">نسبة الربح (%)</label>
            <input 
              type="number" 
              className="w-full px-6 py-4 rounded-2xl border outline-none iphone-input bg-white"
              value={settings.profitMargin}
              onChange={(e) => setSettings({ ...settings, profitMargin: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3"><UsersIcon className="text-blue-600"/> إدارة الحسابات</h2>
          <button onClick={() => setShowAddUser(true)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2">
            <Plus size={20}/> إنشاء حساب جديد
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(u => (
            <div key={u.id} className="bg-white/50 p-6 rounded-3xl border border-white/40 shadow-sm relative group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{u.username}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'مدير' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span>
                </div>
                {u.username !== 'admin' && (
                  <button onClick={() => setUsers(users.filter(usr => usr.id !== u.id))} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></button>
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>الهاتف: {u.phone}</p>
                <p>تاريخ البداية: {u.startDate}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-xl text-xs font-bold">تعديل</button>
                <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold">صلاحيات</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowAddUser(false)} />
          <div className="glass w-full max-w-2xl rounded-[2.5rem] p-8 relative shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">إنشاء مستخدم جديد</h2>
              <X className="cursor-pointer" onClick={() => setShowAddUser(false)} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
               <input 
                type="text" 
                placeholder="اسم المستخدم" 
                className="w-full px-4 py-3 rounded-xl border outline-none iphone-input bg-white"
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
               />
               <input 
                type="password" 
                placeholder="كلمة المرور" 
                className="w-full px-4 py-3 rounded-xl border outline-none iphone-input bg-white"
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
               />
               <input 
                type="text" 
                placeholder="رقم الهاتف" 
                className="w-full px-4 py-3 rounded-xl border outline-none iphone-input bg-white"
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
               />
               <select 
                className="w-full px-4 py-3 rounded-xl border outline-none bg-white"
                onChange={(e) => setNewUser({...newUser, role: e.target.value as Role})}
               >
                 <option value="موظف">موظف</option>
                 <option value="مدير">مدير</option>
               </select>
               <input 
                type="text" 
                placeholder="العنوان" 
                className="w-full md:col-span-2 px-4 py-3 rounded-xl border outline-none iphone-input bg-white"
                onChange={(e) => setNewUser({...newUser, address: e.target.value})}
               />
            </div>

            <button onClick={handleAddUser} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xl shadow-lg shadow-blue-200">إضافة الحساب</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
