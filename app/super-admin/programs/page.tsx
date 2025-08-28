import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, BookOpen } from "lucide-react"
import { Input } from "@/components/ui/input"

export default async function ProgramsManagement() {
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

  // Fetch all programs with enrollment count
  const { data: programs } = await supabase
    .from("programs")
    .select(`
      id,
      name,
      description,
      is_active,
      created_at,
      user_programs(count)
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Kelola Program</h1>
          <p className="text-muted-foreground">Atur program studi yang tersedia untuk pengakuan</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Program
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Program Studi</CardTitle>
          <CardDescription>Semua program studi yang tersedia dalam sistem</CardDescription>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari program..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Program</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pendaftar</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs && programs.length > 0 ? (
                programs.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{program.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{program.description || "Tidak ada deskripsi"}</TableCell>
                    <TableCell>
                      <Badge variant={program.is_active ? "default" : "secondary"}>
                        {program.is_active ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{(program.user_programs as any)?.length || 0} orang</Badge>
                    </TableCell>
                    <TableCell>{new Date(program.created_at).toLocaleDateString("id-ID")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Detail
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Belum ada program studi
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
