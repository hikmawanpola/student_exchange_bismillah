import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Pendaftaran Berhasil!</CardTitle>
            <CardDescription>Silakan periksa email Anda untuk mengkonfirmasi akun</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Kami telah mengirimkan link konfirmasi ke email Anda. Klik link tersebut untuk mengaktifkan akun Anda.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Kembali ke Halaman Masuk</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
