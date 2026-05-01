import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { toast } from "sonner";
import Seo from "@/components/seo/Seo";

const ForgotPasswordPage = () => {
  const { forgotPassword } = useCustomerAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await forgotPassword(email);
      setDevToken(res.resetToken || null);
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err.message || "Could not start password reset");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Seo title="Forgot Password" description="Reset your TECHALVES Solutions customer password." canonicalPath="/forgot-password" noIndex noFollow />
      <div className="container py-12">
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-display">Forgot password</CardTitle>
            <CardDescription>Enter your customer account email to generate a reset link.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <Button className="w-full" disabled={submitting}>
                {submitting ? "Generating..." : "Generate reset link"}
              </Button>
            </form>
            {devToken && (
              <div className="rounded-lg border bg-muted/40 p-4 text-sm space-y-2">
                <p className="font-medium">Development reset token</p>
                <p className="break-all text-muted-foreground">{devToken}</p>
                <Link to={`/reset-password?token=${devToken}`} className="text-primary hover:underline font-medium">
                  Open reset page with this token
                </Link>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Remembered your password? <Link to="/auth" className="text-primary hover:underline">Back to sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;
