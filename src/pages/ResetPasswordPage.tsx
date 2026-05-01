import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { toast } from "sonner";
import Seo from "@/components/seo/Seo";

const ResetPasswordPage = () => {
  const { resetPassword } = useCustomerAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialToken = useMemo(() => params.get("token") || "", [params]);
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      toast.success("Password reset successfully");
      navigate("/auth", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Could not reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Seo title="Reset Password" description="Set a new password for your TECHALVES Solutions customer account." canonicalPath="/reset-password" noIndex noFollow />
      <div className="container py-12">
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-display">Reset password</CardTitle>
            <CardDescription>Use the reset token you generated to set a new password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-token">Reset token</Label>
                <Input id="reset-token" value={token} onChange={(e) => setToken(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required />
              </div>
              <Button className="w-full" disabled={submitting}>
                {submitting ? "Resetting..." : "Reset password"}
              </Button>
            </form>
            <p className="mt-4 text-sm text-muted-foreground">
              Need a new token? <Link to="/forgot-password" className="text-primary hover:underline">Go back</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;
