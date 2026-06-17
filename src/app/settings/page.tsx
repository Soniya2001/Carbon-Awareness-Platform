'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import {
  Settings, User, Car, Zap, Utensils, ShoppingBag, Plane,
  Trash2, Download, Upload, CheckCircle2, Bot,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/useAppStore';
import { exportAllData, clearAllData, importAllData, type SustainabilityProfile } from '@/lib/storage';

// ── Slider helper ──────────────────────────────────────────────────────
function SliderRow({
  label, value, min, max, step = 1, unit, hint,
  onChange,
}: {
  label: string; value: number; min: number; max: number;
  step?: number; unit: string; hint?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="text-sm font-bold text-eco-700 dark:text-eco-300">
          {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-muted rounded-full accent-eco-600 cursor-pointer"
        aria-label={`${label}: ${value} ${unit}`}
        aria-valuemin={min} aria-valuemax={max} aria-valuenow={value}
      />
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ── Toggle row ─────────────────────────────────────────────────────────
function ToggleRow({ label, desc, checked, onCheckedChange, id }: {
  label: string; desc?: string; checked: boolean;
  onCheckedChange: (v: boolean) => void; id: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <Label htmlFor={id} className="font-medium cursor-pointer">{label}</Label>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export default function SettingsPage() {
  const { preferences, updatePreferences, profile, updateProfile } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [saved, setSaved] = useState(false);

  // Local state mirrors profile (single source of truth)
  const [p, setP] = useState<SustainabilityProfile | null>(null);

  useEffect(() => {
    if (profile) setP({ ...profile });
  }, [profile]);

  const upd = useCallback((partial: Partial<SustainabilityProfile>) => {
    setP(prev => prev ? { ...prev, ...partial } : prev);
  }, []);

  const handleSave = useCallback(() => {
    if (!p || !preferences) return;
    updateProfile({ ...p, updatedAt: new Date().toISOString(), completedAt: p.completedAt || new Date().toISOString() });
    updatePreferences({ name: p.name, dietType: p.dietType as typeof preferences.dietType, units: p.units });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, [p, preferences, updateProfile, updatePreferences]);

  const handleExport = useCallback(() => {
    try {
      const blob = new Blob([exportAllData()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), {
        href: url,
        download: `carbonwise_backup_${new Date().toISOString().split('T')[0]}.json`,
      });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
  }, []);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const raw = ev.target?.result;
        if (typeof raw !== 'string') return;
        const json = JSON.parse(raw) as Record<string, unknown>;
        if (json.version && (json.records || json.gamification)) {
          importAllData(json);
          alert('Imported! Reloading…');
          window.location.reload();
        } else { alert('Invalid backup file.'); }
      } catch { alert('Failed to parse JSON.'); }
    };
    reader.readAsText(file);
  }, []);

  const handleClear = useCallback(() => {
    if (confirm('Delete ALL data permanently?')) { clearAllData(); window.location.reload(); }
  }, []);

  if (!preferences || !p) return null;

  const sectionClass = 'space-y-4 pt-2';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-muted-foreground" /> Settings
        </h2>
        <p className="text-muted-foreground text-sm">
          Your complete sustainability profile — changes apply across all modules instantly.
        </p>
      </div>

      {/* ── A. Personal Information ─────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-sky-600" /> A. Personal Information
          </CardTitle>
          <CardDescription className="text-xs">Basic identity and display preferences.</CardDescription>
        </CardHeader>
        <CardContent className={sectionClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="s-name">Display Name</Label>
              <Input id="s-name" value={p.name} onChange={e => upd({ name: e.target.value })} placeholder="Your name" maxLength={30} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-region">Region / Country</Label>
              <Input id="s-region" value={p.region} onChange={e => upd({ region: e.target.value })} placeholder="e.g. India, London, New York" maxLength={50} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="s-units">Measurement Units</Label>
              <Select value={p.units} onValueChange={v => upd({ units: v as SustainabilityProfile['units'] })}>
                <SelectTrigger id="s-units"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (kg, km, kWh)</SelectItem>
                  <SelectItem value="imperial">Imperial (lbs, miles)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="s-theme"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── B. Transportation Profile ───────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-600" /> B. Transportation Profile
          </CardTitle>
          <CardDescription className="text-xs">Daily travel habits used to calculate transport emissions.</CardDescription>
        </CardHeader>
        <CardContent className={sectionClass}>
          <div className="space-y-1.5">
            <Label htmlFor="s-transport">Primary Transport Mode</Label>
            <Select value={p.primaryTransport} onValueChange={v => upd({ primaryTransport: v as SustainabilityProfile['primaryTransport'] })}>
              <SelectTrigger id="s-transport"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="car_petrol">🚗 Petrol Car</SelectItem>
                <SelectItem value="car_diesel">🚗 Diesel Car</SelectItem>
                <SelectItem value="car_electric">⚡ Electric Car</SelectItem>
                <SelectItem value="car_hybrid">🔋 Hybrid Car</SelectItem>
                <SelectItem value="motorcycle">🏍️ Motorcycle</SelectItem>
                <SelectItem value="bus">🚌 Bus / Metro</SelectItem>
                <SelectItem value="train">🚆 Train</SelectItem>
                <SelectItem value="bicycle">🚲 Bicycle</SelectItem>
                <SelectItem value="walking">🚶 Walking</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SliderRow
            label="Weekly Commute Distance"
            value={p.weeklyCommuteKm} min={0} max={500} step={5} unit="km/week"
            hint="Total round-trip distance for a typical week"
            onChange={v => upd({ weeklyCommuteKm: v })}
          />
          <ToggleRow id="s-car" label="Own a Private Vehicle" checked={p.hasPrivateCar} onCheckedChange={v => upd({ hasPrivateCar: v })} />
        </CardContent>
      </Card>

      {/* ── C. Home Energy Profile ──────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" /> C. Home Energy Profile
          </CardTitle>
          <CardDescription className="text-xs">Home electricity and appliance usage.</CardDescription>
        </CardHeader>
        <CardContent className={sectionClass}>
          <SliderRow
            label="Monthly Electricity Usage"
            value={p.monthlyElectricityKwh} min={50} max={1000} step={25} unit="kWh/month"
            hint="Typical Indian home: 150–400 kWh"
            onChange={v => upd({ monthlyElectricityKwh: v })}
          />
          <Separator />
          <ToggleRow
            id="s-ac" label="Use Air Conditioning" checked={p.hasAirConditioning}
            onCheckedChange={v => upd({ hasAirConditioning: v })}
          />
          {p.hasAirConditioning && (
            <SliderRow
              label="AC Usage Per Day"
              value={p.acHoursPerDay} min={0} max={16} unit="hours/day"
              onChange={v => upd({ acHoursPerDay: v })}
            />
          )}
          <Separator />
          <ToggleRow
            id="s-renewable" label="Use Renewable / Green Energy" checked={p.usesRenewableEnergy}
            desc="Solar panels, green energy tariff, etc."
            onCheckedChange={v => upd({ usesRenewableEnergy: v })}
          />
        </CardContent>
      </Card>

      {/* ── D. Food Profile ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Utensils className="w-4 h-4 text-eco-600" /> D. Food Profile
          </CardTitle>
          <CardDescription className="text-xs">Diet type is the biggest food-related variable.</CardDescription>
        </CardHeader>
        <CardContent className={sectionClass}>
          <div className="space-y-1.5">
            <Label htmlFor="s-diet">Diet Type</Label>
            <Select value={p.dietType} onValueChange={v => upd({ dietType: v as SustainabilityProfile['dietType'] })}>
              <SelectTrigger id="s-diet"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vegan">🥦 Vegan (2.89 kg CO₂e/day)</SelectItem>
                <SelectItem value="vegetarian">🧀 Vegetarian (3.81 kg CO₂e/day)</SelectItem>
                <SelectItem value="flexitarian">🥗 Flexitarian (5.63 kg CO₂e/day)</SelectItem>
                <SelectItem value="omnivore">🥩 Mixed Diet (7.19 kg CO₂e/day)</SelectItem>
                <SelectItem value="high_meat">🍖 High Meat (9.50 kg CO₂e/day)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── E. Lifestyle Profile ────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-purple-600" /> E. Lifestyle Profile
          </CardTitle>
          <CardDescription className="text-xs">Shopping, waste, and everyday habits.</CardDescription>
        </CardHeader>
        <CardContent className={sectionClass}>
          <SliderRow
            label="New Items Purchased Monthly"
            value={p.monthlyShoppingItems} min={0} max={20} unit="items/month"
            hint="Clothing, electronics, household items"
            onChange={v => upd({ monthlyShoppingItems: v })}
          />
          <Separator />
          <SliderRow
            label="Waste Recycling Rate"
            value={p.wasteRecyclingPercent} min={0} max={100} step={5} unit="% recycled"
            hint="Percentage of household waste you recycle"
            onChange={v => upd({ wasteRecyclingPercent: v })}
          />
          <Separator />
          <ToggleRow
            id="s-compost" label="Compost Food Waste" checked={p.compostsFood}
            desc="Home compost bin or municipal composting"
            onCheckedChange={v => upd({ compostsFood: v })}
          />
        </CardContent>
      </Card>

      {/* ── F. Travel Habits ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Plane className="w-4 h-4 text-red-600" /> F. Travel Habits
          </CardTitle>
          <CardDescription className="text-xs">Air travel per year (one of highest per-hour emissions).</CardDescription>
        </CardHeader>
        <CardContent className={sectionClass}>
          <SliderRow
            label="Short-haul Flights per Year"
            value={p.shortFlightsPerYear} min={0} max={20} unit="flights/yr"
            hint="Under 3 hours (e.g. domestic)"
            onChange={v => upd({ shortFlightsPerYear: v })}
          />
          <SliderRow
            label="Long-haul Flights per Year"
            value={p.longFlightsPerYear} min={0} max={10} unit="flights/yr"
            hint="Over 3 hours (e.g. international)"
            onChange={v => upd({ longFlightsPerYear: v })}
          />
        </CardContent>
      </Card>

      {/* ── G. AI Preferences ───────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bot className="w-4 h-4 text-sky-600" /> G. AI & Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className={sectionClass}>
          <ToggleRow
            id="s-ai-coach" label="AI Sustainability Coaching"
            desc="Personalised tips and recommendations from Gemini"
            checked={p.aiCoachingEnabled}
            onCheckedChange={v => upd({ aiCoachingEnabled: v })}
          />
          <Separator />
          <ToggleRow
            id="s-forecast-notif" label="Forecast Notifications"
            desc="Get notified about emission trends"
            checked={p.forecastNotifications}
            onCheckedChange={v => upd({ forecastNotifications: v })}
          />
          <Separator />
          <ToggleRow
            id="s-challenges" label="Eco Challenges"
            desc="Receive and participate in eco challenges"
            checked={p.challengesEnabled}
            onCheckedChange={v => upd({ challengesEnabled: v })}
          />
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-sm font-semibold text-eco-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" aria-hidden /> Profile saved!
          </span>
        )}
        <Button onClick={handleSave} variant="gradient" size="lg">
          Save All Changes
        </Button>
      </div>

      {/* ── Data Management ─────────────────────────────────────── */}
      <Card className="border-red-200 dark:border-red-950">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-red-600 dark:text-red-400">
            Data Backup & Management
          </CardTitle>
          <CardDescription className="text-xs">Export your full history or clear all local data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" className="h-10 text-xs gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" aria-hidden /> Export Backup (JSON)
            </Button>
            <div>
              <input id="import-file" type="file" accept=".json" onChange={handleImport} className="hidden" aria-label="Import backup file" />
              <Button variant="outline" className="w-full h-10 text-xs gap-2" onClick={() => document.getElementById('import-file')?.click()}>
                <Upload className="w-4 h-4" aria-hidden /> Import Backup (JSON)
              </Button>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">Clear All Local Data</p>
              <p className="text-[10px] text-muted-foreground">Permanently deletes records, profile, achievements, and settings.</p>
            </div>
            <Button variant="destructive" size="sm" onClick={handleClear} className="gap-2 shrink-0">
              <Trash2 className="w-4 h-4" aria-hidden /> Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
