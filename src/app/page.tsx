"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function HomePage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user && isAdmin) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [user, loading, isAdmin, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-grey200 border-t-text-primary" />
        <span className="text-xs font-medium text-text-tertiary">
          Memuat...
        </span>
      </div>
    </div>
  );
}
