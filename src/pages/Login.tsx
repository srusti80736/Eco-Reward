import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Leaf, User, Shield, Wrench } from "lucide-react";

type Role = "user" | "admin" | "maintenance";

const roles = [
  { id: "user" as Role, label: "User", icon: User, description: "Dispose waste & earn rewards" },
  { id: "admin" as Role, label: "Admin", icon: Shield, description: "Manage system & analytics" },
  { id: "maintenance" as Role, label: "Maintenance", icon: Wrench, description: "Service & maintain bins" },
];

const demoEmails: Record<Role, string> = {
  user: "alex@eco.com",
  admin: "admin@eco.com",
  maintenance: "tech@eco.com",
};

const Login = () => {
  const [selectedRole, setSelectedRole] = useState<Role>("user");
  const [email, setEmail] = useState(demoEmails["user"]);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setEmail(demoEmails[role]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implement auth
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Background decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8">
        {/* Logo & title */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Leaf className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary">Eco-Reward</h1>
          <p className="text-muted-foreground">Smart Waste Management for a Greener Tomorrow</p>
        </div>

        {/* Login card */}
        <Card className="w-full shadow-lg border-border/50">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-card-foreground">Welcome Back</h2>
                <p className="mt-1 text-sm text-muted-foreground">Select your role to continue</p>
              </div>

              {/* Role selector */}
              <div className="flex gap-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isActive = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role.id)}
                      className={`flex flex-1 flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                        isActive
                          ? "border-primary bg-accent text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{role.label}</span>
                    </button>
                  );
                })}
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {roles.find((r) => r.id === selectedRole)?.description}
              </p>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-card-foreground">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-card"
                />
              </div>

              <Button type="submit" size="lg" className="w-full text-base font-semibold">
                Continue as {roles.find((r) => r.id === selectedRole)?.label}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Demo accounts are pre-configured for each role
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          Building a sustainable future, one disposal at a time 🌱
        </p>
      </div>
    </div>
  );
};

export default Login;
