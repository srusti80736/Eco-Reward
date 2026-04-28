import { useState } from "react";
import { Leaf, LogOut, BellRing, MapPin, Gauge, Activity, BatteryMedium, Thermometer, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Advanced mock data
const initialBins = [
  { id: "BIN-0042", location: "Main Campus - Gate 1", fillLevel: 95, status: "Critical", lastUpdated: "2 mins ago", battery: 42, temp: 24, lastServiced: "Yesterday, 14:00" },
  { id: "BIN-0118", location: "Cafeteria - West Wing", fillLevel: 45, status: "Normal", lastUpdated: "15 mins ago", battery: 89, temp: 26, lastServiced: "Today, 06:30" },
  { id: "BIN-045A", location: "Library Entrance", fillLevel: 82, status: "Warning", lastUpdated: "5 mins ago", battery: 15, temp: 22, lastServiced: "3 days ago" },
  { id: "BIN-099B", location: "Sports Complex", fillLevel: 12, status: "Empty", lastUpdated: "1 hour ago", battery: 98, temp: 28, lastServiced: "Today, 08:15" },
  { id: "BIN-102C", location: "Research Lab Bldg", fillLevel: 68, status: "Normal", lastUpdated: "10 mins ago", battery: 55, temp: 21, lastServiced: "Yesterday, 09:00" },
];

const hourlyData = [
  { time: '06:00', avgFill: 10, totalWaste: 50 },
  { time: '09:00', avgFill: 25, totalWaste: 150 },
  { time: '12:00', avgFill: 45, totalWaste: 380 },
  { time: '15:00', avgFill: 65, totalWaste: 520 },
  { time: '18:00', avgFill: 80, totalWaste: 710 },
  { time: '21:00', avgFill: 85, totalWaste: 780 },
  { time: '00:00', avgFill: 90, totalWaste: 820 },
];

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#94a3b8']; // Normal, Warning, Critical, Empty

const AuthDashboard = () => {
  const [bins, setBins] = useState(initialBins);
  const [refreshing, setRefreshing] = useState(false);
  const location = useLocation();
  const userName = location.state?.userName || "System Ops";

  const handleDispatch = (binId: string) => {
    toast.success(`Maintenance team dispatched to ${binId}`);
    setBins(bins.map(bin => 
      bin.id === binId ? { ...bin, fillLevel: 0, status: "Empty", lastUpdated: "Just now", battery: 100, lastServiced: "Just now" } : bin
    ));
  };

  const syncTelemetry = () => {
    setRefreshing(true);
    toast("Syncing hardware telemetry...");
    setTimeout(() => {
        setRefreshing(false);
        toast.success("All sensors synchronized.");
    }, 1500);
  }

  const criticalBins = bins.filter(b => b.fillLevel >= 90).length;
  const warningBins = bins.filter(b => b.fillLevel >= 75 && b.fillLevel < 90).length;
  const avgFill = Math.round(bins.reduce((acc, curr) => acc + curr.fillLevel, 0) / bins.length);

  const statusDistribution = [
    { name: 'Normal (40-74%)', value: bins.filter(b => b.fillLevel >= 40 && b.fillLevel < 75).length },
    { name: 'Warning (75-89%)', value: warningBins },
    { name: 'Critical (>=90%)', value: criticalBins },
    { name: 'Empty (<40%)', value: bins.filter(b => b.fillLevel < 40).length },
  ];

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 pb-12 selection:bg-emerald-500/30">
      {/* Navbar - Dark Theme */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-900/20">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white hidden sm:block">Auth<span className="text-emerald-500">Center</span></span>
        </div>
        
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-300 tracking-wider">SECURE TELEMETRY LINK ACTIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative cursor-pointer hover:bg-slate-800 p-2 rounded-full transition-colors">
             <BellRing className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
             {criticalBins > 0 && (
               <span className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-slate-900 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">
               </span>
             )}
          </div>
          <div className="flex items-center gap-3 border-l border-slate-800 pl-5">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none text-white">{userName}</p>
              <p className="text-xs font-medium text-emerald-500">Authentication Lead</p>
            </div>
            <Avatar className="h-9 w-9 border border-slate-700 ring-2 ring-transparent hover:ring-emerald-500 transition-all cursor-pointer">
              <AvatarFallback className="bg-slate-800 text-slate-300 font-bold">{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-white">Global Fleet Overview</h1>
                <p className="text-slate-400 text-sm mt-1">Real-time status of all deployed IoT Waste Bins across sectors.</p>
            </div>
            <Button onClick={syncTelemetry} disabled={refreshing} className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 h-10 px-4 shadow-sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Syncing...' : 'Force Sync'}
            </Button>
        </div>

        {/* Top Summary Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-red-900/50 bg-gradient-to-br from-red-950/40 to-slate-900 shadow-xl relative overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-bold tracking-wider text-red-400 uppercase">Critical Bins</p>
                  <h3 className="text-4xl font-black text-red-500">{criticalBins}</h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-red-400/80">
                  <span>Requires immediate dispatch</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-900/50 bg-gradient-to-br from-amber-950/30 to-slate-900 shadow-xl relative overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-bold tracking-wider text-amber-400 uppercase">Warnings</p>
                  <h3 className="text-4xl font-black text-amber-500">{warningBins}</h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                  <BellRing className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-amber-400/80">
                  <span>Reaching capacity soon</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900 shadow-xl relative overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Active Units</p>
                  <h3 className="text-4xl font-black text-white">{bins.length} <span className="text-lg text-slate-500">/ 5</span></h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="text-emerald-400 text-xs">●</span> 100% Uptime
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-900/30 bg-gradient-to-br from-emerald-950/20 to-slate-900 shadow-xl relative overflow-hidden group">
             <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-bold tracking-wider text-emerald-400 uppercase">Avg System Fill</p>
                  <h3 className="text-4xl font-black text-emerald-400">{avgFill}%</h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Gauge className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-400/80">
                  <span>Healthy threshold</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-3">
            <Card className="col-span-2 border-slate-800 bg-slate-900 shadow-xl">
                <CardHeader>
                    <CardTitle className="text-lg text-white">System Stress (Average Fill over 24h)</CardTitle>
                    <CardDescription className="text-slate-400">Predictive modeling of overall fleet capacity.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                            <linearGradient id="colorFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                itemStyle={{ color: '#22c55e' }}
                            />
                            <Area type="monotone" dataKey="avgFill" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorFill)" />
                        </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900 shadow-xl flex flex-col">
                <CardHeader>
                    <CardTitle className="text-lg text-white">Fleet Distribution</CardTitle>
                    <CardDescription className="text-slate-400">Current status breakdown</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center -mt-6">
                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="w-full grid grid-cols-2 gap-y-3 gap-x-2 mt-2 px-2">
                        {statusDistribution.map((stat, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                                <span className="text-xs font-medium text-slate-300">{stat.name.split(' ')[0]} <span className="text-slate-500">({stat.value})</span></span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Advanced Detailed Bin List */}
        <Card className="border-slate-800 bg-slate-900 shadow-xl mb-12">
          <CardHeader className="border-b border-slate-800 pb-4">
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="text-xl text-white">Advanced Telemetry Matrix</CardTitle>
                    <CardDescription className="text-slate-400">Deep-dive diagnostics for all hardware endpoints</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                    Export CSV
                </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-950/50">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="py-4 text-slate-400 font-bold tracking-wider text-xs">IDENTIFIER</TableHead>
                    <TableHead className="py-4 text-slate-400 font-bold tracking-wider text-xs">LOCALITY</TableHead>
                    <TableHead className="py-4 text-slate-400 font-bold tracking-wider text-xs">HEALTH</TableHead>
                    <TableHead className="py-4 text-slate-400 font-bold tracking-wider text-xs">CAPACITY DETECT</TableHead>
                    <TableHead className="py-4 text-slate-400 font-bold tracking-wider text-xs">DIAGNOSTICS</TableHead>
                    <TableHead className="py-4 text-slate-400 font-bold tracking-wider text-xs text-right">ACTION COMMAND</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bins.map((bin) => (
                    <TableRow key={bin.id} className={`border-slate-800 transition-colors ${bin.status === "Critical" ? "bg-red-950/20 hover:bg-red-950/30" : "hover:bg-slate-800/50"}`}>
                      
                      {/* ID */}
                      <TableCell className="py-4">
                          <div className="font-mono font-bold text-white text-sm">{bin.id}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">FW: 2.1.4</div>
                      </TableCell>
                      
                      {/* Location */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-200 font-medium">
                          <MapPin className="h-4 w-4 text-blue-400" />
                          {bin.location}
                        </div>
                        <span className="text-xs text-slate-500 block mt-1">Last ping: {bin.lastUpdated}</span>
                      </TableCell>
                      
                      {/* Status */}
                      <TableCell className="py-4">
                        <Badge variant={
                          bin.status === "Critical" ? "destructive" : 
                          bin.status === "Warning" ? "default" : "secondary"
                        } className={`
                          ${bin.status === "Warning" ? "bg-amber-500/20 text-amber-500 border border-amber-500/50 hover:bg-amber-500/30" : ""}
                          ${bin.status === "Normal" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30" : ""}
                          ${bin.status === "Critical" ? "bg-red-500 text-white font-bold animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)] border-none" : ""}
                          ${bin.status === "Empty" ? "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700" : ""}
                          px-3 py-1 text-xs uppercase tracking-wider
                        `}>
                          {bin.status}
                        </Badge>
                      </TableCell>
                      
                      {/* Capacity Graph */}
                      <TableCell className="py-4">
                        <div className="w-full max-w-[150px]">
                          <div className="flex justify-between items-end mb-1">
                               <span className={`text-sm font-black ${
                                    bin.fillLevel >= 90 ? 'text-red-500' :
                                    bin.fillLevel >= 75 ? 'text-amber-500' : 'text-emerald-500'
                                }`}>
                                    {bin.fillLevel}%
                                </span>
                          </div>
                          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                             <div 
                                className={`h-full rounded-none transition-all duration-500 relative ${
                                  bin.fillLevel >= 90 ? 'bg-gradient-to-r from-red-600 to-red-400' :
                                  bin.fillLevel >= 75 ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 
                                  'bg-gradient-to-r from-emerald-600 to-emerald-400'
                                }`} 
                                style={{ width: `${bin.fillLevel}%` }}
                             >
                                <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20"></div>
                             </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Hardware Diagnostics */}
                      <TableCell className="py-4">
                          <div className="flex gap-4">
                              <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5 text-xs text-slate-400" title="Battery Level">
                                      <BatteryMedium className={`h-3 w-3 ${bin.battery < 20 ? 'text-red-500' : 'text-emerald-500'}`} />
                                      {bin.battery}%
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-slate-400" title="Internal Temp">
                                      <Thermometer className="h-3 w-3 text-orange-400" />
                                      {bin.temp}°C
                                  </div>
                              </div>
                          </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-4 text-right">
                        {bin.fillLevel >= 75 ? (
                           <Button size="sm" onClick={() => handleDispatch(bin.id)} className="bg-red-600 hover:bg-red-500 text-white font-bold h-9 shadow-lg shadow-red-900/40 border border-red-500 transition-all hover:scale-105">
                             Issue Dispatch
                           </Button>
                        ) : (
                           <Button size="sm" variant="outline" className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 h-9 font-medium">
                             View Logs
                           </Button>
                        )}
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
};

export default AuthDashboard;
