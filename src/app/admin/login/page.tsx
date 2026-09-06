"use client";

import { useActionState, useState, useTransition } from "react";
import {
  loginAction,
  verifyAdminLoginOtpAction,
  resendAdminLoginOtpAction,
  type LoginState,
} from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { VidlixWordmark } from "@/components/vidlix-wordmark";
// Forcing dynamic rendering for this page lives in the new
// admin/login/layout.tsx — a route segment config export needs a Server
// Component to reliably take effect, and this page is "use client".

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    undefined,
  );

  const otpRequired = state && "otpRequired" in state && state.otpRequired;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <VidlixWordmark className="text-2xl font-bold tracking-widest text-white" xClassName="text-violet-400" />
          <div className="text-[11px] tracking-[0.2em] text-violet-400 mt-1">
            SUPER ADMIN PANEL
          </div>
        </div>

        {otpRequired ? (
          <OtpForm adminId={state.adminId} maskedEmail={state.maskedEmail} />
        ) : (
          <form action={formAction} className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-neutral-300">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
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
            {state && "error" in state && state.error ? (
              <p className="text-sm text-red-400">{state.error}</p>
            ) : null}
            <Button type="submit" disabled={pending} className="w-full bg-violet-600 hover:bg-violet-700">
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

function OtpForm({ adminId, maskedEmail }: { adminId: string; maskedEmail: string }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string>();
  const [resent, setResent] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 space-y-5">
      <p className="text-sm text-neutral-400">
        We sent a 6-digit code to <span className="text-neutral-200 font-medium">{maskedEmail}</span>.
        Enter it below to finish signing in.
      </p>
      <div className="flex justify-center">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot key={i} index={i} className="bg-neutral-950 border-neutral-800 text-white" />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      {error ? <p className="text-sm text-red-400 text-center">{error}</p> : null}
      <Button
        className="w-full bg-violet-600 hover:bg-violet-700"
        disabled={pending || otp.length !== 6}
        onClick={() =>
          startTransition(async () => {
            setError(undefined);
            const res = await verifyAdminLoginOtpAction(adminId, otp);
            if (res?.error) setError(res.error);
          })
        }
      >
        {pending ? "Verifying…" : "Verify & Sign In"}
      </Button>
      <button
        type="button"
        className="text-xs text-neutral-500 hover:text-neutral-300 block mx-auto"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(undefined);
            const res = await resendAdminLoginOtpAction(adminId);
            if (res?.error) setError(res.error);
            else {
              setResent(true);
              setTimeout(() => setResent(false), 3000);
            }
          })
        }
      >
        {resent ? "Code resent." : "Resend code"}
      </button>
    </div>
  );
}
