'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export default function ProfileForm() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    full_name: '',
    bio: '',
    avatar_url: ''
  });

  const supabase = createClientComponentClient();
  const router = useRouter();

  // User ve profil verilerini yükle
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchProfile(user.id);
      }
    };
    getUser();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || ''
        });
      }
    } catch (err) {
      console.error('Profil yüklenemedi:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Kullanıcı bilgisi bulunamadı');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSuccess('Profil başarıyla güncellendi!');
      // Sayfayı yenile
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Profil güncellenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  if (!user) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Profil Ayarları</h2>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-500 p-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            value={user.email || ''}
            disabled
            className="w-full px-3 py-2 border rounded-md bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Ad Soyad
          </label>
          <input
            type="text"
            name="full_name"
            value={profileData.full_name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Adınız Soyadınız"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Biyografi
          </label>
          <textarea
            name="bio"
            value={profileData.bio}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Kendiniz hakkında birkaç cümle..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Avatar URL
          </label>
          <input
            type="url"
            name="avatar_url"
            value={profileData.avatar_url}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="https://..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Çıkış Yap
          </button>
        </div>
      </form>
    </div>
  );
}
