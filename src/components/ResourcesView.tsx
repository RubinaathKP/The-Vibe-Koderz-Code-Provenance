import React, { useState } from 'react';
import { Resource, User } from '../types';
import { BookOpen, Download, PlusCircle, X, Search, Sparkles } from 'lucide-react';

interface ResourcesViewProps {
  resources: Resource[];
  user: User | null;
  onCreateResource: (resData: Partial<Resource>) => Promise<boolean>;
  searchQuery: string;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  user,
  onCreateResource,
  searchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTimeline, setSelectedTimeline] = useState<'all' | 'present' | 'past' | 'future'>('all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeResModal, setActiveResModal] = useState<Resource | null>(null);

  // New Resource Form State
  const [newResData, setNewResData] = useState({
    title: '',
    description: '',
    category: 'Engineering & Tech' as Resource['category'],
    type: 'E-Book' as Resource['type'],
    authorOrProvider: '',
    url: '',
    thumbnailUrl: '',
    level: 'All Levels' as Resource['level'],
    tagsStr: '',
    timeline: 'present' as 'past' | 'present' | 'future',
  });

  const categories = ['All', 'Engineering & Tech', 'Academic & Research', 'Career & Skill', 'IET Standards', 'Project Templates'];
  const timelines: { id: 'all' | 'present' | 'past' | 'future'; label: string }[] = [
    { id: 'all', label: 'All Resources' },
    { id: 'present', label: 'Current Library (Present)' },
    { id: 'past', label: 'Historical & Classics (Past)' },
    { id: 'future', label: 'Upcoming Guides (Future)' },
  ];

  const filteredResources = resources.filter((res) => {
    const matchesCat = selectedCategory === 'All' || res.category === selectedCategory;
    const resTime = res.timeline || 'present';
    const matchesTimeline = selectedTimeline === 'all' || resTime === selectedTimeline;
    const matchesSearch =
      !searchQuery ||
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.authorOrProvider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesTimeline && matchesSearch;
  });

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResData.title || !newResData.description || !newResData.url) return;

    const tags = newResData.tagsStr
      ? newResData.tagsStr.split(',').map(s => s.trim()).filter(Boolean)
      : [newResData.category, newResData.type];

    const ok = await onCreateResource({
      ...newResData,
      authorOrProvider: newResData.authorOrProvider || (user ? user.username : 'IET Member'),
      tags,
    });

    if (ok) {
      setShowShareModal(false);
      setNewResData({
        title: '',
        description: '',
        category: 'Engineering & Tech',
        type: 'E-Book',
        authorOrProvider: '',
        url: '',
        thumbnailUrl: '',
        level: 'All Levels',
        tagsStr: '',
        timeline: 'present',
      });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Poppins']">Engineering & Learning Resources</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access study guides, code repos, and engineering tutorials published by members.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2.5 bg-[#622569] hover:bg-[#9b51e0] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Share Resource</span>
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
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-100 text-[#622569] border border-purple-300'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => {
          const resTime = res.timeline || 'present';
          return (
            <div
              key={res.id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#622569] bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {res.category}
                  </span>
                  <span className="text-xs text-slate-400 font-sans">{res.date}</span>
                </div>

                <div className="space-y-1.5">
                  <h3
                    onClick={() => setActiveResModal(res)}
                    className="font-bold text-slate-900 text-base leading-snug font-['Poppins'] hover:text-[#622569] cursor-pointer line-clamp-2"
                  >
                    {res.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{res.description}</p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500 mt-4">
                <span>By <strong className="text-slate-700 font-medium">{res.authorOrProvider}</strong></span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveResModal(res)}
                    className="py-1.5 px-3 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Details
                  </button>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-[#622569] hover:bg-[#9b51e0] transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Access</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 text-center text-sm text-slate-500">
          <p className="font-semibold uppercase">No resources match the selected criteria</p>
        </div>
      )}

      {/* RESOURCE DETAILS MODAL */}
      {activeResModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto font-sans">
            <button
              onClick={() => setActiveResModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#622569] bg-purple-100 px-3 py-1 rounded-full">
                {activeResModal.category}
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-['Poppins'] mt-2">{activeResModal.title}</h2>
              <p className="text-xs font-semibold text-slate-500 mt-1">Uploaded by {activeResModal.authorOrProvider}</p>
            </div>

            {activeResModal.thumbnailUrl && (
              <div className="h-40 rounded-2xl overflow-hidden relative border border-slate-100 my-4 shadow-sm">
                <img src={activeResModal.thumbnailUrl} alt={activeResModal.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-['Poppins']">Overview</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{activeResModal.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div>
                <p className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Resource Type</p>
                <p className="font-bold text-slate-800 mt-0.5">{activeResModal.type}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Level Scope</p>
                <p className="font-bold text-slate-800 mt-0.5">{activeResModal.level}</p>
              </div>
            </div>

            {activeResModal.tags && activeResModal.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {activeResModal.tags.map((tag, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2.5 py-1 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveResModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Close
              </button>

              <button
                onClick={() => window.open(activeResModal.url, '_blank')}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#622569] hover:bg-[#9b51e0] shadow"
              >
                Access Resource Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE RESOURCE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 relative shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto font-sans">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 uppercase font-['Poppins']">
              Share a Learning Resource
            </h2>

            <form onSubmit={handleShareSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Resource Title *</label>
                  <input
                    type="text"
                    required
                    value={newResData.title}
                    onChange={(e) => setNewResData({ ...newResData, title: e.target.value })}
                    placeholder="e.g. Intro to Digital Signal Processing Notes"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
                  <select
                    value={newResData.category}
                    onChange={(e) => setNewResData({ ...newResData, category: e.target.value as Resource['category'] })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                  >
                    <option value="Engineering & Tech">Engineering & Tech</option>
                    <option value="Academic & Research">Academic & Research</option>
                    <option value="Career & Skill">Career & Skill</option>
                    <option value="IET Standards">IET Standards</option>
                    <option value="Project Templates">Project Templates</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Resource Type</label>
                  <select
                    value={newResData.type}
                    onChange={(e) => setNewResData({ ...newResData, type: e.target.value as Resource['type'] })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                  >
                    <option value="E-Book">E-Book</option>
                    <option value="Video Course">Video Course</option>
                    <option value="Research Paper">Research Paper</option>
                    <option value="Template">Template</option>
                    <option value="Kit">Kit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Author / Provider</label>
                  <input
                    type="text"
                    value={newResData.authorOrProvider}
                    onChange={(e) => setNewResData({ ...newResData, authorOrProvider: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Level</label>
                  <select
                    value={newResData.level}
                    onChange={(e) => setNewResData({ ...newResData, level: e.target.value as Resource['level'] })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                  >
                    <option value="All Levels">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced / Research">Advanced / Research</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Resource Link *</label>
                  <input
                    type="url"
                    required
                    value={newResData.url}
                    onChange={(e) => setNewResData({ ...newResData, url: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Short Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={newResData.description}
                    onChange={(e) => setNewResData({ ...newResData, description: e.target.value })}
                    placeholder="Outline what this resource contains..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#622569] hover:bg-[#9b51e0] rounded-xl transition-all shadow"
                >
                  Publish Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
