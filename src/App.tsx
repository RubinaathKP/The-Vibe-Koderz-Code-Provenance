import React, { useState, useEffect } from 'react';
import { User, Event, Project, Announcement, Opportunity, Resource } from './types';
import { api, removeStoredToken, getCookie, setCookie } from './api';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthView } from './components/AuthView';
import { DashboardView } from './components/DashboardView';
import { ProfileView } from './components/ProfileView';
import { EventsView } from './components/EventsView';
import { ProjectsView } from './components/ProjectsView';
import { OpportunitiesView } from './components/OpportunitiesView';
import { ResourcesView } from './components/ResourcesView';
import { MembersView } from './components/MembersView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { CheckCircle, AlertCircle, Loader2, Award, LogOut, X, LayoutDashboard, Calendar, FolderGit2, Users, Briefcase, BookOpen, Megaphone, User as UserIcon } from 'lucide-react';


export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data state from Express backend
  const [events, setEvents] = useState<Event[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch initial data
  const loadAppData = async () => {
    try {
      const [summary, memRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getMembers()
      ]);

      setEvents(summary.events);
      setProjects(summary.projects);
      setAnnouncements(summary.announcements);
      setOpportunities(summary.opportunities);
      setResources(summary.resources);

      if (memRes.success) setMembers(memRes.members);
    } catch (err) {
      console.error('Failed to load portal data from backend', err);
    }
  };


  // Check auth on boot
  useEffect(() => {
    const initAuth = async () => {
      try {
        const meRes = await api.getMe();
        if (meRes.success && meRes.user) {
          setCurrentUser(meRes.user);
        }
      } catch (err) {
        console.warn('No active auth session', err);
      } finally {
        setAuthChecking(false);
      }
    };

    // Initialize theme from storage
    const storedTheme = getCookie('theme');
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (storedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }

    initAuth();
    loadAppData();
  }, []);

  // Reset search query whenever tab changes
  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
    showToast(`Welcome to IET CONNECT, ${user.username}!`);
    loadAppData();
  };

  const handleLogout = () => {
    removeStoredToken();
    setCurrentUser(null);
    setActiveTab('auth');
    showToast('Signed out successfully.');
  };

  // Event Registration Handler
  const handleRegisterEvent = async (eventId: string) => {
    if (!currentUser) {
      setActiveTab('auth');
      showToast('Please sign in to register for events.', 'error');
      return;
    }

    const event = events.find(e => e.id === eventId);
    if (event) {
      if (event.registeredUserIds.includes(currentUser.id)) {
        showToast('You are already registered for this event.', 'error');
        alert('Registration Error: You are already registered for this event.');
        return;
      }
      if (event.registeredUserIds.length >= event.maxCapacity) {
        showToast('This event is already full.', 'error');
        alert('Registration Error: This event is already full.');
        return;
      }
    }

    try {
      const res = await api.registerEvent(eventId);
      if (res.success && res.event) {
        setEvents(events.map(e => e.id === eventId ? res.event! : e));
        showToast(res.message || 'Event status updated!');
      } else {
        showToast(res.message || 'Action failed', 'error');
      }
    } catch {
      showToast('Error communicating with backend server', 'error');
    }
  };

  // Like Project Handler
  const handleLikeProject = async (projectId: string) => {
    if (!currentUser) {
      setActiveTab('auth');
      showToast('Please sign in to star projects.', 'error');
      return;
    }

    try {
      const res = await api.toggleLikeProject(projectId);
      if (res.success && res.project) {
        setProjects(projects.map(p => p.id === projectId ? res.project! : p));
      }
    } catch {
      showToast('Error liking project', 'error');
    }
  };

  // Submit Project Handler
  const handleSubmitProject = async (projectData: Partial<Project>): Promise<boolean> => {
    try {
      const res = await api.submitProject(projectData);
      if (res.success && res.project) {
        setProjects([res.project, ...projects]);
        showToast('Project submitted to showcase!');
        return true;
      } else {
        showToast(res.message || 'Submission failed', 'error');
        return false;
      }
    } catch {
      showToast('Error submitting project', 'error');
      return false;
    }
  };

  // Create Event Handler
  const handleCreateEvent = async (eventData: Partial<Event>): Promise<boolean> => {
    try {
      const res = await api.createEvent(eventData);
      if (res.success && res.event) {
        setEvents([res.event, ...events]);
        showToast('Event hosted successfully!');
        return true;
      } else {
        showToast(res.message || 'Failed to create event', 'error');
        return false;
      }
    } catch {
      showToast('Server error creating event', 'error');
      return false;
    }
  };

  // Create Opportunity Handler
  const handleCreateOpportunity = async (oppData: Partial<Opportunity>): Promise<boolean> => {
    try {
      const res = await api.createOpportunity(oppData);
      if (res.success && res.opportunity) {
        setOpportunities([res.opportunity, ...opportunities]);
        showToast('Opportunity posted successfully!');
        return true;
      } else {
        showToast(res.message || 'Failed to post opportunity', 'error');
        return false;
      }
    } catch {
      showToast('Server error posting opportunity', 'error');
      return false;
    }
  };

  // Create Resource Handler
  const handleCreateResource = async (resData: Partial<Resource>): Promise<boolean> => {
    try {
      const res = await api.createResource(resData);
      if (res.success && res.resource) {
        setResources([res.resource, ...resources]);
        showToast('Resource shared successfully!');
        return true;
      } else {
        showToast(res.message || 'Failed to share resource', 'error');
        return false;
      }
    } catch {
      showToast('Server error sharing resource', 'error');
      return false;
    }
  };


  // Update Profile Handler
  const handleUpdateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    try {
      const res = await api.updateProfile(profileData);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        showToast('Profile updated successfully!');
        loadAppData();
        return true;
      } else {
        showToast(res.message || 'Profile update failed', 'error');
        return false;
      }
    } catch {
      showToast('Error updating profile', 'error');
      return false;
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="w-8 h-8 text-[#9b51e0] animate-spin mb-3" />
        <p className="text-sm font-semibold tracking-wide font-['Poppins']">Connecting to IET Portal Backend...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans overflow-x-hidden">
      
      {/* Navbar */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Body */}
      <div className="flex flex-1 relative">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={currentUser}
          onLogout={handleLogout}
        />

        {/* Content Pane */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'auth' && (
            <AuthView onAuthSuccess={handleAuthSuccess} />
          )}

          {activeTab === 'dashboard' && (
            currentUser ? (
              <DashboardView
                user={currentUser}
                events={events}
                projects={projects}
                announcements={announcements}
                setActiveTab={setActiveTab}
                onRegisterEvent={handleRegisterEvent}
                onLikeProject={handleLikeProject}
                searchQuery={searchQuery}
              />
            ) : (
              <AuthView onAuthSuccess={handleAuthSuccess} />
            )
          )}

          {activeTab === 'events' && (
            <EventsView
              events={events}
              user={currentUser}
              onRegisterEvent={handleRegisterEvent}
              onCreateEvent={handleCreateEvent}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              projects={projects}
              user={currentUser}
              onLikeProject={handleLikeProject}
              onSubmitProject={handleSubmitProject}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'opportunities' && (
            <OpportunitiesView
              opportunities={opportunities}
              user={currentUser}
              onCreateOpportunity={handleCreateOpportunity}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'resources' && (
            <ResourcesView
              resources={resources}
              user={currentUser}
              onCreateResource={handleCreateResource}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'members' && (

            <MembersView
              members={members}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'announcements' && (
            <AnnouncementsView
              announcements={announcements}
            />
          )}

          {activeTab === 'profile' && (
            currentUser ? (
              <ProfileView
                user={currentUser}
                onUpdateProfile={handleUpdateProfile}
              />
            ) : (
              <AuthView onAuthSuccess={handleAuthSuccess} />
            )
          )}
        </main>
      </div>

      {/* Toast Notification Popup */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-slideUp">
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm md:hidden animate-fadeIn" 
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="absolute left-0 top-0 bottom-0 w-72 bg-[#622569] h-full shadow-2xl border-r-4 border-black p-5 flex flex-col justify-between animate-slideRight"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Header inside drawer with close button */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">Navigation Menu</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg"
                  title="Close Menu"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Chapter Info Badge */}
              <div className="bg-white/10 rounded-xl p-3.5 border border-white/10 backdrop-blur-sm text-white">
                <div className="flex items-center gap-2 text-purple-200 text-xs font-medium mb-1">
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>IET Student Chapter</span>
                </div>
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser ? currentUser.institution : 'Connect & Collaborate'}
                </p>
                {currentUser && (
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-purple-200">
                    <span>Points: <strong className="text-white font-bold">{currentUser.points || 100}</strong></span>
                    <span className="capitalize px-2 py-0.5 rounded bg-white/20 text-white text-[9px] font-medium">{currentUser.role}</span>
                  </div>
                )}
              </div>

              {/* Navigation list */}
              <nav className="space-y-1.5">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'events', label: 'Events & Workshops', icon: Calendar },
                  { id: 'projects', label: 'Member Projects', icon: FolderGit2 },
                  { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
                  { id: 'resources', label: 'Learning Resources', icon: BookOpen },
                  { id: 'members', label: 'Member Directory', icon: Users },
                  { id: 'announcements', label: 'Announcements', icon: Megaphone },
                  { id: 'profile', label: 'My Profile', icon: UserIcon },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-medium transition-all text-left ${
                        isActive
                          ? 'bg-white text-[#622569] font-bold shadow-md shadow-black/10'
                          : 'text-purple-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#622569]' : 'text-purple-200'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Logout/Footer */}
            <div className="pt-4 border-t border-white/10">
              {currentUser ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-rose-200 hover:text-rose-100 border border-white/10 text-xs font-semibold transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out Account</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setActiveTab('auth');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-white text-[#622569] font-bold text-xs hover:bg-purple-50 transition-colors shadow"
                >
                  Sign In to Portal
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
