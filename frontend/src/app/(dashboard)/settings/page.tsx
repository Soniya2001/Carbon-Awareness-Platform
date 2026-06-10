'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings, User, Bell, Shield, Download, Trash2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Separator } from '@/src/components/ui/separator';
import { useAuthStore } from '@/src/store/useAuthStore';
import { authApi } from '@/src/lib/api';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    await authApi.updateProfile({ name: data.name });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2500);
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
    setPasswordSuccess(true);
    passwordForm.reset();
    setTimeout(() => setPasswordSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-eco-600" aria-hidden="true" />
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList aria-label="Settings sections">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="data">
            <Download className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Data
          </TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
              <CardDescription>Update your name and email</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} noValidate className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    {...profileForm.register('name')}
                    aria-invalid={!!profileForm.formState.errors.name}
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-xs text-red-600" role="alert">
                      {profileForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...profileForm.register('email')}
                    aria-invalid={!!profileForm.formState.errors.email}
                  />
                </div>
                <Button
                  type="submit"
                  variant="eco"
                  loading={profileForm.formState.isSubmitting}
                >
                  {profileSuccess ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" aria-hidden="true" />
                      Saved!
                    </>
                  ) : (
                    'Save changes'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription>Use a strong password you don&apos;t use elsewhere</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} noValidate className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <Input id="currentPassword" type="password" {...passwordForm.register('currentPassword')} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs text-red-600" role="alert">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input id="confirmPassword" type="password" {...passwordForm.register('confirmPassword')} />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-red-600" role="alert">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="eco"
                  loading={passwordForm.formState.isSubmitting}
                >
                  {passwordSuccess ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" aria-hidden="true" />
                      Updated!
                    </>
                  ) : (
                    'Update password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
              <CardDescription>Choose what you want to be notified about</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Weekly summary email', description: 'Receive a weekly digest of your carbon footprint' },
                { label: 'Challenge reminders', description: 'Get reminded about active challenges' },
                { label: 'Milestone achievements', description: 'Notify when you earn a new badge' },
                { label: 'AI Coach insights', description: 'Receive personalised sustainability tips' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={i < 2}
                    className="h-4 w-4 rounded border-gray-300 text-eco-600 focus:ring-eco-500"
                    aria-label={item.label}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data */}
        <TabsContent value="data" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export Your Data</CardTitle>
              <CardDescription>Download all your carbon tracking data as JSON or CSV</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Export JSON
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Export CSV
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-base text-red-700">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Delete all activity data</p>
                  <p className="text-xs text-muted-foreground">Permanently delete all carbon records</p>
                </div>
                <Button variant="destructive" size="sm" aria-label="Delete all activity data">
                  <Trash2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  Delete data
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Delete account</p>
                  <p className="text-xs text-muted-foreground">Permanently remove your account and all data</p>
                </div>
                <Button variant="destructive" size="sm" aria-label="Delete account">
                  Delete account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
