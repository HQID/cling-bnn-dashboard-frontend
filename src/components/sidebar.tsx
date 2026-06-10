"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Klien",
    href: "/clients",
    icon: Users,
  },
  {
    name: "Pengaturan",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut, isSuperAdmin } = useAuth();

  const userInitial = user?.email?.charAt(0).toUpperCase() || "A";

  return (
    <div className="flex h-full w-56 flex-col bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <span className="text-xl">🔥</span>
        <span className="text-lg font-bold tracking-tight">Cling</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 pt-2">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-text-primary text-white"
                  : "text-text-secondary hover:bg-grey50 hover:text-text-primary"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-grey100 px-4 py-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-grey100 text-xs font-semibold text-grey700">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">
              {user?.email}
            </p>
            <p className="text-[11px] font-semibold text-text-tertiary">
              {isSuperAdmin ? "Super Admin" : "Admin"}
            </p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-2.5 rounded-[14px] px-3.5 py-2.5 text-sm font-medium text-text-secondary transition-all hover:bg-grey50 hover:text-text-primary"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Keluar
        </button>
      </div>
    </div>
  );
}
