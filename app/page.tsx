import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { GraduationCap, Shield, Users, CheckCircle, ArrowRight, BookOpen } from "lucide-react"

interface LandingContent {
  id: string
  section_key: string
  title: string | null
  content: string | null
  image_url: string | null
  is_active: boolean
}

interface Program {
  id: string
  name: string
  description: string | null
  is_active: boolean
}

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch landing page content
  const { data: landingContent } = await supabase
    .from("landing_content")
    .select("*")
    .eq("is_active", true)
    .order("section_key")

  // Fetch active programs
  const { data: programs } = await supabase.from("programs").select("*").eq("is_active", true).order("name")

  // Helper function to get content by section key
  const getContent = (key: string): LandingContent | undefined => {
    return landingContent?.find((content) => content.section_key === key)
  }

  const heroContent = getContent("hero")
  const aboutContent = getContent("about")
  const featuresContent = getContent("features")

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">Telkom University Student Exchange</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="#programs">Program</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#features">Fitur</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#about">Tentang</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/login">Masuk</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl mb-6">
              {heroContent?.title || "Sistem Manajemen Student Exchange"}
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
              {heroContent?.content ||
                "Platform terpadu untuk mengelola program pertukaran mahasiswa internasional Telkom University"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/signup">
                  Daftar Exchange
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#programs">Lihat Program</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-balance mb-4">{featuresContent?.title || "Fitur Utama"}</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              {featuresContent?.content ||
                "Sistem yang dirancang untuk memudahkan proses pertukaran mahasiswa dengan berbagai fitur canggih"}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle>Multi-Role Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sistem peran yang fleksibel untuk Super Admin, Admin Prodi, dan Mahasiswa dengan akses yang sesuai
                  untuk program exchange
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Shield className="h-6 w-6" />
                </div>
                <CardTitle>Dynamic Step Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Konfigurasi langkah-langkah proses pertukaran mahasiswa yang dapat disesuaikan sesuai kebutuhan
                  universitas partner
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <CardTitle>Real-time Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Pantau progress aplikasi exchange secara real-time dengan dashboard yang informatif dan mudah dipahami
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-balance mb-4">Program Exchange</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Program pertukaran mahasiswa internasional yang tersedia di Telkom University
            </p>
          </div>
          {programs && programs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program: Program) => (
                <Card key={program.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <Badge variant="secondary">Aktif</Badge>
                    </div>
                    <CardTitle className="text-balance">{program.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-pretty">
                      {program.description || "Program pertukaran mahasiswa dengan universitas partner internasional"}
                    </CardDescription>
                    <Button className="w-full mt-4 bg-transparent" variant="outline" asChild>
                      <Link href="/auth/signup">Daftar Program</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada program exchange yang tersedia</p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-balance mb-6">{aboutContent?.title || "Tentang Sistem"}</h2>
            <p className="text-xl text-muted-foreground text-pretty mb-8">
              {aboutContent?.content ||
                "Sistem ini dirancang untuk memfasilitasi proses pertukaran mahasiswa Telkom University dengan universitas partner internasional secara efisien dan transparan"}
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-xl font-semibold mb-4">Untuk Universitas</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Manajemen program exchange yang komprehensif
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Tracking progress aplikasi mahasiswa secara real-time
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Sistem approval yang terstruktur dengan universitas partner
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Untuk Mahasiswa</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Proses aplikasi exchange yang mudah dan intuitif
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Dashboard personal untuk monitoring progress aplikasi
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Notifikasi status aplikasi exchange secara real-time
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-balance mb-4">Siap Memulai?</h2>
            <p className="text-xl text-muted-foreground text-pretty mb-8">
              Bergabunglah dengan program pertukaran mahasiswa internasional Telkom University yang terpercaya
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/signup">Daftar Sekarang</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">Sudah Punya Akun?</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">Telkom University Student Exchange</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Kebijakan Privasi
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Syarat & Ketentuan
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Kontak
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Telkom University Student Exchange System. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
