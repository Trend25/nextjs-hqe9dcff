'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/app/ClientAuthProvider';
import { UserProfile } from '@/types';

export default function ProfileForm() {
  const { user, userProfile, updateProfile, refreshProfile, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    full_name: '',
    company_name: '',
    role: 'entrepreneur',
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        company_name: userProfile.company_name || '',
        role: userProfile.role || 'entrepreneur',
      });
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      setIsLoading(true);
      await updateProfile({ 
        ...formData, 
        onboarding_completed: true 
      });
      setSuccess('Onboarding completed! Welcome to StartupStage! 🎉');
      await refreshProfile();
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    // This would be implemented with proper account deletion logic
    alert('Account deletion feature will be implemented soon. Please contact support for now.');
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-6">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name || ''}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name (Optional)</Label>
              <Input
                id="company_name"
                name="company_name"
                type="text"
                value={formData.company_name || ''}
                onChange={handleChange}
                placeholder="Enter your company name"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                value={formData.role || 'entrepreneur'}
                onChange={handleChange}
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="entrepreneur">Entrepreneur</option>
                <option value="investor">Investor</option>
                <option value="advisor">Advisor</option>
              </select>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium">Email Verification</p>
                <p className="text-sm text-gray-600">
                  {user?.email_confirmed_at ? 'Verified' : 'Not verified'}
                </p>
              </div>
              <div>
                {user?.email_confirmed_at ? (
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    ✓ Verified
                  </span>
                ) : (
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    ⚠ Unverified
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium">Onboarding</p>
                <p className="text-sm text-gray-600">
                  {userProfile?.onboarding_completed ? 'Completed' : 'Not completed'}
                </p>
              </div>
              <div>
                {userProfile?.onboarding_completed ? (
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    ✓ Complete
                  </span>
                ) : (
                  <Button 
                    onClick={handleCompleteOnboarding} 
                    disabled={isLoading}
                    size="sm"
                  >
                    Complete Onboarding
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium">Member Since</p>
                <p className="text-sm text-gray-600">
                  {new Date(user?.created_at || '').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" disabled className="h-16 flex flex-col items-center justify-center">
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs">Change Password</span>
            </Button>
            
            <Button variant="outline" disabled className="h-16 flex flex-col items-center justify-center">
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs">Export Data</span>
            </Button>
            
            <Button variant="outline" disabled className="h-16 flex flex-col items-center justify-center">
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.75 19H9v-5.25l8.25-8.25L21 9l-3.75 3.75L8.5 21.5H4.75V19z" />
              </svg>
              <span className="text-xs">Privacy Settings</span>
            </Button>
            
            <Button variant="outline" disabled className="h-16 flex flex-col items-center justify-center">
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs">Help & Support</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that will affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <p className="font-medium text-red-600">Delete Account</p>
                <p className="text-sm text-red-500">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                disabled={isLoading}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
