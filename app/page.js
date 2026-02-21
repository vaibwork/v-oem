"use client";
import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { 
  Settings, 
  Search, 
  Droplet, 
  Wrench, 
  PlusSquare, 
  LogOut, 
  Activity, 
  Database, 
  Save, 
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Filter,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// --- Context & State Management ---
const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [machineStatus, setMachineStatus] = useState('READY'); // READY, BUSY, ERROR
  const [currentScreen, setCurrentScreen] = useState('DASHBOARD');
  
  // Machine Configuration State
  const [config, setConfig] = useState({
    modelNumber: 'VOEM-TX-2000',
    serialNumber: 'SN-8829-XJ',
    installDate: '2023-10-15',
    numCanisters: 16,
    maxLevel: 3000,
    reserveLevel: 500,
    commMode: 'USB',
    comPort: 'COM3'
  });

  // Canister Data State (16 canisters)
  const [canisters, setCanisters] = useState(
    Array.from({ length: 16 }, (_, i) => ({
      id: i + 1,
      code: `C-${(i + 1).toString().padStart(2, '0')}`,
      color: [
        '#000000', '#FFFFFF', '#FF0000', '#0000FF', '#FFFF00', '#008000', 
        '#FFA500', '#800080', '#A52A2A', '#808080', '#FFC0CB', '#00FFFF',
        '#F0E68C', '#E6E6FA', '#000080', '#556B2F'
      ][i] || '#CCCCCC',
      level: Math.floor(Math.random() * 2000) + 500,
      agitator: false,
      valve: false,
      pump: 'OFF' // OFF, UP, DOWN
    }))
  );

  const login = (username, password) => {
    if (username === 'admin' && password === 'admin') {
      const userData = { id: 1, name: 'Administrator', role: 'SuperUser' };
      setUser(userData);
      localStorage.setItem('voem_session', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('voem_session');
    setCurrentScreen('LOGIN');
  };

  return (
    <AppContext.Provider value={{
      user, setUser, currentScreen, setCurrentScreen,
      machineStatus, setMachineStatus,
      config, setConfig,
      canisters, setCanisters,
      login, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

// --- Reusable UI Components ---
const Card = ({ children, title, className = "" }) => (
  <div className={`bg-[#2d2d2d] border border-[#3f3f3f] rounded-lg shadow-xl overflow-hidden ${className}`}>
    {title && (
      <div className="bg-[#383838] px-4 py-2 border-b border-[#4a4a4a] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">{title}</h3>
      </div>
    )}
    <div className="p-4">{children}</div>
  </div>
);

const Button = ({ children, onClick, variant = 'primary', disabled = false, className = "", icon: Icon }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white',
    secondary: 'bg-[#444] hover:bg-[#555] text-gray-200 border border-[#555]',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    ghost: 'bg-transparent hover:bg-[#333] text-gray-400'
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 font-medium text-sm ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

const Input = ({ label, type = "text", value, onChange, placeholder, className = "" }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && <label className="text-xs font-semibold text-gray-400 uppercase">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="bg-[#1a1a1a] border border-[#444] text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
    />
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    READY: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    BUSY: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    ERROR: 'bg-red-500/10 text-red-500 border-red-500/20'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[status]}`}>
      {status}
    </span>
  );
};

// --- Modules ---
const LoginScreen = () => {
  const { login } = useContext(AppContext);
  const [creds, setCreds] = useState({ user: '', pass: '' });
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (login(creds.user, creds.pass)) {
      setError('');
    } else {
      setError('Invalid credentials. Use admin/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20">
            <Activity size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tighter">v-oem</h1>
          <p className="text-gray-500 text-sm mt-1">Industrial Tinting Control v1.0</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input label="Username" value={creds.user} onChange={e => setCreds({...creds, user: e.target.value})} />
          <Input label="Password" type="password" value={creds.pass} onChange={e => setCreds({...creds, pass: e.target.value})} />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          <Button className="w-full mt-4 py-3" variant="primary">Authenticate</Button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { canisters, config } = useContext(AppContext);
  const stats = [
    { label: 'Canisters Active', value: canisters.length, icon: Database },
    { label: 'Avg Fill Level', value: `${Math.round(canisters.reduce((a, b) => a + b.level, 0) / canisters.length)} ml`, icon: Droplet },
    { label: 'Uptime', value: '42d 12h', icon: Activity },
    { label: 'Last Service', value: config.installDate, icon: Wrench },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-l-4 border-l-blue-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#333] rounded-lg text-blue-400"><stat.icon size={24} /></div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">{stat.label}</p>
                <p className="text-xl font-bold text-gray-200">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Canister Levels (ml)">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={canisters}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="code" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#444', color: '#fff' }} />
                <Bar dataKey="level" fill="#2563eb" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

const MaintenanceModule = () => {
  const { canisters, setCanisters } = useContext(AppContext);
  const toggleAgitator = (id) => setCanisters(prev => prev.map(c => c.id === id ? { ...c, agitator: !c.agitator } : c));
  const handlePump = (id, state) => setCanisters(prev => prev.map(c => c.id === id ? { ...c, pump: state } : c));
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {canisters.map(canister => (
        <Card key={canister.id}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full border border-[#444]" style={{ backgroundColor: canister.color }} />
            <div><h4 className="font-bold text-gray-200">{canister.code}</h4></div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Agitator</span>
              <Button variant={canister.agitator ? 'success' : 'secondary'} className="px-2 py-1 text-[10px]" onClick={() => toggleAgitator(canister.id)}>
                {canister.agitator ? 'RUNNING' : 'STOPPED'}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

const MainLayout = () => {
  const { user, logout, currentScreen, setCurrentScreen, machineStatus } = useContext(AppContext);
  const navItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: Activity },
    { id: 'MAINTENANCE', label: 'Maintenance', icon: Wrench },
    { id: 'SETUP', label: 'Setup', icon: Settings },
  ];

  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-[#121212] text-gray-300 flex flex-col">
      <header className="h-14 bg-[#1e1e1e] border-b border-[#333] flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center"><Activity size={18} className="text-white" /></div>
            <h1 className="text-xl font-black text-white">v-oem</h1>
          </div>
          <nav className="flex items-center gap-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setCurrentScreen(item.id)} className={`px-3 py-1.5 rounded-md text-sm ${currentScreen === item.id ? 'bg-[#333] text-blue-400' : 'text-gray-500'}`}>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <button onClick={logout} className="p-2 text-gray-500"><LogOut size={20} /></button>
      </header>
      <main className="flex-1 p-6 overflow-y-auto">
        {currentScreen === 'DASHBOARD' && <Dashboard />}
        {currentScreen === 'MAINTENANCE' && <MaintenanceModule />}
        {currentScreen === 'SETUP' && <div className="text-center py-20 text-gray-600">Setup Module Ready</div>}
      </main>
      <footer className="h-8 bg-[#1a1a1a] border-t border-[#333] px-6 flex items-center justify-between text-[10px] uppercase font-bold text-gray-600">
        <div>Software: <span className="text-blue-500">v-oem Control Suite</span></div>
        <div className="flex items-center gap-2">Status: <StatusBadge status={machineStatus} /></div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
