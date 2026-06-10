import { useState, useMemo } from "react";
import { Search, ArrowUpDown, Download, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: keyof T & string;
  header: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  render?: (row: T) => React.ReactNode;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchable = true,
  pageSize = 8,
  emptyLabel = "No records found",
}: {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  pageSize?: number;
  emptyLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [asc, setAsc] = useState(true);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let rows = data;
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
    }
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = a[sortKey],
          bv = b[sortKey];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === "number" && typeof bv === "number") return asc ? av - bv : bv - av;
        return asc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }
    return rows;
  }, [data, query, sortKey, asc]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * pageSize, current * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) setAsc((a) => !a);
    else {
      setSortKey(key);
      setAsc(true);
    }
  };

  const handleExport = () => {
    const headersStr = columns
      .filter((c) => c.header !== "Actions" && c.header !== "Slip" && c.header !== "Modify Access")
      .map((c) => `"${c.header.replace(/"/g, '""')}"`)
      .join(",");

    const rowsStr = filtered
      .map((row) => {
        return columns
          .filter((c) => c.header !== "Actions" && c.header !== "Slip" && c.header !== "Modify Access")
          .map((c) => {
            const rawVal = row[c.key];
            const valStr = rawVal != null ? String(rawVal) : "";
            return `"${valStr.replace(/"/g, '""')}"`;
          })
          .join(",");
      })
      .join("\n");

    const csvContent = `${headersStr}\n${rowsStr}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-soft">
      {searchable && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search…"
              className="w-full rounded-lg border border-input bg-secondary/50 py-2 pl-10 pr-3 text-sm outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-4 py-3 font-semibold text-muted-foreground",
                    c.align === "right"
                      ? "text-right"
                      : c.align === "center"
                        ? "text-center"
                        : "text-left",
                  )}
                >
                  {c.sortable ? (
                    <button
                      onClick={() => toggleSort(c.key)}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      {c.header} <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Inbox className="h-8 w-8" />
                    <p className="text-sm">{emptyLabel}</p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40"
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "px-4 py-3 text-foreground",
                        c.align === "right"
                          ? "text-right"
                          : c.align === "center"
                            ? "text-center"
                            : "text-left",
                      )}
                    >
                      {c.render ? c.render(row) : String(row[c.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > pageSize && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <span>
            Showing {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, filtered.length)}{" "}
            of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={current === 1}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-input disabled:opacity-40 hover:bg-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-medium text-foreground">
              {current} / {pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={current === pages}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-input disabled:opacity-40 hover:bg-secondary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
