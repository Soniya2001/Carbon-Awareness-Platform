'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Leaf,
  BarChart3,
  Bot,
  GitBranch,
  Shield,
  Zap,
  Users,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';

const features = [
  {
    icon: BarChart3,
    title: 'Real-Time Tracking',
    description:
      'Log activities across transport, energy, food, shopping, and waste. See your footprint update instantly.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Bot,
    title: 'AI Sustainability Coach',
    description:
      'Gemini-powered coach explains your data in plain language and provides personalised reduction strategies.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: GitBranch,
    title: 'Carbon Twin AI',
    description:
      'Simulate your future: "What if I go plant-based?" See 1, 3, and 5-year impact projections instantly.',
    color: 'text-eco-600',
    bg: 'bg-eco-50',
  },
  {
    icon: TrendingDown,
    title: 'Forecasting Engine',
    description:
      'ML-powered predictions for next month, quarter, and year — with confidence scores and trend analysis.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Zap,
    title: 'Gamification',
    description:
      'Earn eco points, unlock badges, build streaks, and compete on community leaderboards.',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
  },
  {
    icon: Users,
    title: 'Community Impact',
    description:
      'See collective CO₂ savings, trees planted equivalent, and anonymous global leaderboards.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
];

const stats = [
  { value: '4.8t', label: 'Global average CO₂/year' },
  { value: '2.3t', label: 'IPCC 2030 target' },
  { value: '60%', label: 'Potential reduction' },
  { value: '10k+', label: 'Actions tracked' },
];

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ─────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-eco-600" aria-hidden="true" />
            <span className="text-lg font-bold text-gray-900">CarbonWise AI</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              How it works
            </a>
            <a href="#impact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Impact
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button variant="eco" size="sm" asChild>
              <Link href="/register">Get started free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ─────────────────────────────── */}
        <section
          className="relative overflow-hidden bg-gradient-to-b from-eco-50 to-white py-24 md:py-32"
          aria-labelledby="hero-heading"
        >
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-eco-100/40 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 text-center">
            <motion.div {...fadeInUp} initial="initial" animate="animate">
              <Badge variant="outline" className="mb-4 border-eco-300 text-eco-700">
                🌍 Powered by Gemini AI
              </Badge>
            </motion.div>
            <motion.h1
              id="hero-heading"
              className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Your Personal{' '}
              <span className="text-eco-600">Sustainability Coach</span>
            </motion.h1>
            <motion.p
              className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 md:text-xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Track your carbon footprint, get AI-powered recommendations, simulate your future
              impact, and build sustainable habits — all in one beautiful platform.
            </motion.p>
            <motion.div
              className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button variant="eco" size="xl" asChild>
                <Link href="/register">
                  Start tracking free <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link href="/login">Sign in to dashboard</Link>
              </Button>
            </motion.div>
            <motion.div
              className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[
                'No credit card required',
                'WCAG 2.1 AA accessible',
                'End-to-end secure',
                'Free forever plan',
              ].map((item) => (
                <span key={item} className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-eco-500" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Stats Bar ────────────────────────── */}
        <section className="border-y bg-gray-50 py-10" aria-label="Key statistics">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="text-3xl font-bold text-eco-700">{stat.value}</div>
                  <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────── */}
        <section id="features" className="py-24" aria-labelledby="features-heading">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 id="features-heading" className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Everything you need to go green
              </h2>
              <p className="mt-4 text-gray-600">
                14 modules, AI-powered, built for real behaviour change.
              </p>
            </div>
            <motion.div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    variants={fadeInUp}
                    className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${feature.bg}`}>
                      <Icon className={`h-5 w-5 ${feature.color}`} aria-hidden="true" />
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ── Carbon Twin Feature ───────────────── */}
        <section
          id="how-it-works"
          className="bg-gradient-to-br from-gray-900 to-eco-900 py-24 text-white"
          aria-labelledby="twin-heading"
        >
          <div className="container mx-auto px-4">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -32 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Badge className="mb-4 bg-eco-700 text-eco-100 hover:bg-eco-700">
                  ✨ Core Innovation
                </Badge>
                <h2 id="twin-heading" className="text-3xl font-bold sm:text-4xl">
                  Meet your Carbon Twin AI
                </h2>
                <p className="mt-4 text-gray-300 leading-relaxed">
                  Your digital sustainability replica. Ask it anything about your future impact:
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    '"What happens if I keep my current lifestyle for 5 years?"',
                    '"What if I replace 50% of car trips with public transport?"',
                    '"What if I reduce meat consumption by 30%?"',
                    '"What if I switch to renewable electricity?"',
                  ].map((q) => (
                    <li key={q} className="flex items-start gap-3">
                      <span className="mt-0.5 text-eco-400" aria-hidden="true">→</span>
                      <span className="text-sm text-gray-300 italic">{q}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="eco" size="lg" className="mt-8" asChild>
                  <Link href="/register">
                    Try Carbon Twin <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 32 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" aria-hidden="true" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" aria-hidden="true" />
                  <div className="h-3 w-3 rounded-full bg-green-400" aria-hidden="true" />
                  <span className="ml-2 text-xs text-gray-400">Carbon Twin Simulation</span>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg bg-white/10 p-4">
                    <p className="text-xs text-gray-400">Scenario</p>
                    <p className="font-medium">Switch to public transport 80%</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { year: '1 Year', saving: '-18%', co2: '3.9t' },
                      { year: '3 Years', saving: '-42%', co2: '2.8t' },
                      { year: '5 Years', saving: '-61%', co2: '1.9t' },
                    ].map((proj) => (
                      <div key={proj.year} className="rounded-lg bg-eco-800/50 p-3 text-center">
                        <p className="text-xs text-gray-400">{proj.year}</p>
                        <p className="text-lg font-bold text-eco-300">{proj.saving}</p>
                        <p className="text-xs text-gray-400">{proj.co2} CO₂e</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-eco-700 bg-eco-900/50 p-3">
                    <p className="text-xs text-eco-400 font-medium">🤖 AI Insight</p>
                    <p className="mt-1 text-sm text-gray-300">
                      Switching to public transport could save you ₹42,000 in fuel costs
                      and avoid 8.2 tonnes of CO₂ over 5 years — equivalent to planting 370 trees.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Community Impact ─────────────────── */}
        <section id="impact" className="py-24" aria-labelledby="impact-heading">
          <div className="container mx-auto px-4 text-center">
            <h2 id="impact-heading" className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Join a community making an impact
            </h2>
            <p className="mt-4 text-gray-600">
              Every action counts. Together we are rewriting the future.
            </p>
            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { value: '12,400', unit: 'kg', label: 'CO₂ saved', emoji: '🌍' },
                { value: '562', unit: 'trees', label: 'equivalent', emoji: '🌳' },
                { value: '4,800', unit: 'L', label: 'fuel saved', emoji: '⛽' },
                { value: '27', unit: 'cars', label: 'removed equiv.', emoji: '🚗' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  className="rounded-xl border bg-gray-50 p-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="text-3xl" aria-hidden="true">{item.emoji}</div>
                  <div className="mt-2 text-2xl font-bold text-gray-900">
                    {item.value}
                    <span className="ml-1 text-sm font-normal text-gray-500">{item.unit}</span>
                  </div>
                  <div className="text-sm text-gray-500">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────── */}
        <section className="bg-eco-600 py-20 text-white" aria-labelledby="cta-heading">
          <div className="container mx-auto px-4 text-center">
            <h2 id="cta-heading" className="text-3xl font-bold sm:text-4xl">
              Ready to reduce your footprint?
            </h2>
            <p className="mt-4 text-eco-100">
              Join thousands of people making smarter, sustainable choices every day.
            </p>
            <Button
              size="xl"
              className="mt-8 bg-white text-eco-700 hover:bg-eco-50"
              asChild
            >
              <Link href="/register">
                Create your free account <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t bg-gray-900 py-10 text-gray-400">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-eco-500" aria-hidden="true" />
            <span className="font-semibold text-white">CarbonWise AI</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} CarbonWise AI. All rights reserved.</p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
