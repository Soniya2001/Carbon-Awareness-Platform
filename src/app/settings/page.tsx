'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  Settings,
  User,
  Key,
  ShieldAlert,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/store/useAppStore';
import { exportAllData, clearAllData } from '@/lib/storage';

export default function SettingsPage() {
  const { preferences, updatePreferences } = useAppStore();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState('');
  const [diet, setDiet] = useState<'omnivore' | 'flexitarian' | 'vegetarian' | 'vegan'>('omnivore');
  const [apiKey, setApiKey] = useState('');
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [notif, setNotif] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (preferences) {
      setName(preferences.name);
      setDiet(preferences.dietType);
      setApiKey(preferences.geminiApiKey);
      setUnits(preferences.units);
      setNotif(preferences.notifications);
    }
  }, [preferences]);

  if (!preferences) return null;

  const handleSave = () => {
    updatePreferences({
      name: name.trim(),
      dietType: diet,
      geminiApiKey: apiKey.trim(),
      units,
      notifications: notif,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Export Data as JSON
  const handleExport = () => {
    try {
      const dataStr = exportAllData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carbonwise_ai_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export data:', e);
    }
  };

  // Import Data from JSON file
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.version && (json.records || json.gamification)) {
          // Valid backup file
          if (json.records) localStorage.setItem('cw_records', JSON.stringify(json.records));
          if (json.gamification) localStorage.setItem('cw_gamification', JSON.stringify(json.gamification));
          if (json.challenges) localStorage.setItem('cw_challenges', JSON.stringify(json.challenges));
          if (json.simulations) localStorage.setItem('cw_simulations', JSON.stringify(json.simulations));
          // Restore preference keys except API key if desired, or merge
          if (json.preferences) {
            const currentPrefs = { ...json.preferences };
            if (apiKey.trim()) currentPrefs.geminiApiKey = apiKey.trim(); // preserve current API key if present
            localStorage.setItem('cw_prefs', JSON.stringify(currentPrefs));
          }
          alert('Data imported successfully! Reloading...');
          window.location.reload();
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Clear all data
  const handleClear = () => {
    if (confirm('Are you absolutely sure you want to delete all your carbon history, achievements, and settings? This action cannot be undone.')) {
      clearAllData();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-muted-foreground" /> Settings
        </h2>
        <p className="text-muted-foreground text-sm">
          Customize your profile metrics, configure AI integration, and manage your local data backups.
        </p>
      </div>

      {/* Main Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <User className="w-4 h-4 text-eco-600" /> Profile & App Preferences
          </CardTitle>
          <CardDescription className="text-xs">
            Manage your personal profile details and measurement units.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                placeholder="Eco Warrior"
              />
            </div>

            {/* Diet */}
            <div className="space-y-1">
              <Label htmlFor="diet">Diet Style</Label>
              <Select value={diet} onValueChange={(val: any) => setDiet(val)}>
                <SelectTrigger id="diet">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="omnivore">Omnivore (Meat/Dairy)</SelectItem>
                  <SelectItem value="flexitarian">Flexitarian (Mostly Veg)</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian (No Meat)</SelectItem>
                  <SelectItem value="vegan">Vegan (Strictly Plants)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Units */}
            <div className="space-y-1">
              <Label htmlFor="units">Measurement Units</Label>
              <Select value={units} onValueChange={(val: any) => setUnits(val)}>
                <SelectTrigger id="units">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (kg, km, kWh)</SelectItem>
                  <SelectItem value="imperial">Imperial (lbs, miles, kWh)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Theme */}
            <div className="space-y-1">
              <Label htmlFor="theme-select">Visual Mode</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light Theme</SelectItem>
                  <SelectItem value="dark">Dark Theme</SelectItem>
                  <SelectItem value="system">System Default</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <Label htmlFor="notif-switch" className="font-semibold">Sustainability Tips</Label>
              <p className="text-xs text-muted-foreground">Receive periodic alerts and carbon scoring hints.</p>
            </div>
            <Switch id="notif-switch" checked={notif} onCheckedChange={setNotif} />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t justify-end">
            {saveSuccess && (
              <span className="text-xs font-semibold text-eco-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Preferences saved!
              </span>
            )}
            <Button onClick={handleSave} variant="gradient">
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gemini AI Key settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <Key className="w-4 h-4 text-sky-500" /> Google Gemini Integration
          </CardTitle>
          <CardDescription className="text-xs">
            Securely configure your Google AI Studio key to activate generative features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-xs font-semibold flex items-center justify-between">
              <span>Gemini API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-eco-600 hover:underline flex items-center gap-0.5"
              >
                Get free key <Sparkles className="w-3 h-3" />
              </a>
            </Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Paste AI Studio Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          <div className="rounded-xl border p-4 bg-muted/30 flex gap-3 text-xs text-muted-foreground">
            <ShieldAlert className="w-5 h-5 text-eco-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Client-Side Security Guarantee</p>
              <p className="mt-0.5">
                Your API key remains exclusively inside your browser&apos;s LocalStorage. Outgoing requests communicate directly with official Google API servers (`generativelanguage.googleapis.com`) with no intermediary servers intercepting credentials.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data management backup / clear */}
      <Card className="border-red-200 dark:border-red-950 bg-red-50/10">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-red-600 dark:text-red-400">
            Backup & Data Utilities
          </CardTitle>
          <CardDescription className="text-xs">
            Export all logs to a JSON file or clear your local database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export */}
            <Button variant="outline" className="flex items-center gap-1.5 h-10 text-xs" onClick={handleExport}>
              <Download className="w-4 h-4" /> Export Backup (JSON)
            </Button>

            {/* Import */}
            <div className="relative">
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full flex items-center gap-1.5 h-10 text-xs"
                onClick={() => document.getElementById('import-file')?.click()}
              >
                <Upload className="w-4 h-4" /> Import Backup (JSON)
              </Button>
            </div>
          </div>

          <div className="border-t border-red-200 dark:border-red-950/40 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-xs text-red-600 dark:text-red-400">Purge Data Storage</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Irreversibly erase all history records, achievements, points, and configurations.
              </p>
            </div>
            <Button variant="destructive" size="sm" className="text-xs shrink-0" onClick={handleClear}>
              <Trash2 className="w-4 h-4 mr-1.5" /> Purge Local DB
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
