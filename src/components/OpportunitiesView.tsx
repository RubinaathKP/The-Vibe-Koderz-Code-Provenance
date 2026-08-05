import React, { useState } from 'react';
import { Opportunity, User } from '../types';
import { Briefcase, MapPin, DollarSign, Calendar, ExternalLink, PlusCircle, Search, Sparkles, X, CheckCircle, Tag, Building2 } from 'lucide-react';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  user: User | null;
  onCreateOpportunity: (oppData: Partial<Opportunity>) => Promise<boolean>;
  searchQuery: string;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  user,
  onCreateOpportunity,
  searchQuery,
}) => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedTimeline, setSelectedTimeline] = useState<'all' | 'present' | 'past' | 'future'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeOppModal, setActiveOppModal] = useState<Opportunity | null>(null);

  // New Opportunity Form State
  const [newOppData, setNewOppData] = useState({
    title: '',
    companyOrOrg: '',
    type: 'Internship' as Opportunity['type'],
    location: 'Remote',
    stipendOrSalary: '',
    deadline: '',
    description: '',
    applyUrl: '',
    requirementsStr: '',
    tagsStr: '',
    logoUrl: '',
    bannerUrl: '',
    status: 'Open' as 'Open' | 'Closed' | 'Upcoming',
    timeline: 'present' as 'past' | 'present' | 'future',
  });

  const types = ['All', 'Internship', 'Scholarship', 'Research Grant', 'Mentorship', 'Career Fair'];
  const timelines: { id: 'all' | 'present' | 'past' | 'future'; label: string }[] = [
    { id: 'all', label: 'All Opportunities' },
    { id: 'present', label: 'Open Now (Present)' },
    { id: 'future', label: 'Upcoming Applications (Future)' },
    { id: 'past', label: 'Past & Archived (Past)' },
  ];

  const filteredOpps = opportunities.filter((opp) => {
    const matchesType = selectedType === 'All' || opp.type === selectedType;
    const oppTime = opp.timeline || (opp.status === 'Closed' ? 'past' : opp.status === 'Upcoming' ? 'future' : 'present');
    const matchesTimeline = selectedTimeline === 'all' || oppTime === selectedTimeline;
    const matchesSearch =
      !searchQuery ||
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.companyOrOrg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesTimeline && matchesSearch;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOppData.title || !newOppData.companyOrOrg || !newOppData.description || !newOppData.applyUrl) return;

    const requirements = newOppData.requirementsStr
      ? newOppData.requirementsStr.split('\n').map(s => s.trim()).filter(Boolean)
      : ['Active IET student member', 'Enrolled in STEM / Engineering degree'];

    const tags = newOppData.tagsStr
      ? newOppData.tagsStr.split(',').map(s => s.trim()).filter(Boolean)
      : ['IET', newOppData.type];

    const ok = await onCreateOpportunity({
      ...newOppData,
      requirements,
      tags,
    });

    if (ok) {
      setShowCreateModal(false);
      setNewOppData({
        title: '',
        companyOrOrg: '',
        type: 'Internship',
        location: 'Remote',
        stipendOrSalary: '',
        deadline: '',
        description: '',
        applyUrl: '',
        requirementsStr: '',
        tagsStr: '',
        logoUrl: '',
        bannerUrl: '',
        status: 'Open',
        timeline: 'present',
      });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Poppins']">Career & Academic Opportunities</h1>
          <p className="text-xs text-slate-500 mt-1">Explore scholarships, internships, research grants, and mentorship programs for IET CONNECT members</p>
        </div>

        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-[#622569] hover:bg-[#9b51e0] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Opportunity</span>
          </button>
        )}
      </div>

      {/* Timeline & Category Filter Pills */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-2xl">
          {timelines.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTimeline(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedTimeline === t.id
                  ? 'bg-[#622569] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedType === t
                  ? 'bg-purple-100 text-[#622569] border border-purple-300'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOpps.map((opp, idx) => {
          const oppTime = opp.timeline || (opp.status === 'Closed' ? 'past' : opp.status === 'Upcoming' ? 'future' : 'present');

          return (
            <div
              key={opp.id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Banner with Logo Overlay */}
                <div className="h-40 relative overflow-hidden bg-slate-900">
                  <img
                    src={opp.bannerUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80'}
                    alt={opp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-white/90 backdrop-blur-md text-[#622569] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {opp.type}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md ${
                      oppTime === 'present'
                        ? 'bg-emerald-500 text-slate-950 font-extrabold'
                        : oppTime === 'past'
                        ? 'bg-slate-700/90 text-slate-200'
                        : 'bg-purple-600/90 text-white'
                    }`}>
                      {oppTime === 'present' ? '✨ Open Now' : oppTime === 'past' ? '📁 Closed Archive' : '🌟 Upcoming'}
                    </span>
                  </div>

                  {opp.logoUrl && (
                    <div className="absolute bottom-3 left-4 w-12 h-12 rounded-xl bg-white p-1 shadow-lg border border-slate-100 flex items-center justify-center overflow-hidden">
                      <img src={opp.logoUrl} alt={opp.companyOrOrg} className="w-full h-full object-cover rounded-lg" />
                    </div>
                  )}

                  <div className="absolute bottom-3 right-4 text-right">
                    <p className="text-[11px] font-bold text-white tracking-wide">{opp.companyOrOrg}</p>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 space-y-3">
                  <h3
                    onClick={() => setActiveOppModal(opp)}
                    className="font-bold text-slate-900 text-base leading-snug font-['Poppins'] hover:text-[#622569] cursor-pointer line-clamp-2"
                  >
                    {opp.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>{opp.location}</span>
                    </div>
                    {opp.stipendOrSalary && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-800">{opp.stipendOrSalary}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Deadline: <strong>{opp.deadline}</strong></span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">
                    {opp.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-2">
                    {opp.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="p-5 pt-0 border-t border-slate-100/80 flex items-center justify-between gap-3 mt-4">
                <button
                  onClick={() => setActiveOppModal(opp)}
                  className="py-2 px-3.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  View Details
                </button>

                {oppTime === 'present' ? (
                  <a
                    href={opp.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-4 rounded-xl text-xs font-bold bg-[#622569] hover:bg-[#9b51e0] text-white shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span>Apply Now</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs font-semibold text-slate-400 italic">
                    {oppTime === 'past' ? 'Applications Closed' : 'Opens Soon'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredOpps.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No opportunities match the filters</h3>
          <p className="text-xs text-slate-500 mt-1">Try switching to "All Timeline" or choosing a different category.</p>
        </div>
      )}

      {/* OPPORTUNITY DETAILS MODAL */}
      {activeOppModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveOppModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              {activeOppModal.logoUrl && (
                <img src={activeOppModal.logoUrl} alt="" className="w-14 h-14 rounded-2xl border border-slate-200 object-cover" />
              )}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#622569] bg-purple-100 px-2.5 py-0.5 rounded-full">
                  {activeOppModal.type}
                </span>
                <h2 className="text-xl font-bold text-slate-900 font-['Poppins'] mt-1">{activeOppModal.title}</h2>
                <p className="text-xs font-semibold text-slate-500">{activeOppModal.companyOrOrg}</p>
              </div>
            </div>

            <div className="h-44 rounded-2xl overflow-hidden relative border border-slate-200">
              <img src={activeOppModal.bannerUrl} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div>
                <p className="text-slate-500">Location</p>
                <p className="font-bold text-slate-800">{activeOppModal.location}</p>
              </div>
              <div>
                <p className="text-slate-500">Stipend / Support</p>
                <p className="font-bold text-emerald-700">{activeOppModal.stipendOrSalary || 'Competitive'}</p>
              </div>
              <div>
                <p className="text-slate-500">Application Deadline</p>
                <p className="font-bold text-slate-800">{activeOppModal.deadline}</p>
              </div>
              <div>
                <p className="text-slate-500">Status</p>
                <p className="font-bold text-purple-700">{activeOppModal.status || 'Open'}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Description</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{activeOppModal.description}</p>
            </div>

            {activeOppModal.requirements && activeOppModal.requirements.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Eligibility & Requirements</h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {activeOppModal.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveOppModal(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Close
              </button>

              {(activeOppModal.timeline === 'present' || activeOppModal.status === 'Open') && (
                <a
                  href={activeOppModal.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#622569] hover:bg-[#9b51e0] shadow-sm flex items-center gap-1.5"
                >
                  <span>Go to Application Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE OPPORTUNITY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 font-['Poppins']">Post an Opportunity</h2>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Opportunity Title *</label>
                <input
                  type="text"
                  required
                  value={newOppData.title}
                  onChange={(e) => setNewOppData({ ...newOppData, title: e.target.value })}
                  placeholder="e.g. Embedded Firmware Engineering Intern"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#9b51e0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Organization / Sponsor *</label>
                  <input
                    type="text"
                    required
                    value={newOppData.companyOrOrg}
                    onChange={(e) => setNewOppData({ ...newOppData, companyOrOrg: e.target.value })}
                    placeholder="e.g. Siemens Tech Labs / IET Foundation"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={newOppData.type}
                    onChange={(e) => setNewOppData({ ...newOppData, type: e.target.value as Opportunity['type'] })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none"
                  >
                    <option value="Internship">Internship</option>
                    <option value="Scholarship">Scholarship</option>
                    <option value="Research Grant">Research Grant</option>
                    <option value="Mentorship">Mentorship</option>
                    <option value="Career Fair">Career Fair</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newOppData.location}
                    onChange={(e) => setNewOppData({ ...newOppData, location: e.target.value })}
                    placeholder="Remote / Bangalore"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stipend / Award</label>
                  <input
                    type="text"
                    value={newOppData.stipendOrSalary}
                    onChange={(e) => setNewOppData({ ...newOppData, stipendOrSalary: e.target.value })}
                    placeholder="$3,000 / Paid Internship"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={newOppData.deadline}
                    onChange={(e) => setNewOppData({ ...newOppData, deadline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Timeline</label>
                  <select
                    value={newOppData.timeline}
                    onChange={(e) => setNewOppData({ ...newOppData, timeline: e.target.value as 'past' | 'present' | 'future' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none"
                  >
                    <option value="present">Open Now (Present)</option>
                    <option value="future">Upcoming (Future)</option>
                    <option value="past">Past & Archived (Past)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Apply URL *</label>
                <input
                  type="url"
                  required
                  value={newOppData.applyUrl}
                  onChange={(e) => setNewOppData({ ...newOppData, applyUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none"
                  />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Logo URL</label>
                  <input
                    type="url"
                    value={newOppData.logoUrl}
                    onChange={(e) => setNewOppData({ ...newOppData, logoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Banner Image URL</label>
                  <input
                    type="url"
                    value={newOppData.bannerUrl}
                    onChange={(e) => setNewOppData({ ...newOppData, bannerUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={newOppData.description}
                  onChange={(e) => setNewOppData({ ...newOppData, description: e.target.value })}
                  placeholder="Explain the role, scope, and scholarship benefits..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requirements (one per line)</label>
                <textarea
                  rows={2}
                  value={newOppData.requirementsStr}
                  onChange={(e) => setNewOppData({ ...newOppData, requirementsStr: e.target.value })}
                  placeholder="Active IET student member&#10;Good academic standing"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#622569] hover:bg-[#9b51e0] shadow-sm"
                >
                  Post Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
