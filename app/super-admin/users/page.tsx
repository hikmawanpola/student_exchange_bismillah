import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserPlus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default async function UsersManagement() {
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

  // Fetch all users
  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Badge variant="default">Super Admin</Badge>
      case "admin":
        return <Badge variant="secondary">Admin</Badge>
      case "user":
        return <Badge variant="outline">Mahasiswa</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Kelola Pengguna</h1>
          <p className="text-muted-foreground">Atur pengguna dan peran mereka dalam sistem</p>
        </div>
        <Link href="/super-admin/users/create">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Buat Akun Admin
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>
            Semua pengguna yang terdaftar dalam sistem.
            <span className="text-sm text-muted-foreground block mt-1">
              Mahasiswa dapat mendaftar sendiri, Admin hanya bisa dibuat oleh Super Admin
            </span>
          </CardDescription>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari pengguna..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Tanggal Daftar</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString("id-ID")}</TableCell>
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
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Belum ada pengguna terdaftar
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
