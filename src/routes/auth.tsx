import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GlassPanel } from "@/components/nexus/glass";
import { NexusLogo } from "@/components/nexus/nexus-logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Nexus AI OS" },
      {
        name: "description",
        content:
          "Sign in or create your Nexus account to access your AI assistant, workspaces, tasks and knowledge base.",
      },
      { property: "og:title", content: "Sign in — Nexus AI OS" },
      {
        property: "og:description",
        content: "Access your Nexus AI operating system with email or Google.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) navigate({ to: "/" });
  }, [loading, session, navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Welcome to Nexus");
          navigate({ to: "/" });
        } else {
          toast.success("Check your email", {
            description: "Open the confirmation link to finish creating your account.",
          });
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back to Nexus");
        navigate({ to: "/" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
        extraParams: { prompt: "select_account" },
      });
      if (result.error) throw result.error;
      if (result.redirected) return;

      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        throw error ?? new Error("Google did not return a valid sign-in session.");
      }
      toast.success("Welcome to Nexus");
      navigate({ to: "/" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google sign-in could not be completed.";
      toast.error("Google sign-in failed", { description: message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "var(--gradient-veil)" }}
      />
      <GlassPanel className="relative w-full max-w-[420px] p-7 sm:p-8">
        <NexusLogo />
        <h1 className="mt-7 text-2xl font-semibold tracking-tight">
          {mode === "signin" ? "Sign in to Nexus" : "Create your Nexus account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your assistant, workspaces and knowledge, all in one calm surface.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-3">
          <label className="glass flex items-center gap-3 rounded-xl px-3.5 py-3">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
          <label className="glass flex items-center gap-3 rounded-xl px-3.5 py-3">
            <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
          <Button
            type="submit"
            disabled={busy}
            className="brand-gradient w-full rounded-xl text-primary-foreground hover:opacity-90"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-glass-border" />
          or
          <span className="h-px flex-1 bg-glass-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={google}
          className="w-full rounded-xl border-glass-border bg-glass hover:bg-glass-strong"
        >
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New to Nexus?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-medium text-violet hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </GlassPanel>
    </div>
  );
}
