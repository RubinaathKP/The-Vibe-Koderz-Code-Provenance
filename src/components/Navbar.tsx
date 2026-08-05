import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, LogOut, Search, Bell, Sparkles, User as UserIcon, Menu, X, AlertCircle } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  searchQuery,
  setSearchQuery,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navError, setNavError] = useState<string | null>(null);

  // Intentional route/link breakage fixed
  const handleNavClick = (tabId: string) => {
    if (tabId === 'profile' && !user) {
      setActiveTab('auth');
    } else {
      setActiveTab(tabId);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-4 flex items-center justify-between gap-4 shadow-sm">
      {/* Brand & Mobile Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger menu - styled consistently with header buttons */}
        <button
          onClick={() => {
            setMobileMenuOpen(!mobileMenuOpen);
          }}
          className="p-2.5 text-slate-600 hover:text-[#622569] hover:bg-slate-50 border border-slate-200/80 rounded-xl md:hidden transition-colors flex items-center justify-center"
          id="mobile-hamburger-btn"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <div 
          onClick={() => handleNavClick('dashboard')}
          className="cursor-pointer flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#622569] to-[#9b51e0] flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-purple-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-[#622569] tracking-tight font-['Poppins']">IET CONNECT</span>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-[#622569]/10 text-[#622569] rounded-md tracking-wider">PORTAL</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block">Institution of Engineering and Technology</p>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search members, projects, events..."
          className="w-full bg-slate-50 text-slate-900 text-xs pl-10 pr-4 py-2 rounded-xl border border-slate-200/80 focus:bg-white focus:border-[#9b51e0] focus:ring-2 focus:ring-[#9b51e0]/20 outline-none transition-all"
        />
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <button
              onClick={() => handleNavClick('announcements')}
              className="relative p-2.5 text-slate-600 hover:text-[#622569] rounded-xl hover:bg-slate-50 border border-slate-200/60 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <button
                onClick={() => handleNavClick('profile')}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-50 border border-slate-200/60 transition-colors text-left group"
              >
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={user.username}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-100 shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden sm:block font-sans">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-slate-700 leading-tight">{user.username}</p>
                    {user.role === 'lead' && (
                      <ShieldCheck className="w-3.5 h-3.5 text-[#622569]" title="Chapter Lead" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate max-w-[100px]">{user.institution.split('-')[0]}</p>
                </div>
              </button>

              <button
                onClick={onLogout}
                className="p-2.5 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-slate-200/60 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => handleNavClick('auth')}
            className="flex items-center gap-1.5 bg-[#622569] hover:bg-[#9b51e0] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* Floating navigation error block */}
      {navError && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-lg max-w-md w-full animate-fadeIn">
          <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
          <span>{navError}</span>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 z-40 md:hidden animate-fadeIn" 
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer Panel */}
          <div 
            className="fixed left-0 top-0 w-72 h-screen z-50 shadow-2xl p-6 flex flex-col justify-between animate-fadeIn text-white border-r border-white/10"
            style={{ backgroundColor: '#4e1a54' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-sm font-bold text-purple-200 uppercase tracking-wider font-['Poppins']">Navigation</span>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                  }}
                  className="p-1.5 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Close Menu"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {/* Dashboard */}
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="w-full text-left py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3"
                  style={{
                    backgroundColor: activeTab === 'dashboard' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    borderLeft: activeTab === 'dashboard' ? '4px solid #d8b4fe' : '4px solid transparent',
                    paddingLeft: activeTab === 'dashboard' ? '14px' : '16px',
                    color: '#ffffff'
                  }}
                >
                  <span>Dashboard</span>
                </button>

                {/* Events & Workshops */}
                <button
                  onClick={() => handleNavClick('events')}
                  className="w-full text-left py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3"
                  style={{
                    backgroundColor: activeTab === 'events' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    borderLeft: activeTab === 'events' ? '4px solid #d8b4fe' : '4px solid transparent',
                    paddingLeft: activeTab === 'events' ? '14px' : '16px',
                    color: '#ffffff'
                  }}
                >
                  <span>Events & Workshops</span>
                </button>

                {/* Member Projects */}
                <button
                  onClick={() => handleNavClick('projects')}
                  className="w-full text-left py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3"
                  style={{
                    backgroundColor: activeTab === 'projects' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    borderLeft: activeTab === 'projects' ? '4px solid #d8b4fe' : '4px solid transparent',
                    paddingLeft: activeTab === 'projects' ? '14px' : '16px',
                    color: '#ffffff'
                  }}
                >
                  <span>Member Projects</span>
                </button>

                {/* Opportunities */}
                <button
                  onClick={() => handleNavClick('opportunities')}
                  className="w-full text-left py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3"
                  style={{
                    backgroundColor: activeTab === 'opportunities' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    borderLeft: activeTab === 'opportunities' ? '4px solid #d8b4fe' : '4px solid transparent',
                    paddingLeft: activeTab === 'opportunities' ? '14px' : '16px',
                    color: '#ffffff'
                  }}
                >
                  <span>Opportunities</span>
                </button>

                {/* Directory */}
                <button
                  onClick={() => handleNavClick('members')}
                  className="w-full text-left py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3"
                  style={{
                    backgroundColor: activeTab === 'members' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    borderLeft: activeTab === 'members' ? '4px solid #d8b4fe' : '4px solid transparent',
                    paddingLeft: activeTab === 'members' ? '14px' : '16px',
                    color: '#ffffff'
                  }}
                >
                  <span>Member Directory</span>
                </button>

                {/* Announcements */}
                <button
                  onClick={() => handleNavClick('announcements')}
                  className="w-full text-left py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3"
                  style={{
                    backgroundColor: activeTab === 'announcements' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    borderLeft: activeTab === 'announcements' ? '4px solid #d8b4fe' : '4px solid transparent',
                    paddingLeft: activeTab === 'announcements' ? '14px' : '16px',
                    color: '#ffffff'
                  }}
                >
                  <span>Announcements</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              {user ? (
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-white/10 hover:bg-rose-500/20 text-rose-200 hover:text-rose-100 rounded-xl border border-white/10 text-xs font-semibold transition-all"
                >
                  Log Out
                </button>
              ) : (
                <button
                  onClick={() => handleNavClick('auth')}
                  className="w-full py-2.5 bg-white text-[#622569] font-bold text-xs hover:bg-purple-50 rounded-xl transition-all shadow"
                >
                  Access Portal
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};
