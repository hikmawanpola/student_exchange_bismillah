import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  BookOpen,
  FileText,
  User,
  ArrowRight,
} from "lucide-react";

export default async function StudentDashboard() {
  const supabase = await createClient();

  // Check authentication and role
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (
    !profile ||
    !["user", "super_admin"].includes(profile.role?.toLowerCase())
  ) {
    redirect("/unauthorized");
  }

  // Fetch student's program enrollments
  const { data: userPrograms } = await supabase
    .from("user_programs")
    .select("*, programs(*)")
    .eq("user_id", user.id);

  // Fetch student's step progress
  const { data: stepProgress } = await supabase
    .from("user_step_progress")
    .select("*, steps(*)")
    .eq("user_id", user.id)
    .order("steps(order_index)");

  // Fetch all available steps to show the complete process
  const { data: allSteps } = await supabase
    .from("steps")
    .select("*")
    .eq("is_active", true)
    .order("order_index");

  // Calculate overall progress
  const totalSteps = allSteps?.length || 0;
  const completedSteps =
    stepProgress?.filter((p) => p.status === "completed").length || 0;
  const progressPercentage =
    totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  // Get current step (first incomplete step)
  const currentStep = allSteps?.find((step) => {
    const progress = stepProgress?.find((p) => p.step_id === step.id);
    return !progress || progress.status !== "completed";
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Menunggu Review</Badge>;
      case "in_progress":
        return <Badge variant="secondary">Sedang Diproses</Badge>;
      case "completed":
        return <Badge variant="default">Selesai</Badge>;
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge variant="outline">Belum Dimulai</Badge>;
    }
  };

  const getStepStatus = (stepId: string) => {
    const progress = stepProgress?.find((p) => p.step_id === stepId);
    return progress?.status || "not_started";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">
                Dashboard Mahasiswa
              </h1>
              <p className="text-muted-foreground">
                Selamat datang, {profile.full_name}
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              Mahasiswa
            </Badge>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Progress Pengakuan
            </CardTitle>
            <CardDescription>
              Kemajuan Anda dalam proses pengakuan ICAO
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Progress Keseluruhan
                </span>
                <span className="text-sm text-muted-foreground">
                  {completedSteps} dari {totalSteps} langkah selesai
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">0%</span>
                <span className="font-medium">
                  {Math.round(progressPercentage)}%
                </span>
                <span className="text-muted-foreground">100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Step */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Langkah Saat Ini
              </CardTitle>
              <CardDescription>
                Langkah yang perlu Anda selesaikan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-balance">
                      {currentStep.name}
                    </h3>
                    <p className="text-sm text-muted-foreground text-pretty">
                      {currentStep.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(getStepStatus(currentStep.id))}
                    <Badge variant="outline">{currentStep.step_type}</Badge>
                  </div>
                  <Button className="w-full" asChild>
                    <a href={`/dashboard/steps/${currentStep.id}`}>
                      Lanjutkan Langkah
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-medium">Semua langkah telah selesai!</p>
                  <p className="text-sm text-muted-foreground">
                    Selamat, Anda telah menyelesaikan semua proses.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Program Enrollment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-500" />
                Program Terdaftar
              </CardTitle>
              <CardDescription>Program studi yang Anda ikuti</CardDescription>
            </CardHeader>
            <CardContent>
              {userPrograms && userPrograms.length > 0 ? (
                <div className="space-y-3">
                  {userPrograms.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {(enrollment.programs as any)?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(enrollment.programs as any)?.description ||
                            "Program studi terakreditasi"}
                        </p>
                      </div>
                      <Badge variant="default">Aktif</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="font-medium">Belum mendaftar program</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pilih program studi untuk memulai proses pengakuan
                  </p>
                  <Button variant="outline" asChild>
                    <a href="/dashboard/programs">Pilih Program</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Steps Overview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              Semua Langkah Proses
            </CardTitle>
            <CardDescription>
              Ringkasan semua langkah dalam proses pengakuan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allSteps && allSteps.length > 0 ? (
                allSteps.map((step, index) => {
                  const status = getStepStatus(step.id);
                  const progress = stepProgress?.find(
                    (p) => p.step_id === step.id
                  );

                  return (
                    <div
                      key={step.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            status === "completed"
                              ? "bg-green-500 text-white"
                              : status === "in_progress" || status === "pending"
                              ? "bg-blue-500 text-white"
                              : status === "rejected"
                              ? "bg-red-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {status === "completed" ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : status === "rejected" ? (
                            <AlertCircle className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-balance">
                            {step.name}
                          </h3>
                          {getStatusBadge(status)}
                        </div>
                        <p className="text-sm text-muted-foreground text-pretty">
                          {step.description}
                        </p>
                        {progress?.admin_notes && (
                          <p className="text-sm text-blue-600 mt-1">
                            Catatan: {progress.admin_notes}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {status !== "completed" && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/dashboard/steps/${step.id}`}>
                              {status === "not_started" ? "Mulai" : "Lanjutkan"}
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada langkah yang dikonfigurasi
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Akses fitur utama dengan mudah</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <a
                href="/dashboard/profile"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <User className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Profil Saya</p>
                  <p className="text-sm text-muted-foreground">
                    Kelola informasi pribadi
                  </p>
                </div>
              </a>
              <a
                href="/dashboard/programs"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <BookOpen className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Program Studi</p>
                  <p className="text-sm text-muted-foreground">
                    Lihat dan daftar program
                  </p>
                </div>
              </a>
              <a
                href="/dashboard/documents"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <FileText className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Dokumen</p>
                  <p className="text-sm text-muted-foreground">
                    Kelola dokumen pendukung
                  </p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
