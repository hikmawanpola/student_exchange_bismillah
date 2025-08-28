"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle } from "lucide-react"

interface ReviewActionsProps {
  review: any
}

export function ReviewActions({ review }: ReviewActionsProps) {
  const [notes, setNotes] = useState(review.admin_notes || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleAction = async (action: "approve" | "reject") => {
    setIsLoading(true)
    setError(null)

    try {
      const updateData = {
        status: action === "approve" ? "completed" : "rejected",
        admin_notes: notes,
        completed_at: action === "approve" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("user_step_progress").update(updateData).eq("id", review.id)

      if (error) throw error

      router.push("/admin/reviews")
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (review.status === "completed" || review.status === "rejected") {
    return (
      <div className="text-center py-4">
        <div className="mb-4">
          {review.status === "completed" ? (
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
          ) : (
            <XCircle className="h-8 w-8 text-red-500 mx-auto" />
          )}
        </div>
        <p className="font-medium">{review.status === "completed" ? "Aplikasi Disetujui" : "Aplikasi Ditolak"}</p>
        <p className="text-sm text-muted-foreground">
          {review.completed_at && `Pada ${new Date(review.completed_at).toLocaleDateString("id-ID")}`}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="notes">Catatan Admin</Label>
        <Textarea
          id="notes"
          placeholder="Tambahkan catatan untuk mahasiswa..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
      </div>

      {error && (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid gap-2">
        <Button
          onClick={() => handleAction("approve")}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {isLoading ? "Memproses..." : "Setujui"}
        </Button>
        <Button onClick={() => handleAction("reject")} disabled={isLoading} variant="destructive" className="w-full">
          <XCircle className="h-4 w-4 mr-2" />
          {isLoading ? "Memproses..." : "Tolak"}
        </Button>
      </div>
    </div>
  )
}
