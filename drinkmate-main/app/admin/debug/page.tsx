"use client";

import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/translation-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function AdminDebugPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const { isRTL } = useTranslation();

  const getAuthStatus = () => {
    if (isLoading) return { status: "loading", icon: <Loader2 className="h-4 w-4 animate-spin" />, color: "text-blue-500" };
    if (isAuthenticated && user) return { status: "authenticated", icon: <CheckCircle className="h-4 w-4" />, color: "text-green-500" };
    return { status: "not-authenticated", icon: <XCircle className="h-4 w-4" />, color: "text-red-500" };
  };

  const getAdminStatus = () => {
    if (!isAuthenticated || !user) return { status: "not-applicable", icon: <AlertCircle className="h-4 w-4" />, color: "text-gray-500" };
    if (user.isAdmin) return { status: "admin", icon: <CheckCircle className="h-4 w-4" />, color: "text-green-500" };
    return { status: "not-admin", icon: <XCircle className="h-4 w-4" />, color: "text-red-500" };
  };

  const authStatus = getAuthStatus();
  const adminStatus = getAdminStatus();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Admin Panel Debug
        </h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Authentication Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Authentication Status
                <span className={authStatus.color}>
                  {authStatus.icon}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <Badge variant={authStatus.status === "authenticated" ? "default" : "secondary"}>
                  {authStatus.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Loading:</span>
                <span>{isLoading ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Token:</span>
                <span className="text-sm font-mono">
                  {token ? `${token.substring(0, 20)}...` : "None"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Admin Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Admin Status
                <span className={adminStatus.color}>
                  {adminStatus.icon}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <Badge variant={adminStatus.status === "admin" ? "default" : "secondary"}>
                  {adminStatus.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">User ID:</span>
                <span className="text-sm font-mono">
                  {user?._id || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span className="text-sm">
                  {user?.email || "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* User Details */}
          {user && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>User Details</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Refresh Page
              </Button>
              <Button 
                onClick={() => window.open('/admin', '_blank')} 
                variant="outline"
              >
                Try Admin Panel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
