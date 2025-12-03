"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/v1/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (data.auth) {
          setIsAuth(true);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-600 to-purple-700 px-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center gap-4 animate-fade-in w-full max-w-sm">
          <div className="p-4 bg-blue-100 rounded-full">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Memeriksa Autentikasi
          </h2>
          <p className="text-sm text-gray-500 text-center">
            Mohon tunggu sebentar, kami sedang memastikan akses Anda 🔐
          </p>
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mt-2" />
        </div>
      </div>
    );
  }

  if (!isAuth) return null; // router.push sedang jalan

  return <>{children}</>;
}
