import React, { useState } from 'react';
import { User } from '../types';
import { Mail, Phone, MapPin, Building, Calendar, Edit3, Github, Linkedin, ShieldCheck, Sparkles, X } from 'lucide-react';
import { PhoneInput } from './PhoneInput';

interface ProfileViewProps {
  user: User;
  onUpdateProfile: (updatedData: Partial<User>) => Promise<boolean>;
}

const AVATAR_OPTIONS = [
  { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', label: 'Sarah (Leader)' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', label: 'Alex (Software)' },
  { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', label: 'Elena (Research)' },
  { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', label: 'Marcus (IoT)' },
  { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80', label: 'Julia (Network)' }
];

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: user.username,
    phone: user.phone || '',
    gender: user.gender || 'Male',
    dob: user.dob || '',
    city: user.city || '',
    institution: user.institution || '',
    bio: user.bio || '',
    githubUrl: user.githubUrl || '',
    linkedinUrl: user.linkedinUrl || '',
    avatarUrl: user.avatarUrl || AVATAR_OPTIONS[0].url,
    skills: user.skills || [],
    interests: user.interests || [],
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid) {
      setErrorMsg('Please enter a valid phone number according to the selected country format.');
      return;
    }
    setErrorMsg(null);
    setSaving(true);
    const success = await onUpdateProfile(formData);
    setSaving(false);
    if (success) {
      setIsEditing(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn font-sans">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* Cover Banner */}
        <div className="h-44 bg-gradient-to-r from-[#622569] via-purple-700 to-[#9b51e0] relative">
          <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>MEMBER RECORD VERIFIED</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-8 relative pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 -mt-20 mb-6">
            <div className="flex items-end gap-6">
              <img
                src={formData.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={user.username}
                className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-md bg-white shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-slate-900 font-['Poppins'] tracking-tight">{user.username}</h1>
                  {user.role === 'lead' && (
                    <span className="bg-purple-100 text-[#622569] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Chapter Lead
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-1">{user.institution}</p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setErrorMsg(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#622569] hover:bg-[#9b51e0] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* EDIT FORM or READ-ONLY VIEW */}
          {isEditing ? (
            <form 
              onSubmit={handleSave} 
              className="space-y-6 pt-4 border-t border-slate-100"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Professional Avatar Picker Grid */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">Choose Professional Avatar Portrait</label>
                  <div className="grid grid-cols-5 gap-3 max-w-lg">
                    {AVATAR_OPTIONS.map((opt) => {
                      const isSelected = formData.avatarUrl === opt.url;
                      return (
                        <div
                          key={opt.url}
                          onClick={() => setFormData({ ...formData, avatarUrl: opt.url })}
                          className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all aspect-square relative ${
                            isSelected ? 'border-[#622569] scale-105 shadow-md' : 'border-slate-200 hover:border-slate-300'
                          }`}
                          title={opt.label}
                        >
                          <img src={opt.url} alt={opt.label} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-[#622569]/10 flex items-center justify-center">
                              <span className="bg-[#622569] text-white p-0.5 rounded-full text-[8px] font-bold">✓</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
                  <PhoneInput
                    value={formData.phone}
                    onChange={(val) => setFormData({ ...formData, phone: val })}
                    onValidate={setIsPhoneValid}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Institution</label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bio / Statement</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Describe your technical focus or research interests..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">GitHub URL</label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                  />
                </div>

                {/* Skills Tag Management */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Skills</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="e.g. Python, React, IoT"
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none grow"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2 bg-[#622569] hover:bg-[#9b51e0] text-white text-xs font-bold rounded-xl transition-all"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.skills.map((s) => (
                      <span key={s} className="px-2.5 py-1 bg-purple-100 text-[#622569] text-xs font-semibold rounded-lg flex items-center gap-1">
                        {s}
                        <X className="w-3.5 h-3.5 cursor-pointer text-[#622569]/80 hover:text-[#622569]" onClick={() => removeSkill(s)} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#622569] hover:bg-[#9b51e0] rounded-xl transition-all shadow"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          ) : (
            /* READ ONLY VIEW */
            <div className="space-y-6 pt-4 border-t border-slate-100">
              {/* Bio Statement */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">About Member</h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {user.bio || 'No bio provided yet.'}
                </p>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Mail className="w-3.5 h-3.5 text-purple-600" />
                    <span>Email Address</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{user.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Phone className="w-3.5 h-3.5 text-purple-600" />
                    <span>Phone Number</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{user.phone || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    <span>Date of Birth & Gender</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{user.dob || 'N/A'} • {user.gender || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-purple-600" />
                    <span>City</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{user.city || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1 md:col-span-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Building className="w-3.5 h-3.5 text-purple-600" />
                    <span>Institution</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{user.institution}</p>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((s) => (
                      <span key={s} className="px-3 py-1 bg-purple-100 text-[#622569] text-xs font-semibold rounded-lg">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No skills listed yet</span>
                  )}
                </div>
              </div>

              {/* Social Connections */}
              <div className="pt-4 border-t border-slate-100 flex gap-4">
                {user.githubUrl && (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-[#622569]"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub Profile</span>
                  </a>
                )}
                {user.linkedinUrl && (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-[#622569]"
                  >
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <span>LinkedIn Profile</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
