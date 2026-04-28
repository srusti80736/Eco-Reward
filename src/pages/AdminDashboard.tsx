import { Users, TrendingUp, Package, Leaf, Share2, Activity, Globe, Download, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';

const userGrowthData = [
  { month: 'Jan', users: 1200 },
  { month: 'Feb', users: 1900 },
  { month: 'Mar', users: 2400 },
  { month: 'Apr', users: 3800 },
  { month: 'May', users: 5100 },
  { month: 'Jun', users: 7200 },
];

const wasteTypeData = [
  { type: 'Plastic', amount: 4500 },
  { type: 'Paper', amount: 3200 },
  { type: 'Cardboard', amount: 2800 },
  { type: 'Glass', amount: 1500 },
  { type: 'Metal', amount: 900 },
];

const AdminDashboard = () => {
  const location = useLocation();
  const userName = location.state?.userName || "Administrator";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12 selection:bg-blue-500/30">
      
      {/* Admin Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-md shadow-blue-200">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-800 hidden sm:block">Global Admin</span>
        </div>
        
        <div className="flex items-center gap-4">
           <Button variant="outline" size="sm" className="hidden md:flex gap-2 font-semibold text-slate-600">
              <Download className="h-4 w-4" /> Export Report
           </Button>
           <div className="h-8 w-px bg-slate-200 mx-1"></div>
           <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none text-slate-800">{userName}</p>
              <p className="text-xs font-medium text-blue-600">System Level</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-200 border-2 border-white ring-2 ring-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                {userName.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 space-y-8">
        
        <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Analytics</h1>
            <p className="text-slate-500 mt-1 font-medium">Platform-wide recycling metrics and user engagement.</p>
        </div>

        {/* Global KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-md shadow-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Users</p>
                  <h3 className="text-3xl font-black text-slate-800">7,249</h3>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm font-bold text-emerald-500">
                 <TrendingUp className="h-4 w-4 mr-1" /> +12% this month
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md shadow-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Waste Processed</p>
                  <h3 className="text-3xl font-black text-slate-800">12.9 <span className="text-lg text-slate-500">Tons</span></h3>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Package className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm font-bold text-emerald-500">
                 <TrendingUp className="h-4 w-4 mr-1" /> +2.4T since yesterday
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md shadow-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">CO₂ Offset</p>
                  <h3 className="text-3xl font-black text-slate-800">45.2 <span className="text-lg text-slate-500">Tons</span></h3>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                  <Leaf className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm font-bold text-slate-400">
                 Environmental Impact
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md shadow-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Active IoT Bins</p>
                  <h3 className="text-3xl font-black text-slate-800">248 <span className="text-lg text-slate-500">/ 250</span></h3>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm font-bold text-emerald-500">
                 <CheckCircle2 className="h-4 w-4 mr-1" /> 99.2% Uptime
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Container */}
        <div className="grid gap-6 md:grid-cols-2">
            
            {/* User Growth Chart */}
            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl">
                <CardHeader>
                    <CardTitle className="text-lg font-black text-slate-800">User Acquisition</CardTitle>
                    <CardDescription>New registered users over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <RechartsTooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Waste Distribution Chart */}
            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl">
                <CardHeader>
                    <CardTitle className="text-lg font-black text-slate-800">Waste Classification Breakdown</CardTitle>
                    <CardDescription>Total items processed by ML model (in thousands)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={wasteTypeData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis dataKey="type" type="category" axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 13, fontWeight: 600 }} dx={-10} />
                                <RechartsTooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="amount" fill="#22c55e" radius={[0, 6, 6, 0]} barSize={24}>
                                    {
                                        wasteTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={
                                                index === 0 ? '#3b82f6' : 
                                                index === 1 ? '#22c55e' : 
                                                index === 2 ? '#eab308' : 
                                                index === 3 ? '#ec4899' : '#8b5cf6'
                                            } />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

        </div>
        
        {/* Geographic Activity Map Mockup */}
        <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden mb-12">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-blue-500" />
                    Live Geographic Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="h-[400px] w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    {/* Abstract dotted map representation */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#94a3b8 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
                    
                    {/* Animated Nodes */}
                    <div className="absolute top-1/4 left-1/3">
                        <div className="relative">
                            <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
                            <div className="absolute -inset-2 border border-blue-500 rounded-full animate-ping"></div>
                        </div>
                    </div>
                    <div className="absolute top-1/2 left-2/3">
                        <div className="relative">
                            <div className="h-6 w-6 bg-emerald-500 rounded-full"></div>
                            <div className="absolute -inset-4 border border-emerald-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                        </div>
                    </div>
                    <div className="absolute bottom-1/3 left-1/4">
                        <div className="relative">
                            <div className="h-3 w-3 bg-amber-500 rounded-full"></div>
                            <div className="absolute -inset-2 border border-amber-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                        </div>
                    </div>

                    <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-100 space-y-2">
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Node Legend</p>
                         <div className="flex items-center gap-3">
                             <div className="h-3 w-3 bg-emerald-500 rounded-full"></div>
                             <span className="text-sm font-semibold text-slate-700">High Activity</span>
                         </div>
                         <div className="flex items-center gap-3">
                             <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                             <span className="text-sm font-semibold text-slate-700">Medium Activity</span>
                         </div>
                    </div>
                </div>
            </CardContent>
        </Card>

      </main>
    </div>
  );
};

export default AdminDashboard;
