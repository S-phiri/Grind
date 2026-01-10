import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      await authApi.login(email, password);
      toast.success("Login successful");
      navigate("/app");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen noise-texture flex items-center justify-center px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-950/20 via-[#0F1419] to-[#0F1419]" />

      <div className="relative z-10 w-full max-w-md">
        <Link to="/">
          <Button
            variant="ghost"
            className="text-[#00FF88] hover:text-[#00FF88] hover:bg-[#00FF88]/10 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card className="glassy-panel border-white/10 p-8">
          <div className="mb-8 text-center">
            <h1 className="font-display text-4xl text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-400">
              Sign in to access your training dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#00FF88]"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#00FF88]"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419] font-semibold py-6"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button className="text-sm text-gray-400 hover:text-[#00FF88] transition-colors">
              Forgot password?
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-[#00FF88] hover:underline font-semibold"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </Card>

        {/* Trust indicators */}
        <div className="mt-6 text-center text-xs text-gray-500 space-y-2">
          <p>🔒 Secure SSL encryption</p>
          <p>Your data is protected and never shared</p>
        </div>
      </div>
    </div>
  );
}
