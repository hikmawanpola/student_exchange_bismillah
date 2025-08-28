import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { SuperAdminSidebar } from "@/components/super-admin-sidebar"

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["super_admin"]} redirectTo="/unauthorized">
      <div className="flex min-h-screen">
        <SuperAdminSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </AuthGuard>
  )
}
