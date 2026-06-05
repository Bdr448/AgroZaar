import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { Construction, Plus } from "lucide-react";
import { PageHeader } from "@/components/erp/widgets";

export const Route = createFileRoute("/app/$")({
  component: ModulePage,
});

function titleFromPath(path: string) {
  const seg = path.replace(/^\/app\//, "").split("/");
  return seg
    .map((s) => s.replace(/-/g, " ").replace(/\band\b/g, "&").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" · ");
}

function ModulePage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = titleFromPath(pathname);

  return (
    <>
      <PageHeader
        title={title}
        subtitle="Enterprise module"
        action={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90">
            <Plus className="h-4 w-4" /> New Entry
          </button>
        }
      />
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/60 p-12 text-center">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
          <Construction className="h-8 w-8" />
        </span>
        <h2 className="font-heading text-xl font-semibold text-foreground">{title} module</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          This enterprise module is part of the Agrozaar Foods ERP. The interface, tables and forms for this
          section will appear here.
        </p>
      </div>
    </>
  );
}
