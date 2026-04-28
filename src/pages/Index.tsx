import { useState, useEffect } from "react";
import { Leaf, User, ShieldCheck, Lock, Recycle, Gift, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Role = "User" | "Admin" | "Authentication";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role>("User");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = () => {
    if (isLoginMode) {
      // LOGIN LOGIC
      if (!email || !password) {
        toast.error("Please enter both email and password.");
        return;
      }

      const users = JSON.parse(localStorage.getItem("eco_users") || "[]");
      const user = users.find((u: any) => u.email === email && u.password === password && u.role === selectedRole);

      if (user) {
        toast.success(`Welcome back, ${user.name}!`);
        if (user.role === "User") {
          navigate("/dashboard", { state: { userName: user.name, userEmail: user.email } });
        } else if (user.role === "Authentication") {
          navigate("/scan-waste", { state: { userName: user.name, userEmail: user.email } });
        } else if (user.role === "Admin") {
          navigate("/admin-dashboard", { state: { userName: user.name, userEmail: user.email } });
        }
      } else {
        toast.error("User not found or incorrect credentials. Please sign up first.");
      }
    } else {
      // SIGN UP LOGIC
      if (!name || !email || !password) {
        toast.error("Please fill in all fields (Name, Email, Password)");
        return;
      }

      const users = JSON.parse(localStorage.getItem("eco_users") || "[]");
      
      if (users.find((u: any) => u.email === email)) {
        toast.error("An account with this email already exists!");
        return;
      }

      users.push({ name, email, password, role: selectedRole });
      localStorage.setItem("eco_users", JSON.stringify(users));
      
      toast.success("Account created successfully! You can now log in.");
      setIsLoginMode(true);
      // Clear password for safety, keep email pre-filled for login
      setPassword("");
    }
  };

  const roles = [
    { id: "User" as Role, icon: User, label: "User" },
    { id: "Admin" as Role, icon: ShieldCheck, label: "Admin" },
    { id: "Authentication" as Role, icon: Lock, label: "Auth Officer" },
  ];

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white">
        <div className="relative mb-8 animate-in zoom-in duration-1000">
           <div className="absolute inset-0 bg-emerald-500 rounded-full blur-[60px] opacity-30 animate-pulse"></div>
           <div className="relative h-28 w-28 flex items-center justify-center rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 shadow-2xl backdrop-blur-sm">
              {/* Spinner/Recycle */}
              <Recycle className="h-14 w-14 text-emerald-400 absolute opacity-30" />
              <Gift className="h-8 w-8 text-emerald-300 absolute z-10 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-bounce" />
           </div>
        </div>
        <h1 className="text-5xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-emerald-500 animate-in fade-in slide-in-from-bottom-8 duration-700 drop-shadow-sm">
          Waste to Rewards
        </h1>
        <p className="text-emerald-400/80 font-semibold tracking-widest uppercase text-sm animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          Transforming Waste Into Value
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white font-sans text-slate-800 p-4">
      
      {/* Header */}
      <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-top-8 duration-700">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-[#22c55e] to-emerald-700 mb-5 shadow-xl shadow-green-200/60 overflow-hidden group">
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
          <Recycle className="h-10 w-10 text-white opacity-90 group-hover:rotate-180 transition-transform duration-700" />
          <div className="absolute -bottom-2 -right-2 h-9 w-9 bg-amber-400 rounded-full flex items-center justify-center border-[3px] border-white shadow-sm z-10 group-hover:scale-110 transition-transform">
            <Coins className="h-4 w-4 text-amber-900" />
          </div>
        </div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2 text-center text-balance">
          Waste to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] to-emerald-600">Rewards</span>
        </h1>
        <p className="text-lg text-slate-500 font-medium text-center">Smart Waste Management for a Greener Tomorrow</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-green-100/50">
        
        {/* Toggle Mode Tabs */}
        <div className="flex mb-8 bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setIsLoginMode(true)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLoginMode ? 'bg-white text-[#22c55e] shadow' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Log In
          </button>
          <button 
            onClick={() => setIsLoginMode(false)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLoginMode ? 'bg-white text-[#22c55e] shadow' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Sign Up
          </button>
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2">{isLoginMode ? "Welcome Back" : "Create an Account"}</h2>
          <p className="text-slate-500">{isLoginMode ? "Enter your details to log in." : "Select your role and sign up to continue."}</p>
        </div>

        {/* Role Selection */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`flex flex-col items-center justify-center rounded-2xl border p-3 transition-all duration-200 ${
                selectedRole === role.id
                  ? "border-[#22c55e] bg-green-50 text-[#22c55e]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <role.icon className={`h-6 w-6 mb-2 ${selectedRole === role.id ? "text-[#22c55e]" : "text-slate-700"}`} strokeWidth={selectedRole === role.id ? 2 : 1.5} />
              <span className={`text-xs font-bold text-center ${selectedRole === role.id ? "text-[#22c55e]" : "text-slate-700"}`}>{role.label}</span>
            </button>
          ))}
        </div>

        {/* Input Fields */}
        <div className="space-y-4 mb-6">
          {!isLoginMode && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]"
              />
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@eco.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]"
            />
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleAction}
          className="w-full rounded-xl bg-[#22c55e] py-3.5 text-base font-bold text-white shadow-md shadow-green-200 transition-transform hover:scale-[1.02] active:scale-[0.98]">
          {isLoginMode ? "Log In" : "Sign Up"} as {selectedRole}
        </button>

      </div>

    </div>
  );
};

export default Index;
