import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, CheckCircle, Plus } from "lucide-react"

export default async function ProgramsPage() {
  const supabase = await createClient()

  // Check authentication and role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "user") {
    redirect("/unauthorized")
  }

  // Fetch all available programs
  const { data: allPrograms } = await supabase.from("programs").select("*").eq("is_active", true).order("name")

  // Fetch user's enrolled programs
  const { data: userPrograms } = await supabase.from("user_programs").select("program_id").eq("user_id", user.id)

  const enrolledProgramIds = userPrograms?.map((up) => up.program_id) || []

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Program Studi</h1>
          <p className="text-muted-foreground">Pilih program studi untuk memulai proses pengakuan</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allPrograms && allPrograms.length > 0 ? (
          allPrograms.map((program) => {
            const isEnrolled = enrolledProgramIds.includes(program.id)

            return (
              <Card key={program.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    {isEnrolled ? (
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Terdaftar
                      </Badge>
                    ) : (
                      <Badge variant="outline">Tersedia</Badge>
                    )}
                  </div>
                  <CardTitle className="text-balance">{program.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-pretty mb-4">
                    {program.description || "Program studi yang tersedia untuk proses pengakuan ICAO"}
                  </CardDescription>
                  {isEnrolled ? (
                    <Button variant="outline" className="w-full bg-transparent" disabled>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Sudah Terdaftar
                    </Button>
                  ) : (
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Daftar Program
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum Ada Program</h3>
            <p className="text-muted-foreground">Belum ada program studi yang tersedia saat ini.</p>
          </div>
        )}
      </div>
    </div>
  )
}
