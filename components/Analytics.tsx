import React, { useMemo } from 'react';
import { Question } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { calculateEfficiency } from '../utils/helpers';
import { Clock, Trophy, Zap } from 'lucide-react';
import { Heatmap } from './Heatmap';

const Analytics: React.FC<{ questions: Question[] }> = ({ questions }) => {
  const total = questions.length || 1;
  const solved = questions.filter(q => q.status === 'Solved');

  // --- Metrics Calculation ---
  const difficultyCounts = {
      Easy: questions.filter(q => q.difficulty === 'Easy').length,
      Medium: questions.filter(q => q.difficulty === 'Medium').length,
      Hard: questions.filter(q => q.difficulty === 'Hard').length,
  };

  const difficultyData = [
      { name: 'Easy', value: difficultyCounts.Easy, color: '#22c55e' }, // emerald-500
      { name: 'Medium', value: difficultyCounts.Medium, color: '#eab308' }, // yellow-500
      { name: 'Hard', value: difficultyCounts.Hard, color: '#ef4444' }, // red-500
  ].filter(d => d.value > 0);

  const weeklyData = useMemo(() => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const counts = new Array(7).fill(0);
      const now = new Date();
      questions.forEach(q => {
          if (q.lastAttempted) {
              const d = new Date(q.lastAttempted);
              const diffTime = Math.abs(now.getTime() - d.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
              if (diffDays <= 7) {
                  counts[d.getDay()] += (q.timeTaken / 3600); 
              }
          }
      });
      return days.map((day, i) => ({ name: day, hours: parseFloat(counts[i].toFixed(1)) }));
  }, [questions]);

  const hourlyData = useMemo(() => {
      const hours = new Array(24).fill(0);
      questions.forEach(q => {
          if (q.lastAttempted) {
              const h = new Date(q.lastAttempted).getHours();
              hours[h]++;
          }
      });
      return hours.map((val, i) => ({ 
          hour: i === 0 ? '12AM' : i === 12 ? '12PM' : i > 12 ? `${i-12}PM` : `${i}AM`, 
          activity: val 
      }));
  }, [questions]);

  const { strongAreas, needsPractice, efficiencyCounts, avgEfficiencyScore } = useMemo(() => {
      const topicPerf: Record<string, { totalTime: number, solved: number, elite: number }> = {};
      const effCounts = { Elite: 0, High: 0, Avg: 0, Low: 0 };
      let totalEffPoints = 0;
      let effCount = 0;

      questions.forEach(q => {
          const eff = calculateEfficiency(q.difficulty, q.timeTaken);
          if (eff) {
              effCounts[eff.grade as keyof typeof effCounts]++;
              const score = eff.grade === 'Elite' ? 4 : eff.grade === 'High' ? 3 : eff.grade === 'Avg' ? 2 : 1;
              totalEffPoints += score;
              effCount++;
          }

          q.topics.forEach(t => {
              if (!topicPerf[t]) topicPerf[t] = { totalTime: 0, solved: 0, elite: 0 };
              if (q.status === 'Solved') {
                  topicPerf[t].solved++;
                  topicPerf[t].totalTime += q.timeTaken;
                  if (eff && (eff.grade === 'Elite' || eff.grade === 'High')) topicPerf[t].elite++;
              }
          });
      });

      const sortedTopics = Object.entries(topicPerf).map(([name, stat]) => ({
          name,
          score: stat.solved > 0 ? (stat.elite / stat.solved) : 0
      })).sort((a, b) => b.score - a.score);

      const avgScore = effCount > 0 ? (totalEffPoints / effCount) : 0;
      const avgEffLabel = avgScore > 3.5 ? 'Elite' : avgScore > 2.5 ? 'High' : avgScore > 1.5 ? 'Avg' : 'Low';

      return {
          strongAreas: sortedTopics.filter(t => t.score > 0.6).slice(0, 5),
          needsPractice: sortedTopics.filter(t => t.score <= 0.6).slice(0, 5),
          efficiencyCounts: effCounts,
          avgEfficiencyScore: avgEffLabel
      };
  }, [questions]);

  const totalTimeHours = (questions.reduce((acc, q) => acc + q.timeTaken, 0) / 3600).toFixed(1);
  
  // Best Day & Peak Hour Logic
  const hourCounts: number[] = new Array(24).fill(0);
  questions.forEach(q => { if(q.lastAttempted) hourCounts[new Date(q.lastAttempted).getHours()]++; });
  const maxHour = hourCounts.indexOf(Math.max(...hourCounts));
  const peakHourStr = Math.max(...hourCounts) > 0 ? (maxHour === 0 ? '12AM' : maxHour === 12 ? '12PM' : maxHour > 12 ? `${maxHour-12}PM` : `${maxHour}AM`) : '-';

  // Current Streak Calculation
  const currentStreak = useMemo(() => {
      const dates = new Set(questions.filter(q => q.lastAttempted).map(q => new Date(q.lastAttempted!).toLocaleDateString('en-CA')));
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-CA');
          if (dates.has(dateStr)) streak++;
          else if (i === 0 && !dates.has(dateStr)) continue; // Allow missing today if early
          else break;
      }
      return streak;
  }, [questions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
            { label: 'TOTAL TIME', val: `${totalTimeHours}h`, color: 'text-indigo-300', icon: <Clock size={18} className="mb-1 text-indigo-400"/> },
            { label: 'CURRENT STREAK', val: `${currentStreak}d`, color: 'text-emerald-300', icon: <Zap size={18} className="mb-1 text-emerald-400"/> },
            { label: 'AVG EFFICIENCY', val: avgEfficiencyScore, color: 'text-purple-300', icon: <Trophy size={18} className="mb-1 text-purple-400"/> },
            { label: 'PEAK HOUR', val: peakHourStr, color: 'text-amber-300', icon: <Clock size={18} className="mb-1 text-amber-400"/> }
        ].map((stat, i) => (
             <div key={i} className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                {stat.icon}
                <div className={`text-3xl font-bold ${stat.color} drop-shadow-md`}>{stat.val}</div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-2">{stat.label}</div>
             </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Difficulty Spread */}
          <div className="glass-card p-6 rounded-2xl flex flex-col">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm opacity-90">
                  <Clock size={16} className="text-indigo-400"/> Difficulty Spread
              </h3>
              <div className="h-48 relative min-h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie 
                            data={difficultyData} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={55} 
                            outerRadius={80} 
                            paddingAngle={5} 
                            dataKey="value" 
                            stroke="none"
                          >
                              {difficultyData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0f172a', color: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}
                            formatter={(value: number, name: string) => [`${value} Questions`, name]}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={40} 
                            iconType="circle"
                            formatter={(value, entry: any) => <span className="text-xs font-bold text-slate-300 ml-1">{value}</span>}
                            wrapperStyle={{ paddingTop: '24px' }}
                          />
                      </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                      <span className="text-3xl font-bold text-white">{questions.length}</span>
                      <span className="text-[10px] text-white/40 font-bold uppercase">Total</span>
                  </div>
              </div>
          </div>

          {/* Weekly Activity */}
          <div className="glass-card p-6 rounded-2xl flex flex-col">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm opacity-90">
                  <span className="w-1 h-4 bg-indigo-500 rounded-full box-shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span> Weekly Activity (Hours)
              </h3>
              <div className="flex-1 h-48 w-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                          <XAxis dataKey="name" tick={{fontSize: 10, fill: 'rgba(255,255,255,0.6)'}} axisLine={false} tickLine={false} />
                          <Tooltip 
                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0f172a', color: '#fff' }}
                            formatter={(value: number) => [`${value}h`, 'Time']}
                          />
                          <Bar dataKey="hours" fill="#818cf8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Strong Areas / Needs Practice */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
              <div>
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-sm opacity-90">
                      <span className="text-emerald-400 text-lg drop-shadow-sm">✨</span> Strong Areas
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                      {strongAreas.length > 0 ? strongAreas.map(t => (
                          <span key={t.name} className="px-2 py-1 bg-emerald-500/10 text-emerald-300 text-[10px] font-bold uppercase rounded-lg border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                              {t.name}
                          </span>
                      )) : <span className="text-xs text-white/30 italic">Keep practicing!</span>}
                  </div>
              </div>

              <div>
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-sm opacity-90">
                      <span className="text-rose-400 text-lg drop-shadow-sm">⚠️</span> Needs Practice
                  </h3>
                  <div className="flex flex-wrap gap-2">
                      {needsPractice.length > 0 ? needsPractice.map(t => (
                          <span key={t.name} className="px-2 py-1 bg-rose-500/10 text-rose-300 text-[10px] font-bold uppercase rounded-lg border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                              {t.name}
                          </span>
                      )) : <span className="text-xs text-white/30 italic">Doing great!</span>}
                  </div>
              </div>
          </div>
      </div>

      <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-sm opacity-90">
              <Clock size={16} className="text-amber-400"/> Activity by Hour (24h)
          </h3>
          <div className="h-48 w-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData}>
                      <defs>
                          <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <XAxis dataKey="hour" tick={{fontSize: 10, fill: 'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false} interval={3} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0f172a', color: '#fff' }} />
                      <Area type="monotone" dataKey="activity" stroke="#fbbf24" fillOpacity={1} fill="url(#colorActivity)" strokeWidth={2} />
                  </AreaChart>
              </ResponsiveContainer>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm opacity-90">
                  <span className="text-yellow-400">⚡</span> Efficiency Grades
              </h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                      <div className="text-xl font-bold text-purple-300">{efficiencyCounts.Elite}</div>
                      <div className="text-[9px] font-bold text-purple-400 uppercase mt-1">Elite</div>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <div className="text-xl font-bold text-emerald-300">{efficiencyCounts.High}</div>
                      <div className="text-[9px] font-bold text-emerald-400 uppercase mt-1">High</div>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <div className="text-xl font-bold text-blue-300">{efficiencyCounts.Avg}</div>
                      <div className="text-[9px] font-bold text-blue-400 uppercase mt-1">Avg</div>
                  </div>
                  <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                      <div className="text-xl font-bold text-orange-300">{efficiencyCounts.Low}</div>
                      <div className="text-[9px] font-bold text-orange-400 uppercase mt-1">Low</div>
                  </div>
              </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold flex items-center gap-2 text-sm opacity-90">
                   Consistency Heatmap
                </h3>
                <span className="text-[9px] bg-white/10 text-white/60 px-2 py-0.5 rounded border border-white/10">Last 365 Days</span>
              </div>
              <Heatmap data={questions} />
          </div>
      </div>
    </div>
  );
};

export default Analytics;