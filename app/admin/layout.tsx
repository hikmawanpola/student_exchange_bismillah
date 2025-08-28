"use client";

import React from "react";
import { AuthGuard } from "@/components/auth-guard";
import { StudentSidebar } from "@/components/student-sidebar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["user"]} redirectTo="/unauthorized">
      <div className="flex min-h-screen">
        <StudentSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </AuthGuard>
  );
}
