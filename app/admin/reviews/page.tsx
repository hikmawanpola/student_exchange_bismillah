import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Clock, Eye } from "lucide-react"

export default async function ReviewsPage() {
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

  // Fetch all reviews grouped by status
  const [{ data: pendingReviews }, { data: inProgressReviews }, { data: completedReviews }] = await Promise.all([
    supabase
      .from("user_step_progress")
      .select("*, profiles(full_name, email), steps(name, description)")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("user_step_progress")
      .select("*, profiles(full_name, email), steps(name, description)")
      .eq("status", "in_progress")
      .order("updated_at", { ascending: false }),
    supabase
      .from("user_step_progress")
      .select("*, profiles(full_name, email), steps(name, description)")
      .eq("status", "completed")
      .order("updated_at", { ascending: false }),
  ])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Menunggu</Badge>
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

  const ReviewTable = ({ reviews, showActions = true }: { reviews: any[]; showActions?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mahasiswa</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Langkah</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tanggal</TableHead>
          {showActions && <TableHead>Aksi</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell className="font-medium">{(review.profiles as any)?.full_name}</TableCell>
              <TableCell>{(review.profiles as any)?.email}</TableCell>
              <TableCell>{(review.steps as any)?.name}</TableCell>
              <TableCell>{getStatusBadge(review.status)}</TableCell>
              <TableCell>{new Date(review.created_at).toLocaleDateString("id-ID")}</TableCell>
              {showActions && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={showActions ? 6 : 5} className="text-center py-8 text-muted-foreground">
              Tidak ada data review
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Review Aplikasi</h1>
          <p className="text-muted-foreground">Tinjau dan kelola aplikasi pengakuan mahasiswa</p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Menunggu ({pendingReviews?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Sedang Diproses ({inProgressReviews?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Selesai ({completedReviews?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Review Tertunda
              </CardTitle>
              <CardDescription>Aplikasi yang memerlukan review segera</CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewTable reviews={pendingReviews || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in-progress">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Sedang Diproses
              </CardTitle>
              <CardDescription>Aplikasi yang sedang dalam proses review</CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewTable reviews={inProgressReviews || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Review Selesai
              </CardTitle>
              <CardDescription>Aplikasi yang telah selesai direview</CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewTable reviews={completedReviews || []} showActions={false} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
