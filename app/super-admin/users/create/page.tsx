"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"

function CreateUserPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<string>("admin")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Create user with admin service role
      const { data, error: signUpError } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          full_name: fullName,
          role: role,
        },
        email_confirm: true, // Auto-confirm email for admin-created accounts
      })

      if (signUpError) throw signUpError

      setSuccess(`Berhasil membuat akun ${role === "admin" ? "Admin Prodi" : "Super Admin"} untuk ${fullName}`)

      // Reset form
      setEmail("")
      setPassword("")
      setFullName("")
      setRole("admin")

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/super-admin/users")
      }, 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Terjadi kesalahan")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Buat Akun Admin</CardTitle>
              <CardDescription>Buat akun admin atau super admin baru</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Nama Lengkap</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Nama Lengkap"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@telkomuniversity.ac.id"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Peran</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih peran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin Prodi</SelectItem>
                        <SelectItem value="super_admin">Super Admin (ICAO)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimal 6 karakter"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  {success && <p className="text-sm text-green-600">{success}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Membuat akun..." : "Buat Akun Admin"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  <Button variant="outline" onClick={() => router.push("/super-admin/users")} type="button">
                    Kembali ke Daftar User
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CreateUserPageWithAuth() {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <CreateUserPage />
    </AuthGuard>
  )
}
