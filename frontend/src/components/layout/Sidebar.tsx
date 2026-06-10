'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Activity, GitBranch, BarChart3, TrendingUp,
  Target, Users, Bot, Award, Settings, Leaf, ChevronLeft,
  ChevronRight, Zap,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { NAV_ITEMS } from '@/src/lib/constants';
import { useAuthStore } from '@/src/store/useAuthStore';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Activity, GitBranch, BarChart3, TrendingUp,
  Target, Users, Bot, Award, Settings,
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r bg-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className={cn('flex h-16 items-center border-b px-4', collapsed ? 'justify-center' : 'gap-3')}>
        <Leaf className="h-6 w-6 shrink-0 text-eco-600" aria-hidden="true" />
        {!collapsed && (
          <span className="text-base font-bold text-gray-900 truncate">CarbonWise AI</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin" aria-label="Sidebar navigation">
        <ul className="space-y-0.5 px-2" role="list">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon] ?? Activity;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-600',
                    isActive
                      ? 'bg-eco-50 text-eco-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    collapsed && 'justify-center px-2'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn('h-4 w-4 shrink-0', isActive ? 'text-eco-700' : 'text-gray-500 group-hover:text-gray-700')}
                    aria-hidden="true"
                  />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Eco Points */}
      {!collapsed && (
        <div className="mx-3 mb-4 rounded-lg bg-eco-50 p-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-eco-600" aria-hidden="true" />
            <span className="text-xs font-semibold text-eco-700">Eco Points</span>
          </div>
          <p className="mt-1 text-lg font-bold text-eco-800">
            {user ? '0' : '—'}
          </p>
          <p className="text-xs text-eco-600">Green Beginner</p>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-600"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!collapsed}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-gray-500" aria-hidden="true" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-gray-500" aria-hidden="true" />
        )}
      </button>
    </aside>
  );
}
