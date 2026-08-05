import React from 'react';
import { User } from '../types';
import { ShieldCheck, LogOut, Search, Bell, Sparkles, User as UserIcon, Menu, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  searchQuery,
  setSearchQuery,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const [darkMode, setDarkMode] = React.useState(() => {
    try {
      return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (e) {
      console.warn('LocalStorage dark theme persistence failed:', e);
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  return (
    <header className="sticky top-0 z-30 bg-yellow-200/95 backdrop-blur-md border-b-8 border-dashed border-red-500 px-2 sm:px-12 py-4 sm:py-8 flex items-center justify-between gap-3 sm:gap-10 -rotate-1 shadow-2xl">
      {/* Brand & Mobile Title */}
      <div className="flex items-center gap-2 sm:gap-6 rotate-3 -ml-4">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 bg-yellow-300 hover:bg-yellow-400 text-black border-4 border-black shadow-md focus:outline-none active:scale-95 transition-all rotate-3"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="cursor-pointer flex items-center gap-2 sm:gap-4 group -skew-x-6"
        >
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-none bg-gradient-to-br from-pink-600 to-yellow-400 flex items-center justify-center text-white font-black shadow-2xl border-4 border-black group-hover:scale-110 rotate-12">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-black animate-spin" />
          </div>
          <div className="-mt-2 sm:-mt-3">
            <div className="flex items-center gap-1 sm:gap-3">
              <span className="font-black text-base sm:text-2xl text-red-600 tracking-widest leading-none font-serif uppercase underline">IET CONNECT!!!</span>
              <span className="px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-xs font-black uppercase tracking-widest bg-black text-yellow-300 rounded-none -rotate-12 border border-red-500">PORTAL</span>
            </div>
            <p className="text-[10px] sm:text-sm text-purple-900 font-mono font-bold hidden sm:block bg-yellow-100 p-1 border border-black mt-1 rotate-1">INSTITUTION OF ENGINEERING & TECH</p>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-lg mx-8 relative -rotate-2">
        <Search className="w-6 h-6 text-red-600 absolute left-4 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="SEARCH EVERYTHING HERE NOW!!!..."
          className="w-full bg-white text-black font-mono font-black text-base pl-14 pr-6 py-4 rounded-none border-4 border-black focus:border-red-600 focus:ring-8 focus:ring-yellow-400/50 outline-none transition-all uppercase"
        />
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-2 sm:gap-6 rotate-2 mr-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 bg-yellow-300 hover:bg-yellow-400 text-black border-4 border-black rotate-12 transition-all shadow-md focus:outline-none"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun className="w-5 h-5 text-red-600 animate-spin" /> : <Moon className="w-5 h-5 text-black" />}
        </button>

        {user ? (
          <>
            <button
              onClick={() => setActiveTab('announcements')}
              className="relative p-2.5 sm:p-4 text-white bg-purple-900 hover:bg-black rounded-full border-4 border-yellow-300 -rotate-12 shadow-xl"
              title="Notifications"
            >
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
              <span className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-red-600 rounded-none ring-2 sm:ring-4 ring-black"></span>
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 sm:gap-4 pl-2 sm:pl-4 border-l-4 sm:border-l-8 border-dotted border-black">
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-1.5 sm:gap-3 p-1 sm:p-2 pr-2 sm:pr-6 rounded-none bg-yellow-300 hover:bg-yellow-400 border-4 border-black rotate-3 transition-colors text-left group"
              >
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={user.username}
                  className="w-8 h-8 sm:w-12 sm:h-12 rounded-none object-cover border-4 border-black -rotate-12 group-hover:rotate-0 transition-all"
                />
                <div className="hidden sm:block font-mono">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-black leading-tight uppercase">{user.username}</p>
                    {user.role === 'lead' && (
                      <ShieldCheck className="w-5 h-5 text-red-600" title="Chapter Lead" />
                    )}
                  </div>
                  <p className="text-xs text-red-700 font-bold uppercase truncate max-w-[130px]">{user.institution.split('-')[0]}</p>
                </div>
              </button>

              <button
                onClick={onLogout}
                className="p-2 sm:p-3 text-white bg-red-600 hover:bg-red-700 rounded-none border-4 border-black rotate-12 transition-colors shadow-lg"
                title="Logout"
              >
                <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setActiveTab('auth')}
            className="flex items-center gap-1.5 sm:gap-3 bg-red-600 hover:bg-black text-yellow-300 px-3 sm:px-6 py-2 sm:py-4 rounded-none text-xs sm:text-base font-black uppercase border-4 border-black shadow-2xl rotate-6 transition-all"
          >
            <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Login / Register NOW</span>
          </button>
        )}
      </div>
    </header>
  );
};
