"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Users, GraduationCap, Settings, FileText, BarChart3, LogOut, Menu, X, Home, CheckSquare } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/super-admin", icon: Home },
  { name: "Kelola Pengguna", href: "/super-admin/users", icon: Users },
  { name: "Kelola Program", href: "/super-admin/programs", icon: GraduationCap },
  { name: "Kelola Langkah", href: "/super-admin/steps", icon: Settings },
  { name: "Kelola Konten", href: "/super-admin/content", icon: FileText },
  { name: "Progress Monitor", href: "/super-admin/progress", icon: CheckSquare },
  { name: "Laporan", href: "/super-admin/reports", icon: BarChart3 },
]

export function SuperAdminSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-64 bg-card border-r">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <span className="text-lg font-semibold">Super Admin</span>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full bg-transparent" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-1 bg-card border-r">
          <div className="flex h-16 items-center px-4 border-b">
            <span className="text-lg font-semibold">Super Admin</span>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full bg-transparent" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Content offset for desktop */}
      <div className="lg:pl-64 flex-1">{/* Content will be rendered here */}</div>
    </>
  )
}
