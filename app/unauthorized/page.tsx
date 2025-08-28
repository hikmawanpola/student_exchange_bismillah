import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShieldX } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <ShieldX className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Akses Ditolak</CardTitle>
            <CardDescription>Anda tidak memiliki izin untuk mengakses halaman ini</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.
            </p>
            <Button asChild className="w-full">
              <Link href="/">Kembali ke Beranda</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
