"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const publicPaths = ["/login", "/setup"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isPublicPath = publicPaths.includes(pathname);

    if (!user && !isPublicPath) {
      router.push("/login");
    } else if (user && !isAdmin && !isPublicPath) {
      router.push("/login");
    } else if (user && isAdmin && pathname === "/login") {
      router.push("/dashboard");
    }
  }, [user, loading, isAdmin, pathname, router]);

  if (loading) {
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

  return <>{children}</>;
}
