"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Upload, CheckCircle, AlertCircle, Clock } from "lucide-react"

interface StepFormProps {
  step: any
  progress: any
  userId: string
}

export function StepForm({ step, progress, userId }: StepFormProps) {
  const [formData, setFormData] = useState(progress?.data || {})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Create or update user step progress
      const progressData = {
        user_id: userId,
        step_id: step.id,
        status: step.step_type === "review" || step.step_type === "approval" ? "pending" : "in_progress",
        data: formData,
        updated_at: new Date().toISOString(),
      }

      if (progress) {
        // Update existing progress
        const { error } = await supabase.from("user_step_progress").update(progressData).eq("id", progress.id)
      } else {
        // Create new progress
        const { error } = await supabase.from("user_step_progress").insert(progressData)
      }

      if (error) throw error

      // Redirect back to dashboard
      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const renderField = (field: any) => {
    const { name, type, required, options, placeholder } = field

    switch (type) {
      case "text":
        return (
          <div key={name} className="grid gap-2">
            <Label htmlFor={name}>
              {name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={name}
              type="text"
              placeholder={placeholder}
              value={formData[name] || ""}
              onChange={(e) => handleInputChange(name, e.target.value)}
              required={required}
              disabled={progress?.status === "completed"}
            />
          </div>
        )

      case "textarea":
        return (
          <div key={name} className="grid gap-2">
            <Label htmlFor={name}>
              {name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={name}
              placeholder={placeholder}
              value={formData[name] || ""}
              onChange={(e) => handleInputChange(name, e.target.value)}
              required={required}
              disabled={progress?.status === "completed"}
              rows={4}
            />
          </div>
        )

      case "select":
        return (
          <div key={name} className="grid gap-2">
            <Label htmlFor={name}>
              {name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={formData[name] || ""}
              onValueChange={(value) => handleInputChange(name, value)}
              disabled={progress?.status === "completed"}
            >
              <SelectTrigger>
                <SelectValue placeholder={placeholder || "Pilih opsi"} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case "file":
        return (
          <div key={name} className="grid gap-2">
            <Label htmlFor={name}>
              {name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Klik untuk mengunggah atau seret file ke sini</p>
              <Input
                id={name}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleInputChange(name, file.name)
                  }
                }}
                required={required}
                disabled={progress?.status === "completed"}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById(name)?.click()}
                disabled={progress?.status === "completed"}
              >
                Pilih File
              </Button>
              {formData[name] && <p className="text-sm text-muted-foreground mt-2">File: {formData[name]}</p>}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Show status for review/approval steps
  if (step.step_type === "review" || step.step_type === "approval") {
    return (
      <div className="text-center py-8">
        {progress?.status === "completed" ? (
          <div>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Langkah Selesai</h3>
            <p className="text-muted-foreground">
              {step.step_type === "review" ? "Review telah selesai" : "Persetujuan telah diberikan"}
            </p>
          </div>
        ) : progress?.status === "rejected" ? (
          <div>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Langkah Ditolak</h3>
            <p className="text-muted-foreground">Silakan periksa catatan admin untuk informasi lebih lanjut</p>
          </div>
        ) : (
          <div>
            <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Menunggu {step.step_type === "review" ? "Review" : "Persetujuan"}
            </h3>
            <p className="text-muted-foreground">
              Langkah ini sedang {step.step_type === "review" ? "direview" : "menunggu persetujuan"} oleh admin
            </p>
          </div>
        )}
      </div>
    )
  }

  // Show completed status
  if (progress?.status === "completed") {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Langkah Selesai</h3>
        <p className="text-muted-foreground">Anda telah menyelesaikan langkah ini</p>
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h4 className="font-medium mb-4">Data yang Disubmit:</h4>
            <div className="space-y-2 text-left">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-sm font-medium">{key.replace(/_/g, " ")}:</span>
                  <span className="text-sm text-muted-foreground">{String(value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render form fields
  const formFields = step.form_fields?.fields || []

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formFields.length > 0 ? (
        formFields.map((field: any) => renderField(field))
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Tidak ada field yang dikonfigurasi untuk langkah ini</p>
        </div>
      )}

      {error && (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {formFields.length > 0 && progress?.status !== "completed" && (
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Menyimpan..." : progress ? "Update" : "Submit"}
        </Button>
      )}
    </form>
  )
}
