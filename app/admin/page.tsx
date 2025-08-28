import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertCircle, Users, FileText, TrendingUp } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Check authentication and role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/unauthorized")
  }

  // Fetch dashboard statistics for admin
  const [
    { data: pendingReviews },
    { data: completedReviews },
    { data: recentSubmissions },
    { data: activeStudents },
    { count: totalStudents },
  ] = await Promise.all([
    supabase
      .from("user_step_progress")
      .select("*, profiles(full_name), steps(name)")
      .in("status", ["pending", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("user_step_progress")
      .select("*, profiles(full_name), steps(name)")
      .eq("status", "completed")
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("user_step_progress")
      .select("*, profiles(full_name), steps(name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("user_step_progress")
      .select("user_id")
      .neq("status", "completed")
      .then((result) => {
        if (result.data) {
          const uniqueUsers = [...new Set(result.data.map((item) => item.user_id))]
          return uniqueUsers.length
        }
        return 0
      }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "user"),
  ])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Menunggu</Badge>
      case "in_progress":
        return <Badge variant="secondary">Sedang Diproses</Badge>
      case "completed":
        return <Badge variant="default">Selesai</Badge>
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Admin Dashboard</h1>
              <p className="text-muted-foreground">Kelola proses pengakuan dan review aplikasi mahasiswa</p>
            </div>
            <Badge variant="secondary" className="text-sm">
              Admin Prodi
            </Badge>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perlu Review</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReviews?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Aplikasi menunggu review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selesai Direview</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedReviews?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Review yang telah selesai</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mahasiswa Aktif</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeStudents || 0}</div>
              <p className="text-xs text-muted-foreground">Dengan progress aktif</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mahasiswa</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents || 0}</div>
              <p className="text-xs text-muted-foreground">Mahasiswa terdaftar</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Pending Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Review Tertunda
              </CardTitle>
              <CardDescription>Aplikasi yang memerlukan review segera</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingReviews && pendingReviews.length > 0 ? (
                  pendingReviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{(review.profiles as any)?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{(review.steps as any)?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(review.status)}
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">Tidak ada review tertunda</p>
                )}
              </div>
              {pendingReviews && pendingReviews.length > 5 && (
                <div className="mt-4">
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <a href="/admin/reviews">Lihat Semua Review</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Submisi Terbaru
              </CardTitle>
              <CardDescription>Aplikasi yang baru saja disubmit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSubmissions && recentSubmissions.length > 0 ? (
                  recentSubmissions.map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{(submission.profiles as any)?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{(submission.steps as any)?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(submission.created_at).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(submission.status)}
                        <Button size="sm" variant="outline">
                          Lihat
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">Belum ada submisi terbaru</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Akses fitur utama untuk mengelola proses pengakuan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <a
                href="/admin/reviews"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Review Aplikasi</p>
                  <p className="text-sm text-muted-foreground">Tinjau dan setujui aplikasi</p>
                </div>
              </a>
              <a
                href="/admin/students"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Kelola Mahasiswa</p>
                  <p className="text-sm text-muted-foreground">Lihat progress mahasiswa</p>
                </div>
              </a>
              <a
                href="/admin/reports"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Laporan</p>
                  <p className="text-sm text-muted-foreground">Lihat statistik dan laporan</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
