"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VidlixWordmark } from "@/components/vidlix-wordmark";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    undefined,
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <VidlixWordmark className="text-2xl font-bold tracking-widest text-white" xClassName="text-violet-400" />
          <div className="text-[11px] tracking-[0.2em] text-violet-400 mt-1">
            SUPER ADMIN PANEL
          </div>
        </div>
        <form action={formAction} className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-neutral-300">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              defaultValue="admin@vidlix.in"
              className="bg-neutral-950 border-neutral-800 text-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-neutral-300">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-neutral-950 border-neutral-800 text-white"
            />
          </div>
          {state?.error ? (
            <p className="text-sm text-red-400">{state.error}</p>
          ) : null}
          <Button type="submit" disabled={pending} className="w-full bg-violet-600 hover:bg-violet-700">
            {pending ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-xs text-neutral-500 text-center pt-1">
            Demo credentials — admin@vidlix.in / vidlix@admin123
          </p>
        </form>
      </div>
    </div>
  );
}
