"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { toast } from "sonner";

export default function LoginPageContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  
  // Safely get search params
  useEffect(() => {
    if (searchParams) {
      const redirect = searchParams.get('redirect');
      if (redirect) {
        setRedirectPath(redirect);
      }

      const message = searchParams.get('message');
      if (message) {
        toast.success(decodeURIComponent(message), {
          duration: 5000,
          icon: <CheckCircle2 className="h-5 w-5" />
        });
      }
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast.error("Please fill in all fields", {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5" />
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(email, password, rememberMe);
      
      if (result.success) {
        // Store remember me preference if checked
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }
        
        toast.success("Login successful! Redirecting...", {
          duration: 3000,
          icon: <CheckCircle2 className="h-5 w-5" />
        });
        setTimeout(() => {
          router.push(redirectPath);
        }, 1000);
      } else {
        toast.error(result.message, {
          duration: 5000,
          icon: <AlertCircle className="h-5 w-5" />
        });
      }
    } catch (err) {
      toast.error("An unexpected error occurred", {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5" />
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load remembered email if exists
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <PageLayout currentPage="login">
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
            <CardTitle className="text-2xl font-bold text-center text-gray-800">Welcome Back</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
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
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-[#12d6fa] hover:text-[#0fb8d9] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
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
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
                  >
                    Remember me
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
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="border-gray-300 hover:bg-gray-50 transition-colors">
                <Image src="/images/google-icon.png" alt="Google" width={20} height={20} className="mr-2" />
                Google
              </Button>
              <Button variant="outline" className="border-gray-300 hover:bg-gray-50 transition-colors">
                <Image src="/images/facebook-icon.png" alt="Facebook" width={20} height={20} className="mr-2" />
                Facebook
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col border-t border-gray-200 pt-6">
            <div className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#12d6fa] hover:text-[#0fb8d9] font-medium transition-colors">
                Create an account
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
}
