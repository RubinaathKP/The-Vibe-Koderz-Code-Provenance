import React, { useState } from 'react';
import { User } from '../types';
import { MapPin, Mail, Github, Linkedin, ShieldCheck } from 'lucide-react';

interface MembersViewProps {
  members: User[];
  searchQuery: string;
}

export const MembersView: React.FC<MembersViewProps> = ({ members, searchQuery }) => {
  const [selectedCity, setSelectedCity] = useState<string>('All');

  const cities = ['All', ...Array.from(new Set(members.map(m => m.city).filter(Boolean)))];

  const filteredMembers = members.filter((m) => {
    const matchesCity = selectedCity === 'All' || m.city === selectedCity;
    const matchesSearch =
      !searchQuery ||
      m.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.skills && m.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCity && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Poppins']">Member Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Connect with student engineers, researchers, and chapter leads</p>
        </div>
      </div>

      {/* City Filters */}
      {cities.length > 1 && (
        <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-2xl w-max max-w-full overflow-x-auto scrollbar-none">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCity === city
                  ? 'bg-[#622569] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      )}

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <img
                  src={member.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={member.username}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                />

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  member.role === 'lead' ? 'bg-[#622569] text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {member.role === 'lead' ? 'Chapter Lead' : 'Member'}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-slate-900 text-base font-['Poppins']">{member.username}</h3>
                  {member.role === 'lead' && (
                    <ShieldCheck className="w-4 h-4 text-[#622569] shrink-0" title="Chapter Lead" />
                  )}
                </div>
                <p className="text-xs text-slate-500">{member.institution}</p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </p>
                {member.city && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>{member.city}</span>
                  </p>
                )}
              </div>

              {/* Skills */}
              {member.skills && member.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {member.skills.slice(0, 4).map((s) => (
                    <span key={s} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      #{s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Links / Points Footer */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Points: <strong className="text-slate-950 font-bold text-sm">{member.points || 50}</strong></span>

              <div className="flex items-center gap-2">
                {member.githubUrl && (
                  <a
                    href={member.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-slate-900 transition-colors p-1.5 rounded-lg hover:bg-slate-50"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {member.linkedinUrl && (
                  <a
                    href={member.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-[#0077b5] transition-colors p-1.5 rounded-lg hover:bg-slate-50"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
