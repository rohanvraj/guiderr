import { useState, useEffect } from 'react';
import { Upload, Save, LogOut, Camera } from 'lucide-react';
import { supabase, getCurrentUserProfile, updateUserProfile, UserProfile } from '../utils/supabase';

export default function ExpertProfilePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    service_title: '',
    expertise: '',
    hourly_rate: '',
    profile_image_url: '',
  });

  // Check authentication and load profile
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsAuthenticated(true);
        await loadProfile();
      }
    };
    checkAuth();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await getCurrentUserProfile();
      if (userProfile) {
        setProfile(userProfile);
        setFormData({
          full_name: userProfile.full_name || '',
          bio: userProfile.bio || '',
          service_title: userProfile.service_title || '',
          expertise: userProfile.expertise?.join(', ') || '',
          hourly_rate: userProfile.hourly_rate?.toString() || '',
          profile_image_url: userProfile.profile_image_url || '',
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setMessage('❌ Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Unsigned Cloudinary upload
  const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        setMessage('❌ Cloudinary configuration missing');
        return null;
      }

      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formDataUpload,
        }
      );

      if (!response.ok) {
        throw new Error('Cloudinary upload failed');
      }

      const data = await response.json();
      console.log('✅ Profile image uploaded:', data.secure_url);
      return data.secure_url;
    } catch (err) {
      console.error('❌ Cloudinary upload error:', err);
      setMessage(`Error uploading image: ${err}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = await uploadImageToCloudinary(file);
    if (imageUrl) {
      setFormData({ ...formData, profile_image_url: imageUrl });
      setMessage('✅ Image uploaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const updates: Partial<UserProfile> = {
        full_name: formData.full_name || undefined,
        bio: formData.bio || undefined,
        service_title: formData.service_title || undefined,
        expertise: formData.expertise
          ? formData.expertise.split(',').map((e) => e.trim())
          : undefined,
        hourly_rate: formData.hourly_rate ? parseInt(formData.hourly_rate) : undefined,
        profile_image_url: formData.profile_image_url || undefined,
      };

      const updatedProfile = await updateUserProfile(updates);
      setProfile(updatedProfile);
      setMessage('✅ Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setMessage('❌ Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setProfile(null);
    setFormData({
      full_name: '',
      bio: '',
      service_title: '',
      expertise: '',
      hourly_rate: '',
      profile_image_url: '',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4 pt-32">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <Camera className="w-8 h-8 text-slate-900" />
            <h1 className="text-2xl font-bold text-slate-900 ml-3">Expert Profile</h1>
          </div>

          <p className="text-slate-600 mb-6 text-center">
            Sign in to create or edit your expert profile and start offering services.
          </p>

          <button
            onClick={() => {
              // In a real app, this would redirect to login page or open login modal
              setMessage('🔐 Please implement authentication flow');
            }}
            className="w-full py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Sign In with Supabase
          </button>

          <p className="text-xs text-slate-500 text-center mt-4">
            You need to be authenticated to create an expert profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 pt-32">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-200">
          {/* Header with logout */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Expert Profile</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-900 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes('❌')
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-green-100 text-green-800 border border-green-300'
              }`}
            >
              {message}
            </div>
          )}

          {/* Profile Form */}
          <div className="space-y-6">
            {/* Profile Image */}
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                {formData.profile_image_url ? (
                  <img
                    src={formData.profile_image_url}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-slate-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center border-4 border-slate-200">
                    <Camera className="w-8 h-8 text-slate-400" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <label className="block text-sm font-semibold mb-3">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <p className="text-xs text-slate-500 mt-2">
                  {uploading ? '⏳ Uploading...' : '📤 Upload a professional profile photo'}
                </p>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="e.g., Dr. Sarah Mitchell"
              />
            </div>

            {/* Service Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">Service Title *</label>
              <input
                type="text"
                value={formData.service_title}
                onChange={(e) => setFormData({ ...formData, service_title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="e.g., Business Consultant, Photography Coach, etc."
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                rows={4}
                placeholder="Tell customers about yourself, your experience, and what makes you unique..."
              />
            </div>

            {/* Expertise */}
            <div>
              <label className="block text-sm font-semibold mb-2">Areas of Expertise (comma-separated)</label>
              <input
                type="text"
                value={formData.expertise}
                onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="e.g., SEO, Content Strategy, Brand Building"
              />
            </div>

            {/* Hourly Rate */}
            <div>
              <label className="block text-sm font-semibold mb-2">Hourly Rate (₹)</label>
              <input
                type="number"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="e.g., 5000"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={loading || uploading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors mt-8"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

          {/* RLS Security Note */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              🔒 <strong>Security:</strong> Your profile is protected by Row-Level Security (RLS). Only you can edit your own profile data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
