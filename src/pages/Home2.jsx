import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { api } from '@/services/api';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Icons from lucide-react
import {
  Activity as ActivityIcon,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Trash2,
  RefreshCw,
} from 'lucide-react';

// Recharts components
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const CATEGORIES = [
  'Deep Work',
  'Fitness',
  'Learning',
  'Distraction',
  'Social',
  'Rest',
  'Chores',
];

export default function Home2() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [formData, setFormData] = useState({
    title: '',
    category: 'Deep Work',
    duration: '',
    is_relevant: true,
  });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await api.getActivities();
      setActivities(data || []);
    } catch (err) {
      console.error('Failed to load activities', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.duration) return;

    const durationNum = parseFloat(formData.duration);
    if (isNaN(durationNum) || durationNum <= 0) return;

    const newAct = {
      title: formData.title.trim(),
      category: formData.category,
      duration: durationNum,
      is_relevant: formData.is_relevant,
      date: new Date().toISOString().split('T')[0],
    };

    try {
      const created = await api.createActivity(newAct);
      const updated = [created, ...activities];
      setActivities(updated);

      // Trigger celebratory confetti if alignment hits >= 80%
      const totalMin = updated.reduce((s, a) => s + (Number(a.duration) || 0), 0);
      const relMin = updated
        .filter((a) => a.is_relevant)
        .reduce((s, a) => s + (Number(a.duration) || 0), 0);
      const score = totalMin > 0 ? Math.round((relMin / totalMin) * 100) : 0;
      if (score >= 80) {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
      }

      setFormData({
        title: '',
        category: 'Deep Work',
        duration: '',
        is_relevant: true,
      });
    } catch (err) {
      console.error('Failed to create activity', err);
    }
  };

  const handleToggleRelevance = async (id, currentVal) => {
    try {
      const updated = await api.updateActivity(id, { is_relevant: !currentVal });
      setActivities((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      console.error('Failed to toggle relevance', err);
    }
  };

  // Aggregated Metrics
  const stats = useMemo(() => {
    const totalMinutes = activities.reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
    const relevantMinutes = activities
      .filter((a) => a.is_relevant)
      .reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
    const irrelevantMinutes = totalMinutes - relevantMinutes;
    const alignmentScore = totalMinutes > 0 ? Math.round((relevantMinutes / totalMinutes) * 100) : 0;

    return {
      totalHours: (totalMinutes / 60).toFixed(1),
      relevantHours: (relevantMinutes / 60).toFixed(1),
      irrelevantHours: (irrelevantMinutes / 60).toFixed(1),
      alignmentScore,
      totalCount: activities.length,
    };
  }, [activities]);

  // Chart Data: Donut
  const pieData = useMemo(() => {
    const rel = parseFloat(stats.relevantHours);
    const irr = parseFloat(stats.irrelevantHours);
    if (rel === 0 && irr === 0) return [];
    return [
      { name: 'Goal-Relevant', value: rel, color: '#10b981' },
      { name: 'Irrelevant / Leakage', value: irr, color: '#f43f5e' },
    ];
  }, [stats]);

  // Chart Data: Bar by Category
  const barData = useMemo(() => {
    const map = {};
    CATEGORIES.forEach((cat) => {
      map[cat] = { category: cat, relevant: 0, irrelevant: 0 };
    });

    activities.forEach((a) => {
      const cat = a.category || 'Other';
      if (!map[cat]) map[cat] = { category: cat, relevant: 0, irrelevant: 0 };
      const hours = (Number(a.duration) || 0) / 60;
      if (a.is_relevant) {
        map[cat].relevant += hours;
      } else {
        map[cat].irrelevant += hours;
      }
    });

    return Object.values(map)
      .filter((d) => d.relevant > 0 || d.irrelevant > 0)
      .map((d) => ({
        category: d.category,
        'Relevant (hrs)': parseFloat(d.relevant.toFixed(2)),
        'Irrelevant (hrs)': parseFloat(d.irrelevant.toFixed(2)),
      }));
  }, [activities]);

  // Life Optimization AI Insight
  const optimizationTip = useMemo(() => {
    if (activities.length === 0) {
      return {
        title: 'Initialize Your Life OS',
        desc: 'Log your first 3 activities to begin calculating your daily success trajectory.',
        type: 'neutral',
      };
    }

    if (stats.alignmentScore >= 80) {
      return {
        title: 'Peak Alignment State (Top 1%)',
        desc: `Exceptional discipline! ${stats.alignmentScore}% of your time directly compounds towards your life goals. Guard this flow state relentlessly.`,
        type: 'success',
      };
    }

    if (stats.alignmentScore >= 50) {
      return {
        title: 'Moderate Focus — Opportunity Ahead',
        desc: `You have ${stats.irrelevantHours} hrs of untargeted activity. Converting just 45 minutes of distraction into Deep Work will push you over 75% alignment.`,
        type: 'warning',
      };
    }

    return {
      title: 'Attention Leakage Alert',
      desc: `High drift detected. Over ${stats.irrelevantHours} hrs were spent on non-contributory tasks. Consider setting a strict timer for social and distraction activities.`,
      type: 'danger',
    };
  }, [activities, stats]);

  // Filtered Activity List
  const filteredActivities = useMemo(() => {
    if (filterCategory === 'ALL') return activities;
    return activities.filter((a) => a.category === filterCategory);
  }, [activities, filterCategory]);

  return (
    <div className='p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500'>
      {/* Top Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6'>
        <div>
          <div className='flex items-center space-x-2'>
            <span className='px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20'>
              Swarm Modular Runner (Variant B)
            </span>
            <Badge variant='outline' className='text-xs'>
              v2.1 Life OS
            </Badge>
          </div>
          <h1 className='text-3xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-slate-300 bg-clip-text text-transparent'>
            Life Alignment & Activity Engine
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            ஒவ்வொரு நாளும் உங்கள் வாழ்க்கை இலக்குகளை நோக்கி முன்னேறுங்கள் • Track daily activities and measure relevance to ultimate goals.
          </p>
        </div>

        <div className='flex items-center space-x-4 bg-card/60 backdrop-blur-md p-4 rounded-2xl border border-border/60 shadow-sm'>
          <div className='text-right'>
            <div className='text-xs text-muted-foreground font-medium uppercase tracking-wider'>Life Alignment Score</div>
            <div className='text-2xl font-black tracking-tight text-primary flex items-center justify-end gap-1'>
              <Flame className='w-5 h-5 text-amber-500 animate-pulse' />
              {stats.alignmentScore}%
            </div>
          </div>
          <div className='w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20'>
            <TrendingUp className='w-7 h-7 text-primary' />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='border-border/60 shadow-sm hover:shadow-md transition-shadow'>
          <CardContent className='p-5 flex items-center justify-between'>
            <div>
              <p className='text-xs font-medium text-muted-foreground uppercase'>Total Time Logged</p>
              <h3 className='text-2xl font-bold mt-1'>{stats.totalHours} <span className='text-sm font-normal text-muted-foreground'>hrs</span></h3>
              <p className='text-xs text-muted-foreground mt-0.5'>{stats.totalCount} recorded sessions</p>
            </div>
            <div className='w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center'>
              <Clock className='w-5 h-5' />
            </div>
          </CardContent>
        </Card>

        <Card className='border-border/60 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-emerald-500'>
          <CardContent className='p-5 flex items-center justify-between'>
            <div>
              <p className='text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase'>Goal-Relevant Time</p>
              <h3 className='text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400'>{stats.relevantHours} <span className='text-sm font-normal text-muted-foreground'>hrs</span></h3>
              <p className='text-xs text-muted-foreground mt-0.5'>Directly compounding</p>
            </div>
            <div className='w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center'>
              <CheckCircle2 className='w-5 h-5' />
            </div>
          </CardContent>
        </Card>

        <Card className='border-border/60 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-rose-500'>
          <CardContent className='p-5 flex items-center justify-between'>
            <div>
              <p className='text-xs font-medium text-rose-500 uppercase'>Attention Leakage</p>
              <h3 className='text-2xl font-bold mt-1 text-rose-500'>{stats.irrelevantHours} <span className='text-sm font-normal text-muted-foreground'>hrs</span></h3>
              <p className='text-xs text-muted-foreground mt-0.5'>Non-compounding habits</p>
            </div>
            <div className='w-10 h-10 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center'>
              <AlertTriangle className='w-5 h-5' />
            </div>
          </CardContent>
        </Card>

        <Card className='border-border/60 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-indigo-500/5 to-purple-500/5'>
          <CardContent className='p-5 flex items-center justify-between'>
            <div>
              <p className='text-xs font-medium text-primary uppercase'>Focus Trajectory</p>
              <h3 className='text-2xl font-bold mt-1 text-primary'>{stats.alignmentScore >= 75 ? 'Optimal' : stats.alignmentScore >= 50 ? 'Building' : 'Needs Reset'}</h3>
              <p className='text-xs text-muted-foreground mt-0.5'>Adaptive baseline</p>
            </div>
            <div className='w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center'>
              <Sparkles className='w-5 h-5' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Habit Tweak Insight Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          optimizationTip.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
            : optimizationTip.type === 'warning'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
            : optimizationTip.type === 'danger'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100'
            : 'bg-muted/50 border-border text-foreground'
        }`}
      >
        <div className='flex items-start space-x-3.5'>
          <div className='mt-0.5 p-2 rounded-xl bg-background/80 shadow-sm'>
            <Sparkles className='w-5 h-5 text-primary' />
          </div>
          <div>
            <h4 className='font-bold text-sm tracking-tight flex items-center gap-1.5'>
              AI Habit Synthesis: {optimizationTip.title}
            </h4>
            <p className='text-xs opacity-90 mt-0.5 leading-relaxed'>{optimizationTip.desc}</p>
          </div>
        </div>
        <Button
          size='sm'
          variant='outline'
          onClick={() => confetti({ particleCount: 30, spread: 45 })}
          className='text-xs shrink-0 bg-background/90'
        >
          Celebrate Momentum 🎉
        </Button>
      </motion.div>

      {/* Interactive Charts & Activity Logger Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Left Column: Quick Activity Logger Form */}
        <Card className='border-border/60 shadow-sm'>
          <CardHeader>
            <CardTitle className='text-lg flex items-center gap-2'>
              <ActivityIcon className='w-5 h-5 text-primary' />
              Log Activity
            </CardTitle>
            <CardDescription>
              Record an event and designate whether it serves your long-term success.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddActivity} className='space-y-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='title'>Activity Title</Label>
                <Input
                  id='title'
                  placeholder='e.g., Coding core algorithm, Gym session'
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label htmlFor='category'>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger id='category'>
                      <SelectValue placeholder='Category' />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='duration'>Duration (mins)</Label>
                  <Input
                    id='duration'
                    type='number'
                    min='1'
                    placeholder='45'
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className='pt-2 flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30'>
                <div className='space-y-0.5'>
                  <Label htmlFor='is_relevant' className='text-sm font-semibold cursor-pointer'>
                    Direct Goal Relevance
                  </Label>
                  <p className='text-xs text-muted-foreground'>Does this move the needle on your life goals?</p>
                </div>
                <Checkbox
                  id='is_relevant'
                  checked={formData.is_relevant}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_relevant: Boolean(checked) })
                  }
                />
              </div>

              <Button type='submit' className='w-full mt-4 flex items-center gap-2'>
                <CheckCircle2 className='w-4 h-4' />
                Record Activity
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: Visual Charts (Recharts Donut + Stacked Bar) */}
        <div className='lg:col-span-2 space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Donut Chart: Relevance Ratio */}
            <Card className='border-border/60 shadow-sm flex flex-col'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-semibold flex items-center gap-2'>
                  <PieChartIcon className='w-4 h-4 text-primary' />
                  Relevance Allocation
                </CardTitle>
                <CardDescription className='text-xs'>
                  Ratio of Goal-Relevant vs Attention-Leakage Hours
                </CardDescription>
              </CardHeader>
              <CardContent className='flex-1 flex flex-col items-center justify-center min-h-[220px]'>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width='100%' height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey='value'
                        nameKey='name'
                        cx='50%'
                        cy='50%'
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => [`${val} hrs`, 'Duration']} />
                      <Legend verticalAlign='bottom' height={36} iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className='text-center text-xs text-muted-foreground py-8'>
                    No activity data available yet.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bar Chart: By Category */}
            <Card className='border-border/60 shadow-sm flex flex-col'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-semibold flex items-center gap-2'>
                  <BarChart3 className='w-4 h-4 text-primary' />
                  Category Time Breakdown
                </CardTitle>
                <CardDescription className='text-xs'>
                  Hours invested across focus areas
                </CardDescription>
              </CardHeader>
              <CardContent className='flex-1 flex flex-col items-center justify-center min-h-[220px]'>
                {barData.length > 0 ? (
                  <ResponsiveContainer width='100%' height={200}>
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey='category' tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val) => [`${val} hrs`, '']} />
                      <Bar dataKey='Relevant (hrs)' stackId='a' fill='#10b981' radius={[0, 0, 0, 0]} />
                      <Bar dataKey='Irrelevant (hrs)' stackId='a' fill='#f43f5e' radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className='text-center text-xs text-muted-foreground py-8'>
                    No category data logged yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Log Table / List */}
          <Card className='border-border/60 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between pb-3'>
              <div>
                <CardTitle className='text-sm font-semibold'>Activity Timeline & Relevance Audit</CardTitle>
                <CardDescription className='text-xs'>
                  Click status badge to toggle relevance classification
                </CardDescription>
              </div>
              <div className='flex items-center space-x-2'>
                <Filter className='w-3.5 h-3.5 text-muted-foreground' />
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className='h-8 text-xs w-[120px]'>
                    <SelectValue placeholder='Filter' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>All Areas</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='text-center py-8 text-sm text-muted-foreground'>Loading activities...</div>
              ) : filteredActivities.length === 0 ? (
                <div className='text-center py-8 text-sm text-muted-foreground'>
                  No activities found for this filter.
                </div>
              ) : (
                <div className='space-y-2 max-h-[300px] overflow-y-auto pr-1'>
                  {filteredActivities.map((act) => (
                    <div
                      key={act.id}
                      className='flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/40 transition-colors'
                    >
                      <div className='flex items-center space-x-3'>
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            act.is_relevant ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <div>
                          <div className='font-semibold text-sm leading-none'>{act.title}</div>
                          <div className='text-xs text-muted-foreground mt-1 flex items-center gap-2'>
                            <span>{act.category}</span>
                            <span>•</span>
                            <span>{act.duration} mins ({(Number(act.duration) / 60).toFixed(1)} hrs)</span>
                            <span>•</span>
                            <span>{act.date || 'Today'}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        size='sm'
                        variant={act.is_relevant ? 'outline' : 'secondary'}
                        onClick={() => handleToggleRelevance(act.id, act.is_relevant)}
                        className={`text-xs h-7 px-2.5 ${
                          act.is_relevant
                            ? 'border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                            : 'border-rose-500/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                        }`}
                      >
                        {act.is_relevant ? 'Relevant ✓' : 'Drift / Leak ⚠'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
