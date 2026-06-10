'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Settings, User, ChevronDown } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import { Badge } from '@/src/components/ui/badge';
import { cn } from '@/src/lib/utils';
import { useAuthStore } from '@/src/store/useAuthStore';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6" role="banner">
      {/* Page title slot — filled by breadcrumbs or page */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setNotifOpen((v) => !v); setMenuOpen(false); }}
            aria-label="View notifications"
            aria-expanded={notifOpen}
            aria-haspopup="true"
            className="relative"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-[10px] flex items-center justify-center bg-eco-600 text-white border-0">
              2
            </Badge>
          </Button>

          {notifOpen && (
            <div
              className="absolute right-0 top-11 z-50 w-80 rounded-lg border bg-white shadow-lg"
              role="region"
              aria-label="Notifications panel"
            >
              <div className="flex items-center justify-between border-b px-4 py-3">
                <span className="font-semibold text-sm">Notifications</span>
                <button
                  className="text-xs text-eco-600 hover:underline focus:outline-none"
                  onClick={() => setNotifOpen(false)}
                >
                  Mark all read
                </button>
              </div>
              <ul className="max-h-64 overflow-y-auto divide-y" role="list">
                {[
                  { title: 'New challenge available', msg: 'Walk 5 km this week', time: '2h ago' },
                  { title: 'Weekly report ready', msg: 'Your emissions were down 12%', time: '1d ago' },
                ].map((n, i) => (
                  <li key={i} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500">{n.msg}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                  </li>
                ))}
              </ul>
              <div className="border-t px-4 py-2">
                <Link href="/settings" className="text-xs text-eco-600 hover:underline" onClick={() => setNotifOpen(false)}>
                  Manage notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setMenuOpen((v) => !v); setNotifOpen(false); }}
            className={cn(
              'flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-600 transition-colors',
            )}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-label="User menu"
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-eco-100 text-eco-700 text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium text-gray-700 sm:inline max-w-[120px] truncate">
              {user?.name ?? 'User'}
            </span>
            <ChevronDown className="h-3 w-3 text-gray-400 hidden sm:inline" aria-hidden="true" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-11 z-50 w-52 rounded-lg border bg-white shadow-lg py-1"
              role="menu"
              aria-label="User menu"
            >
              <div className="border-b px-4 py-2.5">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <Link
                href="/settings"
                role="menuitem"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none"
                onClick={() => setMenuOpen(false)}
              >
                <User className="h-4 w-4" aria-hidden="true" />
                Profile
              </Link>
              <Link
                href="/settings"
                role="menuitem"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none"
                onClick={() => setMenuOpen(false)}
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                Settings
              </Link>
              <div className="border-t mt-1" />
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:outline-none"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
