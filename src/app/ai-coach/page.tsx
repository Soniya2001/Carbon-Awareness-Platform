'use client';

import React from 'react';
import { Bot, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AICoach } from '@/components/features/AICoach';

export default function AICoachPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* AI Coach chat area */}
      <div className="lg:col-span-2 space-y-6">
        <AICoach />
      </div>

      {/* Helpful Guidelines */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-muted-foreground" /> Coach Guidelines
            </CardTitle>
            <CardDescription className="text-xs">
              Tips on how to get the most out of your AI Sustainability Coach.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-muted-foreground leading-relaxed">
            <div>
              <p className="font-bold text-foreground mb-1">
                💬 Explain Footprint Data
              </p>
              <p>
                You can ask questions like: &quot;What parts of my diet consume the most carbon?&quot; or &quot;Why are my energy emissions so high?&quot;. The coach has direct access to your local activity summary metrics.
              </p>
            </div>
            <div>
              <p className="font-bold text-foreground mb-1">
                ⚡ Actionable Savings Suggestions
              </p>
              <p>
                Prompt: &quot;Give me five quick tips to reduce transport emissions this week.&quot; The coach will compute carbon calculations in real-time and provide tailored actionable challenges.
              </p>
            </div>
            <div>
              <p className="font-bold text-foreground mb-1">
                💡 General Eco Knowledge
              </p>
              <p>
                Ask about complex environmental concepts, such as: &quot;What is the difference between CO₂ and CO₂e?&quot; or &quot;How does composting reduce methane?&quot; to receive simple, beginner-friendly explanations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
