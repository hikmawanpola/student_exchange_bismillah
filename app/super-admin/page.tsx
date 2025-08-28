import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, Settings, FileText, TrendingUp } from "lucide-react"

export default async function SuperAdminDashboard() {
  const supabase = await createClient()

  // Check authentication and role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "super_admin") {
    redirect("/unauthorized")
  }

  // Fetch dashboard statistics
  const [
    { count: totalUsers },
    { count: totalPrograms },
    { count: totalSteps },
    { count: activeUsers },
    { data: recentUsers },
    { data: programStats },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("programs").select("*", { count: "exact", head: true }),
    supabase.from("steps").select("*", { count: "exact", head: true }),
    supabase.from("user_step_progress").select("user_id", { count: "exact", head: true }),
    supabase.from("profiles").select("full_name, role, created_at").order("created_at", { ascending: false }).limit(5),
    supabase
      .from("user_programs")
      .select("program_id, programs(name)")
      .limit(10)
      .then((result) => {
        if (result.data) {
          const programCounts = result.data.reduce(
            (acc, item) => {
              const programName = (item.programs as any)?.name || "Unknown"
              acc[programName] = (acc[programName] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          )
          return Object.entries(programCounts).map(([name, count]) => ({ name, count }))
        }
        return []
      }),
  ])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Super Admin Dashboard</h1>
              <p className="text-muted-foreground">Kelola seluruh sistem pengakuan ICAO</p>
            </div>
            <Badge variant="secondary" className="text-sm">
              Super Admin
            </Badge>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Semua pengguna terdaftar</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Program Studi</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPrograms || 0}</div>
              <p className="text-xs text-muted-foreground">Program yang tersedia</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Langkah Proses</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSteps || 0}</div>
              <p className="text-xs text-muted-foreground">Langkah yang dikonfigurasi</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pengguna Aktif</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Dengan progress aktif</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>Pengguna Terbaru</CardTitle>
              <CardDescription>5 pengguna yang baru mendaftar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers && recentUsers.length > 0 ? (
                  recentUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <Badge
                        variant={
                          user.role === "super_admin" ? "default" : user.role === "admin" ? "secondary" : "outline"
                        }
                      >
                        {user.role === "super_admin" ? "Super Admin" : user.role === "admin" ? "Admin" : "Mahasiswa"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Belum ada pengguna terbaru</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Program Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistik Program</CardTitle>
              <CardDescription>Jumlah pendaftar per program</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {programStats && programStats.length > 0 ? (
                  programStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{stat.name}</span>
                      </div>
                      <Badge variant="outline">{stat.count} pendaftar</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Belum ada data program</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Kelola komponen utama sistem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <a
                href="/super-admin/users"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Kelola Pengguna</p>
                  <p className="text-sm text-muted-foreground">Atur peran dan akses</p>
                </div>
              </a>
              <a
                href="/super-admin/programs"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <GraduationCap className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Kelola Program</p>
                  <p className="text-sm text-muted-foreground">Tambah/edit program studi</p>
                </div>
              </a>
              <a
                href="/super-admin/steps"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <Settings className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Kelola Langkah</p>
                  <p className="text-sm text-muted-foreground">Konfigurasi proses</p>
                </div>
              </a>
              <a
                href="/super-admin/content"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Kelola Konten</p>
                  <p className="text-sm text-muted-foreground">Edit halaman utama</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
