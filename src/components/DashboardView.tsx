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
  searchQuery?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  events,
  projects,
  announcements,
  setActiveTab,
  onRegisterEvent,
  onLikeProject,
  searchQuery = '',
}) => {
  const registeredEvents = events.filter(e => e.registeredUserIds.includes(user.id));
  const userProjects = projects.filter(p => p.authorId === user.id);

  const filteredEvents = events.filter(evt => {
    return !searchQuery || 
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredProjects = projects.filter(proj => {
    return !searchQuery ||
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const upcomingEvents = filteredEvents.slice(0, 3);
  const featuredProjects = filteredProjects.slice(0, 2);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#622569] p-6 sm:p-10 text-white shadow-md">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-purple-200 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>IET Student Member Portal</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold font-['Poppins'] tracking-tight">
            Welcome back, {user.username}!
          </h1>
          <p className="text-purple-100 text-sm mt-3 leading-relaxed max-w-xl">
            You are connected as an active member of <strong className="text-white">{user.institution}</strong>. Stay updated with upcoming engineering workshops, submit your projects, and network with chapter peers.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('events')}
              className="px-5 py-2.5 rounded-xl bg-white text-[#622569] hover:bg-purple-50 font-semibold text-xs shadow-sm flex items-center gap-2 transition-colors"
            >
              <Calendar className="w-4 h-4 text-[#622569]" />
              <span>Explore Events</span>
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-2 transition-colors border border-white/10"
            >
              <FolderGit2 className="w-4 h-4 text-purple-200" />
              <span>Member Projects</span>
            </button>
            <button
              onClick={() => setActiveTab('opportunities')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-2 transition-colors border border-white/10"
            >
              <Briefcase className="w-4 h-4 text-purple-200" />
              <span>Opportunities</span>
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-2 transition-colors border border-white/10"
            >
              <BookOpen className="w-4 h-4 text-purple-200" />
              <span>Learning Hub</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid Overlay - Beautiful and Clean */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Registered Events</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1 text-slate-900">{registeredEvents.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Projects Published</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1 text-slate-900">{userProjects.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Chapter Points</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1 text-slate-900">{user.points || 100}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Membership Role</p>
          <p className="text-base sm:text-lg font-bold mt-2 capitalize text-purple-950 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#622569] animate-pulse" />
            {user.role}
          </p>
        </div>
      </div>

      {/* Grid Section: Announcements & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Cols: Upcoming Events & Projects */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Upcoming Events Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-['Poppins']">
                  Upcoming Chapter Events
                </h3>
                <p className="text-xs text-slate-500 mt-1">Register for workshops, guest lectures & hackathons</p>
              </div>
              <button
                onClick={() => setActiveTab('events')}
                className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
              >
                <span>View All ({events.length})</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingEvents.map((evt) => {
                const isReg = evt.registeredUserIds.includes(user.id);
                return (
                  <div key={evt.id} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-slate-50/50 flex flex-col justify-between hover:border-purple-200/80 transition-all">
                    <div>
                      <div className="h-32 relative overflow-hidden bg-slate-900">
                        <img src={evt.bannerUrl} alt={evt.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-md text-[#622569] text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase">
                          {evt.category}
                        </span>
                      </div>
                      <div className="p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">{evt.title}</h4>
                        <div className="flex flex-col gap-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{evt.date} • {evt.time}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{evt.location}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <button
                        onClick={() => onRegisterEvent(evt.id)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm border ${
                          isReg
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-[#622569] hover:bg-[#9b51e0] border-[#622569] text-white'
                        }`}
                      >
                        {isReg ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Registered</span>
                          </>
                        ) : (
                          <span>Register Event</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Featured Projects Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-['Poppins']">
                  Member Innovation Showcase
                </h3>
                <p className="text-xs text-slate-500 mt-1">Recent projects engineered by chapter students</p>
              </div>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
              >
                <span>View All ({projects.length})</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredProjects.map((proj) => {
                const isLiked = proj.likedByUserIds.includes(user.id);
                return (
                  <div key={proj.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-purple-200 transition-all flex flex-col justify-between space-y-3 shadow-sm">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
                          {proj.domain}
                        </span>
                        <button
                          onClick={() => onLikeProject(proj.id)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 border transition-all ${
                            isLiked 
                              ? 'bg-yellow-50 border-yellow-200 text-yellow-700' 
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
                          }`}
                        >
                          <span>★ {proj.likes} Likes</span>
                        </button>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-950 line-clamp-1">{proj.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{proj.tagline}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>By <strong className="text-slate-700 font-medium">{proj.authorName}</strong></span>
                      <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-[#622569] font-semibold hover:underline">
                        Code Repository →
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
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2 bg-purple-50 text-[#622569] rounded-xl">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider">Official Notices</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">From Chapter Leadership</p>
              </div>
            </div>

            <div className="space-y-4">
              {announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${
                      ann.category === 'Important' ? 'bg-rose-50 text-rose-700' : 'bg-purple-50 text-[#622569]'
                    }`}>
                      {ann.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{ann.date}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 leading-snug">{ann.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Member Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={user.username}
                className="w-12 h-12 rounded-xl object-cover bg-slate-100 ring-2 ring-purple-100"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-sm truncate">{user.username}</h4>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              <p className="flex items-center gap-2">
                <MapPinIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate"><strong>City:</strong> {user.city || 'Not specified'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate"><strong>Phone:</strong> {user.phone || 'Not specified'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate"><strong>Chapter:</strong> {user.institution}</span>
              </p>
            </div>

            <button
              onClick={() => setActiveTab('profile')}
              className="w-full py-2.5 rounded-xl bg-[#622569] hover:bg-[#9b51e0] text-white font-bold text-xs shadow-sm transition-all"
            >
              Manage Full Profile
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
