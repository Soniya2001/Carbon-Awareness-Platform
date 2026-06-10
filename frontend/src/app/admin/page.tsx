'use client';

import { useEffect, useState } from 'react';
import {
  Users, BarChart3, Shield, Activity,
  Trash2, Search, ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import { adminApi } from '@/src/lib/api';
import { formatDate, numberWithCommas } from '@/src/lib/utils';
import type { User } from '@/src/types';

function useAdminData() {
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [usersRes, analyticsRes] = await Promise.all([
          adminApi.getUsers(),
          adminApi.getAnalytics(),
        ]);
        setUsers((usersRes.data as User[]) ?? []);
        setAnalytics(analyticsRes.data as Record<string, unknown> ?? null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { users, analytics, isLoading, setUsers };
}

export default function AdminPage() {
  const { users, analytics, isLoading, setUsers } = useAdminData();
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    await adminApi.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-eco-600" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <Badge variant="outline" className="ml-2 text-xs border-red-300 text-red-700">Admin only</Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-5 space-y-2"><Skeleton className="h-6 w-20" /><Skeleton className="h-8 w-16" /></CardContent></Card>
            ))
          : [
              { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-600' },
              { label: 'Total Activities', value: (analytics as { totalActivities?: number })?.totalActivities ?? 0, icon: Activity, color: 'text-eco-600' },
              { label: 'CO₂ Tracked (kg)', value: numberWithCommas((analytics as { totalCo2e?: number })?.totalCo2e ?? 0), icon: BarChart3, color: 'text-orange-600' },
              { label: 'Active Today', value: (analytics as { activeToday?: number })?.activeToday ?? 0, icon: Users, color: 'text-purple-600' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="pt-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color} opacity-20`} aria-hidden="true" />
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* User Management */}
        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
              <CardTitle className="text-base">User Management</CardTitle>
              <div className="relative w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
                <Input
                  placeholder="Search users…"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search users"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Users table">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-muted-foreground font-medium">User</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Role</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Joined</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {isLoading
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                            <td className="py-3"><Skeleton className="h-4 w-40" /></td>
                            <td><Skeleton className="h-4 w-16" /></td>
                            <td><Skeleton className="h-4 w-24" /></td>
                            <td></td>
                          </tr>
                        ))
                      : filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="text-xs bg-eco-100 text-eco-700">
                                    {user.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td>
                              <Badge
                                variant="outline"
                                className={user.role === 'ADMIN' ? 'border-red-300 text-red-700 text-xs' : 'text-xs'}
                              >
                                {user.role}
                              </Badge>
                            </td>
                            <td className="text-muted-foreground">{formatDate(user.createdAt)}</td>
                            <td className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(user.id)}
                                aria-label={`Delete user ${user.name}`}
                                disabled={user.role === 'ADMIN'}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
                {!isLoading && filteredUsers.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">No users found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Platform Analytics</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : analytics ? (
                <pre className="text-xs bg-gray-50 rounded-lg p-4 overflow-x-auto">
                  {JSON.stringify(analytics, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">No analytics data</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
