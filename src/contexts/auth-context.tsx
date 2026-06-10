"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // Check custom claims
        const tokenResult = await user.getIdTokenResult();
        const role = tokenResult.claims["role"] as string | undefined;
        setIsAdmin(role === "bnn_admin" || role === "bnn_super_admin");
        setIsSuperAdmin(role === "bnn_super_admin");
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Check if user is admin
    const tokenResult =
      await userCredential.user.getIdTokenResult();
    const role = tokenResult.claims["role"] as string | undefined;

    if (role !== "bnn_admin" && role !== "bnn_super_admin") {
      await firebaseSignOut(auth);
      throw new Error(
        "Access denied. You don't have BNN admin privileges."
      );
    }

    router.push("/dashboard");
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, isSuperAdmin, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
