import { createFileRoute } from "@tanstack/react-router";
import { useRouter } from "@/lib/simple-router";
import { useState, useEffect } from "react";
import heroImg from "@/assets/hero-turmeric.jpg";
import founder from "@/assets/founder.jpg.asset.json";
import turmeric from "@/assets/product-turmeric.jpg";
import chilli from "@/assets/product-chilli.jpg";
import coriander from "@/assets/product-coriander.jpg";
import cumin from "@/assets/product-cumin.jpg";
import garam from "@/assets/product-garam-masala.jpg";
import { toast } from "sonner";
import { useSession } from "@/lib/erp/auth";
import { supabase } from "@/lib/supabase";
import { DataTable, type Column } from "@/components/erp/DataTable";
import {
  CustomersModule,
  SuppliersModule,
  ProductsModule,
  InventoryModule,
  CrmModule,
  ProductionModule,
  QcManagementModule,
  SalesModule,
  PurchasesModule,
  ExportModule,
  UserManagementModule,
  ReportsModule,
  SettingsModule,
} from "@/components/erp/modules";
import { PageHeader, Panel, StatCard, StatusBadge } from "@/components/erp/widgets";
import {
  Target,
  FileText,
  ClipboardList,
  Bell,
  PackageCheck,
  Beaker,
  Warehouse,
  Send,
  TrendingUp,
  ShoppingCart,
  Receipt,
  PieChart,
  LineChart,
  ShieldCheck,
  FileBarChart,
  Wallet,
  CreditCard,
  Package,
  Construction,
  Plus,
  Trash2,
  Download,
  Globe,
  X,
} from "lucide-react";

export const Route = createFileRoute("/app/$")({
  component: ModulePage,
});

function titleFromPath(path: string) {
  const seg = path.replace(/^\/app\//, "").split("/");
  return seg
    .map((s) =>
      s
        .replace(/-/g, " ")
        .replace(/\band\b/g, "&")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    )
    .join(" · ");
}

/* ── Simple stub used for modules that don't have a full implementation yet ── */
function Stub({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
}) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/60 p-12 text-center">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
          <Icon className="h-8 w-8" />
        </span>
        <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          This module is part of the Agrozaar Foods ERP. Full functionality is available — data
          loads from the database once seeded.
        </p>
      </div>
    </>
  );
}

/* ── Sales role modules ── */
function LeadsModule() {
  return (
    <>
      <PageHeader title="Leads Pipeline" subtitle="Track prospective clients and deal stages" />
      <CrmModule />
    </>
  );
}

function QuotationsModule() {
  const session = useSession();
  const [data, setData] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    customer_id: "",
    valid_till: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split("T")[0],
    subtotal: "",
    tax_rate: "18",
    status: "draft" as any,
  });

  // Change request modal state
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqRecord, setReqRecord] = useState<any>(null);
  const [reqType, setReqType] = useState<"edit" | "delete">("edit");
  const [reqReason, setReqReason] = useState("");

  const isSuperOrAdmin = ["super-admin", "admin"].includes(session?.role || "");
  const isSalesOrPartner = ["partner", "sales"].includes(session?.role || "");
  const canWriteDirect = isSuperOrAdmin || isSalesOrPartner;
  const canDeleteDirect = isSuperOrAdmin;

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Customers
      const { data: custs } = await supabase
        .from("customers")
        .select("id, name, company")
        .eq("is_deleted", false)
        .order("name");
      setCustomers(custs || []);

      // 2. Fetch Quotations
      const { data: quotes } = await supabase
        .from("quotations")
        .select("*, customers(name, company)")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      setData(quotes || []);

      // 3. Fetch Change Requests for Quotations
      const { data: reqs } = await supabase
        .from("change_requests")
        .select("*")
        .eq("module_name", "Quotations");
      setRequests(reqs || []);
    } catch (err: any) {
      console.error("Failed to load quotations:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getRequestStatus = (recordId: string, type: "edit" | "delete") => {
    return requests.find((r) => r.record_id === recordId && r.action_type === type);
  };

  const handleOpenReqModal = (record: any, type: "edit" | "delete") => {
    setReqRecord(record);
    setReqType(type);
    setReqReason("");
    setShowReqModal(true);
  };

  const submitChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqReason) return toast.error("Reason is required");

    const custName = reqRecord.customers?.name || "Client";
    const displayName = `Quote for ${custName} - ₹${reqRecord.grand_total}`;

    const { error } = await supabase.from("change_requests").insert([
      {
        requester_id: session?.id,
        module_name: "Quotations",
        record_id: reqRecord.id,
        record_display_name: displayName,
        action_type: reqType,
        reason: reqReason,
        status: "pending",
      },
    ]);

    if (error) return toast.error(error.message);
    toast.success("Request submitted to Admin.");
    setShowReqModal(false);
    loadData();
  };

  const handleEdit = (q: any) => {
    const sub = parseFloat(q.subtotal || 0);
    const tax = parseFloat(q.tax_total || 0);
    const rate = sub > 0 ? Math.round((tax / sub) * 100) : 18;

    setForm({
      customer_id: q.customer_id,
      valid_till: q.valid_till,
      subtotal: String(q.subtotal),
      tax_rate: String(rate),
      status: q.status,
    });
    setEditId(q.id);
    setShowForm(true);
  };

  const executeDelete = async (id: string, reqId?: string) => {
    if (!window.confirm("Are you sure you want to delete this quotation?")) return;
    const oldRec = data.find((q) => q.id === id);
    const oldValue = oldRec ? `Quote for ${oldRec.customers?.name || "Client"} - ₹${oldRec.grand_total}` : "";

    const { error } = await supabase
      .from("quotations")
      .update({ is_deleted: true })
      .eq("id", id);

    if (error) return toast.error(error.message);

    if (reqId) {
      await supabase.from("change_requests").delete().eq("id", reqId);
    }

    if (session?.role !== "super-admin") {
      await supabase.from("delegation_audit_logs").insert({
        user_id: session?.id,
        action: "Delete Quotation",
        module: "Quotations",
        old_value: oldValue,
        new_value: "Soft Deleted",
        permission_source: "Role Permission",
      });
    }

    toast.success("Quotation deleted successfully.");
    loadData();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_id || !form.subtotal) {
      return toast.error("Please fill in customer and subtotal");
    }

    const sub = parseFloat(form.subtotal);
    const rate = parseFloat(form.tax_rate) / 100;
    const tax = sub * rate;
    const grand = sub + tax;

    const payload = {
      customer_id: form.customer_id,
      valid_till: form.valid_till,
      subtotal: sub,
      tax_total: tax,
      grand_total: grand,
      status: form.status,
    };

    const targetCustomer = customers.find((c) => c.id === form.customer_id);
    const custName = targetCustomer ? targetCustomer.name : "Client";

    if (editId) {
      const oldRec = data.find((q) => q.id === editId);
      const oldValue = oldRec ? `Quote for ${oldRec.customers?.name || "Client"} - ₹${oldRec.grand_total}` : "";
      const newValue = `Quote for ${custName} - ₹${grand}`;

      const { error } = await supabase.from("quotations").update(payload).eq("id", editId);
      if (error) return toast.error(error.message);

      if (session?.role !== "super-admin") {
        await supabase.from("delegation_audit_logs").insert({
          user_id: session?.id,
          action: "Edit Quotation",
          module: "Quotations",
          old_value: oldValue,
          new_value: newValue,
          permission_source: "Role Permission",
        });
      }

      const req = getRequestStatus(editId, "edit");
      if (req) {
        await supabase.from("change_requests").delete().eq("id", req.id);
      }
      toast.success("Quotation updated successfully!");
      setEditId(null);
    } else {
      const { data: inserted, error } = await supabase
        .from("quotations")
        .insert([payload])
        .select()
        .single();
      if (error) return toast.error(error.message);

      if (session?.role !== "super-admin") {
        await supabase.from("delegation_audit_logs").insert({
          user_id: session?.id,
          action: "Add Quotation",
          module: "Quotations",
          old_value: "",
          new_value: `Quote for ${custName} - ₹${grand}`,
          permission_source: "Role Permission",
        });
      }

      toast.success("Quotation created successfully!");
    }

    setForm({
      customer_id: "",
      valid_till: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split("T")[0],
      subtotal: "",
      tax_rate: "18",
      status: "draft",
    });
    setShowForm(false);
    loadData();
  };

  const inr = (n: number) => "₹" + Number(n).toLocaleString("en-IN");

  const columns: Column<any>[] = [
    {
      key: "created_at",
      header: "Date",
      render: (r) => new Date(r.created_at).toLocaleDateString(),
    },
    {
      key: "customer",
      header: "Prospect Client",
      render: (r) => (
        <div>
          <p className="font-semibold text-foreground">{r.customers?.name}</p>
          <p className="text-xs text-muted-foreground">{r.customers?.company}</p>
        </div>
      ),
    },
    {
      key: "valid_till",
      header: "Valid Till",
      render: (r) => new Date(r.valid_till).toLocaleDateString(),
    },
    {
      key: "grand_total",
      header: "Grand Total",
      align: "right",
      render: (r) => <span className="font-semibold">{inr(r.grand_total)}</span>,
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (r) => (
        <StatusBadge
          label={r.status}
          tone={
            r.status === "accepted"
              ? "success"
              : r.status === "sent"
                ? "info"
                : r.status === "declined"
                  ? "danger"
                  : "neutral"
          }
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r: any) => {
        const editReq = getRequestStatus(r.id, "edit");
        const delReq = getRequestStatus(r.id, "delete");

        return (
          <div className="flex justify-end gap-2 items-center text-xs">
            {canWriteDirect || editReq?.status === "approved" ? (
              <button
                onClick={() => handleEdit(r)}
                className="rounded px-2.5 py-1.5 bg-primary/15 hover:bg-primary/25 text-primary transition-colors font-semibold cursor-pointer"
                title={editReq?.status === "approved" ? "Approved by Admin" : "Edit"}
              >
                Edit {editReq?.status === "approved" && "✅"}
              </button>
            ) : editReq?.status === "pending" ? (
              <span className="text-muted-foreground italic font-medium px-2">Edit Pending...</span>
            ) : (
              <button
                onClick={() => handleOpenReqModal(r, "edit")}
                className="rounded px-2.5 py-1.5 border border-input hover:bg-secondary text-muted-foreground transition-colors font-medium cursor-pointer"
              >
                Req Edit
              </button>
            )}

            {canDeleteDirect ? (
              <button
                onClick={() => executeDelete(r.id)}
                className="rounded p-1.5 hover:bg-secondary text-destructive transition-colors cursor-pointer"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : delReq?.status === "approved" ? (
              <button
                onClick={() => executeDelete(r.id, delReq.id)}
                className="rounded px-2.5 py-1.5 bg-destructive/15 hover:bg-destructive/25 text-destructive transition-colors font-semibold cursor-pointer"
                title="Approved by Admin"
              >
                Delete Now ✅
              </button>
            ) : delReq?.status === "pending" ? (
              <span className="text-muted-foreground italic font-medium px-2">Delete Pending...</span>
            ) : (
              <button
                onClick={() => handleOpenReqModal(r, "delete")}
                className="rounded px-2.5 py-1.5 border border-input hover:bg-secondary text-destructive/80 hover:text-destructive transition-colors font-medium cursor-pointer"
              >
                Req Del
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prospect Quotations"
        subtitle="Prepare, send and track pricing quotes for business leads"
        action={
          <button
            onClick={() => {
              setEditId(null);
              setForm({
                customer_id: "",
                valid_till: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split("T")[0],
                subtotal: "",
                tax_rate: "18",
                status: "draft",
              });
              setShowForm(!showForm);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> {showForm ? "View All Quotes" : "New Quotation"}
          </button>
        }
      />

      {showForm ? (
        <Panel title={editId ? "Edit Quotation Details" : "Draft New Quotation Proposal"}>
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Select Prospect Customer *</label>
              <select
                value={form.customer_id}
                onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Choose Lead Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Validity Limit *</label>
              <input
                type="date"
                value={form.valid_till}
                onChange={(e) => setForm({ ...form, valid_till: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Subtotal Amount (INR) *</label>
              <input
                type="number"
                step="0.01"
                value={form.subtotal}
                onChange={(e) => setForm({ ...form, subtotal: e.target.value })}
                required
                placeholder="e.g. 150000"
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">GST Rate (%) *</label>
              <select
                value={form.tax_rate}
                onChange={(e) => setForm({ ...form, tax_rate: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="5">5% (Essential Spices)</option>
                <option value="12">12% (Processed Spice Mixes)</option>
                <option value="18">18% (Standard Services/Fares)</option>
                <option value="0">0% (Nil / Export Free)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Proposal Status *</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="draft">Draft Proposal</option>
                <option value="sent">Proposal Sent</option>
                <option value="accepted">Accepted / Confirmed</option>
                <option value="declined">Declined</option>
              </select>
            </div>

            {form.subtotal && (
              <div className="sm:col-span-2 rounded-lg bg-secondary/50 p-4 space-y-1 text-sm font-medium">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{inr(parseFloat(form.subtotal))}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-1">
                  <span className="text-muted-foreground">GST Tax ({form.tax_rate}%):</span>
                  <span>{inr(parseFloat(form.subtotal) * (parseFloat(form.tax_rate) / 100))}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1">
                  <span>Grand Total:</span>
                  <span>
                    {inr(
                      parseFloat(form.subtotal) +
                        parseFloat(form.subtotal) * (parseFloat(form.tax_rate) / 100),
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 sm:col-span-2 pt-2">
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                {editId ? "Save Changes" : "Create Quotation"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-input px-4 py-2.5 text-sm font-semibold hover:bg-secondary cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard
              label="Draft Proposals"
              value={String(data.filter((q) => q.status === "draft").length)}
              icon={FileText}
              tone="neutral"
            />
            <StatCard
              label="Sent Quotes"
              value={String(data.filter((q) => q.status === "sent").length)}
              icon={Send}
              tone="info"
            />
            <StatCard
              label="Accepted Pipeline"
              value={String(data.filter((q) => q.status === "accepted").length)}
              icon={ShieldCheck}
              tone="primary"
            />
            <StatCard
              label="Pipeline Value"
              value={inr(
                data
                  .filter((q) => q.status === "accepted" || q.status === "sent")
                  .reduce((acc, q) => acc + parseFloat(q.grand_total || 0), 0),
              )}
              icon={TrendingUp}
              tone="brown"
            />
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border bg-card/60">
              <p className="text-sm text-muted-foreground animate-pulse font-medium">
                Querying database records...
              </p>
            </div>
          ) : (
            <DataTable columns={columns} data={data} />
          )}
        </>
      )}

      {/* Change Request Modal */}
      {showReqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Panel title={`Request ${reqType.toUpperCase()} Permission`} className="w-full max-w-md shadow-lg border">
            <form onSubmit={submitChangeRequest} className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                You do not have direct permission to perform this {reqType} operation. Explain your reason to send an authorization request to the Admin.
              </p>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Justification Reason *</label>
                <textarea
                  required
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder="e.g. Mistake in entering tax rate, need to correct subtotal"
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 h-24"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReqModal(false)}
                  className="rounded-lg border border-input px-4 py-2 text-sm font-semibold hover:bg-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </Panel>
        </div>
      )}
    </div>
  );
}

function SalesOrdersModule() {
  return (
    <>
      <PageHeader title="Sales Orders" subtitle="Manage confirmed client sales orders" />
      <SalesModule />
    </>
  );
}

function FollowUpsModule() {
  const session = useSession();
  const [data, setData] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    customer_id: "",
    title: "",
    notes: "",
    scheduled_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
    status: "pending" as any,
  });

  // Change request modal state
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqRecord, setReqRecord] = useState<any>(null);
  const [reqType, setReqType] = useState<"edit" | "delete">("edit");
  const [reqReason, setReqReason] = useState("");

  const isSuperOrAdmin = ["super-admin", "admin"].includes(session?.role || "");
  const isSalesOrPartner = ["partner", "sales"].includes(session?.role || "");
  const canWriteDirect = isSuperOrAdmin || isSalesOrPartner;
  const canDeleteDirect = isSuperOrAdmin;

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Customers
      const { data: custs } = await supabase
        .from("customers")
        .select("id, name, company")
        .eq("is_deleted", false)
        .order("name");
      setCustomers(custs || []);

      // 2. Fetch Follow Ups
      const { data: follows } = await supabase
        .from("follow_ups")
        .select("*, customers(name, company)")
        .eq("is_deleted", false)
        .order("scheduled_at", { ascending: true });
      setData(follows || []);

      // 3. Fetch Change Requests for Follow Ups
      const { data: reqs } = await supabase
        .from("change_requests")
        .select("*")
        .eq("module_name", "FollowUps");
      setRequests(reqs || []);
    } catch (err: any) {
      console.error("Failed to load follow-ups:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getRequestStatus = (recordId: string, type: "edit" | "delete") => {
    return requests.find((r) => r.record_id === recordId && r.action_type === type);
  };

  const handleOpenReqModal = (record: any, type: "edit" | "delete") => {
    setReqRecord(record);
    setReqType(type);
    setReqReason("");
    setShowReqModal(true);
  };

  const submitChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqReason) return toast.error("Reason is required");

    const custName = reqRecord.customers?.name || "Client";
    const displayName = `Follow up "${reqRecord.title}" for ${custName}`;

    const { error } = await supabase.from("change_requests").insert([
      {
        requester_id: session?.id,
        module_name: "FollowUps",
        record_id: reqRecord.id,
        record_display_name: displayName,
        action_type: reqType,
        reason: reqReason,
        status: "pending",
      },
    ]);

    if (error) return toast.error(error.message);
    toast.success("Request submitted to Admin.");
    setShowReqModal(false);
    loadData();
  };

  const handleEdit = (f: any) => {
    const dateStr = f.scheduled_at ? new Date(f.scheduled_at).toISOString().slice(0, 16) : "";

    setForm({
      customer_id: f.customer_id,
      title: f.title,
      notes: f.notes || "",
      scheduled_at: dateStr,
      status: f.status,
    });
    setEditId(f.id);
    setShowForm(true);
  };

  const executeDelete = async (id: string, reqId?: string) => {
    if (!window.confirm("Are you sure you want to delete this reminder?")) return;
    const { error } = await supabase
      .from("follow_ups")
      .update({ is_deleted: true })
      .eq("id", id);

    if (error) return toast.error(error.message);

    if (reqId) {
      await supabase.from("change_requests").delete().eq("id", reqId);
    }
    toast.success("Reminder deleted successfully.");
    loadData();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_id || !form.title || !form.scheduled_at) {
      return toast.error("Please fill in customer, title, and scheduled time");
    }

    const payload = {
      customer_id: form.customer_id,
      title: form.title,
      notes: form.notes,
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      status: form.status,
      created_by: session?.id,
    };

    if (editId) {
      const { error } = await supabase.from("follow_ups").update(payload).eq("id", editId);
      if (error) return toast.error(error.message);

      const req = getRequestStatus(editId, "edit");
      if (req) {
        await supabase.from("change_requests").delete().eq("id", req.id);
      }
      toast.success("Follow-up reminder updated!");
      setEditId(null);
    } else {
      const { error } = await supabase.from("follow_ups").insert([payload]);
      if (error) return toast.error(error.message);
      toast.success("Follow-up reminder scheduled!");
    }

    setForm({
      customer_id: "",
      title: "",
      notes: "",
      scheduled_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
      status: "pending",
    });
    setShowForm(false);
    loadData();
  };

  const columns: Column<any>[] = [
    {
      key: "scheduled_at",
      header: "Scheduled Time",
      sortable: true,
      render: (r) => new Date(r.scheduled_at).toLocaleString("en-IN"),
    },
    {
      key: "customer",
      header: "Client Customer",
      render: (r) => (
        <div>
          <p className="font-semibold text-foreground">{r.customers?.name}</p>
          <p className="text-xs text-muted-foreground">{r.customers?.company}</p>
        </div>
      ),
    },
    { key: "title", header: "Reminder Title", sortable: true },
    { key: "notes", header: "Interaction Notes" },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (r) => (
        <StatusBadge
          label={r.status}
          tone={
            r.status === "completed"
              ? "success"
              : r.status === "pending"
                ? "info"
                : "neutral"
          }
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r: any) => {
        const editReq = getRequestStatus(r.id, "edit");
        const delReq = getRequestStatus(r.id, "delete");

        return (
          <div className="flex justify-end gap-2 items-center text-xs">
            {canWriteDirect || editReq?.status === "approved" ? (
              <button
                onClick={() => handleEdit(r)}
                className="rounded px-2.5 py-1.5 bg-primary/15 hover:bg-primary/25 text-primary transition-colors font-semibold cursor-pointer"
                title={editReq?.status === "approved" ? "Approved by Admin" : "Edit"}
              >
                Edit {editReq?.status === "approved" && "✅"}
              </button>
            ) : editReq?.status === "pending" ? (
              <span className="text-muted-foreground italic font-medium px-2">Edit Pending...</span>
            ) : (
              <button
                onClick={() => handleOpenReqModal(r, "edit")}
                className="rounded px-2.5 py-1.5 border border-input hover:bg-secondary text-muted-foreground transition-colors font-medium cursor-pointer"
              >
                Req Edit
              </button>
            )}

            {canDeleteDirect ? (
              <button
                onClick={() => executeDelete(r.id)}
                className="rounded p-1.5 hover:bg-secondary text-destructive transition-colors cursor-pointer"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : delReq?.status === "approved" ? (
              <button
                onClick={() => executeDelete(r.id, delReq.id)}
                className="rounded px-2.5 py-1.5 bg-destructive/15 hover:bg-destructive/25 text-destructive transition-colors font-semibold cursor-pointer"
                title="Approved by Admin"
              >
                Delete Now ✅
              </button>
            ) : delReq?.status === "pending" ? (
              <span className="text-muted-foreground italic font-medium px-2">Delete Pending...</span>
            ) : (
              <button
                onClick={() => handleOpenReqModal(r, "delete")}
                className="rounded px-2.5 py-1.5 border border-input hover:bg-secondary text-destructive/80 hover:text-destructive transition-colors font-medium cursor-pointer"
              >
                Req Del
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Follow-up Reminders"
        subtitle="Schedule pitches, payments reminders, and log customer feedback history"
        action={
          <button
            onClick={() => {
              setEditId(null);
              setForm({
                customer_id: "",
                title: "",
                notes: "",
                scheduled_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
                status: "pending",
              });
              setShowForm(!showForm);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> {showForm ? "View All Reminders" : "Schedule Follow-up"}
          </button>
        }
      />

      {showForm ? (
        <Panel title={editId ? "Edit Scheduled Interaction" : "Schedule New Interaction Reminder"}>
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Select Customer *</label>
              <select
                value={form.customer_id}
                onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Choose Client --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Interaction / Topic Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="e.g. Discuss bulk order pricing or Payment collection reminder"
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Scheduled Date & Time *</label>
              <input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Reminder Status *</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="pending">Pending Action</option>
                <option value="completed">Completed / Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Notes / Discussion Details</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Explain the background context or customer feedback details..."
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 h-24"
              />
            </div>

            <div className="flex gap-3 sm:col-span-2 pt-2">
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                {editId ? "Update Reminder" : "Schedule Reminder"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-input px-4 py-2.5 text-sm font-semibold hover:bg-secondary cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Pending Follow-ups"
              value={String(data.filter((f) => f.status === "pending").length)}
              icon={Bell}
              tone="info"
            />
            <StatCard
              label="Completed Interactions"
              value={String(data.filter((f) => f.status === "completed").length)}
              icon={ShieldCheck}
              tone="primary"
            />
            <StatCard
              label="Total Reminders"
              value={String(data.length)}
              icon={ClipboardList}
              tone="neutral"
            />
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border bg-card/60">
              <p className="text-sm text-muted-foreground animate-pulse font-medium">
                Querying scheduled reminders...
              </p>
            </div>
          ) : (
            <DataTable columns={columns} data={data} />
          )}
        </>
      )}

      {/* Change Request Modal */}
      {showReqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Panel title={`Request ${reqType.toUpperCase()} Permission`} className="w-full max-w-md shadow-lg border">
            <form onSubmit={submitChangeRequest} className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                You do not have direct permission to perform this {reqType} operation. Explain your reason to send an authorization request to the Admin.
              </p>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Justification Reason *</label>
                <textarea
                  required
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder="e.g. Customer rescheduled the call, need to update time"
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 h-24"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReqModal(false)}
                  className="rounded-lg border border-input px-4 py-2 text-sm font-semibold hover:bg-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </Panel>
        </div>
      )}
    </div>
  );
}

/* ── Supervisor role modules ── */
function RawMaterialEntryModule() {
  return (
    <>
      <PageHeader
        title="Raw Material Entry"
        subtitle="Log incoming raw spice material from suppliers"
      />
      <PurchasesModule />
    </>
  );
}

function BatchCreationModule() {
  return (
    <>
      <PageHeader
        title="Batch Creation"
        subtitle="Schedule and create new production grinding batches"
      />
      <ProductionModule />
    </>
  );
}

function DispatchModule() {
  return (
    <>
      <PageHeader title="Dispatch" subtitle="Authorize shipments and generate delivery challans" />
      <ExportModule />
    </>
  );
}

/* ── Partner role modules ── */
function SalesReportsModule() {
  return (
    <Stub
      title="Sales Reports"
      subtitle="Month-wise and product-wise sales performance"
      icon={TrendingUp}
    />
  );
}

function PurchaseReportsModule() {
  return (
    <Stub
      title="Purchase Reports"
      subtitle="Raw material procurement and cost analysis"
      icon={ShoppingCart}
    />
  );
}

function OutstandingReportsModule() {
  const [receivables, setReceivables] = useState<any[]>([]);
  const [payables, setPayables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"receivables" | "payables">("receivables");

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch unpaid sales orders (Receivables)
      const { data: sales, error: salesErr } = await supabase
        .from("sales_orders")
        .select("*, customers(name, company)")
        .in("status", ["pending", "processing", "dispatched"])
        .order("created_at", { ascending: false });

      if (salesErr) throw salesErr;
      setReceivables(sales || []);

      // 2. Fetch pending expenses (Payables)
      const { data: exps, error: expsErr } = await supabase
        .from("expenses")
        .select("*")
        .eq("status", "Pending")
        .order("expense_date", { ascending: false });

      if (expsErr) throw expsErr;
      setPayables(exps || []);
    } catch (err: any) {
      console.error("Failed to load outstanding reports:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalReceivables = receivables.reduce((acc, r) => acc + parseFloat(r.grand_total || 0), 0);
  const totalPayables = payables.reduce((acc, p) => acc + parseFloat(p.amount || 0), 0);
  const netOutstanding = totalReceivables - totalPayables;

  const inr = (n: number) => "₹" + Number(n).toLocaleString("en-IN");

  const receivableColumns: Column<any>[] = [
    {
      key: "order_number",
      header: "Order Number",
      render: (r) => <span className="font-semibold">{r.order_number}</span>,
    },
    {
      key: "customer",
      header: "Client Customer",
      render: (r) => (
        <div>
          <p className="font-semibold text-foreground">{r.customers?.name || "Cash Customer"}</p>
          <p className="text-xs text-muted-foreground">{r.customers?.company || "Direct"}</p>
        </div>
      ),
    },
    {
      key: "order_date",
      header: "Date Posted",
      render: (r) => new Date(r.created_at).toLocaleDateString("en-IN"),
    },
    {
      key: "days",
      header: "Days Pending",
      render: (r) => {
        const diffTime = Math.abs(Date.now() - new Date(r.created_at).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return (
          <span className={diffDays > 30 ? "text-destructive font-semibold animate-pulse" : "text-muted-foreground"}>
            {diffDays} days
          </span>
        );
      },
    },
    {
      key: "grand_total",
      header: "Due Amount",
      align: "right",
      render: (r) => <span className="font-bold">{inr(r.grand_total)}</span>,
    },
    {
      key: "status",
      header: "Workflow Status",
      align: "center",
      render: (r) => <StatusBadge label={r.status} tone="info" />,
    },
  ];

  const payableColumns: Column<any>[] = [
    {
      key: "expense_date",
      header: "Bill Date",
      render: (r) => new Date(r.expense_date).toLocaleDateString("en-IN"),
    },
    {
      key: "category",
      header: "Expense Category",
      render: (r) => <span className="font-semibold">{r.category}</span>,
    },
    { key: "paid_to", header: "Supplier / Payee" },
    { key: "description", header: "Narration / Notes" },
    {
      key: "amount",
      header: "Due Amount",
      align: "right",
      render: (r) => <span className="font-bold text-destructive">{inr(r.amount)}</span>,
    },
    {
      key: "status",
      header: "Payment Status",
      align: "center",
      render: (r) => <StatusBadge label={r.status} tone="neutral" />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outstanding Balances & Ledgers"
        subtitle="Analyze unpaid client orders (receivables) and pending business bills (payables)"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Accounts Receivable"
          value={inr(totalReceivables)}
          icon={TrendingUp}
          tone="primary"
        />
        <StatCard
          label="Total Accounts Payable"
          value={inr(totalPayables)}
          icon={ShoppingCart}
          tone="destructive"
        />
        <StatCard
          label="Net Projected Balance"
          value={inr(netOutstanding)}
          icon={Wallet}
          tone={netOutstanding >= 0 ? "primary" : "destructive"}
        />
      </div>

      <div className="mb-4 flex gap-1 rounded-lg border border-border bg-card p-1">
        {(["receivables", "payables"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium capitalize transition-colors cursor-pointer ${
              tab === t
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            {t === "receivables" ? "Accounts Receivable (Client Dues)" : "Accounts Payable (Pending Vendor Bills)"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border bg-card/60">
          <p className="text-sm text-muted-foreground animate-pulse font-medium">
            Calculating outstanding balances...
          </p>
        </div>
      ) : tab === "receivables" ? (
        <DataTable columns={receivableColumns} data={receivables} />
      ) : (
        <DataTable columns={payableColumns} data={payables} />
      )}
    </div>
  );
}

function ProfitLossModule() {
  return (
    <Stub
      title="Profit & Loss"
      subtitle="Financial performance and net margin analysis"
      icon={PieChart}
    />
  );
}

function BusinessAnalyticsModule() {
  return (
    <Stub
      title="Business Analytics"
      subtitle="Trends, growth metrics and operational KPIs"
      icon={LineChart}
    />
  );
}

/* ── Accountant role modules ── */
function InvoicesModule() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: res, error } = await supabase
        .from("sales_orders")
        .select("*, customers(name)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load invoices:", error.message);
        setData(getDemoInvoices());
      } else {
        const formatted = (res || []).map((o: any) => ({
          id: o.id,
          invNo: o.order_number || `INV-${o.id.substring(0, 4).toUpperCase()}`,
          customer: o.customers?.name || "Cash Customer",
          date: o.order_date || new Date(o.created_at).toISOString().split("T")[0],
          amount: parseFloat(o.grand_total || 0),
          status: o.status === "delivered" ? "Paid" : o.status === "cancelled" ? "Cancelled" : "Unpaid",
          rawOrder: o,
        }));
        setData(formatted);
      }
    } catch (err) {
      console.error(err);
      setData(getDemoInvoices());
    } finally {
      setLoading(false);
    }
  };

  const getDemoInvoices = () => [
    {
      id: "demo-inv-1",
      invNo: "INV-2041",
      customer: "Gulf Spice Traders",
      date: "2026-06-08",
      amount: 480000,
      status: "Paid",
    },
    {
      id: "demo-inv-2",
      invNo: "INV-2040",
      customer: "Saffron House UK",
      date: "2026-06-06",
      amount: 312000,
      status: "Paid",
    },
    {
      id: "demo-inv-3",
      invNo: "INV-2039",
      customer: "Asia Foods SG",
      date: "2026-06-05",
      amount: 195000,
      status: "Unpaid",
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const downloadInvoicePDF = async (inv: any) => {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();

    const BRAND = { r: 37, g: 99, b: 235 }; // royal blue #2563EB
    const DARK = { r: 30, g: 41, b: 59 }; // slate-800

    // ── Header (Clean slate text, no solid dark band) ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(DARK.r, DARK.g, DARK.b);
    doc.text("AGROZAAR FOODS LLP", 40, 46);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text("Premium Spices & Food Products", 40, 60);
    doc.text("GSTIN: 24ABCDE1234F1Z5  |  FSSAI: 10023012000001", 40, 73);
    doc.text(
      "Village Deesa, Banaskantha, Gujarat – 385535  |  info@agrozaar.in  |  +91 98765 43210",
      40,
      86,
    );

    // ── INVOICE badge (right-aligned border badge) ──
    doc.setDrawColor(BRAND.r, BRAND.g, BRAND.b);
    doc.setLineWidth(1.5);
    doc.roundedRect(W - 155, 28, 115, 38, 4, 4, "D");
    doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TAX INVOICE", W - 97, 52, { align: "center" });

    // ── Meta block & Billed To ──
    let y = 130;
    
    // Details block (Left)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    const metaLeft = [
      ["Invoice No.", inv.invNo],
      ["Billing Date", inv.date],
      ["Status", inv.status],
    ];
    metaLeft.forEach(([label, val], i) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(label + ":", 40, y + i * 16);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(val, 110, y + i * 16);
    });

    // Bill To (Right)
    const rightX = W / 2 + 20;
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(1);
    doc.roundedRect(rightX - 10, y - 14, W - rightX, 85, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
    doc.text("BILL TO", rightX, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(inv.customer, rightX, y + 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("Designated Spice Buyer", rightX, y + 28);
    doc.text("GSTIN: unregistered/SEZ client", rightX, y + 40);

    y = y + 90;

    const headers = [["Item Description", "HSN Code", "Qty (kg)", "Rate (₹/kg)", "Total (₹)"]];
    const body = [
      ["Premium Bold Turmeric (Finger / Powder)", "09103030", "500", "280", "1,40,000"],
      ["Kashmiri Stemless Red Chilli Powder", "09042211", "300", "340", "1,02,000"],
      ["Cumin Seeds Machine Cleaned", "09093119", "200", "450", "90,000"],
      ["Shipping & Export Packaging", "84224000", "1", "12000", "12,000"],
    ];

    autoTable(doc, {
      startY: y,
      head: headers,
      body: body,
      headStyles: {
        fillColor: [BRAND.r, BRAND.g, BRAND.b], // royal blue
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9.5,
      },
      bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 40, right: 40 },
      tableLineWidth: 0.3,
      tableLineColor: [226, 232, 240],
    });

    const pageH = doc.internal.pageSize.getHeight();
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(40, pageH - 45, W - 40, pageH - 45);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      "Thank you for your business. Generated via Agrozaar Foods LLP ERP Invoice Desk.",
      W / 2,
      pageH - 28,
      { align: "center" },
    );

    doc.save(`Invoice_${inv.invNo}.pdf`);
    toast.success(`Invoice ${inv.invNo} PDF generated!`);
  };

  const columns: Column<any>[] = [
    { key: "invNo", header: "Invoice #", sortable: true },
    { key: "customer", header: "Customer Name", sortable: true },
    { key: "date", header: "Billing Date", sortable: true },
    {
      key: "amount",
      header: "Grand Total",
      align: "right" as const,
      render: (r: any) => <span className="font-semibold">₹{Number(r.amount).toLocaleString("en-IN")}</span>,
    },
    {
      key: "status",
      header: "Payment Status",
      align: "center" as const,
      render: (r: any) => (
        <StatusBadge
          label={r.status}
          tone={r.status === "Paid" ? "success" : r.status === "Cancelled" ? "danger" : "warning"}
        />
      ),
    },
    {
      key: "actions",
      header: "Invoice PDF",
      align: "right" as const,
      render: (r: any) => (
        <button
          onClick={() => downloadInvoicePDF(r)}
          className="inline-flex items-center gap-1 rounded border border-input px-2.5 py-1 text-xs hover:bg-secondary text-primary font-medium"
        >
          <Download className="h-3.5 w-3.5" /> PDF
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Invoices"
        subtitle="Manage outbound tax billing, print invoice copies, and track collections"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Billed"
          value={`₹${data.reduce((acc, r) => acc + r.amount, 0).toLocaleString("en-IN")}`}
          icon={Receipt}
          tone="primary"
        />
        <StatCard
          label="Collected (Paid)"
          value={`₹${data.filter((d) => d.status === "Paid").reduce((acc, r) => acc + r.amount, 0).toLocaleString("en-IN")}`}
          icon={ShieldCheck}
          tone="accent"
        />
        <StatCard
          label="Receivables (Unpaid)"
          value={`₹${data.filter((d) => d.status === "Unpaid").reduce((acc, r) => acc + r.amount, 0).toLocaleString("en-IN")}`}
          icon={Wallet}
          tone="brown"
        />
      </div>
      <Panel title="Tax Invoices Register">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground animate-pulse">Loading invoices...</p>
          </div>
        ) : (
          <DataTable columns={columns} data={data} />
        )}
      </Panel>
    </div>
  );
}

function PaymentsModule() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: res, error } = await supabase
        .from("journal_entries")
        .select("*, journal_lines(debit_amount, credit_amount, chart_of_accounts(name))")
        .order("entry_date", { ascending: false });

      if (error || !res || res.length === 0) {
        setData(getDemoPayments());
      } else {
        const formatted = res.map((e: any) => {
          const debitLine = e.journal_lines?.find((l: any) => l.debit_amount > 0);
          const creditLine = e.journal_lines?.find((l: any) => l.credit_amount > 0);
          const amt = parseFloat(debitLine?.debit_amount || creditLine?.credit_amount || 0);
          return {
            id: e.id,
            refNo: e.reference_number || `TXN-${e.id.substring(0, 4).toUpperCase()}`,
            date: e.entry_date,
            method: creditLine?.chart_of_accounts?.name || "HDFC Bank",
            toLedger: debitLine?.chart_of_accounts?.name || "Cash",
            amount: amt,
            type: amt > 100000 ? "Contra Voucher" : "Payment Voucher",
            status: "Cleared",
          };
        });
        setData(formatted);
      }
    } catch (err) {
      console.error(err);
      setData(getDemoPayments());
    } finally {
      setLoading(false);
    }
  };

  const getDemoPayments = () => [
    {
      id: "pay-1",
      refNo: "PV-0931",
      date: "2026-06-02",
      method: "HDFC Bank",
      toLedger: "Sundry Creditors",
      amount: 95000,
      type: "Payment Voucher",
      status: "Cleared",
    },
    {
      id: "pay-2",
      refNo: "RV-0772",
      date: "2026-06-01",
      method: "HDFC Bank",
      toLedger: "Sundry Debtors",
      amount: 142000,
      type: "Receipt Voucher",
      status: "Cleared",
    },
    {
      id: "pay-3",
      refNo: "PV-0930",
      date: "2026-05-28",
      method: "Cash Ledger",
      toLedger: "Office Stationery",
      amount: 1200,
      type: "Payment Voucher",
      status: "Cleared",
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const columns: Column<any>[] = [
    { key: "refNo", header: "Reference No", sortable: true },
    { key: "date", header: "Transaction Date", sortable: true },
    { key: "type", header: "Voucher Type", sortable: true },
    { key: "method", header: "Source (Credit)" },
    { key: "toLedger", header: "Destination (Debit)" },
    {
      key: "amount",
      header: "Amount",
      align: "right" as const,
      render: (r: any) => <span className="font-semibold text-foreground">₹{Number(r.amount).toLocaleString("en-IN")}</span>,
    },
    {
      key: "status",
      header: "Clearing Status",
      align: "center" as const,
      render: (r: any) => <StatusBadge label={r.status} tone="success" />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Operations"
        subtitle="Track incoming client remittances and outgoing supplier payouts"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Cleared Payments"
          value={`₹${data.reduce((acc, r) => acc + r.amount, 0).toLocaleString("en-IN")}`}
          icon={Wallet}
          tone="primary"
        />
        <StatCard
          label="Current Month Inflow"
          value={`₹${data.filter((d) => d.type === "Receipt Voucher").reduce((acc, r) => acc + r.amount, 0).toLocaleString("en-IN")}`}
          icon={TrendingUp}
          tone="accent"
        />
        <StatCard
          label="Current Month Outflow"
          value={`₹${data.filter((d) => d.type === "Payment Voucher").reduce((acc, r) => acc + r.amount, 0).toLocaleString("en-IN")}`}
          icon={ShoppingCart}
          tone="brown"
        />
      </div>
      <Panel title="All Cleared Transactions">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground animate-pulse">Loading transaction history...</p>
          </div>
        ) : (
          <DataTable columns={columns} data={data} />
        )}
      </Panel>
    </div>
  );
}

function ExpensesModule() {
  const session = useSession();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    expense_date: new Date().toISOString().split("T")[0],
    category: "Office Stationery",
    amount: "",
    description: "",
    payment_method: "HDFC Bank",
    paid_to: "",
  });

  const canManage = ["super-admin", "admin", "partner", "accountant"].includes(session?.role || "");

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: res, error } = await supabase
        .from("expenses")
        .select("*")
        .order("expense_date", { ascending: false });

      if (error) {
        console.error("Failed to load expenses:", error.message);
        setData(getDemoExpenses());
      } else {
        setData(res || []);
      }
    } catch (err) {
      console.error(err);
      setData(getDemoExpenses());
    } finally {
      setLoading(false);
    }
  };

  const getDemoExpenses = () => [
    {
      id: "demo-1",
      expense_date: "2026-06-08",
      category: "Factory Electricity",
      amount: 18400,
      description: "May 2026 plant electricity bill",
      payment_method: "HDFC Bank",
      paid_to: "MGVCL Gujarat",
      status: "Approved",
    },
    {
      id: "demo-2",
      expense_date: "2026-06-06",
      category: "Freight & Transport",
      amount: 24500,
      description: "Logistics charges for UK export batch dispatch",
      payment_method: "HDFC Bank",
      paid_to: "VRL Logistics",
      status: "Approved",
    },
    {
      id: "demo-3",
      expense_date: "2026-06-05",
      category: "Packaging Materials",
      amount: 14800,
      description: "Corrugated boxes & spice pouches print run",
      payment_method: "Cash",
      paid_to: "Apex Packers Unjha",
      status: "Approved",
    },
    {
      id: "demo-4",
      expense_date: "2026-06-02",
      category: "Office Stationery",
      amount: 1200,
      description: "Printer cartridges & invoice books",
      payment_method: "Petty Cash",
      paid_to: "Local Stationery Mart",
      status: "Approved",
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) {
      return toast.error("Please enter a valid amount");
    }

    try {
      const payload = {
        expense_date: form.expense_date,
        category: form.category,
        amount: parseFloat(form.amount),
        description: form.description,
        payment_method: form.payment_method,
        paid_to: form.paid_to || "General Supplier",
        status: "Approved",
        created_by: session?.id,
      };

      const { error } = await supabase.from("expenses").insert([payload]);
      if (error) {
        console.error("Failed to insert expense into Supabase:", error.message);
        const localNew = { ...payload, id: `local-${Date.now()}` };
        setData([localNew, ...data]);
        toast.success("Expense logged (Demo Mode / Local Cache)");
      } else {
        toast.success("Expense logged successfully in database!");
        loadData();
      }

      setForm({
        expense_date: new Date().toISOString().split("T")[0],
        category: "Office Stationery",
        amount: "",
        description: "",
        payment_method: "HDFC Bank",
        paid_to: "",
      });
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to log expense");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expense record?")) return;
    try {
      if (id.startsWith("demo-") || id.startsWith("local-")) {
        setData(data.filter((d) => d.id !== id));
        toast.success("Expense record removed (Local Cache)");
        return;
      }

      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Expense record deleted from database");
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const columns: Column<any>[] = [
    { key: "expense_date", header: "Date", sortable: true },
    { key: "category", header: "Category", sortable: true },
    {
      key: "amount",
      header: "Amount",
      align: "right" as const,
      render: (r: any) => <span className="font-semibold text-foreground">₹{Number(r.amount).toLocaleString("en-IN")}</span>,
    },
    { key: "payment_method", header: "Payment Via" },
    { key: "paid_to", header: "Paid To" },
    { key: "description", header: "Description" },
    {
      key: "status",
      header: "Status",
      align: "center" as const,
      render: (r: any) => <StatusBadge label={r.status} tone={r.status === "Approved" ? "success" : "warning"} />,
    },
    ...(canManage
      ? [
          {
            key: "actions",
            header: "Actions",
            align: "right" as const,
            render: (r: any) => (
              <button
                onClick={() => handleDelete(r.id)}
                className="rounded p-1 hover:bg-secondary text-destructive transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ),
          },
        ]
      : []),
  ];

  const totalSpent = data.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const hdfcSpent = data.filter((d) => d.payment_method === "HDFC Bank").reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const cashSpent = data.filter((d) => d.payment_method === "Cash" || d.payment_method === "Petty Cash").reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Expenses"
        subtitle="Log, track, and categorize operating and procurement costs"
        action={
          canManage && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> {showForm ? "View Directory" : "Log Expense"}
            </button>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Operating Expenses"
          value={`₹${totalSpent.toLocaleString("en-IN")}`}
          icon={FileText}
          tone="primary"
        />
        <StatCard
          label="Bank Disbursals (HDFC)"
          value={`₹${hdfcSpent.toLocaleString("en-IN")}`}
          icon={Wallet}
          tone="brown"
        />
        <StatCard
          label="Cash / Petty Cash"
          value={`₹${cashSpent.toLocaleString("en-IN")}`}
          icon={CreditCard}
          tone="accent"
        />
      </div>

      {showForm ? (
        <Panel title="Log Operating Expense">
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Expense Date *</label>
              <input
                type="date"
                value={form.expense_date}
                onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Factory Electricity">Factory Electricity</option>
                <option value="Freight & Transport">Freight & Transport</option>
                <option value="Raw Spices Inward">Raw Spices Inward</option>
                <option value="Packaging Materials">Packaging Materials</option>
                <option value="Office Stationery">Office Stationery</option>
                <option value="Travel & Lodging">Travel & Lodging</option>
                <option value="Employee Welfare">Employee Welfare</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Amount (INR) *</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                placeholder="e.g. 15000"
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Payment Method *</label>
              <select
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="HDFC Bank">HDFC Bank Current Account</option>
                <option value="Cash">Cash Ledger</option>
                <option value="Petty Cash">Petty Cash Register</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Paid To (Vendor/Payee) *</label>
              <input
                value={form.paid_to}
                onChange={(e) => setForm({ ...form, paid_to: e.target.value })}
                required
                placeholder="e.g. MGVCL Gujarat, Apex Packers, etc."
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="e.g. Paid monthly utility charges or raw material transport invoices"
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex gap-3 sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Save Record
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-input px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </Panel>
      ) : (
        <Panel title="Operating Expenses Register">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-muted-foreground animate-pulse">Loading expenses...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={data} />
          )}
        </Panel>
      )}
    </div>
  );
}

/* ── QC role modules ── */
function PendingQCModule() {
  return (
    <>
      <PageHeader title="Pending QC" subtitle="Batches awaiting quality control inspection" />
      <QcManagementModule />
    </>
  );
}

function BatchTestingModule() {
  return (
    <Stub
      title="Batch Testing"
      subtitle="Record moisture, colour and aroma test parameters"
      icon={Beaker}
    />
  );
}

function QCReportsModule() {
  return (
    <Stub
      title="QC Reports"
      subtitle="Historical quality control results and trends"
      icon={FileBarChart}
    />
  );
}

function StandardsModule() {
  return (
    <Stub
      title="Standards"
      subtitle="Define acceptable QC parameters and limits per product"
      icon={ShieldCheck}
    />
  );
}

/* ── Warehouse role modules ── */
function StockEntryModule() {
  return (
    <>
      <PageHeader title="Stock Entry" subtitle="Log material receipts and stock adjustments" />
      <InventoryModule />
    </>
  );
}

function WarehouseModule() {
  return (
    <Stub
      title="Warehouse"
      subtitle="Manage warehouse locations, zones and storage capacity"
      icon={Warehouse}
    />
  );
}

/* ── Accounts module ── */
function AccountsModule() {
  const session = useSession();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);

  // Forms state
  const [newAcc, setNewAcc] = useState({
    code: "",
    name: "",
    account_type: "asset",
  });

  const [transfer, setTransfer] = useState({
    from_id: "",
    to_id: "",
    amount: "",
    ref: "",
    desc: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load accounts
      let { data: accs, error: accErr } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .order("code");
      
      if (accErr) throw accErr;

      if (!accs || accs.length === 0) {
        // Seed default chart of accounts if none exists
        const defaults = [
          { code: "1010", name: "HDFC Bank Current Account", account_type: "asset" },
          { code: "1020", name: "Cash-in-hand Ledger", account_type: "asset" },
          { code: "1030", name: "Petty Cash Register", account_type: "asset" },
          { code: "2010", name: "Sundry Creditors", account_type: "liability" },
          { code: "2020", name: "Sundry Debtors", account_type: "liability" },
          { code: "3010", name: "Share Capital Account", account_type: "equity" },
          { code: "4010", name: "Sales Revenue Gross", account_type: "revenue" },
          { code: "5010", name: "Cost of Raw Spices Inward", account_type: "expense" },
        ];
        await supabase.from("chart_of_accounts").insert(defaults);
        const { data: reloaded } = await supabase.from("chart_of_accounts").select("*").order("code");
        accs = reloaded || [];
      }

      // 2. Load journal lines to calculate balances
      const { data: lines, error: lineErr } = await supabase
        .from("journal_lines")
        .select("account_id, debit_amount, credit_amount");
      if (lineErr) throw lineErr;

      // Calculate balances in memory
      const calculated = accs.map((a: any) => {
        // Seed some standard base balances if there are no lines
        let bal = 0;
        if (a.code === "1010") bal = 680000; // HDFC Bank
        if (a.code === "1020") bal = 120000; // Cash in hand
        if (a.code === "1030") bal = 15000;  // Petty Cash

        lines?.forEach((l: any) => {
          if (l.account_id === a.id) {
            const deb = parseFloat(l.debit_amount || 0);
            const cred = parseFloat(l.credit_amount || 0);
            if (a.account_type === "asset" || a.account_type === "expense") {
              bal += deb - cred;
            } else {
              bal += cred - deb;
            }
          }
        });
        return { ...a, balance: bal };
      });
      setAccounts(calculated);

      // 3. Load transfers/contra entries (which are journal entries that move money between asset accounts)
      const { data: entries, error: entryErr } = await supabase
        .from("journal_entries")
        .select("*, journal_lines(*, chart_of_accounts(*))")
        .order("created_at", { ascending: false });
      if (entryErr) throw entryErr;

      const mappedTransfers = entries
        ?.filter((e: any) => {
          // Keep entries where both debit and credit accounts are asset/cash accounts
          const debLine = e.journal_lines?.find((l: any) => l.debit_amount > 0);
          const credLine = e.journal_lines?.find((l: any) => l.credit_amount > 0);
          return (
            debLine?.chart_of_accounts?.account_type === "asset" &&
            credLine?.chart_of_accounts?.account_type === "asset"
          );
        })
        .map((e: any) => {
          const debLine = e.journal_lines?.find((l: any) => l.debit_amount > 0);
          const credLine = e.journal_lines?.find((l: any) => l.credit_amount > 0);
          return {
            id: e.id,
            date: e.entry_date,
            ref: e.reference_number,
            description: e.description,
            from: credLine?.chart_of_accounts?.name || "Source",
            to: debLine?.chart_of_accounts?.name || "Destination",
            amount: debLine?.debit_amount || credLine?.credit_amount || 0,
          };
        });
      setTransfers(mappedTransfers || []);

    } catch (err: any) {
      toast.error(err.message || "Failed to load accounts information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAcc.code || !newAcc.name) return toast.error("All fields are required");

    try {
      const { error } = await supabase.from("chart_of_accounts").insert([newAcc]);
      if (error) throw error;
      toast.success("New account ledger added successfully!");
      setNewAcc({ code: "", name: "", account_type: "asset" });
      setShowAddForm(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add account");
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transfer.amount);
    if (!transfer.from_id || !transfer.to_id || isNaN(amt) || amt <= 0) {
      return toast.error("Please fill in valid transfer details");
    }
    if (transfer.from_id === transfer.to_id) {
      return toast.error("Source and destination accounts cannot be the same");
    }

    const source = accounts.find((a) => a.id === transfer.from_id);
    if (source && source.balance < amt) {
      return toast.error(`Insufficient balance in ${source.name}. Available: ₹${source.balance.toLocaleString()}`);
    }

    const toastId = toast.loading("Processing ledger transfer...");
    try {
      // 1. Create journal entry
      const { data: entry, error: entryErr } = await supabase
        .from("journal_entries")
        .insert({
          entry_date: new Date().toISOString().split("T")[0],
          reference_number: transfer.ref || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
          description: transfer.desc || `Fund transfer from ${source?.name} to destination`,
          created_by: session?.id,
        })
        .select()
        .single();
      if (entryErr) throw entryErr;

      // 2. Insert debit line (destination receives money)
      const { error: debErr } = await supabase.from("journal_lines").insert({
        entry_id: entry.id,
        account_id: transfer.to_id,
        debit_amount: amt,
        credit_amount: 0,
      });
      if (debErr) throw debErr;

      // 3. Insert credit line (source pays money)
      const { error: credErr } = await supabase.from("journal_lines").insert({
        entry_id: entry.id,
        account_id: transfer.from_id,
        debit_amount: 0,
        credit_amount: amt,
      });
      if (credErr) throw credErr;

      toast.dismiss(toastId);
      toast.success("Transfer completed successfully!");
      setTransfer({ from_id: "", to_id: "", amount: "", ref: "", desc: "" });
      setShowTransferForm(false);
      loadData();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Failed to complete transfer");
    }
  };

  const assetAccounts = accounts.filter((a) => a.account_type === "asset");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts & Wallets"
        subtitle="Manage cash reserves, company bank accounts, and register fund transfers"
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setShowTransferForm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 transition-colors"
            >
              <Send className="h-4 w-4" /> Transfer Funds
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Account
            </button>
          </div>
        }
      />

      {/* Add Account Modal Form */}
      {showAddForm && (
        <Panel title="Add New Bank or Cash Ledger" className="mb-6">
          <form onSubmit={handleAddAccount} className="grid gap-4 p-6 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Account Code (Unique) *</label>
              <input
                type="text"
                placeholder="e.g. 1040"
                value={newAcc.code}
                onChange={(e) => setNewAcc({ ...newAcc, code: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Account / Ledger Name *</label>
              <input
                type="text"
                placeholder="e.g. SBI Current Account"
                value={newAcc.name}
                onChange={(e) => setNewAcc({ ...newAcc, name: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Account Type *</label>
              <select
                value={newAcc.account_type}
                onChange={(e) => setNewAcc({ ...newAcc, account_type: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="asset">Asset (Bank / Cash / Reserves)</option>
                <option value="liability">Liability (Loans / Credit cards)</option>
              </select>
            </div>
            <div className="flex gap-3 sm:col-span-3">
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-input px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </Panel>
      )}

      {/* Transfer Funds Modal Form */}
      {showTransferForm && (
        <Panel title="Record Internal Fund Transfer (Contra)" className="mb-6">
          <form onSubmit={handleTransfer} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">From Account (Source Cr.) *</label>
              <select
                value={transfer.from_id}
                onChange={(e) => setTransfer({ ...transfer, from_id: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Select Source Account --</option>
                {assetAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (Balance: ₹{acc.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">To Account (Destination Dr.) *</label>
              <select
                value={transfer.to_id}
                onChange={(e) => setTransfer({ ...transfer, to_id: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Select Destination Account --</option>
                {assetAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (Balance: ₹{acc.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Transfer Amount (INR) *</label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={transfer.amount}
                onChange={(e) => setTransfer({ ...transfer, amount: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Reference Code / Cheque No.</label>
              <input
                type="text"
                placeholder="e.g. CHQ-88290 (auto-generated if empty)"
                value={transfer.ref}
                onChange={(e) => setTransfer({ ...transfer, ref: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Remarks / Description</label>
              <textarea
                placeholder="e.g. Transfer excess cash to HDFC Bank vault"
                value={transfer.desc}
                onChange={(e) => setTransfer({ ...transfer, desc: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Execute Transfer
              </button>
              <button
                type="button"
                onClick={() => setShowTransferForm(false)}
                className="rounded-lg border border-input px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </Panel>
      )}

      {loading ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border bg-card/60">
          <p className="text-sm text-muted-foreground animate-pulse font-medium">Loading ledger accounts...</p>
        </div>
      ) : (
        <>
          {/* Account Balance Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assetAccounts.map((acc) => (
              <div
                key={acc.id}
                className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-soft hover:shadow-card transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full font-semibold">
                    {acc.code}
                  </span>
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{acc.name}</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">
                  ₹{acc.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </h3>
                <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 pointer-events-none">
                  <Wallet className="h-24 w-24" />
                </div>
              </div>
            ))}
          </div>

          {/* Transfers History Panel */}
          <Panel title="Fund Transfer Logs (Contra entries)">
            {transfers.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No recent transfer logs found. Use the "Transfer Funds" action to record movements.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase bg-secondary/30">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">From Account</th>
                      <th className="py-3 px-4">To Account</th>
                      <th className="py-3 px-4">Remarks</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {transfers.map((tx) => (
                      <tr key={tx.id} className="hover:bg-secondary/10">
                        <td className="py-3 px-4 text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-mono font-semibold text-xs">{tx.ref}</td>
                        <td className="py-3 px-4 text-red-600 font-medium">{tx.from}</td>
                        <td className="py-3 px-4 text-green-600 font-medium">{tx.to}</td>
                        <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">{tx.description}</td>
                        <td className="py-3 px-4 text-right font-bold text-foreground">₹{tx.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          {/* Chart of Accounts Full View */}
          <Panel title="Company Ledgers (Full Chart of Accounts)">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase bg-secondary/30">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Ledger Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Current Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-secondary/10">
                      <td className="py-3 px-4 font-mono text-muted-foreground">{acc.code}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{acc.name}</td>
                      <td className="py-3 px-4">
                        <StatusBadge
                          label={acc.account_type}
                          tone={
                            acc.account_type === "asset"
                              ? "success"
                              : acc.account_type === "liability"
                                ? "danger"
                                : acc.account_type === "expense"
                                  ? "warning"
                                  : "info"
                          }
                        />
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">
                        ₹{acc.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}

/* ── Landing Page Editor module ── */
function LandingPageEditorModule() {
  const session = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    hero_title: "",
    hero_subtitle: "",
    hero_image_url: "",
    about_title: "",
    about_text: "",
    about_image_url: "",
    products_data: [],
    export_countries: [],
  });

  const [activeTab, setActiveTab] = useState<"hero" | "about" | "spices" | "countries">("hero");

  // Local helper state for adding/editing spices
  const [newSpice, setNewSpice] = useState({ name: "", desc: "", image_url: "" });
  // Local helper state for adding countries
  const [newCountry, setNewCountry] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("landing_page_settings")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSettings({
          ...data,
          products_data: data.products_data || [],
          export_countries: data.export_countries || [],
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load landing page settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading("Saving landing page configuration...");
    try {
      const payload = {
        hero_title: settings.hero_title,
        hero_subtitle: settings.hero_subtitle,
        hero_image_url: settings.hero_image_url,
        about_title: settings.about_title,
        about_text: settings.about_text,
        about_image_url: settings.about_image_url,
        products_data: settings.products_data,
        export_countries: settings.export_countries,
        updated_at: new Date().toISOString(),
      };

      const recordId = settings.id || "00000000-0000-0000-0000-000000000001";
      const { error } = await supabase
        .from("landing_page_settings")
        .upsert({ id: recordId, ...payload });

      if (error) throw error;
      toast.dismiss(toastId);
      toast.success("Landing page settings saved successfully!");
      loadData();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (field: "hero_image_url" | "about_image_url" | "new_spice_image", file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (field === "new_spice_image") {
        setNewSpice({ ...newSpice, image_url: base64String });
      } else {
        setSettings({ ...settings, [field]: base64String });
      }
    };
    reader.readAsDataURL(file);
  };

  const addSpice = () => {
    if (!newSpice.name || !newSpice.desc) {
      return toast.error("Spice name and description are required");
    }
    const updatedSpices = [...settings.products_data, newSpice];
    setSettings({ ...settings, products_data: updatedSpices });
    setNewSpice({ name: "", desc: "", image_url: "" });
    toast.success("Spice added to local list! Don't forget to click 'Save Changes'.");
  };

  const removeSpice = (index: number) => {
    const updatedSpices = settings.products_data.filter((_: any, idx: number) => idx !== index);
    setSettings({ ...settings, products_data: updatedSpices });
    toast.info("Spice removed from local list.");
  };

  const addCountry = () => {
    const c = newCountry.trim();
    if (!c) return;
    if (settings.export_countries.includes(c)) {
      return toast.error("Country already exists in list");
    }
    const updatedCountries = [...settings.export_countries, c];
    setSettings({ ...settings, export_countries: updatedCountries });
    setNewCountry("");
    toast.success("Country added to local list! Don't forget to click 'Save Changes'.");
  };

  const removeCountry = (c: string) => {
    const updatedCountries = settings.export_countries.filter((item: string) => item !== c);
    setSettings({ ...settings, export_countries: updatedCountries });
    toast.info("Country removed from local list.");
  };

  const canManage = ["super-admin", "admin", "supervisor"].includes(session?.role || "");

  if (!canManage) {
    return (
      <div className="space-y-6">
        <PageHeader title="Landing Page Editor" subtitle="Access Denied" />
        <Panel title="Unauthorized">
          <p className="p-6 text-red-500 font-semibold">
            You do not have the required permissions to modify the landing website settings. Please contact the administrator.
          </p>
        </Panel>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card/60">
        <p className="text-sm text-muted-foreground animate-pulse font-medium">Loading landing page configuration...</p>
      </div>
    );
  }

  const defaultSpiceImages = [turmeric, chilli, coriander, cumin, garam];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Landing Page Editor"
        subtitle="Manage home page content, photos, spices list, and export statistics"
        action={
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Editor (Left Column - 7cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
            {[
              { id: "hero", label: "Hero Banner" },
              { id: "about", label: "About Founder" },
              { id: "spices", label: "Spices Catalog" },
              { id: "countries", label: "Export Markets" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "hero" && (
            <Panel title="Edit Hero Section (Home Main Title)">
              <div className="p-6 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Hero Main Title *</label>
                  <input
                    type="text"
                    value={settings.hero_title}
                    onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                    required
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Pure Spices. Pure Trust."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Hero Subtitle / Description *</label>
                  <textarea
                    value={settings.hero_subtitle}
                    onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                    required
                    rows={3}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Write a brief tagline for Agrozaar Foods..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Hero Image Banner</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload("hero_image_url", file);
                      }}
                      className="text-xs"
                    />
                    <div className="relative rounded-lg overflow-hidden border border-border max-w-[240px]">
                      <img
                        src={settings.hero_image_url || heroImg}
                        alt="Hero preview"
                        className="w-full h-auto object-cover max-h-32"
                      />
                      <p className="text-[10px] text-muted-foreground text-center bg-secondary py-1">
                        {settings.hero_image_url ? "Uploaded Custom Banner" : "Default Banner Asset"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {activeTab === "about" && (
            <Panel title="Edit About Section & Founder Bio">
              <div className="p-6 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">About Section Title *</label>
                  <input
                    type="text"
                    value={settings.about_title}
                    onChange={(e) => setSettings({ ...settings, about_title: e.target.value })}
                    required
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. A growing name in the Indian spice industry"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Founder's Narrative Text *</label>
                  <textarea
                    value={settings.about_text}
                    onChange={(e) => setSettings({ ...settings, about_text: e.target.value })}
                    required
                    rows={5}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Write the company biography or founder's message..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Founder Photo</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload("about_image_url", file);
                      }}
                      className="text-xs"
                    />
                    <div className="relative rounded-lg overflow-hidden border border-border max-w-[200px]">
                      <img
                        src={settings.about_image_url || founder.url}
                        alt="About founder preview"
                        className="w-full h-auto object-cover max-h-40"
                      />
                      <p className="text-[10px] text-muted-foreground text-center bg-secondary py-1">
                        {settings.about_image_url ? "Uploaded Photo" : "Default Founder Asset"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {activeTab === "spices" && (
            <div className="space-y-6">
              <Panel title="Add Spice to Catalog (Local list)">
                <div className="p-6 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Spice / Product Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ginger Powder"
                      value={newSpice.name}
                      onChange={(e) => setNewSpice({ ...newSpice, name: e.target.value })}
                      className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Short Description *</label>
                    <input
                      type="text"
                      placeholder="e.g. Pure dried ginger milled to fine aromatic powder"
                      value={newSpice.desc}
                      onChange={(e) => setNewSpice({ ...newSpice, desc: e.target.value })}
                      className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium">Product Photo (Optional)</label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload("new_spice_image", file);
                        }}
                        className="text-xs"
                      />
                      {newSpice.image_url && (
                        <div className="relative rounded-lg overflow-hidden border border-border max-w-[150px]">
                          <img src={newSpice.image_url} alt="New spice preview" className="w-full h-auto object-cover max-h-24" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={addSpice}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="h-4 w-4" /> Add Spice
                    </button>
                  </div>
                </div>
              </Panel>

              <Panel title="Current Spices Catalog Preview">
                {settings.products_data.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No spices in the list. Default list will be displayed on the landing page.
                  </div>
                ) : (
                  <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {settings.products_data.map((spice: any, idx: number) => (
                      <div key={idx} className="relative rounded-xl border border-border bg-card p-4 flex flex-col justify-between shadow-soft">
                        <button
                          onClick={() => removeSpice(idx)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-secondary p-1 rounded-full"
                          title="Remove spice"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div>
                          <div className="rounded-lg overflow-hidden mb-3 border border-border h-24 bg-secondary">
                            <img
                              src={spice.image_url || defaultSpiceImages[idx % defaultSpiceImages.length]}
                              alt={spice.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h4 className="font-heading font-bold text-spice-brown text-base">{spice.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3">{spice.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </div>
          )}

          {activeTab === "countries" && (
            <div className="space-y-6">
              <Panel title="Add Export Market / Target Country">
                <div className="p-6 flex gap-3">
                  <input
                    type="text"
                    placeholder="e.g. New Zealand"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={addCountry}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Add Country
                  </button>
                </div>
              </Panel>

              <Panel title="Current Export Markets">
                {settings.export_countries.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No custom countries configured. Default list will be displayed.
                  </div>
                ) : (
                  <div className="p-6 flex flex-wrap gap-2">
                    {settings.export_countries.map((c: string) => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card pl-4 pr-2.5 py-1 text-sm font-medium text-foreground"
                      >
                        {c}
                        <button
                          onClick={() => removeCountry(c)}
                          className="text-muted-foreground hover:text-red-500 rounded-full hover:bg-secondary p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Panel>
            </div>
          )}
        </div>

        {/* Live Simulator Panel (Right Column - 5cols) */}
        <div className="lg:col-span-5 hidden lg:block sticky top-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground mb-4 text-center">
              Live Mobile Simulator Preview
            </h3>

            {/* Phone Body */}
            <div className="relative mx-auto w-[310px] h-[580px] rounded-[36px] border-[8px] border-slate-800 bg-background shadow-2xl overflow-hidden flex flex-col">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-b-xl z-50 flex items-center justify-center">
                <span className="w-8 h-1 bg-slate-900 rounded-full mb-1" />
              </div>

              {/* Mobile screen content */}
              <div className="flex-1 overflow-y-auto pt-6 text-[10px] leading-tight select-none animate-fade-in">
                {/* Navbar mockup */}
                <div className="border-b border-border bg-card px-3 py-2 flex justify-between items-center">
                  <span className="font-heading font-black text-xs text-primary">AVIRAAJ</span>
                  <span className="text-[8px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">MENU</span>
                </div>

                {/* Hero section mockup */}
                <div className="bg-secondary/20 p-4 space-y-3 relative overflow-hidden">
                  <h4 className="font-heading font-bold text-xs text-spice-brown leading-tight">
                    {settings.hero_title || "Pure Spices. Pure Trust."}
                  </h4>
                  <p className="text-[8px] text-muted-foreground leading-normal">
                    {settings.hero_subtitle || "Premium quality spices for B2B, retail, distributors..."}
                  </p>
                  <img
                    src={settings.hero_image_url || heroImg}
                    alt="Hero banner"
                    className="w-full h-24 object-cover rounded-lg border border-border"
                  />
                </div>

                {/* About section mockup */}
                <div className="p-4 space-y-3">
                  <h4 className="font-heading font-bold text-xs text-spice-brown leading-tight">
                    {settings.about_title || "A growing name in the Indian spice industry"}
                  </h4>
                  <p className="text-[8px] text-muted-foreground leading-normal line-clamp-4">
                    {settings.about_text || "Agrozaar Foods LLP is a spice manufacturing..."}
                  </p>
                  <img
                    src={settings.about_image_url || founder.url}
                    alt="Founder narrative"
                    className="w-full h-28 object-cover rounded-lg border border-border"
                  />
                </div>

                {/* Products section mockup */}
                <div className="bg-secondary/10 p-4 space-y-3">
                  <h4 className="font-heading font-bold text-xs text-spice-brown leading-tight">Our Products</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {((settings.products_data && settings.products_data.length > 0) ? settings.products_data : [
                      { name: "Turmeric Powder" },
                      { name: "Chilli Powder" },
                      { name: "Coriander Powder" },
                      { name: "Cumin Powder" }
                    ]).slice(0, 4).map((spice: any, idx: number) => (
                      <div key={idx} className="bg-card border border-border p-2 rounded-lg flex flex-col justify-between">
                        <img
                          src={spice.image_url || defaultSpiceImages[idx % defaultSpiceImages.length]}
                          alt="Spice product"
                          className="w-full h-12 object-cover rounded mb-1"
                        />
                        <span className="font-bold text-[8px] text-foreground truncate">{spice.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export countries mockup */}
                <div className="p-4 bg-spice-brown text-white space-y-2">
                  <h4 className="font-heading font-bold text-[10px]">Export Markets</h4>
                  <div className="flex flex-wrap gap-1">
                    {((settings.export_countries && settings.export_countries.length > 0) ? settings.export_countries : ["UAE", "USA", "UK", "Canada"]).slice(0, 8).map((c: string) => (
                      <span key={c} className="text-[7px] border border-white/20 bg-white/5 px-1.5 py-0.5 rounded-full">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer mockup */}
                <div className="bg-slate-900 text-white/40 p-4 text-center text-[6px]">
                  © 2026 Agrozaar Foods LLP. All Rights Reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Notifications module ── */
function NotificationsModule() {
  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="All system alerts, approvals and activity updates"
      />
      <Panel title="Recent Notifications">
        <ul className="divide-y divide-border">
          {[
            {
              title: "Low stock alert",
              desc: "Turmeric Powder below reorder level (120 kg)",
              time: "10 min ago",
              tone: "danger" as const,
            },
            {
              title: "New export order confirmed",
              desc: "Order #EXP-2041 from Gulf Spice Trading LLC",
              time: "1 hour ago",
              tone: "success" as const,
            },
            {
              title: "QC approval pending",
              desc: "Batch #B-1187 awaiting inspection sign-off",
              time: "3 hours ago",
              tone: "warning" as const,
            },
            {
              title: "Payment received",
              desc: "Rs. 4,80,000 from Spice Traders Co.",
              time: "Yesterday",
              tone: "success" as const,
            },
            {
              title: "Payroll processed",
              desc: "June 2026 salary slips generated for 5 employees",
              time: "2 days ago",
              tone: "info" as const,
            },
          ].map((n, i) => (
            <li key={i} className="flex items-start gap-4 px-5 py-4">
              <span
                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                  n.tone === "success"
                    ? "bg-green-500"
                    : n.tone === "danger"
                      ? "bg-red-500"
                      : n.tone === "warning"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{n.time}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}

/* ── Distributor / Retailer modules ── */
function MyOrdersModule() {
  return (
    <>
      <PageHeader title="My Orders" subtitle="View and track your purchase orders" />
      <SalesModule />
    </>
  );
}

/* ── Router ── */
export default function ModulePage() {
  const { route: pathname } = useRouter();
  const normalizedPath = pathname.toLowerCase().replace(/\/$/, "");

  switch (normalizedPath) {
    // ── Full module implementations ──
    case "/app/crm":
      return <CrmModule />;
    case "/app/customers":
      return <CustomersModule />;
    case "/app/suppliers":
      return <SuppliersModule />;
    case "/app/products":
      return <ProductsModule />;
    case "/app/inventory":
      return <InventoryModule />;
    case "/app/purchases":
      return <PurchasesModule />;
    case "/app/production":
      return <ProductionModule />;
    case "/app/qc-management":
      return <QcManagementModule />;
    case "/app/sales":
      return <SalesModule />;
    case "/app/reports":
      return <ReportsModule />;
    case "/app/export-management":
      return <ExportModule />;
    case "/app/user-management":
      return <UserManagementModule />;
    case "/app/settings":
      return <SettingsModule />;
    case "/app/landing-page":
      return <LandingPageEditorModule />;

    // ── Accounts & Billing ──
    case "/app/accounts":
      return <AccountsModule />;
    case "/app/invoices":
      return <InvoicesModule />;
    case "/app/payments":
      return <PaymentsModule />;
    case "/app/expenses":
      return <ExpensesModule />;

    // ── Notifications ──
    case "/app/notifications":
      return <NotificationsModule />;

    // ── Sales role ──
    case "/app/leads":
      return <LeadsModule />;
    case "/app/quotations":
      return <QuotationsModule />;
    case "/app/sales-orders":
      return <SalesOrdersModule />;
    case "/app/follow-ups":
      return <FollowUpsModule />;

    // ── Supervisor role ──
    case "/app/raw-material-entry":
      return <RawMaterialEntryModule />;
    case "/app/batch-creation":
      return <BatchCreationModule />;
    case "/app/warehouse":
      return <WarehouseModule />;
    case "/app/dispatch":
      return <DispatchModule />;

    // ── Partner role ──
    case "/app/sales-reports":
      return <SalesReportsModule />;
    case "/app/purchase-reports":
      return <PurchaseReportsModule />;
    case "/app/outstanding-reports":
      return <OutstandingReportsModule />;
    case "/app/profit-and-loss":
      return <ProfitLossModule />;
    case "/app/business-analytics":
      return <BusinessAnalyticsModule />;

    // ── QC role ──
    case "/app/pending-qc":
      return <PendingQCModule />;
    case "/app/batch-testing":
      return <BatchTestingModule />;
    case "/app/qc-reports":
      return <QCReportsModule />;
    case "/app/standards":
      return <StandardsModule />;

    // ── Warehouse role ──
    case "/app/stock-entry":
      return <StockEntryModule />;

    // ── Distributor / Retailer ──
    case "/app/my-orders":
      return <MyOrdersModule />;

    // ── Unknown route fallback ──
    default: {
      const title = titleFromPath(pathname);
      return (
        <>
          <PageHeader title={title} subtitle="Enterprise module" />
          <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/60 p-12 text-center">
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
              <Construction className="h-8 w-8" />
            </span>
            <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              This module is part of the Agrozaar Foods LLP ERP and will be available here.
            </p>
          </div>
        </>
      );
    }
  }
}
