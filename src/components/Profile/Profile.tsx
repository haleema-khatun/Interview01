import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Calendar, Edit2, Save, X, MapPin, Phone, Briefcase, GraduationCap, Award, Globe, Heart, Languages } from 'lucide-react';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    phone: '',
    skills: [] as string[],
    interests: [] as string[],
    languages: [] as string[],
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        phone: profile.phone || '',
        skills: profile.skills || [],
        interests: profile.interests || [],
        languages: profile.languages || [],
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        full_name: formData.full_name,
        bio: formData.bio,
        location: formData.location,
        phone: formData.phone,
        skills: formData.skills,
        interests: formData.interests,
        languages: formData.languages,
        updated_at: new Date().toISOString(),
      });

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        phone: profile.phone || '',
        skills: profile.skills || [],
        interests: profile.interests || [],
        languages: profile.languages || [],
      });
    }
    setIsEditing(false);
  };

  const handleArrayFieldChange = (field: 'skills' | 'interests' | 'languages', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Not available';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-8 transition-colors duration-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">Personal Information</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-full flex items-center justify-center mb-4 transition-colors duration-200">
                <User className="h-16 w-16 text-white" />
              </div>
              <div className="text-center lg:text-left">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                  {profile?.full_name || 'User'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center lg:justify-start space-x-1 mt-1 transition-colors duration-200">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </p>
                <p className="text-gray-500 dark:text-gray-500 flex items-center justify-center lg:justify-start space-x-1 mt-1 transition-colors duration-200">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(profile?.created_at)}</span>
                </p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    profile?.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  } transition-colors duration-200`}>
                    {profile?.role === 'admin' ? 'Administrator' : 'User'}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white py-2 transition-colors duration-200">{profile?.full_name || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                    <MapPin className="h-4 w-4" />
                    <span>Location</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, Country"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white py-2 transition-colors duration-200">{profile?.location || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white py-2 transition-colors duration-200">{profile?.phone || 'Not set'}</p>
                  )}
                </div>
              </div>

              {/* Bio Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2 transition-colors duration-200">{profile?.bio || 'No bio added yet.'}</p>
                )}
              </div>

              {/* Skills */}
              <div>
                <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  <Briefcase className="h-4 w-4" />
                  <span>Skills</span>
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={formData.skills.join(', ')}
                      onChange={(e) => handleArrayFieldChange('skills', e.target.value)}
                      placeholder="JavaScript, React, Node.js, Python..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-200">Separate skills with commas</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {profile?.skills && profile.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm transition-colors duration-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 transition-colors duration-200">No skills added yet</p>
                    )}
                  </div>
                )}
              </div>

              {/* Interests */}
              <div>
                <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  <Heart className="h-4 w-4" />
                  <span>Interests</span>
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={formData.interests.join(', ')}
                      onChange={(e) => handleArrayFieldChange('interests', e.target.value)}
                      placeholder="Machine Learning, Web Development, Mobile Apps..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-200">Separate interests with commas</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {profile?.interests && profile.interests.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm transition-colors duration-200"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 transition-colors duration-200">No interests added yet</p>
                    )}
                  </div>
                )}
              </div>

              {/* Languages */}
              <div>
                <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  <Languages className="h-4 w-4" />
                  <span>Languages</span>
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={formData.languages.join(', ')}
                      onChange={(e) => handleArrayFieldChange('languages', e.target.value)}
                      placeholder="English, Spanish, French..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-200">Separate languages with commas</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {profile?.languages && profile.languages.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.languages.map((language, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm transition-colors duration-200"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 transition-colors duration-200">No languages added yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-200">Account Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">Email Address</label>
              <p className="text-gray-900 dark:text-white transition-colors duration-200">{user?.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-200">Email cannot be changed</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">Account Type</label>
              <p className="text-gray-900 dark:text-white capitalize transition-colors duration-200">{profile?.role || 'user'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">Member Since</label>
              <p className="text-gray-900 dark:text-white transition-colors duration-200">
                {formatDate(profile?.created_at)}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">Last Updated</label>
              <p className="text-gray-900 dark:text-white transition-colors duration-200">
                {formatDate(profile?.updated_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Profile Sections */}
        {(profile?.education && profile.education.length > 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 mt-8 transition-colors duration-200">
            <h2 className="flex items-center space-x-2 text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-200">
              <GraduationCap className="h-5 w-5" />
              <span>Education</span>
            </h2>
            <div className="space-y-4">
              {profile.education.map((edu: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                  <h3 className="font-medium text-gray-900 dark:text-white transition-colors duration-200">{edu.degree || 'Degree'}</h3>
                  <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">{edu.institution || 'Institution'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 transition-colors duration-200">{edu.year || 'Year'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(profile?.experience && profile.experience.length > 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 mt-8 transition-colors duration-200">
            <h2 className="flex items-center space-x-2 text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-200">
              <Briefcase className="h-5 w-5" />
              <span>Experience</span>
            </h2>
            <div className="space-y-4">
              {profile.experience.map((exp: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                  <h3 className="font-medium text-gray-900 dark:text-white transition-colors duration-200">{exp.title || 'Position'}</h3>
                  <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">{exp.company || 'Company'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 transition-colors duration-200">{exp.duration || 'Duration'}</p>
                  {exp.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-200">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(profile?.certifications && profile.certifications.length > 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 mt-8 transition-colors duration-200">
            <h2 className="flex items-center space-x-2 text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-200">
              <Award className="h-5 w-5" />
              <span>Certifications</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.certifications.map((cert: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                  <h3 className="font-medium text-gray-900 dark:text-white transition-colors duration-200">{cert.name || 'Certification'}</h3>
                  <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">{cert.issuer || 'Issuer'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 transition-colors duration-200">{cert.date || 'Date'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};