import React, { useState } from 'react';
import { User } from '../types';
import { MapPin, Mail, Github, Linkedin } from 'lucide-react';

interface MembersViewProps {
  members: User[];
  searchQuery: string;
  user: User | null;
}

export const MembersView: React.FC<MembersViewProps> = ({ members, searchQuery, user }) => {
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
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 font-['Poppins']">Member Directory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Connect and pair program with other student engineers, researchers, and chapter leads.
        </p>
      </div>

      {/* City Filters */}
      {cities.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCity === city
                  ? 'bg-[#622569] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      )}

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <img
                  src={member.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={member.username}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                />

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                  member.role === 'lead' ? 'bg-purple-100 text-[#622569]' : 'bg-slate-100 text-slate-600'
                }`}>
                  {member.role === 'lead' ? 'Lead' : 'Member'}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base font-['Poppins'] truncate">{member.username}</h3>
                <p className="text-xs text-slate-400 font-medium truncate">{member.institution}</p>
              </div>

              <div className="space-y-2 text-xs text-slate-500 pt-3 border-t border-slate-100 font-sans">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </p>
                {member.city && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="truncate">{member.city}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Links / Points Footer */}
            <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Points: <strong className="text-[#622569] font-bold">{member.points || 50}</strong></span>

              <div className="flex items-center gap-2">
                {member.githubUrl && (
                  <a
                    href={member.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-[#622569] hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <Github className="w-4.5 h-4.5" />
                  </a>
                )}
                {member.linkedinUrl && (
                  <a
                    href={member.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-[#622569] hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <Linkedin className="w-4.5 h-4.5" />
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
