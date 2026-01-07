
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Menu, X, Bell, LogOut, Search, Plus, 
  Trash2, Printer, FileSpreadsheet, Settings as SettingsIcon,
  Package, ShoppingCart, List, Send, Users as UsersIcon, ChevronRight,
  ShieldCheck, LayoutDashboard, Database, CreditCard, UserPlus, Wifi, WifiOff,
  Edit3, CheckCircle2, AlertCircle, History, Wallet, Tag, Bookmark, ScanLine,
  MessageSquare, Sparkles, User as UserIcon, Bot
} from 'lucide-react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, onValue } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { GoogleGenAI } from "@google/genai";
import { User, Company, Invoice, Sale, AppSettings, Product, Role, InvoiceItem, Payment } from './types';

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAYdWvZbTTkGlfI6vv02EFUMbw5eeF4UpU",
  authDomain: "sample-firebase-adddi-app.firebaseapp.com",
  databaseURL: "https://sample-firebase-adddi-app-default-rtdb.firebaseio.com",
  projectId: "sample-firebase-adddi-app",
  storageBucket: "sample-firebase-adddi-app.firebasestorage.app",
  messagingSenderId: "1013529485030",
  appId: "1:1013529485030:web:3dd9b79cd7d7ba41b42527"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

const DEFAULT_ADMIN: User = { 
  id: '1', 
  username: 'admin', 
  password: 'admin', 
  role: 'مدير', 
  phone: '0100000000', 
  address: 'مركز الإدارة', 
  startDate: new Date().toLocaleDateString(), 
  permissions: ['pos', 'createInvoice', 'orders', 'priceLists', 'offers', 'shelfPrices', 'stock', 'sales', 'settings'] 
};

const INITIAL_SETTINGS: AppSettings = {
  programName: 'Market Pro',
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

const getIconForKey = (key: string) => {
  switch (key) {
    case 'pos': return <ShoppingCart size={22} />;
    case 'createInvoice': return <Send size={22} />;
    case 'orders': return <List size={22} />;
    case 'priceLists': return <Database size={22} />;
    case 'offers': return <Tag size={22} />;
    case 'shelfPrices': return <Bookmark size={22} />;
    case 'stock': return <Package size={22} />;
    case 'sales': return <LayoutDashboard size={22} />;
    case 'settings': return <SettingsIcon size={22} />;
    default: return <Package size={22} />;
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

  const [users, setUsers] = useState<User[]>([DEFAULT_ADMIN]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [nextInvoiceId, setNextInvoiceId] = useState(1000);
  const [nextCompanyCode, setNextCompanyCode] = useState(10);

  // Cloud Data Synchronization
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    onValue(ref(db, 'settings'), (snap) => snap.exists() && setSettings(snap.val()));
    
    onValue(ref(db, 'users'), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        let cloudUsers = (val ? Object.values(val) : []) as User[];
        if (!cloudUsers.some(u => u && u.username === 'admin')) {
          cloudUsers.push(DEFAULT_ADMIN);
        }
        setUsers(cloudUsers.filter(u => u && u.username));
      } else {
        setUsers([DEFAULT_ADMIN]);
      }
    });

    onValue(ref(db, 'companies'), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        setCompanies(val ? Object.values(val) : []);
      }
    });

    onValue(ref(db, 'invoices'), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        setInvoices(val ? Object.values(val) : []);
      }
    });

    onValue(ref(db, 'sales'), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        setSales(val ? Object.values(val) : []);
      }
    });

    onValue(ref(db, 'metadata'), (snap) => {
      if (snap.exists()) {
        const meta = snap.val();
        setNextInvoiceId(meta.nextInvoiceId || 1000);
        setNextCompanyCode(meta.nextCompanyCode || 10);
      }
    });

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncData = (path: string, data: any) => {
    if (isOnline) set(ref(db, path), data);
  };

  const handleLogin = (u: string, p: string) => {
    const user = (users || []).find(usr => 
      usr && 
      usr.username && 
      usr.username.toLowerCase() === (u || '').toLowerCase() && 
      usr.password === p
    );
    
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
    } else {
      alert('خطأ: اسم المستخدم أو كلمة المرور غير صحيحة.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentView('pos');
  };

  const lowStockItems = useMemo(() => {
    const results: { company: Company; items: Product[] }[] = [];
    (companies || []).forEach(comp => {
      if (!comp || !comp.products) return;
      const low = comp.products.filter(p => {
        const rec = (invoices || []).filter(inv => inv && inv.status === 'تم التسليم' && inv.companyId === comp.id)
          .reduce((s, inv) => s + (inv.items ? inv.items.find(it => it.code === p.code)?.quantity || 0 : 0), 0);
        const sold = (sales || []).reduce((s, sale) => s + (sale.items ? sale.items.find(it => it.code === p.code)?.quantity || 0 : 0), 0);
        return (rec - sold) <= (p.minThreshold || 5);
      });
      if (low.length > 0) results.push({ company: comp, items: low });
    });
    return results;
  }, [companies, invoices, sales]);

  const renderView = () => {
    const commonProps = { 
      settings, 
      companies: companies || [], 
      setCompanies: (d: any) => { setCompanies(d); syncData('companies', d); },
      invoices: invoices || [], 
      setInvoices: (d: any) => { setInvoices(d); syncData('invoices', d); },
      sales: sales || [], 
      setSales: (d: any) => { setSales(d); syncData('sales', d); },
      nextInvoiceId, 
      setNextInvoiceId: (v: number) => { setNextInvoiceId(v); syncData('metadata/nextInvoiceId', v); },
      nextCompanyCode, 
      setNextCompanyCode: (v: number) => { setNextCompanyCode(v); syncData('metadata/nextCompanyCode', v); }
    };

    switch (currentView) {
      case 'pos': return <POSView {...commonProps} />;
      case 'createInvoice': return <CreateInvoiceView {...commonProps} prefilled={prefilledInvoiceCompany} onCancel={() => setPrefilledInvoiceCompany(null)} />;
      case 'orders': return <OrdersView {...commonProps} />;
      case 'priceLists': return <PriceListsView {...commonProps} />;
      case 'offers': return <OffersView {...commonProps} />;
      case 'shelfPrices': return <ShelfPriceView {...commonProps} />;
      case 'stock': return <StockView {...commonProps} />;
      case 'sales': return <SalesHistoryView {...commonProps} />;
      case 'settings': return <SettingsView settings={settings} setSettings={(d) => { setSettings(d); syncData('settings', d); }} users={users || []} setUsers={(d) => { setUsers(d); syncData('users', d); }} />;
      default: return <POSView {...commonProps} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
        <div className="glass-card w-full max-md:p-6 p-10 rounded-[2.5rem] border border-white/5 animate-fade-in text-center relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full"></div>
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl relative z-10">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h2 className="text-4xl font-black mb-8 text-white relative z-10 tracking-tight">{settings.programName}</h2>
          <form onSubmit={(e: any) => { e.preventDefault(); handleLogin(e.target.username.value, e.target.password.value); }} className="space-y-6 relative z-10">
            <div className="space-y-1 text-right">
              <label className="text-[10px] text-gray-500 font-bold mr-2">اسم المستخدم</label>
              <input name="username" type="text" placeholder="أدخل اسم المستخدم" required className="w-full px-6 py-4 rounded-2xl iphone-input outline-none text-right bg-white/5" />
            </div>
            <div className="space-y-1 text-right">
              <label className="text-[10px] text-gray-500 font-bold mr-2">كلمة المرور</label>
              <input name="password" type="password" placeholder="أدخل كلمة المرور" required className="w-full px-6 py-4 rounded-2xl iphone-input outline-none text-right bg-white/5" />
            </div>
            <button type="submit" className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xl shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.5)] active:scale-95 transition-all mt-4">دخول النظام</button>
          </form>
          <div className="mt-8 text-[10px] text-gray-500 font-bold tracking-widest uppercase relative z-10">Market Pro S-Cloud v2.5</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isGlassTheme ? 'bg-[#0f172a] text-white' : 'bg-gray-100 text-gray-900'} flex flex-col transition-all duration-500`}>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}
      
      <aside className={`fixed top-0 right-0 h-full w-80 glass-card z-50 transform transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl rounded-l-[2rem]`}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">لوحة التحكم</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
          </div>
          <nav className="space-y-2 overflow-y-auto flex-1 custom-scrollbar pr-1">
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
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><Menu size={24} /></button>
          <div className="hidden xs:block">
            <h1 className="font-black text-lg leading-tight">{settings.programName}</h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">أهلاً، {currentUser?.username}</p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xl font-black font-mono">
            {dateTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </div>
          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest hidden sm:block">
            {dateTime.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full glass ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
             {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
             <span className="text-[10px] font-bold hidden md:block">{isOnline ? 'سحابي متصل' : 'أوفلاين'}</span>
          </div>
          <NotificationBell lowStockItems={lowStockItems} onOrder={(c: Company) => { setPrefilledInvoiceCompany(c); setCurrentView('createInvoice'); }} />
          <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-400/20 rounded-xl transition-all"><LogOut size={20} /></button>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-[1600px] mx-auto animate-fade-in flex-1 w-full overflow-x-hidden custom-scrollbar">
        {renderView()}
      </main>

      <footer className="p-4 text-center text-[10px] text-gray-500 font-bold border-t border-white/5 bg-black/20">
         نظام Market Pro - جميع الحقوق محفوظة لـ Amir Lamay &copy; {new Date().getFullYear()}
      </footer>

      <WelcomeToast username={currentUser?.username || ''} />
      
      {/* AI Chatbot Integration */}
      <AIChatBot 
        companies={companies} 
        sales={sales} 
        invoices={invoices} 
        settings={settings}
        currentUser={currentUser}
      />
    </div>
  );
};

// --- AI ChatBot Component ---

const AIChatBot: React.FC<{ 
  companies: Company[], 
  sales: Sale[], 
  invoices: Invoice[], 
  settings: AppSettings,
  currentUser: User | null
}> = ({ companies, sales, invoices, settings, currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
    { role: 'ai', text: 'أهلاً بك! أنا مساعد Market Pro الذكي. كيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي عن المبيعات أو المخزون أو أي شيء يخص النظام.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Prepare context summary for AI
      const context = {
        totalCompanies: companies.length,
        totalSalesCount: sales.length,
        totalSalesValue: sales.reduce((a, b) => a + (b.totalValue || 0), 0),
        invoicesCount: invoices.length,
        lowStockCompanies: companies.filter(c => c.products?.some(p => p.stock <= (p.minThreshold || 5))).length,
        topSellingItems: "Many items available",
        programName: settings.programName,
        userName: currentUser?.username || 'Guest',
        userRole: currentUser?.role || 'User'
      };

      const prompt = `
        You are an AI assistant for the "Market Pro" supermarket management system.
        Context Information:
        - Current App State Summary: ${JSON.stringify(context)}
        - User Query: ${userText}
        
        Rules:
        1. Answer in Arabic.
        2. Be professional, helpful, and concise.
        3. Use the context to answer specific questions about the store's performance or stock if asked.
        4. If the user asks for data not in the summary, explain that you have general overview access.
        5. You represent the Market Pro intelligence.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const aiText = response.text || "عذراً، حدث خطأ في معالجة طلبك.";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "عذراً، لم أستطع الاتصال بالخادم الآن. يرجى المحاولة لاحقاً." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-end">
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] glass-card rounded-[2.5rem] mb-4 flex flex-col overflow-hidden border border-blue-500/30 animate-fade-in shadow-2xl">
          <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="font-black text-sm">مساعد Market Pro</h4>
                <p className="text-[10px] text-blue-200 font-bold">مدعوم بالذكاء الاصطناعي</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-900/40">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-bold leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none shadow-lg' 
                  : 'glass text-blue-100 rounded-bl-none border-blue-500/20'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-end">
                <div className="glass p-4 rounded-2xl rounded-bl-none border-blue-500/20 flex gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-black/20 border-t border-white/5">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="اسأل أي شيء..." 
                className="flex-1 glass iphone-input px-4 py-3 rounded-xl text-sm outline-none"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-3xl shadow-[0_15px_40px_rgba(37,99,235,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all relative group"
      >
        <Sparkles size={30} className="group-hover:rotate-12 transition-transform" />
        {messages.length > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[#0f172a]">1</span>
        )}
      </button>
    </div>
  );
};

// --- View Components ---

const POSView: React.FC<any> = ({ settings, companies, sales, setSales }) => {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [code, setCode] = useState('');
  const [qty, setQty] = useState(1);
  const [received, setReceived] = useState<number>(0);

  const addItem = () => {
    let product: Product | null = null;
    (companies || []).forEach((c: Company) => {
      if (!c.products) return;
      const p = c.products.find(x => x.code === code);
      if (p) product = p;
    });

    if (product) {
      const p = product as Product;
      const price = p.offerPrice && p.offerPrice > 0 ? p.offerPrice : p.priceAfterTax * (1 + settings.profitMargin / 100);
      setItems([...items, { code: p.code, name: p.name, price, quantity: qty, total: price * qty }]);
      setCode(''); setQty(1);
    } else alert('الصنف غير موجود في قوائم الشركات');
  };

  const total = items.reduce((a, b) => a + b.total, 0);
  const change = received > 0 ? received - total : 0;

  const handleSave = () => {
    if (items.length === 0) return;
    const sale: Sale = { id: Date.now().toString(), date: new Date().toISOString(), items, totalValue: total, received, change };
    setSales([...(sales || []), sale]);
    setItems([]); setReceived(0); alert('تم حفظ الفاتورة بنجاح');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-right">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-card p-6 rounded-[2rem] space-y-6 border border-white/10">
          <h2 className="text-2xl font-black flex items-center gap-3 justify-end"><ShoppingCart className="text-blue-400"/> كاشير المبيعات</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input type="text" placeholder="باركود الصنف" className="flex-1 px-6 py-4 rounded-2xl iphone-input text-lg font-mono" value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()} />
            <div className="flex gap-4">
              <input type="number" placeholder="الكمية" className="w-24 px-4 py-4 rounded-2xl iphone-input text-center text-lg font-bold" value={qty} onChange={e => setQty(Number(e.target.value))} />
              <button onClick={addItem} className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl transition-all">إضافة</button>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-[2rem] overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-gray-400"><tr><th className="p-4 text-right">الصنف</th><th className="p-4">السعر</th><th className="p-4">الكمية</th><th className="p-4">الإجمالي</th><th className="p-4"></th></tr></thead>
              <tbody className="divide-y divide-white/5">
                {items.map((it, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold">{it.name} <span className="block text-[10px] text-gray-500 font-normal">{it.code}</span></td>
                    <td className="p-4">{it.price.toFixed(2)}</td><td className="p-4">{it.quantity}</td><td className="p-4 font-black text-blue-400">{it.total.toFixed(2)}</td>
                    <td className="p-4"><button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-red-400 p-2 hover:bg-red-400/20 rounded-xl"><Trash2 size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {items.length === 0 && <div className="p-16 text-center text-gray-500 font-bold">ابدأ بإضافة أصناف للفاتورة</div>}
        </div>
      </div>
      <div className="space-y-6">
        <div className="glass-card p-10 rounded-[2.5rem] space-y-8 bg-blue-600/5 border border-blue-500/20 shadow-2xl">
          <div className="text-center">
             <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">صافي الفاتورة</p>
             <h3 className="text-6xl font-black tracking-tighter">{total.toFixed(2)} <span className="text-sm font-bold">ج.م</span></h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase mr-2">المبلغ المستلم</label>
              <input type="number" className="w-full py-5 rounded-3xl iphone-input text-4xl font-black text-center" placeholder="0.00" value={received || ''} onChange={e => setReceived(Number(e.target.value))} />
            </div>
            <div className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/10">
               <span className="text-sm text-gray-400 font-bold">متبقي للعميل:</span>
               <span className="text-4xl font-black text-green-400">{change.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={handleSave} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-2xl shadow-xl active:scale-95 transition-all hover:bg-blue-700">إصدار الفاتورة</button>
        </div>
      </div>
    </div>
  );
};

const CreateInvoiceView: React.FC<any> = ({ companies, nextInvoiceId, setNextInvoiceId, invoices, setInvoices, prefilled, onCancel }) => {
  const [selectedComp, setSelectedComp] = useState<Company | null>(prefilled || null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [prodCode, setProdCode] = useState('');
  const [qty, setQty] = useState(1);
  const [search, setSearch] = useState('');

  const add = () => {
    if (!selectedComp || !selectedComp.products) return;
    const p = selectedComp.products.find(x => x.code === prodCode);
    if (p) {
      setItems([...items, { code: p.code, name: p.name, price: p.priceBeforeTax, quantity: qty, total: p.priceBeforeTax * qty }]);
      setProdCode(''); setQty(1);
    } else alert('كود الصنف غير صحيح أو غير مسجل لهذه الشركة');
  };

  const total = items.reduce((a, b) => a + b.total, 0);

  const handleSave = () => {
    if (items.length === 0 || !selectedComp) return;
    const inv: Invoice = { 
      id: nextInvoiceId, 
      companyId: selectedComp.id, 
      companyName: selectedComp.name, 
      date: new Date().toLocaleDateString('ar-EG'), 
      items, totalValue: total, status: 'لم يتم التسليم', 
      payments: [], paidAmount: 0, remaining: total 
    };
    const newInvoices = [...(invoices || []), inv];
    setInvoices(newInvoices);
    setNextInvoiceId(nextInvoiceId + 1);
    alert('تم ترحيل الطلبية بنجاح');
    setSelectedComp(null); setItems([]);
  };

  return (
    <div className="max-w-5xl mx-auto text-right space-y-8">
      {!selectedComp ? (
        <div className="glass-card p-12 rounded-[3rem] text-center space-y-10 border border-white/10">
          <div className="w-20 h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center mx-auto text-blue-400"><Send size={40}/></div>
          <h2 className="text-3xl font-black">إنشاء طلبية توريد جديدة</h2>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="ابحث عن المورد..." className="w-full pr-12 pl-6 py-4 rounded-2xl iphone-input" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar p-2">
            {(companies || []).filter((c: Company) => c && c.name && c.name.includes(search)).map((c: Company) => (
              <button key={c.id} onClick={() => setSelectedComp(c)} className="p-8 glass rounded-2xl text-right font-bold hover:bg-blue-600/20 transition-all border border-white/5">
                <span className="text-xl block mb-1">{c.name}</span>
                <span className="text-[10px] text-gray-500 font-normal tracking-widest uppercase">كود المورد: {c.code}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card p-10 rounded-[2.5rem] space-y-8 animate-fade-in border border-white/10">
          <div className="flex justify-between items-center pb-6 border-b border-white/10">
            <button onClick={() => { setSelectedComp(null); onCancel(); }} className="p-2 hover:bg-white/10 rounded-full text-gray-500"><X size={24}/></button>
            <h3 className="text-2xl font-black">إنشاء فاتورة توريد من: {selectedComp.name} <span className="text-blue-400 font-mono ml-4">#{nextInvoiceId}</span></h3>
          </div>
          <div className="flex flex-col md:flex-row gap-4 p-8 bg-white/5 rounded-3xl border border-white/5 items-end">
            <div className="flex-1 space-y-2 text-right w-full">
              <label className="text-[10px] text-gray-500 font-bold mr-2">كود الصنف من القائمة</label>
              <input type="text" placeholder="أدخل كود الصنف" className="w-full px-6 py-4 rounded-xl iphone-input" value={prodCode} onChange={e => setProdCode(e.target.value)} />
            </div>
            <div className="space-y-2 text-right w-full md:w-32">
              <label className="text-[10px] text-gray-500 font-bold mr-2">الكمية</label>
              <input type="number" placeholder="1" className="w-full px-4 py-4 rounded-xl iphone-input text-center font-bold" value={qty} onChange={e => setQty(Number(e.target.value))} />
            </div>
            <button onClick={add} className="w-full md:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-lg transition-all">إضافة</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="text-gray-500"><tr><th className="p-4">الصنف</th><th className="p-4">سعر الوحدة (توريد)</th><th className="p-4 text-center">الكمية</th><th className="p-4">الإجمالي</th></tr></thead>
              <tbody className="divide-y divide-white/5">
                {items.map((it, i) => (
                  <tr key={i} className="hover:bg-white/3">
                    <td className="p-4 font-bold">{it.name}</td><td className="p-4">{it.price.toFixed(2)}</td><td className="p-4 text-center">{it.quantity}</td><td className="p-4 font-black text-blue-400">{it.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center p-8 bg-blue-600/10 rounded-3xl border border-blue-500/20">
             <span className="font-bold text-gray-400">إجمالي الطلبية المستحق:</span>
             <span className="text-4xl font-black">{total.toFixed(2)} <span className="text-xs">ج.م</span></span>
          </div>
          <button onClick={handleSave} className="w-full py-6 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-2xl shadow-xl transition-all">حفظ وترحيل الطلبية للمراجعة</button>
        </div>
      )}
    </div>
  );
};

const OrdersView: React.FC<any> = ({ invoices, setInvoices }) => {
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [search, setSearch] = useState('');

  const filtered = (invoices || []).filter((inv: Invoice) => inv && (inv.companyName?.includes(search) || inv.id?.toString().includes(search)));

  const addPayment = () => {
    if (!selected || payAmount <= 0) return;
    const updated = (invoices || []).map((inv: Invoice) => {
      if (inv && inv.id === selected.id) {
        const paid = (inv.paidAmount || 0) + payAmount;
        const rem = Math.max(0, (inv.totalValue || 0) - paid);
        const newPayments = [...(inv.payments || []), { amount: payAmount, date: new Date().toLocaleDateString('ar-EG') }];
        const newInv = { ...inv, paidAmount: paid, remaining: rem, payments: newPayments };
        setSelected(newInv);
        return newInv;
      }
      return inv;
    });
    setInvoices(updated); setPayAmount(0); alert('تم تسجيل الدفعة بنجاح');
  };

  const updateStatus = (status: any) => {
    if (!selected) return;
    const updated = (invoices || []).map((inv: Invoice) => (inv && inv.id === selected.id) ? { ...inv, status } : inv);
    setInvoices(updated);
    setSelected({ ...selected, status });
  };

  const liveRemaining = selected ? Math.max(0, (selected.remaining || 0) - (payAmount || 0)) : 0;

  return (
    <div className="space-y-8 text-right">
      <div className="glass-card p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 border border-white/10">
        <h2 className="text-2xl font-black">إدارة الأوردارات المرحلة</h2>
        <div className="relative w-full max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="بحث باسم الشركة أو رقم الفاتورة..." className="w-full pr-12 pl-6 py-3 rounded-2xl iphone-input" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((inv: Invoice) => (
          <div key={inv.id} onClick={() => setSelected(inv)} className="glass-card p-6 rounded-[2rem] cursor-pointer hover:border-blue-500/40 border border-white/5 transition-all group active:scale-95 shadow-xl">
             <div className="flex justify-between mb-4">
               <span className="text-xs text-blue-400 font-black">#{inv.id}</span>
               <span className={`text-[9px] px-2 py-1 rounded-full font-bold ${inv.status === 'تم التسليم' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{inv.status}</span>
             </div>
             <h3 className="text-lg font-bold mb-1">{inv.companyName}</h3>
             <p className="text-[10px] text-gray-500">القيمة: {(inv.totalValue || 0).toFixed(2)} | المتبقي: {(inv.remaining || 0).toFixed(2)}</p>
             <div className="mt-4 pt-4 border-t border-white/5 text-[9px] text-gray-600 font-bold uppercase tracking-widest">{inv.date}</div>
          </div>
        ))}
      </div>
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="absolute inset-0 bg-black/70" onClick={() => setSelected(null)} />
           <div className="glass-card w-full max-w-5xl max-h-[90vh] overflow-y-auto p-10 relative z-10 border border-white/10 rounded-[3rem] custom-scrollbar shadow-2xl">
             <div className="flex justify-between items-center mb-10">
               <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={32}/></button>
               <h2 className="text-2xl font-black tracking-tight">مراجعة وتسوية الفاتورة #{selected.id}</h2>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                   <div className="flex gap-4">
                     <button onClick={() => updateStatus('تم التسليم')} className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all ${selected.status === 'تم التسليم' ? 'bg-green-600 text-white shadow-lg' : 'glass text-gray-500 hover:bg-white/5'}`}>تأكيد الاستلام</button>
                     <button onClick={() => updateStatus('لم يتم التسليم')} className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all ${selected.status === 'لم يتم التسليم' ? 'bg-red-600 text-white shadow-lg' : 'glass text-gray-500 hover:bg-white/5'}`}>في انتظار الاستلام</button>
                   </div>
                   <div className="space-y-3">
                     <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">قائمة الأصناف</h4>
                     {(selected.items || []).map((it, idx) => (
                       <div key={idx} className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/5 font-bold hover:bg-white/10 transition-colors">
                         <span className="text-blue-400">{(it.total || 0).toFixed(2)} ج.م</span>
                         <span>{it.name} (x{it.quantity})</span>
                       </div>
                     ))}
                   </div>
                </div>
                <div className="space-y-8">
                   <div className="glass p-8 rounded-3xl border border-blue-500/20 space-y-6 bg-blue-600/5">
                      <h4 className="font-black text-xs text-blue-400 uppercase tracking-widest text-center">إضافة دفعة سداد</h4>
                      <input type="number" className="w-full py-5 rounded-2xl iphone-input text-4xl font-black text-center" placeholder="0.00" value={payAmount || ''} onChange={e => setPayAmount(Number(e.target.value))} />
                      <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                        <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">المتبقي اللحظي:</span>
                        <span className="text-xl font-black text-red-400">{liveRemaining.toFixed(2)}</span>
                      </div>
                      <button onClick={addPayment} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black shadow-lg transition-all">تسجيل السداد</button>
                   </div>
                   <div className="space-y-3">
                      <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">سجل الدفعات:</h4>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {(selected.payments || []).map((p, i) => (
                          <div key={i} className="flex justify-between p-3 glass rounded-xl text-[10px] font-bold">
                             <span className="text-green-400">{p.amount.toFixed(2)} ج.م</span>
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

const SettingsView: React.FC<any> = ({ settings, setSettings, users, setUsers }) => {
  const [showAdd, setShowAdd] = useState(false);
  
  const addUser = (e: any) => {
    e.preventDefault();
    const u: User = { 
      id: Date.now().toString(), 
      username: e.target.u.value, 
      password: e.target.p.value, 
      role: e.target.r.value, 
      phone: '', 
      address: '', 
      startDate: new Date().toLocaleDateString('ar-EG'), 
      permissions: [] 
    };
    const newUsers = [...(users || []), u];
    setUsers(newUsers); 
    setShowAdd(false);
  };

  const deleteUser = (id: string) => {
    const user = (users || []).find(u => u && u.id === id);
    if (user?.username === 'admin') return alert('لا يمكن حذف حساب المدير الرئيسي');
    if (confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
      const newUsers = (users || []).filter(x => x && x.id !== id);
      setUsers(newUsers);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-right">
      <div className="glass-card p-10 rounded-[3rem] space-y-10 border border-white/10">
        <h3 className="text-2xl font-black flex items-center gap-3 justify-end"><SettingsIcon className="text-blue-400"/> إعدادات النظام</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase mr-2 tracking-widest">اسم البرنامج الرئيسي</label>
            <input type="text" className="w-full px-6 py-4 rounded-2xl iphone-input font-black" value={settings.programName} onChange={e => setSettings({...settings, programName: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase mr-2 tracking-widest">هامش الربح الافتراضي (%)</label>
            <input type="number" className="w-full px-6 py-4 rounded-2xl iphone-input font-black" value={settings.profitMargin} onChange={e => setSettings({...settings, profitMargin: Number(e.target.value)})} />
          </div>
        </div>
        <div className="space-y-4 pt-8 border-t border-white/5">
          <h4 className="font-bold text-xs text-gray-500 uppercase tracking-widest mb-4">تعديل مسميات القائمة الجانبية:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(settings.sideMenuNames).map(k => (
              <div key={k} className="space-y-1">
                <label className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">{k}</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl iphone-input text-xs font-bold" value={settings.sideMenuNames[k]} onChange={e => setSettings({...settings, sideMenuNames: {...settings.sideMenuNames, [k]: e.target.value}})} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="glass-card p-10 rounded-[3rem] space-y-10 border border-white/10">
        <h3 className="text-2xl font-black flex items-center gap-3 justify-end"><UsersIcon className="text-blue-400"/> إدارة صلاحيات الموظفين</h3>
        <div className="space-y-4 overflow-y-auto max-h-[500px] custom-scrollbar pr-2">
          {(users || []).filter(u => u).map((u: User) => (
            <div key={u.id} className="p-5 glass rounded-2xl flex justify-between items-center border border-white/5 hover:bg-white/10 transition-colors">
              <button onClick={() => deleteUser(u.id)} className="text-red-400 p-3 hover:bg-red-400/20 rounded-xl transition-all"><Trash2 size={18}/></button>
              <div className="text-right">
                <p className="font-black text-lg">{u.username}</p>
                <p className="text-[10px] text-blue-400 font-black tracking-widest uppercase">{u.role} | {u.startDate}</p>
              </div>
            </div>
          ))}
          <button onClick={() => setShowAdd(true)} className="w-full py-5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl font-black text-sm hover:bg-blue-600 hover:text-white shadow-xl transition-all flex items-center justify-center gap-2">
            <UserPlus size={20}/> إنشاء حساب موظف جديد
          </button>
        </div>
      </div>
      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="absolute inset-0 bg-black/70" onClick={() => setShowAdd(false)} />
           <form onSubmit={addUser} className="glass-card w-full max-w-md p-12 rounded-[3rem] relative z-10 space-y-8 animate-fade-in text-right border border-white/10 shadow-2xl">
              <h3 className="text-2xl font-black text-center mb-4">بيانات الحساب الجديد</h3>
              <div className="space-y-4">
                <input name="u" type="text" placeholder="اسم المستخدم" className="w-full px-6 py-4 rounded-xl iphone-input" required />
                <input name="p" type="password" placeholder="كلمة المرور" className="w-full px-6 py-4 rounded-xl iphone-input" required />
                <select name="r" className="w-full px-6 py-4 rounded-xl iphone-input bg-[#0f172a]">
                  <option value="موظف">موظف مبيعات (كاشير)</option>
                  <option value="مدير">مدير نظام (صلاحيات كاملة)</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 glass rounded-xl font-bold">إلغاء</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black shadow-xl">حفظ الحساب</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

// --- View Component Stubs ---
const PriceListsView = ({ companies, setCompanies, nextCompanyCode, setNextCompanyCode }: any) => <div className="p-20 text-center glass-card rounded-[3rem] border border-white/10"><Database size={64} className="mx-auto text-blue-400 mb-6"/><h2 className="text-2xl font-black mb-2">قوائم أسعار الشركات</h2><p className="text-gray-500">تم تفعيل وضع المزامنة السحابية. يمكنك تسجيل الشركات وأسعار التوريد هنا.</p></div>;
const OffersView = ({ companies, settings }: any) => <div className="p-20 text-center glass-card rounded-[3rem] border border-white/10"><Tag size={64} className="mx-auto text-blue-400 mb-6"/><h2 className="text-2xl font-black mb-2">إدارة أسعار العروض</h2><p className="text-gray-500">تعديل أسعار البيع المخصصة لفترات العروض.</p></div>;
const ShelfPriceView = ({ companies }: any) => <div className="p-20 text-center glass-card rounded-[3rem] border border-white/10"><Bookmark size={64} className="mx-auto text-blue-400 mb-6"/><h2 className="text-2xl font-black mb-2">طباعة ملصقات الرفوف</h2><p className="text-gray-500">تصدير وطباعة أسعار الرفوف للأصناف المختارة.</p></div>;
const StockView = ({ companies, invoices, sales }: any) => <div className="p-20 text-center glass-card rounded-[3rem] border border-white/10"><Package size={64} className="mx-auto text-blue-400 mb-6"/><h2 className="text-2xl font-black mb-2">إدارة المخزون العام</h2><p className="text-gray-500">متابعة الكميات الحالية لكل شركة بناءً على التوريدات والمبيعات.</p></div>;
const SalesHistoryView = ({ sales }: any) => <div className="p-20 text-center glass-card rounded-[3rem] border border-white/10"><LayoutDashboard size={64} className="mx-auto text-blue-400 mb-6"/><h2 className="text-2xl font-black mb-2">سجل المبيعات والأرباح</h2><p className="text-gray-500">عرض العمليات التاريخية والتقارير المالية للفترات المحددة.</p></div>;

const NavItem: React.FC<any> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)]' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
    <div className={active ? 'text-white' : 'text-blue-400'}>{icon}</div>
    <span className="font-bold text-sm text-right flex-1 leading-tight">{label}</span>
  </button>
);

const NotificationBell: React.FC<any> = ({ lowStockItems, onOrder }) => {
  const [open, setOpen] = useState(false);
  const count = (lowStockItems || []).length;
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-2.5 hover:bg-white/10 rounded-xl relative transition-all">
        <Bell size={20} />
        {count > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></span>}
      </button>
      {open && (
        <div className="absolute left-0 mt-4 w-72 glass-card p-6 rounded-[2rem] z-50 animate-fade-in text-right border border-white/10 shadow-2xl">
           <h4 className="text-[10px] font-black text-blue-400 mb-4 uppercase tracking-widest">إشعارات النواقص ({count})</h4>
           <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
             {count === 0 && <p className="text-xs text-gray-500 text-center py-4 font-bold">المخزون مكتمل حالياً</p>}
             {(lowStockItems || []).map((n: any, i: number) => (
               <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                 <p className="font-black text-xs text-white">{n.company ? n.company.name : 'شركة غير معروفة'}</p>
                 <p className="text-[9px] text-gray-500 mb-3">أصناف تحت الحد الأدنى: {(n.items || []).length}</p>
                 <button onClick={() => { onOrder(n.company); setOpen(false); }} className="w-full py-2 bg-blue-600/20 text-blue-400 rounded-lg text-[9px] font-black hover:bg-blue-600 hover:text-white transition-all">بدء طلبية توريد</button>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

const WelcomeToast: React.FC<any> = ({ username }) => {
  const [v, setV] = useState(false);
  useEffect(() => { if (username) { setV(true); setTimeout(() => setV(false), 5000); } }, [username]);
  if (!v) return null;
  return (
    <div className="fixed bottom-8 left-8 glass px-8 py-5 rounded-[2rem] shadow-2xl z-[100] border border-blue-500/30 animate-fade-in flex items-center gap-4">
      <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><CheckCircle2 size={24}/></div>
      <div className="text-right">
        <h4 className="font-black text-white text-sm">مرحباً، {username}!</h4>
        <p className="text-[10px] text-blue-400 font-bold">تم ربط الجلسة بالموقع السحابي بنجاح</p>
      </div>
    </div>
  );
};

export default App;
