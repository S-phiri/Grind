import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    hasNumber: false,
    hasLetter: false,
  });
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Check password strength
    if (name === "password") {
      setPasswordStrength({
        length: value.length >= 8,
        hasNumber: /\d/.test(value),
        hasLetter: /[a-zA-Z]/.test(value),
      });
    }
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await authApi.signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
      });
      toast.success(response.message || "Account created successfully!");
      navigate("/app/intake");
    } catch (err: any) {
      const errorMessage =
        err?.message || err?.error || "Failed to create account";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isPasswordValid =
    passwordStrength.length && passwordStrength.hasNumber && passwordStrength.hasLetter;

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
              Create Account
            </h1>
            <p className="text-gray-400">
              Join the GRIND and start your training journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">
                Username *
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#00FF88]"
                required
                disabled={isLoading}
              />
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-gray-300">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  name="first_name"
                  type="text"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#00FF88]"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-gray-300">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  name="last_name"
                  type="text"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#00FF88]"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#00FF88]"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password *
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#00FF88]"
                required
                disabled={isLoading}
              />
              {formData.password && (
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-gray-400">
                    {passwordStrength.length ? (
                      <CheckCircle2 className="w-3 h-3 text-[#00FF88]" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-gray-500" />
                    )}
                    <span>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    {passwordStrength.hasNumber ? (
                      <CheckCircle2 className="w-3 h-3 text-[#00FF88]" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-gray-500" />
                    )}
                    <span>Contains a number</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    {passwordStrength.hasLetter ? (
                      <CheckCircle2 className="w-3 h-3 text-[#00FF88]" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-gray-500" />
                    )}
                    <span>Contains a letter</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Confirm Password *
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#00FF88]"
                required
                disabled={isLoading}
              />
              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-400">
                    Passwords do not match
                  </p>
                )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !isPasswordValid}
              className="w-full bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419] font-semibold py-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#00FF88] hover:underline font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Trust indicators */}
          <div className="mt-6 text-center text-xs text-gray-500 space-y-2">
            <p>🔒 Secure SSL encryption</p>
            <p>Your data is protected and never shared</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

