import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ReviewActions } from "@/components/review-actions"
import { ArrowLeft, User, FileText, Calendar } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: Promise<{ reviewId: string }>
}

export default async function ReviewDetailPage({ params }: PageProps) {
  const { reviewId } = await params
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

  // Fetch review details
  const { data: review } = await supabase
    .from("user_step_progress")
    .select("*, profiles(full_name, email), steps(name, description, step_type)")
    .eq("id", reviewId)
    .single()

  if (!review) {
    redirect("/admin/reviews")
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
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/admin/reviews"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Review
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Review Aplikasi</h1>
            <p className="text-muted-foreground">Detail review untuk {(review.profiles as any)?.full_name}</p>
          </div>
          {getStatusBadge(review.status)}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Mahasiswa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Nama Lengkap</p>
                <p className="text-sm text-muted-foreground">{(review.profiles as any)?.full_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{(review.profiles as any)?.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Step Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informasi Langkah
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Nama Langkah</p>
                <p className="text-sm text-muted-foreground">{(review.steps as any)?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Deskripsi</p>
                <p className="text-sm text-muted-foreground text-pretty">{(review.steps as any)?.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Tipe Langkah</p>
                <Badge variant="outline">{(review.steps as any)?.step_type}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Submitted Data */}
          <Card>
            <CardHeader>
              <CardTitle>Data yang Disubmit</CardTitle>
              <CardDescription>Informasi yang disubmit oleh mahasiswa</CardDescription>
            </CardHeader>
            <CardContent>
              {review.data && Object.keys(review.data).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(review.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-start p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">
                          {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </p>
                        <p className="text-sm text-muted-foreground text-pretty">{String(value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Tidak ada data yang disubmit</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Review Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi Review</CardTitle>
              <CardDescription>Setujui atau tolak aplikasi ini</CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewActions review={review} />
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Disubmit</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
              {review.updated_at !== review.created_at && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Diupdate</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.updated_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
              )}
              {review.completed_at && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Selesai</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.completed_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Notes */}
          {review.admin_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Catatan Admin</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-pretty">{review.admin_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
