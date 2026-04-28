import { Recycle, Coins, User, Award, Scan, PenLine, TreeDeciduous, Factory, Droplets, Target, ChevronRight, CheckCircle2, Star, TrendingUp, LogOut, Settings, Moon, Sun } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = location.state?.userName || "Guest";
  const userEmail = location.state?.userEmail || "guest@eco.com";

  // Dynamic Stats State
  const [stats, setStats] = useState<any>({
    points: 0,
    disposals: 0,
    badges: 0,
    history: [],
    weeklyData: [
      { day: 'Mon', points: 0 }, { day: 'Tue', points: 0 }, { day: 'Wed', points: 0 },
      { day: 'Thu', points: 0 }, { day: 'Fri', points: 0 }, { day: 'Sat', points: 0 }, { day: 'Sun', points: 0 }
    ]
  });

  useEffect(() => {
    const storageKey = `eco_user_stats_${userEmail}`;
    const storedStats = localStorage.getItem(storageKey);
    if (storedStats) {
      setStats(JSON.parse(storedStats));
    } else {
      const initialStats = {
        points: 0, disposals: 0, badges: 0, history: [],
        weeklyData: [
          { day: 'Mon', points: 0 }, { day: 'Tue', points: 0 }, { day: 'Wed', points: 0 },
          { day: 'Thu', points: 0 }, { day: 'Fri', points: 0 }, { day: 'Sat', points: 0 }, { day: 'Sun', points: 0 }
        ]
      };
      localStorage.setItem(storageKey, JSON.stringify(initialStats));
      setStats(initialStats);
    }
  }, [userEmail]);

  // Rank Calculation Logic
  const getRankInfo = (pts: number) => {
    if (pts < 100) return { name: "Novice Recycler", nextRank: "Eco Contributor", next: 100 };
    if (pts < 500) return { name: "Eco Contributor", nextRank: "Green Guardian", next: 500 };
    if (pts < 1500) return { name: "Green Guardian", nextRank: "Eco Warrior", next: 1500 };
    return { name: "Eco Warrior", nextRank: "Max Rank", next: 3000 };
  };

  const rankInfo = getRankInfo(stats.points);
  const progressPercent = Math.min((stats.points / rankInfo.next) * 100, 100);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 selection:bg-[#22c55e]/30">
      
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-white/80 backdrop-blur-md px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#22c55e] to-emerald-700 shadow-md shadow-green-200/60 overflow-hidden">
            <Recycle className="h-5 w-5 text-white" />
            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-amber-400 rounded-full flex items-center justify-center border-[2px] border-white shadow-sm z-10">
              <Coins className="h-2.5 w-2.5 text-amber-900" />
            </div>
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight hidden sm:block ml-1 text-balance">
            Waste to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] to-emerald-600">Rewards</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 shadow-sm cursor-pointer hover:bg-amber-100 transition-colors">
            <Award className="h-4 w-4 text-amber-500" />
            <span className="font-bold tracking-tight text-amber-700">{stats.points} <span className="text-xs font-semibold text-amber-600/70">PTS</span></span>
          </div>
          
          <div className="h-8 w-px bg-slate-200 mx-1"></div>

          <Sheet>
            <SheetTrigger asChild>
              <button className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                <User className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-bold text-slate-700 hidden sm:block">Profile</span>
              </button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px] flex flex-col justify-between border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <div>
                <SheetHeader className="mb-8">
                  <SheetTitle className="text-left dark:text-slate-100">Profile Dashboard</SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col items-start gap-1 mb-8 p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{userName}</h3>
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#22c55e]"></span> {rankInfo.name}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        {isDarkMode ? <Moon className="h-5 w-5 text-slate-700 dark:text-slate-300" /> : <Sun className="h-5 w-5 text-amber-500" />}
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Dark Mode</span>
                    </div>
                    <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                  </div>

                  <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                        <Settings className="h-5 w-5 text-slate-700 dark:text-slate-300 group-hover:text-blue-500" />
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Account Settings</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                >
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <span className="font-bold">Log Out</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile & Rank Section */}
        <section className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left space-y-4">
               <div>
                  <div className="inline-block bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 shadow-sm border border-amber-200">
                     {rankInfo.name}
                  </div>
                  <h1 className="text-3xl font-black text-slate-800 tracking-tight">Welcome back, {userName}!</h1>
                  <p className="text-slate-500 font-medium">Keep tracking your disposals to level up.</p>
               </div>
               
               <div className="space-y-2 max-w-md mx-auto md:mx-0">
                  <div className="flex justify-between items-end text-sm">
                     <span className="font-bold text-slate-700 flex items-center gap-1.5 text-xs tracking-wider uppercase">
                        <Target className="h-4 w-4 text-[#22c55e]" /> Next Rank: {rankInfo.nextRank}
                     </span>
                     <span className="font-bold text-slate-500">{stats.points} / {rankInfo.next} PTS</span>
                  </div>
                  <Progress value={progressPercent} className="h-3 bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-[#22c55e] [&>div]:to-emerald-400" />
                  <p className="text-xs text-slate-400 text-right font-medium">{(rankInfo.next - stats.points)} points to go</p>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
               <Card className="bg-slate-50 border-none shadow-none text-center p-4">
                  <p className="text-3xl font-black text-[#22c55e]">{stats.disposals}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Disposals</p>
               </Card>
               <Card className="bg-slate-50 border-none shadow-none text-center p-4">
                  <p className="text-3xl font-black text-amber-500">{stats.badges}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Badges</p>
               </Card>
            </div>
          </div>
        </section>

        {/* Global CTAs */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => navigate("/scan-waste", { state: { userName, userEmail } })}
              className="relative overflow-hidden group bg-gradient-to-br from-[#22c55e] to-emerald-600 rounded-3xl p-8 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all hover:-translate-y-1 text-left"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl origin-top-right group-hover:scale-150 transition-transform duration-500"></div>
              <Scan className="h-10 w-10 text-white mb-4" />
              <h3 className="text-2xl font-black text-white tracking-tight mb-2">Scan & Classify</h3>
              <p className="text-emerald-100 font-medium">Connect to a bin and use AI to identify your waste.</p>
              
              <div className="absolute bottom-8 right-8 h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md group-hover:translate-x-2 transition-transform">
                <ChevronRight className="h-5 w-5 text-white" />
              </div>
            </button>
            
            <button 
              className="relative overflow-hidden group bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all hover:-translate-y-1 text-left shadow-sm"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-2xl origin-top-right group-hover:scale-150 transition-transform duration-500"></div>
              <PenLine className="h-10 w-10 text-slate-400 mb-4 group-hover:text-blue-500 transition-colors" />
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Manual Entry</h3>
              <p className="text-slate-500 font-medium">Log your recycling manually if sensors are offline.</p>
              
              <div className="absolute bottom-8 right-8 h-10 w-10 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 rounded-full flex items-center justify-center transition-all">
                <ChevronRight className="h-5 w-5" />
              </div>
            </button>
        </section>

        {/* Gamification & Stats */}
        <section className="grid md:grid-cols-3 gap-6">
            
            {/* Chart (Takes 2 columns) */}
            <Card className="md:col-span-2 border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden">
                <CardHeader className="bg-transparent border-b border-slate-50 pb-4">
                    <div className="flex justify-between items-center">
                       <div>
                          <CardTitle className="text-lg font-black tracking-tight text-slate-800">Activity & Earnings</CardTitle>
                          <CardDescription>Points earned over the last 7 days</CardDescription>
                       </div>
                       <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                          <TrendingUp className="h-3 w-3" /> +14%
                       </div>
                    </div>
                </CardHeader>
                <CardContent className="h-[280px] p-0 mt-6 px-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                            <RechartsTooltip 
                                cursor={{ fill: '#F8FAFC' }} 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                itemStyle={{ color: '#22c55e' }}
                            />
                            <Bar dataKey="points" radius={[6, 6, 0, 0]}>
                                {stats.weeklyData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.points > 0 ? '#22c55e' : '#e2e8f0'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Recent History Map */}
            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl flex flex-col">
                <CardHeader className="bg-transparent border-b border-slate-50 pb-4">
                    <CardTitle className="text-lg font-black tracking-tight text-slate-800">Recent Verification</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 px-6 py-4 flex flex-col">
                   <div className="flex-1 space-y-5 overflow-y-auto max-h-[220px]">
                       {stats.history.length === 0 ? (
                           <div className="flex flex-col items-center justify-center h-full text-slate-400">
                               <p className="text-sm">No recent activity yet.</p>
                               <p className="text-xs mt-1">Scan an item to get started!</p>
                           </div>
                       ) : (
                           stats.history.slice(0, 4).map((activity: any) => (
                               <div key={activity.id} className="flex items-center justify-between group">
                                  <div className="flex items-center gap-3">
                                      <div className={`h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 group-hover:bg-[#22c55e]/10 transition-colors`}>
                                         {activity.status === 'verified' ? <CheckCircle2 className="h-5 w-5 text-[#22c55e]" /> : <Star className="h-5 w-5 text-slate-400" />}
                                      </div>
                                      <div>
                                          <p className="font-bold text-slate-800 capitalize text-sm">{activity.type}</p>
                                          <p className="text-xs text-slate-400 font-medium">{activity.time}</p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <span className="font-black text-slate-700 bg-slate-50 px-2 py-1 rounded-md text-xs group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">+{activity.points}</span>
                                  </div>
                               </div>
                           ))
                       )}
                   </div>
                   <Button variant="ghost" className="w-full mt-4 text-[#22c55e] hover:text-emerald-700 hover:bg-emerald-50 rounded-xl font-bold">
                       View All History
                   </Button>
                </CardContent>
            </Card>

        </section>

        {/* Eco Impact Footprint */}
        <section>
          <h2 className="text-xl font-black text-slate-800 tracking-tight mb-4 px-2">Your Environmental Footprint</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white shadow-sm hover:shadow-md transition-shadow rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                    <TreeDeciduous className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Trees Saved</h4>
                    <p className="text-3xl font-black text-slate-800 tracking-tight mt-1">{(stats.disposals * 0.1).toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-sky-100 bg-gradient-to-br from-sky-50 to-white shadow-sm hover:shadow-md transition-shadow rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 shadow-inner">
                    <Factory className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">CO₂ Reduced</h4>
                    <p className="text-3xl font-black text-slate-800 tracking-tight mt-1">{(stats.disposals * 0.5).toFixed(1)} <span className="text-lg text-slate-400 font-semibold">kg</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition-shadow rounded-3xl">
              <CardContent className="p-6">
                 <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                    <Droplets className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Water Saved</h4>
                    <p className="text-3xl font-black text-slate-800 tracking-tight mt-1">{stats.disposals * 2} <span className="text-lg text-slate-400 font-semibold">L</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </section>

      </main>
    </div>
  );
};

export default Dashboard;
