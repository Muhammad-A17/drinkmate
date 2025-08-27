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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Check,
  X,
  ArrowLeft,
  ShieldCheck
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [isResetComplete, setIsResetComplete] = useState(false);
  
  const router = useRouter();
  const { resetPassword } = useAuth();
  const { token } = params;

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

  // Verify token validity (in a real app, this would check with the backend)
  useEffect(() => {
    // This is a simple validation just for demonstration
    // In a real app, you would verify the token with the backend
    if (!token || token.length < 10) {
      setIsTokenValid(false);
      setError("Invalid or expired password reset token");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Enhanced validation
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    if (passwordStrength < 50) {
      setError("Please choose a stronger password");
      setIsLoading(false);
      return;
    }

    try {
      const result = await resetPassword(token, password);
      
      if (result.success) {
        setSuccess("Password reset successful!");
        setIsResetComplete(true);
        setTimeout(() => {
          router.push("/login?message=Password+reset+successful%21+Please+sign+in+with+your+new+password.");
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout currentPage="reset-password">
      <div className="container max-w-md mx-auto py-12 px-4">
        <Card className="border-[#12d6fa]/20 shadow-lg">
          <CardHeader className="space-y-2 pb-6">
            <div className="mx-auto mb-2">
              <Image 
                src="/images/drinkmate-logo.png" 
                alt="Drinkmate" 
                width={150} 
                height={50} 
                className="h-10 w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              {isResetComplete ? "Password Reset Complete" : "Reset Password"}
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              {isResetComplete 
                ? "Your password has been successfully reset" 
                : "Create a new secure password for your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {!isTokenValid ? (
              <div className="text-center py-4">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Invalid Reset Link</h3>
                <p className="text-gray-600 mb-6">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
                <Button 
                  className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white transition-colors"
                  onClick={() => router.push("/forgot-password")}
                >
                  Request New Link
                </Button>
              </div>
            ) : isResetComplete ? (
              <div className="text-center py-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Password Reset Successful</h3>
                <p className="text-gray-600 mb-6">
                  Your password has been successfully reset. You can now log in with your new password.
                </p>
                <Button 
                  className="bg-[#12d6fa] hover:bg-[#0fb8d9] text-white transition-colors"
                  onClick={() => router.push("/login")}
                >
                  Go to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">New Password</Label>
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
                          <Progress value={passwordStrength} className="h-1" />
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
                    <Label htmlFor="confirmPassword" className="text-gray-700">Confirm New Password</Label>
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
                  <Button 
                    type="submit" 
                    className="w-full bg-[#12d6fa] hover:bg-[#0fb8d9] text-white transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Resetting password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col border-t border-gray-200 pt-6">
            <Link 
              href="/login" 
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
}
