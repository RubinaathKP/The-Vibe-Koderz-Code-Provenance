import React from 'react';
import { User, Event, Project, Announcement } from '../types';
import { Calendar, FolderGit2, Award, ArrowUpRight, Megaphone, CheckCircle2, Sparkles, MapPin, Clock, Briefcase, BookOpen, ShieldCheck, Mail, Phone, MapPinIcon } from 'lucide-react';

interface DashboardViewProps {
  user: User;
  events: Event[];
  projects: Project[];
  announcements: Announcement[];
  setActiveTab: (tab: string) => void;
  onRegisterEvent: (eventId: string) => void;
  onLikeProject: (projectId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  events,
  projects,
  announcements,
  setActiveTab,
  onRegisterEvent,
  onLikeProject,
}) => {
  const registeredEvents = events.filter(e => e.registeredUserIds.includes(user.id));
  const userProjects = projects.filter(p => p.authorId === user.id);
  const upcomingEvents = events.slice(0, 3);
  const featuredProjects = projects.slice(0, 2);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto p-1 font-sans">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#622569] to-[#9b51e0] p-8 text-white shadow-md border-0 w-full">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-bold text-purple-100 mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            <span>MEMBER PORTAL ACTIVE</span>
          </div>
          
          <h1 className="text-3xl font-bold font-['Poppins'] tracking-tight">
            Welcome back, {user.username}!
          </h1>
          <p className="text-purple-100 text-sm mt-2 font-medium max-w-xl">
            You are connected as an active member of <strong className="text-white underline">{user.institution}</strong>.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveTab('events')}
              className="px-4 py-2 bg-white/15 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/10 shadow-sm transition-all flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5 text-purple-200" />
              <span>Explore Events</span>
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className="px-4 py-2 bg-white/15 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/10 shadow-sm transition-all flex items-center gap-2"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-purple-200" />
              <span>Member Projects</span>
            </button>
            <button
              onClick={() => setActiveTab('opportunities')}
              className="px-4 py-2 bg-white/15 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/10 shadow-sm transition-all flex items-center gap-2"
            >
              <Briefcase className="w-3.5 h-3.5 text-purple-200" />
              <span>Opportunities</span>
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className="px-4 py-2 bg-white/15 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/10 shadow-sm transition-all flex items-center gap-2"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-200" />
              <span>Learning Hub</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase">Registered Events</p>
          <p className="text-3xl font-bold text-[#622569] mt-2">{registeredEvents.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase">Projects Published</p>
          <p className="text-3xl font-bold text-[#622569] mt-2">{userProjects.length}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase">Chapter Points</p>
          <p className="text-3xl font-bold text-[#622569] mt-2">{user.points || 100} PTS</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase">Membership Role</p>
          <p className="text-3xl font-bold text-[#622569] mt-2 capitalize">{user.role}</p>
        </div>
      </div>

      {/* Grid Section: Announcements & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Cols: Upcoming Events & Projects */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Upcoming Events Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-['Poppins']">
                  Upcoming Chapter Events
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('events')}
                className="text-xs font-bold text-[#622569] bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
              >
                <span>View All ({events.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingEvents.map((evt) => {
                const isReg = evt.registeredUserIds.includes(user.id);
                return (
                  <div key={evt.id} className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm bg-white flex flex-col justify-between hover:shadow-md transition-all">
                    <div>
                      <div className="h-28 relative overflow-hidden bg-slate-900">
                        <img src={evt.bannerUrl} alt={evt.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <span className="absolute bottom-2 right-2 bg-[#622569] text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {evt.category}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">{evt.title}</h4>
                        <div className="flex flex-col gap-1 text-xs text-slate-500 font-sans">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#622569] shrink-0" />
                            <span>{evt.date} • {evt.time}</span>
                          </span>
                        </div>
                      </div>
                    </div>
 
                    <div className="p-4 pt-0">
                      <button
                        onClick={() => onRegisterEvent(evt.id)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                          isReg
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-[#622569] hover:bg-[#9b51e0] border-transparent text-white shadow-sm'
                        }`}
                      >
                        {isReg ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Registered</span>
                          </>
                        ) : (
                          <span>Register</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
 
          {/* Featured Projects Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-['Poppins']">
                  Member Innovation Showcase
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs font-bold text-[#622569] bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
              >
                <span>View All ({projects.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredProjects.map((proj) => {
                const isLiked = proj.likedByUserIds.includes(user.id);
                return (
                  <div key={proj.id} className="p-4 rounded-2xl border border-slate-200/80 bg-white flex flex-col justify-between space-y-3 hover:shadow-md transition-all">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-[#622569] bg-purple-50 px-2 py-0.5 rounded-md">
                          {proj.domain}
                        </span>
                        <button
                          onClick={() => onLikeProject(proj.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 border transition-all ${
                            isLiked 
                              ? 'bg-amber-100 border-amber-300 text-amber-950' 
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>★ {proj.likes} Stars</span>
                        </button>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">{proj.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{proj.tagline}</p>
                    </div>
 
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>By <strong className="text-slate-700 font-medium">{proj.authorName}</strong></span>
                      <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-[#622569] font-bold hover:underline">
                        Code Repository
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
 
        </div>
 
        {/* Right Col: Announcements & Quick Member Profile Summary */}
        <div className="space-y-6">
          
          {/* Chapter Announcements Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-2 bg-[#622569]/10 text-[#622569] rounded-xl">
                <Megaphone className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase font-['Poppins']">Official Notices</h3>
              </div>
            </div>
 
            <div className="space-y-3">
              {announcements.slice(0, 2).map((ann) => (
                <div key={ann.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-medium">
                    <span className="bg-purple-100 text-[#622569] font-bold px-2 py-0.5 rounded">
                      {ann.category}
                    </span>
                    <span className="text-slate-400">{ann.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{ann.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
 
          {/* Quick Member Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={user.username}
                className="w-12 h-12 rounded-2xl object-cover bg-slate-100 border border-slate-100 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-sm truncate">{user.username}</h4>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
 
            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-[#622569] shrink-0" />
                <span className="truncate"><strong>City:</strong> {user.city || 'Not specified'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#622569] shrink-0" />
                <span className="truncate"><strong>Phone:</strong> {user.phone || 'Not specified'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#622569] shrink-0" />
                <span className="truncate"><strong>Chapter:</strong> {user.institution}</span>
              </p>
            </div>
 
            <button
              onClick={() => setActiveTab('profile')}
              className="w-full py-2.5 bg-[#622569] hover:bg-[#9b51e0] text-white font-bold text-xs rounded-xl shadow transition-all uppercase tracking-wide"
            >
              Manage Full Profile
            </button>
          </div>
 
        </div>
 
      </div>
    </div>
  );
};
