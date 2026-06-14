'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Search,
  Trash2,
  Filter,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ActivityLogger } from '@/components/features/ActivityLogger';
import { useAppStore } from '@/store/useAppStore';
import { CATEGORY_ICONS } from '@/lib/carbonEngine';
import { formatCO2, formatDate, capitalize } from '@/lib/utils';

export default function CalculatorPage() {
  const { records, deleteRecord } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        const matchesSearch = r.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [records, searchTerm, selectedCategory]);

  const categoriesList = useMemo(() => {
    const cats = new Set(records.map((r) => r.category));
    return ['all', ...Array.from(cats)];
  }, [records]);

  // Compute calculator stats
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Get start of week (Monday)
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - distanceToMonday);
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

    // Get current month prefix YYYY-MM
    const currentMonthPrefix = now.toISOString().slice(0, 7);

    let todayCO2 = 0;
    let weekCO2 = 0;
    let monthCO2 = 0;

    for (const r of records) {
      if (r.date === todayStr) {
        todayCO2 += r.co2e;
      }
      if (r.date >= startOfWeekStr && r.date <= todayStr) {
        weekCO2 += r.co2e;
      }
      if (r.date.startsWith(currentMonthPrefix)) {
        monthCO2 += r.co2e;
      }
    }

    return {
      today: todayCO2,
      week: weekCO2,
      month: monthCO2,
      annual: monthCO2 * 12,
    };
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Top statistics overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Footprint", value: formatCO2(stats.today) },
          { label: "This Week's Footprint", value: formatCO2(stats.week) },
          { label: "This Month's Footprint", value: formatCO2(stats.month) },
          { label: "Estimated Annual", value: formatCO2(stats.annual) },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
              <p className="text-lg font-bold text-foreground mt-1">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-eco-600" /> Log Daily Activity
            </CardTitle>
            <CardDescription>
              Select a category and log your daily carbon-emitting activities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityLogger />
          </CardContent>
        </Card>

        {/* Right Column: History Log */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activity History</CardTitle>
            <CardDescription>
              A history of your logged activities and their carbon footprints.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-sm"
                  aria-label="Search activities"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 min-w-[150px]">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  aria-label="Filter by category"
                >
                  <option value="all">All Categories</option>
                  {categoriesList.filter(c => c !== 'all').map((cat) => (
                    <option key={cat} value={cat}>
                      {capitalize(cat)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List */}
            {filteredRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse" aria-label="Activity logs history">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs font-semibold">
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Activity</th>
                      <th className="py-2 px-3 text-right">Value</th>
                      <th className="py-2 px-3 text-right">Emissions</th>
                      <th className="py-2 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <AnimatePresence initial={false}>
                      {filteredRecords.map((log) => (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-2.5 px-3 font-medium whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                              {formatDate(log.date)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 capitalize">
                            <span className="flex items-center gap-1">
                              <span aria-hidden>{CATEGORY_ICONS[log.category]}</span>
                              {log.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-foreground">
                            {log.label}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            {log.value} {log.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-red-500 whitespace-nowrap">
                            {formatCO2(log.co2e)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                              onClick={() => deleteRecord(log.id)}
                              aria-label={`Delete activity ${log.label}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                <AlertCircle className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="font-semibold text-sm">No activities found</p>
                <p className="text-xs mt-1">
                  Try adjusting your filters or log a new activity to get started.
                </p>
              </div>
            )}
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
