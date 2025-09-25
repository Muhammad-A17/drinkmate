"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  User, 
  Mail, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Check,
  X
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { toast } from "sonner";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);
  
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const [redirectPath, setRedirectPath] = useState("/");

  // Get redirect parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    if (redirect) {
      setRedirectPath(redirect);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, router, redirectPath]);

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordFeedback([]);
      return;
    }

    const feedback = [];
    let strength = 0;

    // Length check
    if (password.length >= 8) {
      strength += 25;
      feedback.push("8+ characters");
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      strength += 25;
      feedback.push("Uppercase letter");
    }

    // Number check
    if (/[0-9]/.test(password)) {
      strength += 25;
      feedback.push("Number");
    }

    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 25;
      feedback.push("Special character");
    }

    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  }, [password]);

  // Get color based on password strength
  const getStrengthColor = () => {
    if (passwordStrength < 50) return "bg-red-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  // Get indicator class for progress bar
  const getProgressIndicatorClass = () => {
    if (passwordStrength < 50) return "bg-red-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Enhanced validation
    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields", {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5" />
      });
      setIsLoading(false);
      return;
    }

    if (fullName.length < 2) {
      toast.error("Full name must be at least 2 characters", {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5" />
      });
      setIsLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address", {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5" />
      });
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match", {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5" />
      });
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters", {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5" />
      });
      setIsLoading(false);
      return;
    }

    if (passwordStrength < 50) {
      toast.error("Please choose a stronger password", {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5" />
      });
      setIsLoading(false);
      return;
    }

    if (!agreedToTerms) {
      toast.error("You must agree to the Terms of Service", {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5" />
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await register(fullName, email, password);
      
      if (result.success) {
        toast.success("Registration successful!", {
          duration: 3000,
          icon: <CheckCircle2 className="h-5 w-5" />
        });
        setTimeout(() => {
          // Redirect to login with success message and preserve redirect path
          const redirectParam = redirectPath !== "/" ? `&redirect=${encodeURIComponent(redirectPath)}` : "";
          router.push(`/login?message=${encodeURIComponent("Account created successfully! Please sign in.")}${redirectParam}`);
        }, 1500);
      } else {
        toast.error(result.message, {
          duration: 5000,
          icon: <AlertCircle className="h-5 w-5" />
        });
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred", {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5" />
      });
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <PageLayout currentPage="register">
      <div className="container max-w-md mx-auto py-12 px-4">
        <Card className="border-[#12d6fa]/20 shadow-lg">
          <CardHeader className="space-y-2 pb-6">
            <div className="mx-auto mb-2">
              <Image 
                src="/images/drinkmate-logo.png"
                style={{ width: "auto", height: "auto" }} 
                alt="Drinkmate" 
                width={150} 
                height={50} 
                className="h-10 w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">Create Account</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Join Drinkmate and start your sparkling journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-700">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isLoading}
                      required
                      className="pl-10 border-gray-300 focus:border-[#12d6fa] focus:ring-[#12d6fa] transition-colors"
                    />
                  </div>
                  {fullName && fullName.length < 2 && (
                    <p className="text-xs text-red-500 mt-1">Full name must be at least 2 characters</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                      className="pl-10 border-gray-300 focus:border-[#12d6fa] focus:ring-[#12d6fa] transition-colors"
                    />
                  </div>
                  {email && !isValidEmail(email) && (
                    <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      className="pl-10 border-gray-300 focus:border-[#12d6fa] focus:ring-[#12d6fa] transition-colors"
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Password strength indicator */}
                  {password && (
                    <div className="mt-2 space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Password strength:</span>
                          <span className={
                            passwordStrength < 50 ? "text-red-500" : 
                            passwordStrength < 75 ? "text-yellow-500" : 
                            "text-green-500"
                          }>
                            {passwordStrength < 50 ? "Weak" : 
                             passwordStrength < 75 ? "Medium" : 
                             "Strong"}
                          </span>
                        </div>
                        <div className="relative h-1 w-full overflow-hidden rounded-full bg-gray-200">
                          <div 
                            className={`absolute left-0 top-0 h-full transition-all ${getProgressIndicatorClass()}`} 
                            style={{ width: `${passwordStrength}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          {password.length >= 8 ? 
                            <Check className="h-3 w-3 text-green-500" /> : 
                            <X className="h-3 w-3 text-red-500" />
                          }
                          <span>8+ characters</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {/[A-Z]/.test(password) ? 
                            <Check className="h-3 w-3 text-green-500" /> : 
                            <X className="h-3 w-3 text-red-500" />
                          }
                          <span>Uppercase letter</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {/[0-9]/.test(password) ? 
                            <Check className="h-3 w-3 text-green-500" /> : 
                            <X className="h-3 w-3 text-red-500" />
                          }
                          <span>Number</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {/[^A-Za-z0-9]/.test(password) ? 
                            <Check className="h-3 w-3 text-green-500" /> : 
                            <X className="h-3 w-3 text-red-500" />
                          }
                          <span>Special character</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      className="pl-10 border-gray-300 focus:border-[#12d6fa] focus:ring-[#12d6fa] transition-colors"
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                    required
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
                  >
                    I agree to the{" "}
                    <Link href="/terms-of-service" className="text-[#12d6fa] hover:text-[#0fb8d9] underline">
                      Terms of Service
                    </Link>
                    {" "}and{" "}
                    <Link href="/privacy-policy" className="text-[#12d6fa] hover:text-[#0fb8d9] underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#12d6fa] hover:bg-[#0fb8d9] text-white transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col border-t border-gray-200 pt-6">
            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-[#12d6fa] hover:text-[#0fb8d9] font-medium transition-colors">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
}
