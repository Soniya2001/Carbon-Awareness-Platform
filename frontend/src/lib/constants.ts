export const APP_NAME = 'CarbonWise AI';
export const APP_DESCRIPTION = 'Your Personal Sustainability Coach';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  TRACKER: '/tracker',
  CARBON_TWIN: '/carbon-twin',
  ANALYTICS: '/analytics',
  CHALLENGES: '/challenges',
  COMMUNITY: '/community',
  AI_COACH: '/ai-coach',
  FORECAST: '/forecast',
  ACHIEVEMENTS: '/achievements',
  SETTINGS: '/settings',
  ADMIN: '/admin',
};

export const CATEGORIES = [
  { key: 'transportation', label: 'Transportation', emoji: '🚗', color: '#3b82f6' },
  { key: 'energy', label: 'Energy', emoji: '⚡', color: '#f59e0b' },
  { key: 'food', label: 'Food', emoji: '🥗', color: '#22c55e' },
  { key: 'shopping', label: 'Shopping', emoji: '🛒', color: '#a855f7' },
  { key: 'waste', label: 'Waste', emoji: '♻️', color: '#ef4444' },
] as const;

export const GLOBAL_AVERAGE_CO2 = 4800; // kg CO2e/year
export const SUSTAINABLE_TARGET = 2300; // kg CO2e/year (IPCC 2030)
export const NET_ZERO_TARGET = 500; // kg CO2e/year

export const BADGE_DEFINITIONS = [
  { id: 'first_step', name: 'First Step', description: 'Logged your first activity', emoji: '🌱' },
  { id: 'week_streak', name: 'Week Warrior', description: '7-day logging streak', emoji: '🔥' },
  { id: 'month_streak', name: 'Monthly Master', description: '30-day logging streak', emoji: '📅' },
  { id: 'low_carbon_day', name: 'Green Day', description: 'Day under 5 kg CO2e', emoji: '🌿' },
  { id: 'challenge_complete', name: 'Challenge Champion', description: 'First challenge completed', emoji: '🏆' },
  { id: 'transport_hero', name: 'Transport Hero', description: 'Avoided 100 km of car travel', emoji: '🚲' },
  { id: 'food_conscious', name: 'Food Conscious', description: '30 days of food tracking', emoji: '🥗' },
  { id: 'energy_saver', name: 'Energy Saver', description: 'Reduced energy footprint by 20%', emoji: '⚡' },
  { id: 'community_star', name: 'Community Star', description: 'Top 10% on leaderboard', emoji: '⭐' },
  { id: 'eco_legend', name: 'Eco Legend', description: 'Reached 1000 eco points', emoji: '🌍' },
  { id: 'zero_waste', name: 'Zero Waste Hero', description: 'Recycled or composted 10 times', emoji: '♻️' },
  { id: 'ai_student', name: 'AI Student', description: 'Had 5 AI Coach conversations', emoji: '🤖' },
  { id: 'twin_explorer', name: 'Twin Explorer', description: 'First Carbon Twin simulation', emoji: '🔮' },
  { id: 'forecaster', name: 'Forecaster', description: 'Checked forecast 5 times', emoji: '📊' },
];

export const SIMULATION_SCENARIOS = [
  {
    key: 'public_transport',
    name: 'Switch to Public Transport',
    description: 'Replace 80% of car trips with bus, train, or cycling',
    icon: '🚌',
    potentialSaving: '15-25%',
  },
  {
    key: 'reduce_meat',
    name: 'Plant-Based Diet',
    description: 'Eliminate beef and lamb, reduce other meat',
    icon: '🥦',
    potentialSaving: '20-30%',
  },
  {
    key: 'renewable_energy',
    name: 'Renewable Energy',
    description: 'Switch to 100% renewable electricity + better insulation',
    icon: '☀️',
    potentialSaving: '15-20%',
  },
  {
    key: 'remote_work',
    name: 'Work From Home',
    description: 'Work from home 4 days a week',
    icon: '🏠',
    potentialSaving: '10-15%',
  },
  {
    key: 'zero_waste',
    name: 'Zero Waste Lifestyle',
    description: 'Recycle, compost, and buy second-hand',
    icon: '♻️',
    potentialSaving: '5-10%',
  },
  {
    key: 'full_sustainable',
    name: 'Full Sustainable Lifestyle',
    description: 'Combine EV, plant-based, renewables, minimal waste',
    icon: '🌱',
    potentialSaving: '60-80%',
  },
];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: ROUTES.TRACKER, label: 'Tracker', icon: 'Activity' },
  { href: ROUTES.CARBON_TWIN, label: 'Carbon Twin', icon: 'GitBranch' },
  { href: ROUTES.ANALYTICS, label: 'Analytics', icon: 'BarChart3' },
  { href: ROUTES.FORECAST, label: 'Forecast', icon: 'TrendingUp' },
  { href: ROUTES.CHALLENGES, label: 'Challenges', icon: 'Target' },
  { href: ROUTES.COMMUNITY, label: 'Community', icon: 'Users' },
  { href: ROUTES.AI_COACH, label: 'AI Coach', icon: 'Bot' },
  { href: ROUTES.ACHIEVEMENTS, label: 'Achievements', icon: 'Award' },
  { href: ROUTES.SETTINGS, label: 'Settings', icon: 'Settings' },
];
