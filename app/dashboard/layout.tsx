"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthGuard({
  allowedRoles,
  redirectTo,
  children,
}: {
  allowedRoles: string[];
  redirectTo: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || !allowedRoles.includes(profile.role)) {
        router.replace(redirectTo);
        return;
      }

      setAuthorized(true);
    };

    checkAuth().finally(() => setLoading(false));
  }, [supabase, router, allowedRoles, redirectTo]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  if (!authorized) return null;

  return <>{children}</>;
}
