'use client';

import React from 'react';
import { TrendingUp, HelpCircle, Activity, Sparkles, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ForecastPanel } from '@/components/features/ForecastPanel';

export default function ForecastPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Forecast Engine Workspace */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-eco-600" /> Carbon Forecast Engine
            </CardTitle>
            <CardDescription>
              Predict your future carbon emissions over the next 1, 3, and 6 months using statistical trend analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForecastPanel />
          </CardContent>
        </Card>
      </div>

      {/* Forecast Explanation Sidecard */}
      <div className="lg:col-span-1 space-y-6">
        {/* Model info card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <HelpCircle className="w-4 h-4 text-muted-foreground" /> How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-muted-foreground leading-relaxed">
            <div>
              <p className="font-bold text-foreground flex items-center gap-1 mb-1">
                <Activity className="w-3.5 h-3.5 text-eco-600" /> Linear Regression
              </p>
              <p>
                The forecast engine analyzes the chronological slope of your daily carbon records. It computes a linear trendline to predict emissions based on your average rate of change.
              </p>
            </div>
            <div>
              <p className="font-bold text-foreground flex items-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" /> Confidence Score
              </p>
              <p>
                Confidence is calculated based on the volume and spacing of your historical logs. Having at least 30 days of consistent activity logs maximizes the accuracy and raises the confidence score.
              </p>
            </div>
            <div>
              <p className="font-bold text-foreground flex items-center gap-1 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Risk Indicators
              </p>
              <p>
                An increasing trend triggers warnings. AI recommendations will automatically prioritize reducing emissions in the category responsible for the upward trajectory.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
