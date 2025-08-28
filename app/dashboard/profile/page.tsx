import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Calendar, Shield } from "lucide-react"

export default async function ProfilePage() {
  const supabase = await createClient()

  // Check authentication and role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "user") {
    redirect("/unauthorized")
  }

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
          <h1 className="text-3xl font-bold text-balance">Profil Saya</h1>
          <p className="text-muted-foreground">Kelola informasi pribadi Anda</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Pribadi
            </CardTitle>
            <CardDescription>Data pribadi dan informasi akun</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input id="fullName" value={profile.full_name} readOnly />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input id="email" value={profile.email} readOnly />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Peran</Label>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                {getRoleBadge(profile.role)}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="joinDate">Tanggal Bergabung</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{new Date(profile.created_at).toLocaleDateString("id-ID")}</span>
              </div>
            </div>
            <Button className="w-full">Edit Profil</Button>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistik Akun</CardTitle>
            <CardDescription>Ringkasan aktivitas Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Status Akun</p>
                <p className="text-sm text-muted-foreground">Akun aktif dan terverifikasi</p>
              </div>
              <Badge variant="default">Aktif</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Terakhir Login</p>
                <p className="text-sm text-muted-foreground">Informasi login terakhir</p>
              </div>
              <span className="text-sm text-muted-foreground">Hari ini</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Keamanan</p>
                <p className="text-sm text-muted-foreground">Password dan keamanan akun</p>
              </div>
              <Button variant="outline" size="sm">
                Ubah Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
