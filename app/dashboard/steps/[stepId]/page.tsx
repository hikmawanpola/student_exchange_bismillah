import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StepForm } from "@/components/step-form"
import { ArrowLeft, FileText, Upload, Eye, CheckCircle } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: Promise<{ stepId: string }>
}

export default async function StepPage({ params }: PageProps) {
  const { stepId } = await params
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

  // Fetch step details
  const { data: step } = await supabase.from("steps").select("*").eq("id", stepId).single()

  if (!step) {
    redirect("/dashboard")
  }

  // Fetch user's progress for this step
  const { data: progress } = await supabase
    .from("user_step_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("step_id", stepId)
    .single()

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case "form":
        return <FileText className="h-5 w-5" />
      case "upload":
        return <Upload className="h-5 w-5" />
      case "review":
        return <Eye className="h-5 w-5" />
      case "approval":
        return <CheckCircle className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Menunggu Review</Badge>
      case "in_progress":
        return <Badge variant="secondary">Sedang Diproses</Badge>
      case "completed":
        return <Badge variant="default">Selesai</Badge>
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>
      default:
        return <Badge variant="outline">Belum Dimulai</Badge>
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">{step.name}</h1>
            <p className="text-muted-foreground text-pretty">{step.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(progress?.status || "not_started")}
            <Badge variant="outline" className="flex items-center gap-1">
              {getStepIcon(step.step_type)}
              {step.step_type}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lengkapi Langkah</CardTitle>
              <CardDescription>
                {step.step_type === "form" && "Isi formulir berikut dengan lengkap"}
                {step.step_type === "upload" && "Unggah dokumen yang diperlukan"}
                {step.step_type === "review" && "Langkah ini sedang dalam proses review"}
                {step.step_type === "approval" && "Menunggu persetujuan dari admin"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StepForm step={step} progress={progress} userId={user.id} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Step Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Langkah</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Tipe Langkah</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStepIcon(step.step_type)}
                  <span className="text-sm capitalize">{step.step_type}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Urutan</p>
                <p className="text-sm text-muted-foreground">Langkah ke-{step.order_index}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                {getStatusBadge(progress?.status || "not_started")}
              </div>
              {progress?.completed_at && (
                <div>
                  <p className="text-sm font-medium">Selesai pada</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(progress.completed_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Notes */}
          {progress?.admin_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Catatan Admin</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-pretty">{progress.admin_notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle>Bantuan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-pretty">
                Jika Anda mengalami kesulitan dalam menyelesaikan langkah ini, silakan hubungi admin untuk mendapatkan
                bantuan.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
