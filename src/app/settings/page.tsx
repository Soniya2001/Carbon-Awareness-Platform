'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Settings, User, Download, Upload, Trash2, CheckCircle2 } from 'lucide-react';
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
  const [name, setName]               = useState('');
  const [diet, setDiet]               = useState<'omnivore'|'flexitarian'|'vegetarian'|'vegan'>('omnivore');
  const [units, setUnits]             = useState<'metric'|'imperial'>('metric');
  const [notif, setNotif]             = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (preferences) { setName(preferences.name); setDiet(preferences.dietType); setUnits(preferences.units); setNotif(preferences.notifications); }
  }, [preferences]);

  if (!preferences) return null;

  const handleSave = () => {
    updatePreferences({ name: name.trim(), dietType: diet, units, notifications: notif });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExport = () => {
    try {
      const blob = new Blob([exportAllData()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href: url, download: `carbonwise_backup_${new Date().toISOString().split('T')[0]}.json` });
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (e) { console.error('Export failed:', e); }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (json.version && (json.records || json.gamification)) {
          if (json.records)      localStorage.setItem('cw_records',      JSON.stringify(json.records));
          if (json.gamification) localStorage.setItem('cw_gamification', JSON.stringify(json.gamification));
          if (json.challenges)   localStorage.setItem('cw_challenges',   JSON.stringify(json.challenges));
          if (json.simulations)  localStorage.setItem('cw_simulations',  JSON.stringify(json.simulations));
          if (json.preferences)  localStorage.setItem('cw_prefs',        JSON.stringify(json.preferences));
          alert('Data imported! Reloading…'); window.location.reload();
        } else { alert('Invalid backup file.'); }
      } catch { alert('Failed to parse backup JSON.'); }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (confirm('Delete ALL data permanently? This cannot be undone.')) { clearAllData(); window.location.reload(); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2"><Settings className="w-6 h-6 text-muted-foreground" /> Settings</h2>
        <p className="text-muted-foreground text-sm">Customise your profile and manage your local data.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5"><User className="w-4 h-4 text-eco-600" /> Profile & Preferences</CardTitle>
          <CardDescription className="text-xs">Manage your personal profile and display options.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" value={name} onChange={e=>setName(e.target.value)} maxLength={30} placeholder="Eco Warrior" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="diet">Diet Style</Label>
              <Select value={diet} onValueChange={(v: typeof diet)=>setDiet(v)}>
                <SelectTrigger id="diet"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="omnivore">Omnivore (Meat/Dairy)</SelectItem>
                  <SelectItem value="flexitarian">Flexitarian (Mostly Veg)</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian (No Meat)</SelectItem>
                  <SelectItem value="vegan">Vegan (Strictly Plants)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="units">Units</Label>
              <Select value={units} onValueChange={(v: typeof units)=>setUnits(v)}>
                <SelectTrigger id="units"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (kg, km, kWh)</SelectItem>
                  <SelectItem value="imperial">Imperial (lbs, miles)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="theme-select">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <Label htmlFor="notif-switch" className="font-semibold">Sustainability Tips</Label>
              <p className="text-xs text-muted-foreground">Periodic eco-scoring hints.</p>
            </div>
            <Switch id="notif-switch" checked={notif} onCheckedChange={setNotif} />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 border-t">
            {saveSuccess && <span className="text-xs font-semibold text-eco-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" aria-hidden /> Saved!</span>}
            <Button onClick={handleSave} variant="gradient">Save Preferences</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-950">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-red-600 dark:text-red-400">Data Backup & Export</CardTitle>
          <CardDescription className="text-xs">Export your data to JSON or clear your local storage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-10 text-xs gap-1.5" onClick={handleExport}><Download className="w-4 h-4" aria-hidden /> Export Backup (JSON)</Button>
            <div className="relative">
              <input id="import-file" type="file" accept=".json" onChange={handleImport} className="hidden" aria-label="Import backup file" />
              <Button variant="outline" className="w-full h-10 text-xs gap-1.5" onClick={()=>document.getElementById('import-file')?.click()}><Upload className="w-4 h-4" aria-hidden /> Import Backup (JSON)</Button>
            </div>
          </div>
          <div className="border-t border-red-200 dark:border-red-950/40 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-xs text-red-600 dark:text-red-400">Clear All Data</p>
              <p className="text-[10px] text-muted-foreground">Permanently delete all records, achievements, and settings.</p>
            </div>
            <Button variant="destructive" size="sm" className="text-xs shrink-0" onClick={handleClear}><Trash2 className="w-4 h-4 mr-1.5" aria-hidden /> Clear Local Data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
