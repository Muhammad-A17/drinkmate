"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  
  const { forgotPassword } = useAuth();

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setSuccess("Password reset instructions have been sent to your email");
        setEmailSent(true);
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
    <PageLayout currentPage="forgot-password">
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
            <CardTitle className="text-2xl font-bold text-center text-gray-800">Forgot Password</CardTitle>
            <CardDescription className="text-center text-gray-600">
              {!emailSent 
                ? "Enter your email and we'll send you a link to reset your password" 
                : "Check your inbox for the password reset link"}
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

            {!emailSent ? (
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
                        autoComplete="email"
                      />
                    </div>
                    {email && !isValidEmail(email) && (
                      <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
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
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-8 w-8 text-[#12d6fa]" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Check Your Email</h3>
                  <p className="text-gray-600 mb-2">
                    We've sent a password reset link to:
                  </p>
                  <p className="font-medium text-gray-800 mb-4">{email}</p>
                  <p className="text-sm text-gray-600">
                    If you don't see it, please check your spam folder or
                  </p>
                  <Button 
                    variant="link" 
                    className="text-[#12d6fa] hover:text-[#0fb8d9] p-0 h-auto text-sm"
                    onClick={() => setEmailSent(false)}
                  >
                    try another email address
                  </Button>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Didn't receive the email?
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-[#12d6fa] text-[#12d6fa] hover:bg-[#12d6fa]/10"
                    onClick={() => handleSubmit(new Event('click') as unknown as React.FormEvent)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      "Resend Email"
                    )}
                  </Button>
                </div>
              </div>
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
