import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Users, Search, Eye, GraduationCap } from "lucide-react"

export default async function StudentsPage() {
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

  // Fetch all students with their program enrollments and progress
  const { data: students } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      created_at,
      user_programs(
        programs(name)
      ),
      user_step_progress(
        status,
        steps(name)
      )
    `)
    .eq("role", "user")
    .order("created_at", { ascending: false })

  const getProgressSummary = (progress: any[]) => {
    if (!progress || progress.length === 0) return "Belum ada progress"

    const completed = progress.filter((p) => p.status === "completed").length
    const total = progress.length
    return `${completed}/${total} langkah selesai`
  }

  const getProgressBadge = (progress: any[]) => {
    if (!progress || progress.length === 0) {
      return <Badge variant="outline">Belum Mulai</Badge>
    }

    const completed = progress.filter((p) => p.status === "completed").length
    const total = progress.length
    const percentage = (completed / total) * 100

    if (percentage === 100) {
      return <Badge variant="default">Selesai</Badge>
    } else if (percentage > 50) {
      return <Badge variant="secondary">Hampir Selesai</Badge>
    } else if (percentage > 0) {
      return <Badge variant="outline">Dalam Progress</Badge>
    } else {
      return <Badge variant="outline">Belum Mulai</Badge>
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Kelola Mahasiswa</h1>
          <p className="text-muted-foreground">Monitor progress dan kelola mahasiswa dalam sistem</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Daftar Mahasiswa
          </CardTitle>
          <CardDescription>Semua mahasiswa yang terdaftar dalam sistem pengakuan</CardDescription>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari mahasiswa..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Daftar</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students && students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.full_name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      {(student.user_programs as any)?.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {((student.user_programs as any)[0].programs as any)?.name || "Tidak ada program"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Belum mendaftar program</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{getProgressSummary(student.user_step_progress as any)}</div>
                    </TableCell>
                    <TableCell>{getProgressBadge(student.user_step_progress as any)}</TableCell>
                    <TableCell>{new Date(student.created_at).toLocaleDateString("id-ID")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Belum ada mahasiswa terdaftar
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
