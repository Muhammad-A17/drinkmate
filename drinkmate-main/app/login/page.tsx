"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import LoginPageContent from "./LoginPageContent";

// Disable static generation for this page
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#12d6fa]" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
