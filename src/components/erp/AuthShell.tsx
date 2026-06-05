import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";

export function AuthShell({
  icon,
  iconTone = "primary",
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  iconTone?: "primary" | "destructive" | "accent";
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  const tone =
    iconTone === "destructive"
      ? "bg-destructive/10 text-destructive"
      : iconTone === "accent"
        ? "bg-accent/10 text-accent"
        : "bg-primary/10 text-primary";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md text-center">
        <Link to="/" className="mb-10 inline-flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          <span className="flex flex-col items-start leading-none">
            <span className="font-heading text-lg font-extrabold text-spice-brown">Agrozaar</span>
            <span className="text-[0.65rem] font-medium tracking-[0.22em] text-muted-foreground">FOODS LLP</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ${tone}`}>
            {icon}
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          {children && <div className="mt-6 text-left">{children}</div>}
        </div>
      </div>
    </div>
  );
}
