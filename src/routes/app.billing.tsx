import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Plus, Search, Filter, Download, X, Trash2, PlusCircle } from "lucide-react";
import { useSession } from "@/lib/erp/auth";
import type { RoleId } from "@/lib/erp/auth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const Route = createFileRoute("/app/billing")({
  component: BillingPage,
});

/* ─── Types ─────────────────────────────────────────────── */
interface LineItem {
  description: string;
  qty: number;
  unit: string;
  rate: number;
}

interface Invoice {
  id: string;
  date: string;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
  // Billed-to
  customerName: string;
  customerAddress: string;
  customerGST: string;
  customerEmail: string;
  customerPhone: string;
  // Items
  items: LineItem[];
  // Financial
  discount: number; // %
  taxRate: number; // %
  notes: string;
  paymentTerms: string;
  bankDetails: string;
}

/* ─── Helpers ────────────────────────────────────────────── */
const ADMIN_ROLES: RoleId[] = ["super-admin", "admin"];
const canCreate = (role: RoleId) => ADMIN_ROLES.includes(role);

const subtotal = (items: LineItem[]) => items.reduce((s, i) => s + i.qty * i.rate, 0);
const calcInvoice = (inv: Invoice) => {
  // Always coerce to number — form inputs can leave these as strings
  const discPct = Number(inv.discount) || 0;
  const taxPct = Number(inv.taxRate) || 0;
  const sub = subtotal(inv.items);
  const discAmt = (sub * discPct) / 100;
  const taxable = sub - discAmt;
  const taxAmt = (taxable * taxPct) / 100;
  return { sub, discAmt, taxable, taxAmt, total: taxable + taxAmt };
};

// UI formatter — uses Rupee symbol, fine for HTML
const fmt = (n: number) =>
  "\u20B9" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// PDF formatter — jsPDF built-in helvetica has no U+20B9 glyph; use plain ASCII
const fmtPdf = (n: number) => "Rs. " + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const newItem = (): LineItem => ({ description: "", qty: 1, unit: "Kg", rate: 0 });

const STATUS_STYLE: Record<string, string> = {
  Paid: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Overdue: "bg-red-100 text-red-700",
};

/* ─── PDF colours (Agrozaar brand) ──────────────────────── */
const BRAND = { r: 232, g: 155, b: 0 }; // turmeric #E89B00
const DARK = { r: 31, g: 31, b: 31 };
const LIGHT = { r: 250, g: 248, b: 245 };

/* ─── PDF Generator ─────────────────────────────────────── */
function downloadInvoicePDF(inv: Invoice, role: RoleId) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const { sub, discAmt, taxable, taxAmt, total } = calcInvoice(inv);

  // ── Background header band ──
  doc.setFillColor(DARK.r, DARK.g, DARK.b);
  doc.rect(0, 0, W, 110, "F");

  // ── Brand accent bar ──
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.rect(0, 110, W, 5, "F");

  // ── Company name ──
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("AGROZAAR FOODS LLP", 40, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 195, 188);
  doc.text("Premium Spices & Food Products", 40, 67);
  doc.text("GSTIN: 24ABCDE1234F1Z5  |  FSSAI: 10023012000001", 40, 80);
  doc.text(
    "Village Deesa, Banaskantha, Gujarat – 385535  |  info@agrozaar.in  |  +91 98765 43210",
    40,
    93,
  );

  // ── INVOICE badge (right) ──
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.roundedRect(W - 155, 28, 115, 38, 4, 4, "F");
  doc.setTextColor(DARK.r, DARK.g, DARK.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("INVOICE", W - 97, 52, { align: "center" });

  // ── Meta block ──
  let y = 130;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(DARK.r, DARK.g, DARK.b);

  const metaLeft = [
    ["Invoice No.", inv.id],
    ["Date", inv.date],
    ["Due Date", inv.dueDate],
    ["Status", inv.status],
    ["Payment Terms", inv.paymentTerms || "Net 15"],
  ];
  metaLeft.forEach(([label, val], i) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 100, 60);
    doc.text(label + ":", 40, y + i * 16);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(DARK.r, DARK.g, DARK.b);
    doc.text(val, 145, y + i * 16);
  });

  // ── Bill To ──
  const rightX = W / 2 + 20;
  doc.setFillColor(LIGHT.r, LIGHT.g, LIGHT.b);
  doc.roundedRect(rightX - 10, y - 14, W - rightX, 95, 4, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
  doc.text("BILL TO", rightX, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(DARK.r, DARK.g, DARK.b);
  doc.text(inv.customerName, rightX, y + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 70, 60);
  const addrLines = doc.splitTextToSize(inv.customerAddress, W - rightX - 20);
  doc.text(addrLines, rightX, y + 28);
  let billY = y + 28 + addrLines.length * 12;
  if (inv.customerGST) {
    doc.text("GSTIN: " + inv.customerGST, rightX, billY);
    billY += 12;
  }
  if (inv.customerEmail) doc.text(inv.customerEmail, rightX, billY);

  // ── Items table ──
  y = 255;
  autoTable(doc, {
    startY: y,
    head: [["#", "Description", "Qty", "Unit", "Rate", "Amount"]],
    body: inv.items.map((it, i) => [
      i + 1,
      it.description,
      it.qty,
      it.unit,
      fmtPdf(it.rate),
      fmtPdf(it.qty * it.rate),
    ]),
    headStyles: {
      fillColor: [DARK.r, DARK.g, DARK.b],
      textColor: [BRAND.r, BRAND.g, BRAND.b],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, textColor: [DARK.r, DARK.g, DARK.b] },
    alternateRowStyles: { fillColor: [LIGHT.r, LIGHT.g, LIGHT.b] },
    columnStyles: {
      0: { cellWidth: 25, halign: "center" },
      2: { cellWidth: 40, halign: "right" },
      3: { cellWidth: 40, halign: "center" },
      4: { cellWidth: 80, halign: "right" },
      5: { cellWidth: 90, halign: "right" },
    },
    margin: { left: 40, right: 40 },
    tableLineWidth: 0.3,
    tableLineColor: [220, 210, 195],
  });

  // ── Totals block ──
  const finalY: number = (doc as any).lastAutoTable.finalY + 16;
  const totalsX = W - 200;

  const showFull = ["super-admin", "admin", "accountant", "partner"].includes(role);

  // Right-side totals block: fixed column positions
  const MARGIN_R = 40; // right page margin
  const LABEL_X = totalsX; // label left edge
  const VALUE_X = W - MARGIN_R; // value right-aligned anchor (inside margin)
  const ROW_H = 22;

  const rows: [string, string][] = [["Subtotal", fmtPdf(sub)]];
  if (showFull) {
    if (Number(inv.discount) > 0)
      rows.push([`Discount (${inv.discount}%)`, `- ${fmtPdf(discAmt)}`]);
    rows.push([`Tax / GST (${inv.taxRate}%)`, fmtPdf(taxAmt)]);
  }
  rows.push(["TOTAL", fmtPdf(total)]);

  rows.forEach(([label, val], i) => {
    const rowY = finalY + i * ROW_H;
    const isTotal = label === "TOTAL";

    if (isTotal) {
      // Banner spans from LABEL_X - padding to VALUE_X + padding, fully inside margins
      const bannerX = LABEL_X - 8;
      const bannerW = VALUE_X - LABEL_X + 16;
      doc.setFillColor(DARK.r, DARK.g, DARK.b);
      doc.roundedRect(bannerX, rowY - 14, bannerW, 20, 3, 3, "F");
      doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
    } else {
      doc.setTextColor(80, 70, 60);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
    }
    doc.text(label, LABEL_X, rowY);
    doc.text(val, VALUE_X, rowY, { align: "right" });
  });

  // ── Bank details (accountant/admin only) ──
  if (["super-admin", "admin", "accountant"].includes(role) && inv.bankDetails) {
    const bankY = finalY + rows.length * ROW_H + 20;
    doc.setFillColor(LIGHT.r, LIGHT.g, LIGHT.b);
    doc.roundedRect(40, bankY - 14, (W - 80) / 2, 60, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
    doc.text("BANK / PAYMENT DETAILS", 50, bankY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(DARK.r, DARK.g, DARK.b);
    const bankLines = doc.splitTextToSize(inv.bankDetails, (W - 80) / 2 - 20);
    doc.text(bankLines, 50, bankY + 14);
  }

  // ── Notes ──
  if (inv.notes) {
    const notesY = finalY + rows.length * ROW_H + 20;
    const noteX = ["super-admin", "admin", "accountant"].includes(role) ? W / 2 + 10 : 40;
    const noteW = ["super-admin", "admin", "accountant"].includes(role) ? W / 2 - 50 : W - 80;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
    doc.text("NOTES", noteX, notesY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(80, 70, 60);
    const noteLines = doc.splitTextToSize(inv.notes, noteW);
    doc.text(noteLines, noteX, notesY + 14);
  }

  // ── Footer ──
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(DARK.r, DARK.g, DARK.b);
  doc.rect(0, pageH - 32, W, 32, "F");
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.rect(0, pageH - 32, W, 3, "F");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(180, 170, 155);
  doc.text(
    "Thank you for your business. This is a computer-generated invoice.",
    W / 2,
    pageH - 14,
    { align: "center" },
  );

  doc.save(`${inv.id}-${inv.customerName.replace(/\s+/g, "_")}.pdf`);
}

/* ─── Seed data ──────────────────────────────────────────── */
const SEED: Invoice[] = [
  {
    id: "INV-2025-001",
    date: "2025-06-01",
    dueDate: "2025-06-15",
    status: "Paid",
    customerName: "Fresh Mart Pvt Ltd",
    customerAddress: "12, Ring Road, Ahmedabad, Gujarat – 380001",
    customerGST: "24AABCF1234G1Z5",
    customerEmail: "accounts@freshmart.in",
    customerPhone: "+91 98001 12345",
    items: [
      { description: "Premium Turmeric Powder (1 Kg Pack)", qty: 200, unit: "Kg", rate: 120 },
      { description: "Red Chilli Powder (500g Pack)", qty: 150, unit: "Kg", rate: 95 },
    ],
    discount: 5,
    taxRate: 5,
    notes: "Delivery within 3 working days.",
    paymentTerms: "Net 15",
    bankDetails: "Bank: HDFC Bank\nA/C: 50200012345678\nIFSC: HDFC0001234\nBranch: Deesa, Gujarat",
  },
  {
    id: "INV-2025-002",
    date: "2025-06-03",
    dueDate: "2025-06-17",
    status: "Pending",
    customerName: "Spice World Exports",
    customerAddress: "Plot 45, GIDC, Surat, Gujarat – 395010",
    customerGST: "24BBBCE5678H2Z1",
    customerEmail: "purchase@spiceworld.com",
    customerPhone: "+91 97000 55555",
    items: [
      { description: "Cumin Seeds (Export Grade)", qty: 500, unit: "Kg", rate: 185 },
      { description: "Coriander Powder", qty: 300, unit: "Kg", rate: 80 },
      { description: "Garam Masala Blend", qty: 100, unit: "Kg", rate: 210 },
    ],
    discount: 2,
    taxRate: 5,
    notes: "Export invoice. FOB terms applicable.",
    paymentTerms: "Net 30",
    bankDetails: "Bank: SBI\nA/C: 31234567890\nIFSC: SBIN0001234\nBranch: Deesa Main",
  },
  {
    id: "INV-2025-003",
    date: "2025-06-05",
    dueDate: "2025-06-19",
    status: "Overdue",
    customerName: "Green Valley Foods",
    customerAddress: "Warehouse 7, APMC, Pune, Maharashtra – 411019",
    customerGST: "27CCCDE9012I3Z7",
    customerEmail: "billing@greenvalley.co.in",
    customerPhone: "+91 96000 77777",
    items: [
      { description: "Dry Ginger Powder", qty: 250, unit: "Kg", rate: 160 },
      { description: "Black Pepper Whole", qty: 100, unit: "Kg", rate: 420 },
    ],
    discount: 0,
    taxRate: 12,
    notes: "Second reminder – payment overdue.",
    paymentTerms: "Net 14",
    bankDetails: "Bank: ICICI Bank\nA/C: 123456789012\nIFSC: ICIC0000123\nBranch: Deesa",
  },
];

/* ─── Empty form ─────────────────────────────────────────── */
const emptyInvoice = (): Invoice => ({
  id: `INV-2025-${String(SEED.length + 1 + Math.floor(Math.random() * 100)).padStart(3, "0")}`,
  date: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
  status: "Pending",
  customerName: "",
  customerAddress: "",
  customerGST: "",
  customerEmail: "",
  customerPhone: "",
  items: [newItem()],
  discount: 0,
  taxRate: 5,
  notes: "",
  paymentTerms: "Net 15",
  bankDetails: "Bank: HDFC Bank\nA/C: 50200012345678\nIFSC: HDFC0001234\nBranch: Deesa, Gujarat",
});

/* ─── Main Page ──────────────────────────────────────────── */
function BillingPage() {
  const user = useSession();
  const role: RoleId = user?.role ?? "warehouse";
  const [invoices, setInvoices] = useState<Invoice[]>(SEED);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [viewInv, setViewInv] = useState<Invoice | null>(null);

  const filtered = invoices.filter(
    (inv) =>
      (statusFilter === "All" || inv.status === statusFilter) &&
      (inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
        inv.id.toLowerCase().includes(search.toLowerCase())),
  );

  const totals = {
    paid: invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + calcInvoice(i).total, 0),
    pending: invoices
      .filter((i) => i.status === "Pending")
      .reduce((s, i) => s + calcInvoice(i).total, 0),
    overdue: invoices
      .filter((i) => i.status === "Overdue")
      .reduce((s, i) => s + calcInvoice(i).total, 0),
  };

  const openNew = () => {
    setEditing(emptyInvoice());
    setFormOpen(true);
  };
  const openEdit = (inv: Invoice) => {
    setEditing({ ...inv, items: inv.items.map((i) => ({ ...i })) });
    setFormOpen(true);
  };

  const saveInvoice = (inv: Invoice) => {
    setInvoices((prev) => {
      const idx = prev.findIndex((i) => i.id === inv.id);
      return idx >= 0 ? prev.map((i, n) => (n === idx ? inv : i)) : [inv, ...prev];
    });
    setFormOpen(false);
  };

  const deleteInvoice = (id: string) => setInvoices((prev) => prev.filter((i) => i.id !== id));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Billing</h1>
            <p className="text-sm text-muted-foreground">Invoices & payments</p>
          </div>
        </div>
        {canCreate(role) && (
          <button
            onClick={openNew}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> New Invoice
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Paid" amount={totals.paid} color="text-green-600" bg="bg-green-50" />
        <SummaryCard
          label="Pending"
          amount={totals.pending}
          color="text-yellow-600"
          bg="bg-yellow-50"
        />
        <SummaryCard label="Overdue" amount={totals.overdue} color="text-red-600" bg="bg-red-50" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice # or customer…"
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {["All", "Paid", "Pending", "Overdue"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === s ? "bg-primary text-primary-foreground" : "border hover:bg-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Invoice #</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No invoices found.
                </td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-semibold text-primary">{inv.id}</td>
                  <td className="px-4 py-3 font-medium">{inv.customerName}</td>
                  <td className="px-4 py-3">{fmt(calcInvoice(inv).total)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.date}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.dueDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[inv.status]}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewInv(inv)}
                        className="text-xs text-primary hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={() => downloadInvoicePDF(inv, role)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                        title="Download PDF"
                      >
                        <Download className="h-3.5 w-3.5" /> PDF
                      </button>
                      {canCreate(role) && (
                        <>
                          <button
                            onClick={() => openEdit(inv)}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteInvoice(inv.id)}
                            className="text-xs text-red-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice Form Modal */}
      {formOpen && editing && (
        <InvoiceFormModal
          invoice={editing}
          onSave={saveInvoice}
          onClose={() => setFormOpen(false)}
        />
      )}

      {/* View Modal */}
      {viewInv && (
        <InvoiceViewModal
          invoice={viewInv}
          role={role}
          onClose={() => setViewInv(null)}
          onDownload={() => downloadInvoicePDF(viewInv, role)}
        />
      )}
    </div>
  );
}

/* ─── Summary Card ───────────────────────────────────────── */
function SummaryCard({
  label,
  amount,
  color,
  bg,
}: {
  label: string;
  amount: number;
  color: string;
  bg: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{fmt(amount)}</p>
    </div>
  );
}

/* ─── Invoice Form Modal ─────────────────────────────────── */
function InvoiceFormModal({
  invoice,
  onSave,
  onClose,
}: {
  invoice: Invoice;
  onSave: (inv: Invoice) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Invoice>(invoice);

  const set = <K extends keyof Invoice>(k: K, v: Invoice[K]) => setForm((p) => ({ ...p, [k]: v }));
  const setItem = (i: number, k: keyof LineItem, v: string | number) =>
    setForm((p) => ({
      ...p,
      items: p.items.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)),
    }));
  const addItem = () => setForm((p) => ({ ...p, items: [...p.items, newItem()] }));
  const removeItem = (i: number) =>
    setForm((p) => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));

  const { sub, discAmt, taxAmt, total } = calcInvoice(form);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-background shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-bold">Invoice — {form.id}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Meta row */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Invoice #" value={form.id} onChange={(v) => set("id", v)} />
            <Field label="Date" type="date" value={form.date} onChange={(v) => set("date", v)} />
            <Field
              label="Due Date"
              type="date"
              value={form.dueDate}
              onChange={(v) => set("dueDate", v)}
            />
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as Invoice["status"])}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {["Paid", "Pending", "Overdue"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
              Customer Details
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Customer Name"
                value={form.customerName}
                onChange={(v) => set("customerName", v)}
              />
              <Field
                label="Email"
                type="email"
                value={form.customerEmail}
                onChange={(v) => set("customerEmail", v)}
              />
              <Field
                label="Phone"
                value={form.customerPhone}
                onChange={(v) => set("customerPhone", v)}
              />
              <Field
                label="GSTIN"
                value={form.customerGST}
                onChange={(v) => set("customerGST", v)}
              />
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Address
                </label>
                <textarea
                  rows={2}
                  value={form.customerAddress}
                  onChange={(e) => set("customerAddress", e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>
          </section>

          {/* Line items */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
              Line Items
            </p>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
                <span className="col-span-5">Description</span>
                <span className="col-span-2 text-right">Qty</span>
                <span className="col-span-2">Unit</span>
                <span className="col-span-2 text-right">Rate (₹)</span>
                <span className="col-span-1" />
              </div>
              {form.items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    className="col-span-5 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Product / service"
                    value={it.description}
                    onChange={(e) => setItem(i, "description", e.target.value)}
                  />
                  <input
                    type="number"
                    min={1}
                    className="col-span-2 rounded-lg border bg-background px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary"
                    value={it.qty}
                    onChange={(e) => setItem(i, "qty", +e.target.value)}
                  />
                  <select
                    className="col-span-2 rounded-lg border bg-background px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={it.unit}
                    onChange={(e) => setItem(i, "unit", e.target.value)}
                  >
                    {["Kg", "Ton", "Pcs", "Box", "Bag", "Ltr"].map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    className="col-span-2 rounded-lg border bg-background px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary"
                    value={it.rate}
                    onChange={(e) => setItem(i, "rate", +e.target.value)}
                  />
                  <button
                    onClick={() => removeItem(i)}
                    disabled={form.items.length === 1}
                    className="col-span-1 flex justify-center text-red-400 hover:text-red-600 disabled:opacity-30"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline mt-1"
              >
                <PlusCircle className="h-4 w-4" /> Add Item
              </button>
            </div>
          </section>

          {/* Totals preview */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{fmt(sub)}</span>
              </div>
              {form.discount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount ({form.discount}%)</span>
                  <span>- {fmt(discAmt)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Tax / GST ({form.taxRate}%)</span>
                <span>{fmt(taxAmt)}</span>
              </div>
              <div className="flex justify-between border-t pt-1 font-bold text-base">
                <span>Total</span>
                <span className="text-primary">{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Financial settings */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field
              label="Discount %"
              type="number"
              value={String(form.discount)}
              onChange={(v) => set("discount", +v)}
            />
            <Field
              label="Tax / GST %"
              type="number"
              value={String(form.taxRate)}
              onChange={(v) => set("taxRate", +v)}
            />
            <Field
              label="Payment Terms"
              value={form.paymentTerms}
              onChange={(v) => set("paymentTerms", v)}
            />
          </div>

          {/* Notes + Bank */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Terms, delivery info, etc."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Bank / Payment Details
              </label>
              <textarea
                rows={3}
                value={form.bankDetails}
                onChange={(e) => set("bankDetails", e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Bank name, A/C no., IFSC…"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Save Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Invoice View Modal ─────────────────────────────────── */
function InvoiceViewModal({
  invoice: inv,
  role,
  onClose,
  onDownload,
}: {
  invoice: Invoice;
  role: RoleId;
  onClose: () => void;
  onDownload: () => void;
}) {
  const { sub, discAmt, taxAmt, total } = calcInvoice(inv);
  const showFinancial = ["super-admin", "admin", "accountant", "partner"].includes(role);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Invoice</p>
            <h2 className="text-xl font-bold">{inv.id}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onDownload}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Download className="h-4 w-4" /> Download PDF
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <ViewField label="Date" value={inv.date} />
            <ViewField label="Due Date" value={inv.dueDate} />
            <ViewField label="Payment Terms" value={inv.paymentTerms} />
            <ViewField
              label="Status"
              value={
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[inv.status]}`}
                >
                  {inv.status}
                </span>
              }
            />
          </div>

          {/* Customer */}
          <div className="rounded-xl bg-muted/40 p-4 text-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
              Bill To
            </p>
            <p className="font-semibold">{inv.customerName}</p>
            <p className="text-muted-foreground">{inv.customerAddress}</p>
            {inv.customerGST && <p className="text-muted-foreground">GSTIN: {inv.customerGST}</p>}
            {inv.customerEmail && <p className="text-muted-foreground">{inv.customerEmail}</p>}
          </div>

          {/* Items */}
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2">Unit</th>
                  <th className="px-4 py-2 text-right">Rate</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {inv.items.map((it, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-2.5 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium">{it.description}</td>
                    <td className="px-4 py-2.5 text-right">{it.qty}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{it.unit}</td>
                    <td className="px-4 py-2.5 text-right">{fmt(it.rate)}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{fmt(it.qty * it.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          {showFinancial && (
            <div className="flex justify-end">
              <div className="w-60 space-y-1.5 text-sm">
                <TotalRow label="Subtotal" value={fmt(sub)} />
                {inv.discount > 0 && (
                  <TotalRow
                    label={`Discount (${inv.discount}%)`}
                    value={`- ${fmt(discAmt)}`}
                    muted
                  />
                )}
                <TotalRow label={`Tax / GST (${inv.taxRate}%)`} value={fmt(taxAmt)} muted />
                <div className="flex justify-between border-t pt-2 font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">{fmt(total)}</span>
                </div>
              </div>
            </div>
          )}
          {!showFinancial && (
            <div className="flex justify-end text-sm font-bold">
              Total: <span className="ml-2 text-primary">{fmt(total)}</span>
            </div>
          )}

          {/* Bank details — accountant/admin only */}
          {["super-admin", "admin", "accountant"].includes(role) && inv.bankDetails && (
            <div className="rounded-xl bg-muted/40 p-4 text-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
                Bank / Payment Details
              </p>
              <pre className="whitespace-pre-wrap font-sans text-muted-foreground text-xs">
                {inv.bankDetails}
              </pre>
            </div>
          )}

          {inv.notes && (
            <div className="rounded-xl bg-muted/40 p-4 text-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
                Notes
              </p>
              <p className="text-muted-foreground">{inv.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Small helpers ──────────────────────────────────────── */
function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}

function ViewField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}

function TotalRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`flex justify-between ${muted ? "text-muted-foreground" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
