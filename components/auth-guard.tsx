"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

export function AuthGuard({ children, allowedRoles, redirectTo = "/auth/login" }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push(redirectTo)
          return
        }

        setUser(user)

        // Get user profile to check role
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (profile) {
          setUserRole(profile.role)

          // Check if user has required role
          if (allowedRoles && !allowedRoles.includes(profile.role)) {
            router.push("/unauthorized")
            return
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push(redirectTo)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push(redirectTo)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, allowedRoles, redirectTo])

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
