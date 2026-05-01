import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, LogIn, UserPlus } from "lucide-react";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import Seo from "@/components/seo/Seo";

const AuthPage = () => {
  const { customer, login, register } = useCustomerAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("redirect") || "/account";
  }, [location.search]);

  const [tab, setTab] = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ fullName: "", email: "", phone: "", password: "" });

  if (customer) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err.message || "Could not sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(registerForm);
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Seo title="Customer Login & Register" description="Secure customer sign in and registration for TECHALVES Solutions." canonicalPath="/auth" noIndex noFollow />
      <div className="container py-12 lg:py-20">
        <div className="mx-auto max-w-5xl grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Customer account</p>
            <h1 className="text-4xl font-display font-bold leading-tight">Sign in to save your cart, place orders, and track your purchases.</h1>
            <p className="text-muted-foreground text-lg">
              Customer accounts are backed by the server, so your profile and order history stay available across devices.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                ["Saved cart", "Keep products ready for checkout."],
                ["Order history", "View past orders and statuses."],
                ["Account recovery", "Reset your password any time."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-xl border bg-card p-4">
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl font-display">Welcome back</CardTitle>
              <CardDescription>Use your TECHALVES customer account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={setTab} className="space-y-5">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <TabsContent value="login">
                  <form className="space-y-4" onSubmit={handleLogin}>
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <Label htmlFor="login-password">Password</Label>
                        <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                        required
                        minLength={6}
                      />
                    </div>
                    <Button className="w-full gap-2" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                      Sign in
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form className="space-y-4" onSubmit={handleRegister}>
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full name</Label>
                      <Input
                        id="register-name"
                        placeholder="Jane Doe"
                        value={registerForm.fullName}
                        onChange={(e) => setRegisterForm((prev) => ({ ...prev, fullName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="you@example.com"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-phone">Phone</Label>
                        <Input
                          id="register-phone"
                          placeholder="+254 7XX XXX XXX"
                          value={registerForm.phone}
                          onChange={(e) => setRegisterForm((prev) => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="At least 6 characters"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
                        required
                        minLength={6}
                      />
                    </div>
                    <Button className="w-full gap-2" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                      Create account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;
