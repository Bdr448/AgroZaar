import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DataTable, type Column } from "./DataTable";
import { PageHeader, Panel, StatCard, StatusBadge } from "./widgets";
import { toast } from "sonner";
import { useSession } from "@/lib/erp/auth";
import {
  Plus,
  Users,
  Truck,
  Package,
  Boxes,
  Landmark,
  Eye,
  EyeOff,
  Globe,
  Construction,
  Target,
  FileText,
  Bell,
  Beaker,
  ShieldCheck,
  Warehouse,
  Send,
  PieChart as PieIcon,
  LineChart as LineIcon,
  Settings as SettingsIcon,
  TrendingUp,
  ShoppingCart,
  Factory,
  Wallet,
  Receipt,
  Trash2,
  AlertTriangle,
  Pencil,
} from "lucide-react";

const inr = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

interface ChangeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  type: "edit" | "delete";
  reason: string;
  setReason: (val: string) => void;
  module: string;
}

function ChangeRequestModal({
  isOpen,
  onClose,
  onSubmit,
  type,
  reason,
  setReason,
  module,
}: ChangeRequestModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Panel title={`Request ${type.toUpperCase()} Authorization`} className="w-full max-w-md shadow-lg border">
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            You do not have direct permission to {type} this {module} record. Explain your reason below to request admin approval.
          </p>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Justification Reason *</label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Typo correction, incorrect client details, client requested removal"
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 h-24"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
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
  );
}

/* ====================================================================
   DEMO SEED DATA HELPER
   ==================================================================== */
export async function seedModuleDemoData() {
  toast.loading("Seeding demo records...");
  try {
    // 1. Seed Warehouses
    const { data: whs } = await supabase.from("warehouses").select("id");
    if (!whs || whs.length === 0) {
      await supabase
        .from("warehouses")
        .insert([
          { name: "Main Processing Plant - Unjha" },
          { name: "Finished Goods Warehouse - Ahmedabad" },
          { name: "Raw Spice Transit Depot - Guntur" },
        ]);
    }

    // 2. Seed Product Categories
    const { data: cats } = await supabase.from("product_categories").select("id");
    if (!cats || cats.length === 0) {
      await supabase.from("product_categories").insert([
        { name: "Whole Spices", description: "Un-ground premium whole raw spices" },
        { name: "Ground Powders", description: "Finely ground spice powders" },
        { name: "Blended Masalas", description: "Recipe-based blended spice mixes" },
      ]);
    }

    // 3. Seed Units
    const { data: units } = await supabase.from("units").select("id");
    if (!units || units.length === 0) {
      await supabase.from("units").insert([
        { name: "Kilograms", abbreviation: "kg" },
        { name: "Metric Tons", abbreviation: "MT" },
        { name: "Boxes (10kg)", abbreviation: "box" },
      ]);
    }

    // 4. Seed Customers
    const { data: custs } = await supabase.from("customers").select("id");
    if (!custs || custs.length === 0) {
      await supabase.from("customers").insert([
        {
          name: "Gulf Spice Trading LLC",
          company: "Gulf Foods Dubai",
          email: "procurement@gulffoods.ae",
          phone: "+971-4-582910",
        },
        {
          name: "Saffron House UK",
          company: "Saffron UK Ltd",
          email: "imports@saffronhouse.co.uk",
          phone: "+44-20-7946-0958",
        },
        {
          name: "Asia Foods SG",
          company: "Asia Spice Singapore",
          email: "orders@asiafoods.com.sg",
          phone: "+65-6735-8290",
        },
      ]);
    }

    // 5. Seed Suppliers
    const { data: supps } = await supabase.from("suppliers").select("id");
    if (!supps || supps.length === 0) {
      await supabase.from("suppliers").insert([
        {
          name: "Guntur Chilli Farms",
          company: "Guntur Chilli Co-op",
          email: "contact@gunturchilli.org",
          phone: "+91-863-289410",
        },
        {
          name: "Unjha Cumin Traders",
          company: "Unjha Mandi Traders",
          email: "sales@unjhacumin.com",
          phone: "+91-2767-25910",
        },
      ]);
    }

    // 6. Fetch Seeded entities to map
    const { data: dbCats } = await supabase.from("product_categories").select("*");
    const { data: dbUnits } = await supabase.from("units").select("*");

    // 7. Seed Products
    const { data: prods } = await supabase.from("products").select("id");
    if (!prods || prods.length === 0) {
      const catId = dbCats?.[1]?.id; // Ground Powders
      const unitId = dbUnits?.[0]?.id; // kg

      const { data: newProds } = await supabase
        .from("products")
        .insert([
          {
            name: "Premium Turmeric Powder",
            sku: "PR-TUR-001",
            category_id: catId,
            unit_id: unitId,
            hsn_code: "09103030",
            gst_rate: 5.0,
          },
          {
            name: "Guntur Red Chilli Powder",
            sku: "PR-CHI-001",
            category_id: catId,
            unit_id: unitId,
            hsn_code: "09042211",
            gst_rate: 5.0,
          },
          {
            name: "Premium Cumin Seeds Whole",
            sku: "PR-CUM-001",
            category_id: dbCats?.[0]?.id,
            unit_id: unitId,
            hsn_code: "09093119",
            gst_rate: 5.0,
          },
        ])
        .select();

      // Seed Prices
      if (newProds) {
        for (const p of newProds) {
          await supabase.from("product_prices").insert([
            { product_id: p.id, tier: "standard", price: 280 },
            { product_id: p.id, tier: "distributor", price: 240 },
            { product_id: p.id, tier: "retailer", price: 265 },
          ]);
        }
      }
    }

    // 8. Seed Payroll Data
    const { data: dbProfiles } = await supabase.from("user_profiles").select("*");
    const profilesMap: Record<string, string> = {};
    if (dbProfiles) {
      dbProfiles.forEach((p) => {
        profilesMap[p.email] = p.id;
      });
    }

    const { data: dbEmps } = await supabase.from("employees").select("id");
    if (!dbEmps || dbEmps.length === 0) {
      const SALARY_SEED = [
        {
          code: "EMP-001",
          email: "supervisor@agrozaar.com",
          name: "Rakesh Mehta",
          dept: "Production",
          designation: "Plant Supervisor",
          basic: 32000,
          hra: 9600,
          allowances: 4000,
          deductions: 3800,
          net: 41800,
          status: "paid",
        },
        {
          code: "EMP-002",
          email: "qc@agrozaar.com",
          name: "Sunita Rao",
          dept: "Quality",
          designation: "QC Analyst",
          basic: 28000,
          hra: 8400,
          allowances: 3000,
          deductions: 3200,
          net: 36200,
          status: "paid",
        },
        {
          code: "EMP-003",
          email: "warehouse@agrozaar.com",
          name: "Imran Shaikh",
          dept: "Warehouse",
          designation: "Store Keeper",
          basic: 22000,
          hra: 6600,
          allowances: 2500,
          deductions: 2600,
          net: 28500,
          status: "pending",
        },
        {
          code: "EMP-004",
          email: "sales@agrozaar.com",
          name: "Priya Nair",
          dept: "Sales",
          designation: "Sales Executive",
          basic: 26000,
          hra: 7800,
          allowances: 5000,
          deductions: 3000,
          net: 35800,
          status: "pending",
        },
        {
          code: "EMP-005",
          email: "accountant@agrozaar.com",
          name: "Vikram Joshi",
          dept: "Accounts",
          designation: "Accountant",
          basic: 30000,
          hra: 9000,
          allowances: 3500,
          deductions: 3500,
          net: 39000,
          status: "paid",
        },
      ];

      const { data: run, error: errRun } = await supabase
        .from("payroll_runs")
        .insert({
          cycle_month: "2026-06",
          status: "processed",
        })
        .select()
        .single();

      if (!errRun && run) {
        for (const s of SALARY_SEED) {
          const profileId = profilesMap[s.email] || null;
          const { data: emp, error: errEmp } = await supabase
            .from("employees")
            .insert({
              profile_id: profileId,
              employee_code: s.code,
              designation: s.designation,
              department: s.dept,
              bank_account: "BANK" + Math.floor(100000000 + Math.random() * 900000000),
            })
            .select()
            .single();

          if (!errEmp && emp) {
            await supabase.from("employee_salary_structure").insert({
              employee_id: emp.id,
              basic: s.basic,
              hra: s.hra,
              allowances: s.allowances,
              deductions: s.deductions,
            });

            await supabase.from("salary_slips").insert({
              payroll_run_id: run.id,
              employee_id: emp.id,
              basic: s.basic,
              hra: s.hra,
              allowances: s.allowances,
              deductions: s.deductions,
              net_pay: s.net,
              status: s.status,
            });
          }
        }
      }
    }

    toast.dismiss();
    toast.success("Demo records seeded successfully!");
  } catch (err: any) {
    toast.dismiss();
    toast.error("Seeding failed: " + err.message);
  }
}

/* ====================================================================
   1. CUSTOMERS & SUPPLIERS MODULES
   ==================================================================== */
export function CustomersModule() {
  const session = useSession();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", gstin: "" });

  const [requests, setRequests] = useState<any[]>([]);
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqRecord, setReqRecord] = useState<any>(null);
  const [reqType, setReqType] = useState<"edit" | "delete">("edit");
  const [reqReason, setReqReason] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "addresses" | "orders" | "payments">("overview");
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [customerInvoices, setCustomerInvoices] = useState<any[]>([]);
  const [receivables, setReceivables] = useState(0);

  const canManage = ["super-admin", "admin", "partner", "sales"].includes(session?.role || "");
  const isAdmin = ["super-admin", "admin"].includes(session?.role || "");
  const canEditDirect = isAdmin || ["partner", "sales"].includes(session?.role || "");
  const canDeleteDirect = isAdmin;

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: res } = await supabase
        .from("customers")
        .select("*")
        .eq("is_deleted", false)
        .or("is_lead.eq.false,is_lead.is.null")
        .order("created_at", { ascending: false });
      setData(res || []);

      const { data: reqs } = await supabase
        .from("change_requests")
        .select("*")
        .eq("module_name", "Customers");
      setRequests(reqs || []);

      const { data: orders } = await supabase
        .from("sales_orders")
        .select("grand_total, status")
        .eq("status", "pending");
      const totalPending = orders?.reduce((sum, o) => sum + (Number(o.grand_total) || 0), 0) || 0;
      setReceivables(totalPending);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerDetails = async (customer: any) => {
    const { data: orders } = await supabase
      .from("sales_orders")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });
    setCustomerOrders(orders || []);

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("agrozaar_billing_invoices");
      if (saved) {
        const invs = JSON.parse(saved);
        const filteredInvs = invs.filter((i: any) => 
          i.customerName?.toLowerCase() === customer.name?.toLowerCase() ||
          (customer.company && i.customerName?.toLowerCase() === customer.company?.toLowerCase())
        );
        setCustomerInvoices(filteredInvs);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerDetails(selectedCustomer);
    }
  }, [selectedCustomer]);

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

    const displayName = reqRecord.name + (reqRecord.company ? ` (${reqRecord.company})` : "");
    const { error } = await supabase.from("change_requests").insert([
      {
        requester_id: session?.id,
        module_name: "Customers",
        record_id: reqRecord.id,
        record_display_name: displayName,
        action_type: reqType,
        reason: reqReason,
        status: "pending",
      },
    ]);

    if (error) return toast.error(error.message);
    toast.success("Modification request sent to Admin.");
    setShowReqModal(false);
    loadData();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return toast.error("Name is required");
    if (!form.phone) return toast.error("Phone number is required");
    
    if (editId) {
      const oldRec = data.find((c) => c.id === editId);
      const oldValue = oldRec ? `${oldRec.name}${oldRec.company ? ` (${oldRec.company})` : ""}` : "";
      const newValue = `${form.name}${form.company ? ` (${form.company})` : ""}`;

      const { error } = await supabase
        .from("customers")
        .update(form)
        .eq("id", editId);
      if (error) return toast.error(error.message);

      if (session?.role !== "super-admin") {
        await supabase.from("delegation_audit_logs").insert({
          user_id: session?.id,
          action: "Edit Customer",
          module: "Customers",
          old_value: oldValue,
          new_value: newValue,
          permission_source: "Role Permission",
        });
      }

      const req = getRequestStatus(editId, "edit");
      if (req) {
        await supabase.from("change_requests").delete().eq("id", req.id);
      }
      toast.success("Customer updated successfully");
      setEditId(null);
      setForm({ name: "", company: "", email: "", phone: "", gstin: "" });
      setShowForm(false);
      loadData();
    } else {
      const { data: existing } = await supabase
        .from("customers")
        .select("customer_code")
        .eq("is_lead", false)
        .order("customer_code", { ascending: false })
        .limit(1);
        
      let nextNum = 1;
      if (existing && existing.length > 0 && existing[0].customer_code) {
        const code = existing[0].customer_code;
        const numMatch = code.match(/\d+/);
        if (numMatch) {
          nextNum = parseInt(numMatch[0], 10) + 1;
        }
      }
      const customerCode = `CUS${String(nextNum).padStart(5, "0")}`;

      const { data: inserted, error } = await supabase
        .from("customers")
        .insert([{
          name: form.name,
          company: form.company,
          email: form.email,
          phone: form.phone,
          gstin: form.gstin,
          is_lead: false,
          customer_code: customerCode,
          customer_type: "Other",
        }])
        .select()
        .single();
      if (error) return toast.error(error.message);

      if (session?.role !== "super-admin" && inserted) {
        await supabase.from("delegation_audit_logs").insert({
          user_id: session?.id,
          action: "Add Customer",
          module: "Customers",
          old_value: "",
          new_value: `${inserted.name}${inserted.company ? ` (${inserted.company})` : ""}`,
          permission_source: "Role Permission",
        });
      }

      toast.success(`Customer added! Code: ${customerCode}`);
      setForm({ name: "", company: "", email: "", phone: "", gstin: "" });
      setShowForm(false);
      loadData();
      if (inserted) {
        setSelectedCustomer(inserted);
        setActiveTab("overview");
      }
    }
  };

  const handleEdit = (customer: any) => {
    setForm({
      name: customer.name || "",
      company: customer.company || "",
      email: customer.email || "",
      phone: customer.phone || "",
      gstin: customer.gstin || "",
    });
    setEditId(customer.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, reqId?: string) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    const oldRec = data.find((c) => c.id === id);
    const oldValue = oldRec ? `${oldRec.name}${oldRec.company ? ` (${oldRec.company})` : ""}` : "";

    const { error } = await supabase
      .from("customers")
      .update({ is_deleted: true })
      .eq("id", id);
    if (error) return toast.error(error.message);

    if (reqId) {
      await supabase.from("change_requests").delete().eq("id", reqId);
    }

    if (session?.role !== "super-admin") {
      await supabase.from("delegation_audit_logs").insert({
        user_id: session?.id,
        action: "Delete Customer",
        module: "Customers",
        old_value: oldValue,
        new_value: "Soft Deleted",
        permission_source: "Role Permission",
      });
    }

    toast.success("Customer deleted successfully (Soft Deleted)");
    loadData();
  };

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Customer Name",
      sortable: true,
      render: (r) => (
        <button
          onClick={() => {
            setSelectedCustomer(r);
            setActiveTab("overview");
          }}
          className="font-medium text-primary hover:underline text-left cursor-pointer"
        >
          {r.name}
        </button>
      ),
    },
    { key: "customer_code", header: "Customer Code" },
    { key: "company", header: "Company" },
    { key: "phone", header: "Phone" },
    { key: "gstin", header: "GSTIN" },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (r: any) => {
        const editReq = getRequestStatus(r.id, "edit");
        const delReq = getRequestStatus(r.id, "delete");

        return (
          <div className="flex justify-end gap-2 items-center text-xs">
            {canEditDirect || editReq?.status === "approved" ? (
              <button
                onClick={() => handleEdit(r)}
                className="rounded p-1.5 hover:bg-secondary text-primary transition-colors cursor-pointer"
                title={editReq?.status === "approved" ? "Approved by Admin" : "Edit"}
              >
                <Pencil className="h-4 w-4" /> {editReq?.status === "approved" && "✅"}
              </button>
            ) : editReq?.status === "pending" ? (
              <span className="text-muted-foreground italic font-medium px-2">Edit Pending...</span>
            ) : (
              <button
                onClick={() => handleOpenReqModal(r, "edit")}
                className="rounded px-2 py-1 border border-input hover:bg-secondary text-muted-foreground transition-colors font-medium cursor-pointer"
              >
                Req Edit
              </button>
            )}

            {canDeleteDirect ? (
              <button
                onClick={() => handleDelete(r.id)}
                className="rounded p-1.5 hover:bg-secondary text-destructive transition-colors cursor-pointer"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : delReq?.status === "approved" ? (
              <button
                onClick={() => handleDelete(r.id, delReq.id)}
                className="rounded px-2 py-1 bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors font-semibold cursor-pointer"
                title="Approved by Admin"
              >
                Delete Now ✅
              </button>
            ) : delReq?.status === "pending" ? (
              <span className="text-muted-foreground italic font-medium px-2">Delete Pending...</span>
            ) : (
              <button
                onClick={() => handleOpenReqModal(r, "delete")}
                className="rounded px-2 py-1 border border-input hover:bg-secondary text-destructive/80 hover:text-destructive transition-colors font-medium cursor-pointer"
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
        title="Customer Management"
        subtitle="Manage client portfolios, billing contacts, and tax info"
        action={
          canManage && (
            <button
              onClick={() => {
                setSelectedCustomer(null);
                setEditId(null);
                setForm({ name: "", company: "", email: "", phone: "", gstin: "" });
                setShowForm(!showForm);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> {showForm || selectedCustomer ? "View Directory" : "Add Customer"}
            </button>
          )
        }
      />

      {selectedCustomer ? (
        <Panel
          title={`Customer Profile: ${selectedCustomer.name} (${selectedCustomer.customer_code || "No Code"})`}
          action={
            <button
              onClick={() => setSelectedCustomer(null)}
              className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted cursor-pointer"
            >
              Back to Directory
            </button>
          }
        >
          <div className="flex border-b border-border bg-muted/20 px-6 pt-3 gap-6">
            {[
              { id: "overview", label: "Overview" },
              { id: "addresses", label: "Addresses" },
              { id: "orders", label: "Orders" },
              { id: "payments", label: "Payments" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard
                    label="Outstanding Balance"
                    value={inr(customerOrders.filter(o => o.status === "pending").reduce((sum, o) => sum + (o.grand_total || 0), 0))}
                    icon={Wallet}
                    tone="accent"
                  />
                  <StatCard
                    label="Total Purchases"
                    value={inr(customerOrders.reduce((sum, o) => sum + (o.grand_total || 0), 0))}
                    icon={Plus}
                    tone="primary"
                  />
                  <StatCard
                    label="Total Orders"
                    value={`${customerOrders.length} orders`}
                    icon={FileText}
                    tone="brown"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-sm border-t pt-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Customer Name</p>
                      <p className="font-semibold mt-0.5">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Company Name</p>
                      <p className="font-semibold mt-0.5">{selectedCustomer.company || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Customer Code</p>
                      <p className="font-semibold mt-0.5">{selectedCustomer.customer_code || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Customer Type</p>
                      <select
                        value={selectedCustomer.customer_type || "Other"}
                        onChange={async (e) => {
                          const val = e.target.value;
                          const { error } = await supabase
                            .from("customers")
                            .update({ customer_type: val })
                            .eq("id", selectedCustomer.id);
                          if (error) return toast.error(error.message);
                          setSelectedCustomer({ ...selectedCustomer, customer_type: val });
                          toast.success("Customer type updated!");
                        }}
                        className="rounded-lg border border-input bg-card px-2.5 py-1.5 text-xs font-semibold mt-1 outline-none cursor-pointer"
                      >
                        {['Retailer', 'Distributor', 'Wholesaler', 'Corporate', 'Exporter', 'Other'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Email</p>
                      <p className="font-semibold mt-0.5">{selectedCustomer.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Phone</p>
                      <p className="font-semibold mt-0.5">
                        {selectedCustomer.phone ? `${selectedCustomer.phone_country_code || "+91"} ${selectedCustomer.phone}` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">GSTIN</p>
                      <p className="font-semibold mt-0.5">{selectedCustomer.gstin || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Status</p>
                      <select
                        value={selectedCustomer.status || "active"}
                        onChange={async (e) => {
                          const val = e.target.value;
                          const { error } = await supabase
                            .from("customers")
                            .update({ status: val })
                            .eq("id", selectedCustomer.id);
                          if (error) return toast.error(error.message);
                          setSelectedCustomer({ ...selectedCustomer, status: val });
                          toast.success("Customer status updated!");
                        }}
                        className="rounded-lg border border-input bg-card px-2.5 py-1.5 text-xs font-semibold mt-1 outline-none cursor-pointer"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="space-y-4 text-sm">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block font-semibold">Billing Address / Company Address</label>
                  <textarea
                    value={selectedCustomer.company_address || ""}
                    placeholder="Enter Billing Address..."
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, company_address: e.target.value })}
                    onBlur={async () => {
                      const { error } = await supabase
                        .from("customers")
                        .update({ company_address: selectedCustomer.company_address })
                        .eq("id", selectedCustomer.id);
                      if (error) toast.error(error.message);
                      else toast.success("Billing address saved!");
                    }}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none mt-1 h-24 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block font-semibold">City</label>
                  <input
                    value={selectedCustomer.city || ""}
                    placeholder="Enter City..."
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, city: e.target.value })}
                    onBlur={async () => {
                      const { error } = await supabase
                        .from("customers")
                        .update({ city: selectedCustomer.city })
                        .eq("id", selectedCustomer.id);
                      if (error) toast.error(error.message);
                      else toast.success("City saved!");
                    }}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none mt-1 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs text-muted-foreground uppercase font-semibold">
                      <th className="px-4 py-3">Order #</th>
                      <th className="px-4 py-3 text-right">Grand Total</th>
                      <th className="px-4 py-3">Order Date</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerOrders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No orders recorded for this customer.</td>
                      </tr>
                    ) : (
                      customerOrders.map((o) => (
                        <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3 font-semibold text-primary">{o.order_number}</td>
                          <td className="px-4 py-3 text-right font-medium">{inr(o.grand_total)}</td>
                          <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                              o.status === "dispatched" || o.status === "delivered" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "payments" && (
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs text-muted-foreground uppercase font-semibold">
                      <th className="px-4 py-3">Invoice #</th>
                      <th className="px-4 py-3 text-right">Total Amount</th>
                      <th className="px-4 py-3">Invoice Date</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No billing invoices found for this customer.</td>
                      </tr>
                    ) : (
                      customerInvoices.map((inv) => (
                        <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3 font-semibold text-primary">{inv.id}</td>
                          <td className="px-4 py-3 text-right font-medium">{inr(inv.items.reduce((s: number, it: any) => s + (it.qty * it.rate * getUnitFactor(it.unit)), 0))}</td>
                          <td className="px-4 py-3 text-muted-foreground">{inv.date}</td>
                          <td className="px-4 py-3 text-muted-foreground">{inv.dueDate}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                              inv.status === "Paid" ? "bg-green-100 text-green-700" : inv.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Panel>
      ) : showForm ? (
        <Panel title={editId ? "Edit Customer" : "Add New Customer"}>
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Customer Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Sharad Spices"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Company Name</label>
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Spice Traders LLC"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="customer@email.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone Number *</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="+91 99000-00000"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">GSTIN (Tax Registration)</label>
              <input
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="24AAAAA0000A1Z5"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground sm:col-span-2 cursor-pointer"
            >
              {editId ? "Update Customer" : "Save Customer"}
            </button>
          </form>
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Total Clients"
              value={String(data.length)}
              icon={Users}
              tone="primary"
            />
            <StatCard
              label="Active Accounts"
              value={String(data.filter((d) => d.status !== "inactive").length)}
              icon={Landmark}
              tone="accent"
            />
            <StatCard
              label="Outstanding Receivables"
              value={inr(receivables)}
              icon={ShieldCheck}
              tone="brown"
            />
          </div>
          <DataTable columns={columns} data={data} emptyLabel="No customers registered yet." />
        </>
      )}

      <ChangeRequestModal
        isOpen={showReqModal}
        onClose={() => setShowReqModal(false)}
        onSubmit={submitChangeRequest}
        type={reqType}
        reason={reqReason}
        setReason={setReqReason}
        module="Customers"
      />
    </div>
  );
}

export function SuppliersModule() {
  const session = useSession();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", gstin: "" });

  const [requests, setRequests] = useState<any[]>([]);
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqRecord, setReqRecord] = useState<any>(null);
  const [reqType, setReqType] = useState<"edit" | "delete">("edit");
  const [reqReason, setReqReason] = useState("");

  const canManage = ["super-admin", "admin", "partner", "warehouse", "supervisor"].includes(session?.role || "");
  const isAdmin = ["super-admin", "admin"].includes(session?.role || "");
  const canEditDirect = isAdmin || ["partner", "warehouse", "supervisor"].includes(session?.role || "");
  const canDeleteDirect = isAdmin;

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: res } = await supabase
        .from("suppliers")
        .select("*")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      setData(res || []);

      const { data: reqs } = await supabase
        .from("change_requests")
        .select("*")
        .eq("module_name", "Suppliers");
      setRequests(reqs || []);
    } catch (err: any) {
      console.error(err);
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

    const displayName = reqRecord.name + (reqRecord.company ? ` (${reqRecord.company})` : "");
    const { error } = await supabase.from("change_requests").insert([
      {
        requester_id: session?.id,
        module_name: "Suppliers",
        record_id: reqRecord.id,
        record_display_name: displayName,
        action_type: reqType,
        reason: reqReason,
        status: "pending",
      },
    ]);

    if (error) return toast.error(error.message);
    toast.success("Modification request sent to Admin.");
    setShowReqModal(false);
    loadData();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return toast.error("Name is required");
    
    if (editId) {
      const oldRec = data.find((s) => s.id === editId);
      const oldValue = oldRec ? `${oldRec.name}${oldRec.company ? ` (${oldRec.company})` : ""}` : "";
      const newValue = `${form.name}${form.company ? ` (${form.company})` : ""}`;

      const { error } = await supabase
        .from("suppliers")
        .update(form)
        .eq("id", editId);
      if (error) return toast.error(error.message);

      if (session?.role !== "super-admin") {
        await supabase.from("delegation_audit_logs").insert({
          user_id: session?.id,
          action: "Edit Supplier",
          module: "Suppliers",
          old_value: oldValue,
          new_value: newValue,
          permission_source: "Role Permission",
        });
      }

      const req = getRequestStatus(editId, "edit");
      if (req) {
        await supabase.from("change_requests").delete().eq("id", req.id);
      }
      toast.success("Supplier updated successfully");
      setEditId(null);
    } else {
      const { data: inserted, error } = await supabase
        .from("suppliers")
        .insert([form])
        .select()
        .single();
      if (error) return toast.error(error.message);

      if (session?.role !== "super-admin" && inserted) {
        await supabase.from("delegation_audit_logs").insert({
          user_id: session?.id,
          action: "Add Supplier",
          module: "Suppliers",
          old_value: "",
          new_value: `${inserted.name}${inserted.company ? ` (${inserted.company})` : ""}`,
          permission_source: "Role Permission",
        });
      }

      toast.success("Supplier added successfully");
    }
    
    setForm({ name: "", company: "", email: "", phone: "", gstin: "" });
    setShowForm(false);
    loadData();
  };

  const handleEdit = (supplier: any) => {
    setForm({
      name: supplier.name || "",
      company: supplier.company || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      gstin: supplier.gstin || "",
    });
    setEditId(supplier.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, reqId?: string) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    const oldRec = data.find((s) => s.id === id);
    const oldValue = oldRec ? `${oldRec.name}${oldRec.company ? ` (${oldRec.company})` : ""}` : "";

    const { error } = await supabase
      .from("suppliers")
      .update({ is_deleted: true })
      .eq("id", id);
    if (error) return toast.error(error.message);

    if (reqId) {
      await supabase.from("change_requests").delete().eq("id", reqId);
    }

    if (session?.role !== "super-admin") {
      await supabase.from("delegation_audit_logs").insert({
        user_id: session?.id,
        action: "Delete Supplier",
        module: "Suppliers",
        old_value: oldValue,
        new_value: "Soft Deleted",
        permission_source: "Role Permission",
      });
    }

    toast.success("Supplier deleted successfully (Soft Deleted)");
    loadData();
  };

  const columns: Column<any>[] = [
    { key: "name", header: "Supplier Name", sortable: true },
    { key: "company", header: "Company" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "gstin", header: "GSTIN" },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (r: any) => {
        const editReq = getRequestStatus(r.id, "edit");
        const delReq = getRequestStatus(r.id, "delete");

        return (
          <div className="flex justify-end gap-2 items-center text-xs">
            {canEditDirect || editReq?.status === "approved" ? (
              <button
                onClick={() => handleEdit(r)}
                className="rounded p-1.5 hover:bg-secondary text-primary transition-colors cursor-pointer"
                title={editReq?.status === "approved" ? "Approved by Admin" : "Edit"}
              >
                <Pencil className="h-4 w-4" /> {editReq?.status === "approved" && "✅"}
              </button>
            ) : editReq?.status === "pending" ? (
              <span className="text-muted-foreground italic font-medium px-2">Edit Pending...</span>
            ) : (
              <button
                onClick={() => handleOpenReqModal(r, "edit")}
                className="rounded px-2 py-1 border border-input hover:bg-secondary text-muted-foreground transition-colors font-medium cursor-pointer"
              >
                Req Edit
              </button>
            )}

            {canDeleteDirect ? (
              <button
                onClick={() => handleDelete(r.id)}
                className="rounded p-1.5 hover:bg-secondary text-destructive transition-colors cursor-pointer"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : delReq?.status === "approved" ? (
              <button
                onClick={() => handleDelete(r.id, delReq.id)}
                className="rounded px-2 py-1 bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors font-semibold cursor-pointer"
                title="Approved by Admin"
              >
                Delete Now ✅
              </button>
            ) : delReq?.status === "pending" ? (
              <span className="text-muted-foreground italic font-medium px-2">Delete Pending...</span>
            ) : (
              <button
                onClick={() => handleOpenReqModal(r, "delete")}
                className="rounded px-2 py-1 border border-input hover:bg-secondary text-destructive/80 hover:text-destructive transition-colors font-medium cursor-pointer"
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
        title="Supplier Management"
        subtitle="Manage agricultural farms, wholesale mandi merchants, and raw spice vendors"
        action={
          canManage && (
            <button
              onClick={() => {
                setEditId(null);
                setForm({ name: "", company: "", email: "", phone: "", gstin: "" });
                setShowForm(!showForm);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> {showForm ? "View Directory" : "Add Supplier"}
            </button>
          )
        }
      />

      {showForm ? (
        <Panel title={editId ? "Edit Supplier" : "Add New Supplier"}>
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Supplier Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Guntur Farms"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Company Name</label>
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Chilli Farms Co."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="supplier@email.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone Number</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="+91 99000-00000"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">GSTIN</label>
              <input
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="24AAAAA0000A1Z5"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground sm:col-span-2 cursor-pointer"
            >
              {editId ? "Update Supplier" : "Save Supplier"}
            </button>
          </form>
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Total Suppliers"
              value={String(data.length)}
              icon={Truck}
              tone="brown"
            />
            <StatCard
              label="Seeded Mandi Vendors"
              value={String(data.filter((d) => d.gstin).length)}
              icon={ShieldCheck}
              tone="accent"
            />
            <StatCard
              label="Active Purchase Channels"
              value="Direct Raw Contract"
              icon={Warehouse}
              tone="primary"
            />
          </div>
          <DataTable columns={columns} data={data} emptyLabel="No suppliers registered yet." />
        </>
      )}

      <ChangeRequestModal
        isOpen={showReqModal}
        onClose={() => setShowReqModal(false)}
        onSubmit={submitChangeRequest}
        type={reqType}
        reason={reqReason}
        setReason={setReqReason}
        module="Suppliers"
      />
    </div>
  );
}

/* ====================================================================
   2. PRODUCTS MODULE
   ==================================================================== */
export function ProductsModule() {
  const session = useSession();
  const [data, setData] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    hsn_code: "",
    gst_rate: 5.0,
    standard_price: 0,
    distributor_price: 0,
    retailer_price: 0,
  });

  const [requests, setRequests] = useState<any[]>([]);
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqRecord, setReqRecord] = useState<any>(null);
  const [reqType, setReqType] = useState<"edit" | "delete">("edit");
  const [reqReason, setReqReason] = useState("");

  const canManage = ["super-admin", "admin", "supervisor"].includes(session?.role || "");
  const isAdmin = ["super-admin", "admin"].includes(session?.role || "");
  const canEditDirect = isAdmin || ["supervisor"].includes(session?.role || "");
  const canDeleteDirect = isAdmin;

  const loadData = async () => {
    try {
      const { data: products } = await supabase
        .from("products")
        .select("*, product_prices(*)")
        .eq("is_deleted", false);
      setData(products || []);

      const { data: reqs } = await supabase
        .from("change_requests")
        .select("*")
        .eq("module_name", "Products");
      setRequests(reqs || []);
    } catch (err: any) {
      console.error(err);
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

    const displayName = reqRecord.name + ` (${reqRecord.sku})`;
    const { error } = await supabase.from("change_requests").insert([
      {
        requester_id: session?.id,
        module_name: "Products",
        record_id: reqRecord.id,
        record_display_name: displayName,
        action_type: reqType,
        reason: reqReason,
        status: "pending",
      },
    ]);

    if (error) return toast.error(error.message);
    toast.success("Modification request sent to Admin.");
    setShowReqModal(false);
    loadData();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku) return toast.error("Name and SKU are required");

    if (editId) {
      const oldRec = data.find((p) => p.id === editId);
      const oldValue = oldRec ? `${oldRec.name} (${oldRec.sku})` : "";
      const newValue = `${form.name} (${form.sku})`;

      const { error } = await supabase
        .from("products")
        .update({
          name: form.name,
          sku: form.sku,
          hsn_code: form.hsn_code,
          gst_rate: form.gst_rate,
        })
        .eq("id", editId);

      if (error) return toast.error(error.message);

      // Upsert pricing tiers
      await supabase.from("product_prices").upsert(
        { product_id: editId, tier: "standard", price: form.standard_price },
        { onConflict: "product_id,tier" }
      );
      await supabase.from("product_prices").upsert(
        { product_id: editId, tier: "distributor", price: form.distributor_price },
        { onConflict: "product_id,tier" }
      );
      await supabase.from("product_prices").upsert(
        { product_id: editId, tier: "retailer", price: form.retailer_price },
        { onConflict: "product_id,tier" }
      );

      if (session?.role !== "super-admin") {
        await supabase.from("delegation_audit_logs").insert({
          user_id: session?.id,
          action: "Edit Product",
          module: "Products",
          old_value: oldValue,
          new_value: newValue,
          permission_source: "Role Permission",
        });
      }

      const req = getRequestStatus(editId, "edit");
      if (req) {
        await supabase.from("change_requests").delete().eq("id", req.id);
      }
      toast.success("Product and pricing tiers updated!");
      setEditId(null);
    } else {
      const { data: p, error } = await supabase
        .from("products")
        .insert([
          {
            name: form.name,
            sku: form.sku,
            hsn_code: form.hsn_code,
            gst_rate: form.gst_rate,
          },
        ])
        .select()
        .single();

      if (error) return toast.error(error.message);

      if (p) {
        await supabase.from("product_prices").insert([
          { product_id: p.id, tier: "standard", price: form.standard_price },
          { product_id: p.id, tier: "distributor", price: form.distributor_price },
          { product_id: p.id, tier: "retailer", price: form.retailer_price },
        ]);

        if (session?.role !== "super-admin") {
          await supabase.from("delegation_audit_logs").insert({
            user_id: session?.id,
            action: "Add Product",
            module: "Products",
            old_value: "",
            new_value: `${p.name} (${p.sku})`,
            permission_source: "Role Permission",
          });
        }
      }

      toast.success("Product and pricing tiers saved!");
    }

    setForm({
      name: "",
      sku: "",
      hsn_code: "",
      gst_rate: 5.0,
      standard_price: 0,
      distributor_price: 0,
      retailer_price: 0,
    });
    setShowForm(false);
    loadData();
  };

  const handleEdit = (product: any) => {
    const getPriceVal = (tier: string) => {
      return product.product_prices?.find((p: any) => p.tier === tier)?.price || 0;
    };
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      hsn_code: product.hsn_code || "",
      gst_rate: product.gst_rate || 5.0,
      standard_price: getPriceVal("standard"),
      distributor_price: getPriceVal("distributor"),
      retailer_price: getPriceVal("retailer"),
    });
    setEditId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, reqId?: string) => {
    if (!window.confirm("Are you sure you want to delete this product SKU?")) return;
    const oldRec = data.find((p) => p.id === id);
    const oldValue = oldRec ? `${oldRec.name} (${oldRec.sku})` : "";

    const { error } = await supabase
      .from("products")
      .update({ is_deleted: true })
      .eq("id", id);
    if (error) return toast.error(error.message);

    if (reqId) {
      await supabase.from("change_requests").delete().eq("id", reqId);
    }

    if (session?.role !== "super-admin") {
      await supabase.from("delegation_audit_logs").insert({
        user_id: session?.id,
        action: "Delete Product",
        module: "Products",
        old_value: oldValue,
        new_value: "Soft Deleted",
        permission_source: "Role Permission",
      });
    }

    toast.success("Product deleted successfully (Soft Deleted)");
    loadData();
  };

  const getPrice = (row: any, tier: string) => {
    const p = row.product_prices?.find((pr: any) => pr.tier === tier);
    return p ? inr(p.price) : "-";
  };

  const columns: Column<any>[] = [
    { key: "sku", header: "SKU", sortable: true },
    { key: "name", header: "Product Name", sortable: true },
    { key: "hsn_code", header: "HSN Code" },
    { key: "standard", header: "Std Price", render: (r) => getPrice(r, "standard") },
    { key: "distributor", header: "Dist Price", render: (r) => getPrice(r, "distributor") },
    { key: "retailer", header: "Retail Price", render: (r) => getPrice(r, "retailer") },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (r: any) => {
        const editReq = getRequestStatus(r.id, "edit");
        const delReq = getRequestStatus(r.id, "delete");

        return (
          <div className="flex justify-end gap-2 items-center text-xs">
            {canEditDirect || editReq?.status === "approved" ? (
              <button
                onClick={() => handleEdit(r)}
                className="rounded p-1.5 hover:bg-secondary text-primary transition-colors cursor-pointer"
                title={editReq?.status === "approved" ? "Approved by Admin" : "Edit"}
              >
                <Pencil className="h-4 w-4" /> {editReq?.status === "approved" && "✅"}
              </button>
            ) : editReq?.status === "pending" ? (
              <span className="text-muted-foreground italic font-medium px-2">Edit Pending...</span>
            ) : (
              <button
                onClick={() => handleOpenReqModal(r, "edit")}
                className="rounded px-2 py-1 border border-input hover:bg-secondary text-muted-foreground transition-colors font-medium cursor-pointer"
              >
                Req Edit
              </button>
            )}

            {canDeleteDirect ? (
              <button
                onClick={() => handleDelete(r.id)}
                className="rounded p-1.5 hover:bg-secondary text-destructive transition-colors cursor-pointer"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : delReq?.status === "approved" ? (
              <button
                onClick={() => handleDelete(r.id, delReq.id)}
                className="rounded px-2 py-1 bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors font-semibold cursor-pointer"
                title="Approved by Admin"
              >
                Delete Now ✅
              </button>
            ) : delReq?.status === "pending" ? (
              <span className="text-muted-foreground italic font-medium px-2">Delete Pending...</span>
            ) : (
              <button
                onClick={() => handleOpenReqModal(r, "delete")}
                className="rounded px-2 py-1 border border-input hover:bg-secondary text-destructive/80 hover:text-destructive transition-colors font-medium cursor-pointer"
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
        title="Products Catalog"
        subtitle="Manage export spice SKU catalogs and active pricing structures"
        action={
          canManage && (
            <button
              onClick={() => {
                setEditId(null);
                setForm({
                  name: "",
                  sku: "",
                  hsn_code: "",
                  gst_rate: 5.0,
                  standard_price: 0,
                  distributor_price: 0,
                  retailer_price: 0,
                });
                setShowForm(!showForm);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> {showForm ? "View Catalog" : "Add Product"}
            </button>
          )
        }
      />

      {showForm ? (
        <Panel title={editId ? "Edit Product SKU" : "Create New Product SKU"}>
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Product Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Ground Coriander Premium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">SKU Code *</label>
              <input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. AG-COR-003"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">HSN Code</label>
              <input
                value={form.hsn_code}
                onChange={(e) => setForm({ ...form, hsn_code: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="09093119"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">GST Rate (%)</label>
              <input
                type="number"
                value={form.gst_rate}
                onChange={(e) => setForm({ ...form, gst_rate: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <hr className="sm:col-span-2 my-1" />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Standard Price (INR/kg)</label>
              <input
                type="number"
                value={form.standard_price}
                onChange={(e) => setForm({ ...form, standard_price: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Distributor Price (INR/kg)</label>
              <input
                type="number"
                value={form.distributor_price}
                onChange={(e) =>
                  setForm({ ...form, distributor_price: parseFloat(e.target.value) || 0 })
                }
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Retailer Price (INR/kg)</label>
              <input
                type="number"
                value={form.retailer_price}
                onChange={(e) => setForm({ ...form, retailer_price: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground sm:col-span-2 mt-2 cursor-pointer"
            >
              {editId ? "Update Product SKU & Prices" : "Save Product SKU & Prices"}
            </button>
          </form>
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Total catalog SKUs"
              value={String(data.length)}
              icon={Package}
              tone="primary"
            />
            <StatCard
              label="Distributor Pricing tiers"
              value="Mapped"
              icon={ShieldCheck}
              tone="accent"
            />
            <StatCard
              label="Taxable (GST 5%) items"
              value={String(data.filter((d) => d.gst_rate === 5).length)}
              icon={Landmark}
              tone="brown"
            />
          </div>
          <DataTable columns={columns} data={data} emptyLabel="No products found." />
        </>
      )}

      <ChangeRequestModal
        isOpen={showReqModal}
        onClose={() => setShowReqModal(false)}
        onSubmit={submitChangeRequest}
        type={reqType}
        reason={reqReason}
        setReason={setReqReason}
        module="Products"
      />
    </div>
  );
}

/* ====================================================================
   3. INVENTORY MODULE
   ==================================================================== */
export function InventoryModule() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    product_id: "",
    warehouse_id: "",
    quantity: 0,
    movement_type: "adjustment",
    description: "",
  });

  const loadData = async () => {
    const { data: st } = await supabase
      .from("stock_movements")
      .select("*, products(name, sku), warehouses(name)");
    setStocks(st || []);

    const { data: pr } = await supabase.from("products").select("id, name, sku");
    setProducts(pr || []);

    const { data: wh } = await supabase.from("warehouses").select("id, name");
    setWarehouses(wh || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id || !form.warehouse_id || !form.quantity)
      return toast.error("Product, Warehouse, and Quantity are required");

    const { error } = await supabase.from("stock_movements").insert([form]);
    if (error) return toast.error(error.message);

    toast.success("Stock movement logged successfully!");
    setForm({
      product_id: "",
      warehouse_id: "",
      quantity: 0,
      movement_type: "adjustment",
      description: "",
    });
    setShowForm(false);
    loadData();
  };

  const columns: Column<any>[] = [
    {
      key: "created_at",
      header: "Date",
      sortable: true,
      render: (r) => new Date(r.created_at).toLocaleDateString(),
    },
    {
      key: "product",
      header: "Product",
      render: (r) => `${r.products?.name || "Product"} (${r.products?.sku || ""})`,
    },
    { key: "warehouse", header: "Warehouse", render: (r) => r.warehouses?.name || "Warehouse" },
    {
      key: "quantity",
      header: "Qty Change",
      align: "right",
      render: (r) => (
        <span
          className={
            r.quantity > 0 ? "text-accent font-semibold" : "text-destructive font-semibold"
          }
        >
          {r.quantity > 0 ? `+${r.quantity} kg` : `${r.quantity} kg`}
        </span>
      ),
    },
    {
      key: "movement_type",
      header: "Type",
      render: (r) => (
        <StatusBadge label={r.movement_type} tone={r.quantity > 0 ? "success" : "danger"} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Ledger & Movements"
        subtitle="Track material entries, warehouse log transfers, and quantity checks"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> {showForm ? "View Ledger" : "Log Movement"}
          </button>
        }
      />

      {showForm ? (
        <Panel title="Log Stock Movement">
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Select Product SKU *</label>
              <select
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Choose Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Select Target Warehouse *</label>
              <select
                value={form.warehouse_id}
                onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Choose Warehouse --</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Quantity * (positive = inward, negative = outward)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Movement Type *</label>
              <select
                value={form.movement_type}
                onChange={(e) => setForm({ ...form, movement_type: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="adjustment">Stock Adjustment / Correction</option>
                <option value="purchase">Raw Material Purchase Inflow</option>
                <option value="production_input">Production Consumption</option>
                <option value="production_output">Finished Goods Grinding</option>
                <option value="sales_dispatch">Sales Order Dispatch</option>
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Grinding batch output transfer"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground sm:col-span-2"
            >
              Submit Entry
            </button>
          </form>
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Transactions Logged"
              value={String(stocks.length)}
              icon={Boxes}
              tone="primary"
            />
            <StatCard
              label="Active Warehouses"
              value={String(warehouses.length)}
              icon={Warehouse}
              tone="accent"
            />
            <StatCard
              label="Total Stock Ledger Volume"
              value={stocks.reduce((acc, s) => acc + s.quantity, 0).toFixed(2) + " kg"}
              icon={Boxes}
              tone="brown"
            />
          </div>
          <DataTable columns={columns} data={stocks} emptyLabel="No movements logged yet." />
        </>
      )}
    </div>
  );
}

/* ====================================================================
   4. CRM & LEADS MODULE
   ==================================================================== */
export function CrmModule() {
  const [data, setData] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    phone_country_code: "+91",
    lead_source: "Website",
    company_address: "",
    company_website: "",
    notes: "New lead captured",
    next_follow_up_date: "",
  });

  const loadData = async () => {
    const { data: res } = await supabase
      .from("customers")
      .select("*")
      .eq("is_lead", true)
      .order("created_at", { ascending: false });
    setData(res || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return toast.error("Lead name is required");
    const { error } = await supabase.from("customers").insert([
      {
        name: form.name,
        company: form.company || "Prospect",
        email: form.email,
        phone: form.phone,
        phone_country_code: form.phone_country_code,
        lead_source: form.lead_source,
        company_address: form.company_address,
        company_website: form.company_website,
        notes: form.notes,
        next_follow_up_date: form.next_follow_up_date || null,
        is_lead: true,
        lead_status: "new",
      },
    ]);
    if (error) return toast.error(error.message);
    toast.success("Lead added successfully to pipeline");
    setForm({
      name: "",
      company: "",
      email: "",
      phone: "",
      phone_country_code: "+91",
      lead_source: "Website",
      company_address: "",
      company_website: "",
      notes: "New lead captured",
      next_follow_up_date: "",
    });
    setShowForm(false);
    loadData();
  };

  const saveLeadEdits = async () => {
    if (!editForm.name) return toast.error("Name is required");
    const { error } = await supabase
      .from("customers")
      .update({
        name: editForm.name,
        company: editForm.company,
        email: editForm.email,
        phone: editForm.phone,
        phone_country_code: editForm.phone_country_code,
        lead_source: editForm.lead_source,
        company_address: editForm.company_address,
        company_website: editForm.company_website,
        notes: editForm.notes,
        next_follow_up_date: editForm.next_follow_up_date || null,
        last_contacted_at: editForm.last_contacted_at || null,
      })
      .eq("id", editForm.id);

    if (error) return toast.error(error.message);
    toast.success("Lead details updated!");
    setIsEditing(false);
    setSelectedLead(editForm);
    loadData();
  };

  const updateLeadStatusDirectly = async (leadId: string, status: string) => {
    const { error } = await supabase
      .from("customers")
      .update({ lead_status: status })
      .eq("id", leadId);

    if (error) return toast.error(error.message);
    toast.success(`Lead status updated to ${status}!`);
    setSelectedLead((prev: any) => prev ? { ...prev, lead_status: status } : null);
    setEditForm((prev: any) => prev ? { ...prev, lead_status: status } : null);
    loadData();
  };

  const convertLeadToCustomer = async (lead: any) => {
    const customerType = prompt(
      "Enter Customer Type:\n(Retailer, Distributor, Wholesaler, Corporate, Exporter, Other)",
      "Wholesaler"
    );
    if (customerType === null) return;
    
    const validTypes = ['Retailer', 'Distributor', 'Wholesaler', 'Corporate', 'Exporter', 'Other'];
    if (!validTypes.includes(customerType)) {
      return toast.error("Invalid Customer Type. Choose from: " + validTypes.join(", "));
    }

    const { data: existing } = await supabase
      .from("customers")
      .select("customer_code")
      .eq("is_lead", false)
      .order("customer_code", { ascending: false })
      .limit(1);
      
    let nextNum = 1;
    if (existing && existing.length > 0 && existing[0].customer_code) {
      const code = existing[0].customer_code;
      const numMatch = code.match(/\d+/);
      if (numMatch) {
        nextNum = parseInt(numMatch[0], 10) + 1;
      }
    }
    const customerCode = `CUS${String(nextNum).padStart(5, "0")}`;

    const { error } = await supabase
      .from("customers")
      .update({
        is_lead: false,
        lead_status: "won",
        customer_code: customerCode,
        customer_type: customerType,
      })
      .eq("id", lead.id);

    if (error) return toast.error(error.message);
    toast.success(`Converted to Customer successfully! Code: ${customerCode}`);
    setSelectedLead(null);
    loadData();
  };

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Lead / Contact",
      sortable: true,
      render: (r) => (
        <button
          onClick={() => {
            setSelectedLead(r);
            setEditForm(r);
            setIsEditing(false);
          }}
          className="font-medium text-primary hover:underline text-left cursor-pointer"
        >
          {r.name}
        </button>
      ),
    },
    { key: "company", header: "Prospective Client" },
    {
      key: "lead_status",
      header: "Status",
      render: (r) => (
        <span className="inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold uppercase">
          {r.lead_status || "new"}
        </span>
      ),
    },
    {
      key: "next_follow_up_date",
      header: "Next Follow-up",
      render: (r) => r.next_follow_up_date ? new Date(r.next_follow_up_date).toLocaleDateString() : "Not scheduled",
    },
    {
      key: "created_at",
      header: "Captured At",
      render: (r) => new Date(r.created_at).toLocaleDateString(),
    },
  ];

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysFollowups = data.filter((l) => l.next_follow_up_date === todayStr).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM & Pipeline"
        subtitle="Track prospective spice deals, followups, and client conversions"
        action={
          <button
            onClick={() => {
              setSelectedLead(null);
              setIsEditing(false);
              setShowForm(!showForm);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> {showForm || selectedLead ? "View Pipeline" : "Add Lead"}
          </button>
        }
      />

      {selectedLead ? (
        <Panel
          title={isEditing ? `Edit Lead: ${selectedLead.name}` : `Lead Profile: ${selectedLead.name}`}
          action={
            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  onClick={() => {
                    setEditForm({ ...selectedLead });
                    setIsEditing(true);
                  }}
                  className="rounded-lg border px-3 py-1 text-xs font-semibold hover:bg-muted cursor-pointer"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedLead(null);
                  setIsEditing(false);
                }}
                className="rounded-lg border px-3 py-1 text-xs font-semibold hover:bg-muted cursor-pointer"
              >
                Back to Pipeline
              </button>
            </div>
          }
        >
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveLeadEdits();
              }}
              className="grid gap-4 p-6 sm:grid-cols-2"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Contact Name *</label>
                <input
                  value={editForm.name || ""}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Company Name</label>
                <input
                  value={editForm.company || ""}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={editForm.email || ""}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
                <div className="flex gap-2">
                  <select
                    value={editForm.phone_country_code || "+91"}
                    onChange={(e) => setEditForm({ ...editForm, phone_country_code: e.target.value })}
                    className="rounded-lg border border-input bg-card px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+971">+971 (UAE)</option>
                  </select>
                  <input
                    value={editForm.phone || ""}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Lead Source</label>
                <select
                  value={editForm.lead_source || "Website"}
                  onChange={(e) => setEditForm({ ...editForm, lead_source: e.target.value })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {["Website", "Referral", "Trade Fair", "LinkedIn", "Direct Contact"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Next Follow-up Date</label>
                <input
                  type="date"
                  value={editForm.next_follow_up_date || ""}
                  onChange={(e) => setEditForm({ ...editForm, next_follow_up_date: e.target.value })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Last Contacted Date</label>
                <input
                  type="date"
                  value={editForm.last_contacted_at || ""}
                  onChange={(e) => setEditForm({ ...editForm, last_contacted_at: e.target.value })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Company Website</label>
                <input
                  value={editForm.company_website || ""}
                  onChange={(e) => setEditForm({ ...editForm, company_website: e.target.value })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. www.londonspices.com"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Company Address</label>
                <textarea
                  value={editForm.company_address || ""}
                  onChange={(e) => setEditForm({ ...editForm, company_address: e.target.value })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 h-16"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Notes</label>
                <textarea
                  value={editForm.notes || ""}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 h-20"
                />
              </div>
              <div className="flex gap-3 sm:col-span-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 text-sm border-b pb-6">
                <div>
                  <p className="text-xs text-muted-foreground">Contact Name</p>
                  <p className="font-semibold mt-0.5">{selectedLead.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Company Name</p>
                  <p className="font-semibold mt-0.5">{selectedLead.company || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-semibold mt-0.5">{selectedLead.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-semibold mt-0.5">
                    {selectedLead.phone ? `${selectedLead.phone_country_code || "+91"} ${selectedLead.phone}` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lead Source</p>
                  <p className="font-semibold mt-0.5">{selectedLead.lead_source || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase mt-1">
                    {selectedLead.lead_status || "new"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Contacted</p>
                  <p className="font-semibold mt-0.5">
                    {selectedLead.last_contacted_at ? new Date(selectedLead.last_contacted_at).toLocaleDateString() : "Never"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Next Follow-up</p>
                  <p className="font-semibold mt-0.5">
                    {selectedLead.next_follow_up_date ? new Date(selectedLead.next_follow_up_date).toLocaleDateString() : "Not scheduled"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Company Website</p>
                  <p className="font-semibold mt-0.5 font-mono text-xs">
                    {selectedLead.company_website ? (
                      <a href={`https://${selectedLead.company_website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {selectedLead.company_website}
                      </a>
                    ) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Company Address</p>
                  <p className="font-semibold mt-0.5 whitespace-pre-wrap">{selectedLead.company_address || "N/A"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="mt-1 p-3 bg-muted/40 rounded-lg whitespace-pre-wrap">{selectedLead.notes || "No notes."}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-2">Update Status:</span>
                  <button
                    onClick={() => updateLeadStatusDirectly(selectedLead.id, "qualified")}
                    className="rounded-lg border border-primary/40 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 cursor-pointer"
                  >
                    Qualified
                  </button>
                  <button
                    onClick={() => updateLeadStatusDirectly(selectedLead.id, "won")}
                    className="rounded-lg border border-green-500 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100 cursor-pointer"
                  >
                    Won
                  </button>
                  <button
                    onClick={() => updateLeadStatusDirectly(selectedLead.id, "lost")}
                    className="rounded-lg border border-red-500 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 cursor-pointer"
                  >
                    Lost
                  </button>
                </div>

                {selectedLead.lead_status === "won" && (
                  <button
                    onClick={() => convertLeadToCustomer(selectedLead)}
                    className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-bold text-white shadow-soft hover:bg-green-700 transition-colors cursor-pointer"
                  >
                    Convert to Customer
                  </button>
                )}
              </div>
            </div>
          )}
        </Panel>
      ) : showForm ? (
        <Panel title="Record New Lead Prospect">
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Contact Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Company Name</label>
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. London Spice Importers"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="procurement@londonspices.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone Number</label>
              <div className="flex gap-2">
                <select
                  value={form.phone_country_code}
                  onChange={(e) => setForm({ ...form, phone_country_code: e.target.value })}
                  className="rounded-lg border border-input bg-card px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+971">+971 (UAE)</option>
                </select>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="20-7946-0958"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Lead Source</label>
              <select
                value={form.lead_source}
                onChange={(e) => setForm({ ...form, lead_source: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                {["Website", "Referral", "Trade Fair", "LinkedIn", "Direct Contact"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Next Follow-up Date</label>
              <input
                type="date"
                value={form.next_follow_up_date}
                onChange={(e) => setForm({ ...form, next_follow_up_date: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Company Website</label>
              <input
                value={form.company_website}
                onChange={(e) => setForm({ ...form, company_website: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. www.londonspices.com"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Company Address</label>
              <textarea
                value={form.company_address}
                onChange={(e) => setForm({ ...form, company_address: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 h-16"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Pipeline Notes / Status Details</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 h-20"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground sm:col-span-2 cursor-pointer"
            >
              Add Lead to CRM
            </button>
          </form>
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Pipeline Leads"
              value={String(data.length)}
              icon={Target}
              tone="primary"
            />
            <StatCard label="Today's Follow-ups" value={`${todaysFollowups} leads`} icon={Bell} tone="accent" />
            <StatCard label="Pipeline Status" value="Active" icon={ShieldCheck} tone="brown" />
          </div>
          <DataTable columns={columns} data={data} emptyLabel="No leads captured." />
        </>
      )}
    </div>
  );
}

/* ====================================================================
   5. PRODUCTION MODULE
   ==================================================================== */
export function ProductionModule() {
  const [data, setData] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    product_id: "",
    batch_number: "",
    planned_qty: 0,
    status: "scheduled",
    start_date: new Date().toISOString().split("T")[0],
  });

  const loadData = async () => {
    const { data: batches } = await supabase
      .from("production_batches")
      .select("*, products(name, sku)")
      .order("created_at", { ascending: false });
    setData(batches || []);

    const { data: pr } = await supabase.from("products").select("id, name, sku");
    setProducts(pr || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id || !form.batch_number || !form.planned_qty)
      return toast.error("Please fill all fields");

    const { error } = await supabase.from("production_batches").insert([form]);
    if (error) return toast.error(error.message);

    toast.success("Production batch created successfully");
    setForm({
      product_id: "",
      batch_number: "",
      planned_qty: 0,
      status: "scheduled",
      start_date: new Date().toISOString().split("T")[0],
    });
    setShowForm(false);
    loadData();
  };

  const columns: Column<any>[] = [
    { key: "batch_number", header: "Batch Number", sortable: true },
    { key: "product", header: "Product SKU", render: (r) => r.products?.name || "Product" },
    {
      key: "planned_qty",
      header: "Planned Qty",
      align: "right",
      render: (r) => `${r.planned_qty} kg`,
    },
    { key: "start_date", header: "Start Date" },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (r) => (
        <StatusBadge label={r.status} tone={r.status === "completed" ? "success" : "warning"} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Batches"
        subtitle="Manage grinding schedules, batch numbers, and material packing tracking"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> {showForm ? "View Batches" : "Schedule Batch"}
          </button>
        }
      />

      {showForm ? (
        <Panel title="Create Production Batch">
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Select Product to Grind/Blend *</label>
              <select
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Choose Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Batch Reference Number *</label>
              <input
                value={form.batch_number}
                onChange={(e) => setForm({ ...form, batch_number: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. BT-TUR-0605"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Planned Quantity (kg) *</label>
              <input
                type="number"
                value={form.planned_qty}
                onChange={(e) => setForm({ ...form, planned_qty: parseFloat(e.target.value) || 0 })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Planned Start Date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground sm:col-span-2"
            >
              Schedule Batch
            </button>
          </form>
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Total Batches"
              value={String(data.length)}
              icon={Factory}
              tone="primary"
            />
            <StatCard
              label="Batches in Grinding"
              value={String(
                data.filter((d) => d.status === "grinding" || d.status === "scheduled").length,
              )}
              icon={Beaker}
              tone="accent"
            />
            <StatCard
              label="Completed Batches"
              value={String(data.filter((d) => d.status === "completed").length)}
              icon={ShieldCheck}
              tone="brown"
            />
          </div>
          <DataTable columns={columns} data={data} emptyLabel="No production batches found." />
        </>
      )}
    </div>
  );
}

/* ====================================================================
   6. QC MANAGEMENT MODULE
   ==================================================================== */
export function QcManagementModule() {
  const session = useSession();
  const [data, setData] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    batch_id: "",
    moisture: 5.0,
    aroma: "Premium spice aroma",
    color: "Correct standard color",
    status: "approved",
  });

  // Requests state and modal state
  const [requests, setRequests] = useState<any[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    record_id: "",
    display_name: "",
    action_type: "edit" as "edit" | "delete",
    reason: "",
  });

  const loadData = async () => {
    const { data: tests } = await supabase
      .from("qc_tests")
      .select("*, production_batches(batch_number, products(name, sku))")
      .order("tested_at", { ascending: false });
    setData(tests || []);

    // Load active batches that are scheduled/grinding
    const { data: bt } = await supabase
      .from("production_batches")
      .select("id, batch_number")
      .order("created_at", { ascending: false });
    setBatches(bt || []);

    // Load change requests for QC module
    const { data: reqs } = await supabase
      .from("change_requests")
      .select("*")
      .eq("module_name", "QC");
    setRequests(reqs || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getRequestStatus = (recordId: string, type: "edit" | "delete") => {
    return requests.find((r) => r.record_id === recordId && r.action_type === type);
  };

  const handleRequestChange = (record: any, type: "edit" | "delete") => {
    setRequestForm({
      record_id: record.id,
      display_name: record.production_batches?.batch_number || "QC Record",
      action_type: type,
      reason: "",
    });
    setShowRequestModal(true);
  };

  const submitChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.reason) return toast.error("Reason is required");

    const { error } = await supabase.from("change_requests").insert([
      {
        requester_id: session?.id,
        module_name: "QC",
        record_id: requestForm.record_id,
        record_display_name: requestForm.display_name,
        action_type: requestForm.action_type,
        reason: requestForm.reason,
        status: "pending",
      },
    ]);

    if (error) return toast.error(error.message);
    toast.success("Modification request sent to Admin.");
    setShowRequestModal(false);
    loadData();
  };

  const executeDelete = async (id: string, reqId: string) => {
    if (!window.confirm("Are you sure you want to delete this QC record?")) return;
    const { error } = await supabase.from("qc_tests").delete().eq("id", id);
    if (error) return toast.error(error.message);

    if (reqId) {
      await supabase.from("change_requests").delete().eq("id", reqId);
    }
    toast.success("QC record deleted successfully.");
    loadData();
  };

  const handleEdit = (test: any) => {
    setForm({
      batch_id: test.batch_id,
      moisture: parseFloat(test.moisture),
      aroma: test.aroma,
      color: test.color,
      status: test.status,
    });
    setEditId(test.id);
    setShowForm(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.batch_id || !form.moisture || !form.aroma)
      return toast.error("Moisture and aroma checks are required");

    if (editId) {
      const { error } = await supabase
        .from("qc_tests")
        .update(form)
        .eq("id", editId);
      if (error) return toast.error(error.message);

      const req = getRequestStatus(editId, "edit");
      if (req) {
        await supabase.from("change_requests").delete().eq("id", req.id);
      }
      toast.success("QC test updated successfully!");
      setEditId(null);
    } else {
      const { error } = await supabase.from("qc_tests").insert([form]);
      if (error) return toast.error(error.message);

      // Update the production batch status to completed/rejected
      await supabase
        .from("production_batches")
        .update({ status: form.status === "approved" ? "completed" : "cancelled" })
        .eq("id", form.batch_id);

      toast.success("Quality Control test recorded successfully!");
    }

    setForm({
      batch_id: "",
      moisture: 5.0,
      aroma: "Premium spice aroma",
      color: "Correct standard color",
      status: "approved",
    });
    setShowForm(false);
    loadData();
  };

  const columns: Column<any>[] = [
    {
      key: "tested_at",
      header: "Test Date",
      render: (r) => new Date(r.tested_at).toLocaleDateString(),
    },
    {
      key: "batch",
      header: "Batch Number",
      render: (r) => r.production_batches?.batch_number || "Batch",
    },
    {
      key: "product",
      header: "Product",
      render: (r) => r.production_batches?.products?.name || "Product",
    },
    { key: "moisture", header: "Moisture (%)", align: "right", render: (r) => `${r.moisture}%` },
    {
      key: "status",
      header: "QC Status",
      align: "center",
      render: (r) => (
        <StatusBadge label={r.status} tone={r.status === "approved" ? "success" : "danger"} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (r: any) => {
        const isAdmin = ["super-admin", "admin"].includes(session?.role || "");
        const editReq = getRequestStatus(r.id, "edit");
        const delReq = getRequestStatus(r.id, "delete");

        return (
          <div className="flex justify-end gap-2 items-center text-xs">
            {isAdmin || editReq?.status === "approved" ? (
              <button
                onClick={() => handleEdit(r)}
                className="rounded px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary transition-colors font-semibold"
                title={editReq?.status === "approved" ? "Approved by Admin" : "Edit"}
              >
                Edit {editReq?.status === "approved" && "✅"}
              </button>
            ) : editReq?.status === "pending" ? (
              <span className="text-muted-foreground italic font-medium">Edit Pending...</span>
            ) : (
              <button
                onClick={() => handleRequestChange(r, "edit")}
                className="rounded px-2 py-1 border border-input hover:bg-secondary text-muted-foreground transition-colors font-medium"
                title="Request Edit"
              >
                Req Edit
              </button>
            )}

            {isAdmin ? (
              <button
                onClick={() => executeDelete(r.id, "")}
                className="rounded p-1 hover:bg-secondary text-destructive transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : delReq?.status === "approved" ? (
              <button
                onClick={() => executeDelete(r.id, delReq.id)}
                className="rounded px-2 py-1 bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors font-semibold"
                title="Approved by Admin"
              >
                Delete Now ✅
              </button>
            ) : delReq?.status === "pending" ? (
              <span className="text-muted-foreground italic font-medium">Delete Pending...</span>
            ) : (
              <button
                onClick={() => handleRequestChange(r, "delete")}
                className="rounded px-2 py-1 border border-input hover:bg-secondary text-destructive/80 hover:text-destructive transition-colors font-medium"
                title="Request Delete"
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
        title="Quality Control Tests"
        subtitle="Inspect moisture percentages, physical parameters, and release batches to inventory"
        action={
          <button
            onClick={() => {
              setEditId(null);
              setForm({
                batch_id: "",
                moisture: 5.0,
                aroma: "Premium spice aroma",
                color: "Correct standard color",
                status: "approved",
              });
              setShowForm(!showForm);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> {showForm ? "View QC Tests" : "Record QC Check"}
          </button>
        }
      />

      {showRequestModal && (
        <Panel title={`Request to ${requestForm.action_type === "edit" ? "Edit" : "Delete"} ${requestForm.display_name}`} className="mb-6 border border-primary/20">
          <form onSubmit={submitChangeRequest} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Reason for requesting change *</label>
              <textarea
                value={requestForm.reason}
                onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                required
                rows={3}
                placeholder="e.g. Moisture value was entered wrong (9% instead of 6%), need to fix batch record."
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="rounded-lg border border-input px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </Panel>
      )}

      {showForm ? (
        <Panel title={editId ? "Edit Quality Control Inspection" : "Record Quality Control Inspection"}>
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Select Production Batch *</label>
              <select
                value={form.batch_id}
                onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
                required
                disabled={!!editId}
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              >
                <option value="">-- Choose Batch --</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batch_number}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Moisture Content (%) *</label>
              <input
                type="number"
                step="0.1"
                value={form.moisture}
                onChange={(e) => setForm({ ...form, moisture: parseFloat(e.target.value) || 0 })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Aroma Inspection *</label>
              <input
                value={form.aroma}
                onChange={(e) => setForm({ ...form, aroma: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Color Standards *</label>
              <input
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">QC Status *</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="approved">QC Approved (Release to Stock)</option>
                <option value="rejected">QC Rejected / Return Batch</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground sm:col-span-2"
            >
              {editId ? "Update Inspection Record" : "Record Inspection & Update Batch"}
            </button>
          </form>
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="QC Inspections"
              value={String(data.length)}
              icon={ShieldCheck}
              tone="primary"
            />
            <StatCard
              label="Passed Batches"
              value={String(data.filter((d) => d.status === "approved").length)}
              icon={ShieldCheck}
              tone="accent"
            />
            <StatCard
              label="Rejected Batches"
              value={String(data.filter((d) => d.status === "rejected").length)}
              icon={AlertTriangle}
              tone="destructive"
            />
          </div>
          <DataTable columns={columns} data={data} emptyLabel="No QC records logged." />
        </>
      )}
    </div>
  );
}

/* ====================================================================
   7. SALES & PURCHASES MODULES
   ==================================================================== */
export function SalesModule() {
  const [data, setData] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customer_id: "",
    order_number: "",
    grand_total: 0,
    status: "pending",
  });

  const loadData = async () => {
    const { data: orders } = await supabase
      .from("sales_orders")
      .select("*, customers(name, company)")
      .order("created_at", { ascending: false });
    setData(orders || []);

    const { data: ct } = await supabase.from("customers").select("id, name, company");
    setCustomers(ct || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_id || !form.order_number || !form.grand_total)
      return toast.error("All fields are required");

    const { error } = await supabase.from("sales_orders").insert([form]);
    if (error) return toast.error(error.message);

    toast.success("Sales order recorded successfully!");
    setForm({ customer_id: "", order_number: "", grand_total: 0, status: "pending" });
    setShowForm(false);
    loadData();
  };

  const columns: Column<any>[] = [
    { key: "order_number", header: "Order #", sortable: true },
    { key: "customer", header: "Customer Name", render: (r) => r.customers?.name || "Customer" },
    {
      key: "grand_total",
      header: "Grand Total",
      align: "right",
      render: (r) => <span className="font-semibold">{inr(r.grand_total)}</span>,
    },
    {
      key: "created_at",
      header: "Order Date",
      render: (r) => new Date(r.created_at).toLocaleDateString(),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (r) => (
        <StatusBadge
          label={r.status}
          tone={r.status === "dispatched" || r.status === "delivered" ? "success" : "warning"}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        subtitle="Manage client quotations, dispatch pipelines, and billing status"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> {showForm ? "View Orders" : "Record Sales Order"}
          </button>
        }
      />

      {showForm ? (
        <Panel title="Record New Sales Order">
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Select Customer *</label>
              <select
                value={form.customer_id}
                onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company || "Direct"})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Order Invoice Number *</label>
              <input
                value={form.order_number}
                onChange={(e) => setForm({ ...form, order_number: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. SO-1042"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Grand Total Invoice (INR) *</label>
              <input
                type="number"
                value={form.grand_total}
                onChange={(e) => setForm({ ...form, grand_total: parseFloat(e.target.value) || 0 })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground sm:col-span-2"
            >
              Save Sales Order
            </button>
          </form>
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Total Sales Orders"
              value={String(data.length)}
              icon={TrendingUp}
              tone="primary"
            />
            <StatCard
              label="Open Pipeline Orders"
              value={String(
                data.filter((d) => d.status === "pending" || d.status === "processing").length,
              )}
              icon={Bell}
              tone="accent"
            />
            <StatCard
              label="Total Billing Sales"
              value={inr(data.reduce((acc, o) => acc + o.grand_total, 0))}
              icon={Wallet}
              tone="brown"
            />
          </div>
          <DataTable columns={columns} data={data} emptyLabel="No sales orders logged yet." />
        </>
      )}
    </div>
  );
}

export function PurchasesModule() {
  const [data, setData] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ supplier_id: "", product_id: "", quantity: 0, cost: 0 });

  const loadData = async () => {
    // In our double-entry stock structure, purchases are logged under stock movements marked 'purchase'
    const { data: st } = await supabase
      .from("stock_movements")
      .select("*, products(name, sku)")
      .eq("movement_type", "purchase")
      .order("created_at", { ascending: false });
    setData(st || []);

    const { data: sp } = await supabase.from("suppliers").select("id, name, company");
    setSuppliers(sp || []);

    const { data: pr } = await supabase.from("products").select("id, name, sku");
    setProducts(pr || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplier_id || !form.product_id || !form.quantity)
      return toast.error("Please fill all fields");

    // Retrieve finished goods transit warehouse
    const { data: wh } = await supabase.from("warehouses").select("id").limit(1).single();
    if (!wh) return toast.error("Please seed warehouses first.");

    const { error } = await supabase.from("stock_movements").insert([
      {
        product_id: form.product_id,
        warehouse_id: wh.id,
        quantity: form.quantity,
        movement_type: "purchase",
        description: `Purchase Inward from Supplier`,
      },
    ]);

    if (error) return toast.error(error.message);

    toast.success("Purchase recorded!");
    setForm({ supplier_id: "", product_id: "", quantity: 0, cost: 0 });
    setShowForm(false);
    loadData();
  };

  const columns: Column<any>[] = [
    {
      key: "created_at",
      header: "Date",
      render: (r) => new Date(r.created_at).toLocaleDateString(),
    },
    { key: "product", header: "Product", render: (r) => r.products?.name || "Product" },
    {
      key: "quantity",
      header: "Inward Quantity",
      align: "right",
      render: (r) => `${r.quantity} kg`,
    },
    {
      key: "movement_type",
      header: "Inflow Ledger",
      render: (r) => <StatusBadge label="Raw Purchase" tone="success" />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Bills"
        subtitle="Manage farm spice acquisitions and raw material purchase logs"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> {showForm ? "View Log" : "Record Purchase"}
          </button>
        }
      />

      {showForm ? (
        <Panel title="Record Spice Purchase Inward">
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Select Supplier *</label>
              <select
                value={form.supplier_id}
                onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Choose Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.company || "Farm"})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Select Product *</label>
              <select
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Choose Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Inward Weight (kg) *</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground sm:col-span-2"
            >
              Log Raw Inward
            </button>
          </form>
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Raw Inward Invoices"
              value={String(data.length)}
              icon={ShoppingCart}
              tone="primary"
            />
            <StatCard
              label="Total Inward Volume"
              value={data.reduce((acc, p) => acc + p.quantity, 0) + " kg"}
              icon={Boxes}
              tone="brown"
            />
          </div>
          <DataTable columns={columns} data={data} emptyLabel="No raw purchases recorded." />
        </>
      )}
    </div>
  );
}

/* ====================================================================
   8. EXPORT MANAGEMENT MODULE
   ==================================================================== */
export function ExportModule() {
  const [data, setData] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sales_order_id: "", challan_number: "", vehicle_details: "" });

  const loadData = async () => {
    const { data: challans } = await supabase
      .from("delivery_challans")
      .select("*, sales_orders(order_number, customers(name))")
      .order("dispatched_at", { ascending: false });
    setData(challans || []);

    const { data: so } = await supabase
      .from("sales_orders")
      .select("id, order_number")
      .order("created_at", { ascending: false });
    setOrders(so || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sales_order_id || !form.challan_number)
      return toast.error("Order ID and Challan Number are required");

    const { error } = await supabase.from("delivery_challans").insert([form]);
    if (error) return toast.error(error.message);

    // Update sales order to dispatched
    await supabase
      .from("sales_orders")
      .update({ status: "dispatched" })
      .eq("id", form.sales_order_id);

    toast.success("Delivery Challan printed and order dispatched!");
    setForm({ sales_order_id: "", challan_number: "", vehicle_details: "" });
    setShowForm(false);
    loadData();
  };

  const columns: Column<any>[] = [
    { key: "challan_number", header: "Challan #", sortable: true },
    { key: "order", header: "Sales Order", render: (r) => r.sales_orders?.order_number || "Order" },
    { key: "client", header: "Client", render: (r) => r.sales_orders?.customers?.name || "Client" },
    { key: "vehicle_details", header: "Logistics Details" },
    {
      key: "dispatched_at",
      header: "Dispatch Time",
      render: (r) => new Date(r.dispatched_at).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Export Challans & Logistics"
        subtitle="Track container dispatches, vehicle numbers, and custom delivery notes"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> {showForm ? "View Shipments" : "Dispatch Order"}
          </button>
        }
      />

      {showForm ? (
        <Panel title="Generate Delivery Challan / Dispatch">
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Select Sales Order *</label>
              <select
                value={form.sales_order_id}
                onChange={(e) => setForm({ ...form, sales_order_id: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Select Order --</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.order_number}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Delivery Challan Number *</label>
              <input
                value={form.challan_number}
                onChange={(e) => setForm({ ...form, challan_number: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. DC-0951"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Vehicle / Container Shipping Details</label>
              <input
                value={form.vehicle_details}
                onChange={(e) => setForm({ ...form, vehicle_details: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Container GJ-01-XX-9900 via GANDHIDHAM port"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground sm:col-span-2"
            >
              Authorize Dispatch & Print Challan
            </button>
          </form>
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Dispatched Shipments"
              value={String(data.length)}
              icon={Globe}
              tone="primary"
            />
            <StatCard
              label="Customs Cleared Status"
              value="Online Port Ready"
              icon={ShieldCheck}
              tone="accent"
            />
          </div>
          <DataTable columns={columns} data={data} emptyLabel="No dispatches recorded yet." />
        </>
      )}
    </div>
  );
}

/* ====================================================================
   9. USER MANAGEMENT MODULE
   ==================================================================== */
export function UserManagementModule() {
  const [data, setData] = useState<any[]>([]);

  const loadData = async () => {
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("*")
      .order("role", { ascending: true });
    setData(profiles || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const changeRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("user_profiles")
      .update({ role: newRole })
      .eq("id", userId);
    if (error) return toast.error(error.message);
    toast.success("Role updated successfully!");
    loadData();
  };

  const columns: Column<any>[] = [
    { key: "name", header: "Employee Name", sortable: true },
    { key: "email", header: "Workspace Email" },
    {
      key: "role",
      header: "Assigned Role",
      render: (r) => <StatusBadge label={r.role} tone="info" />,
    },
    {
      key: "id",
      header: "Modify Access",
      render: (r) => (
        <select
          value={r.role}
          onChange={(e) => changeRole(r.id, e.target.value)}
          className="rounded-md border border-input bg-card text-xs p-1 outline-none"
        >
          <option value="super-admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="partner">Partner</option>
          <option value="supervisor">Supervisor</option>
          <option value="sales">Sales Team</option>
          <option value="accountant">Accountant</option>
          <option value="warehouse">Warehouse</option>
          <option value="qc-manager">QC Manager</option>
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Directory & RBAC Settings"
        subtitle="Manage employee profiles, dashboard view restrictions, and DB security access levels"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Registered Workspace Members"
          value={String(data.length)}
          icon={Users}
          tone="primary"
        />
        <StatCard
          label="Admin accounts"
          value={String(data.filter((d) => d.role === "admin" || d.role === "super-admin").length)}
          icon={ShieldCheck}
          tone="accent"
        />
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}

/* ====================================================================
   10. REPORTS MODULE
   ==================================================================== */
async function downloadReportPDF(reportTitle: string) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  const BRAND = { r: 37, g: 99, b: 235 }; // royal blue #2563EB
  const DARK = { r: 30, g: 41, b: 59 }; // slate-800
  const LIGHT = { r: 248, g: 250, b: 252 }; // slate-50

  // Top edge brand color bar (print-friendly accent)
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.rect(0, 0, W, 8, "F");

  // Company name
  doc.setTextColor(DARK.r, DARK.g, DARK.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("AGROZAAR FOODS LLP", 40, 46);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text("Premium Spices & Food Products", 40, 60);
  doc.text("GSTIN: 24ABCDE1234F1Z5  |  FSSAI: 10023012000001", 40, 73);

  // Report title badge (print-friendly right aligned border badge)
  doc.setDrawColor(BRAND.r, BRAND.g, BRAND.b);
  doc.setLineWidth(1.5);
  doc.roundedRect(W - 205, 28, 165, 34, 4, 4, "D");
  doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("OFFICIAL REPORT", W - 122, 50, { align: "center" });

  // Sub-header details
  let y = 115;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(DARK.r, DARK.g, DARK.b);
  doc.text(reportTitle.toUpperCase(), 40, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, y + 16);
  doc.text("Classification: Confidential - Internal Use Only", 40, y + 28);

  y = y + 40;

  let headers: string[][] = [];
  let body: any[][] = [];

  if (reportTitle === "Trial Balance Statement") {
    headers = [["Account Description", "Debit Balance", "Credit Balance"]];
    const { data: res } = await supabase
      .from("journal_entries")
      .select("*, journal_lines(debit_amount, credit_amount, chart_of_accounts(name))");

    if (res && res.length > 0) {
      const ledgers: Record<string, { debit: number; credit: number }> = {};
      res.forEach((entry: any) => {
        entry.journal_lines?.forEach((line: any) => {
          const name = line.chart_of_accounts?.name || "Suspense";
          if (!ledgers[name]) ledgers[name] = { debit: 0, credit: 0 };
          ledgers[name].debit += parseFloat(line.debit_amount || 0);
          ledgers[name].credit += parseFloat(line.credit_amount || 0);
        });
      });
      body = Object.entries(ledgers).map(([name, bal]) => [
        name,
        bal.debit > 0 ? `Rs. ${bal.debit.toLocaleString("en-IN")}` : "-",
        bal.credit > 0 ? `Rs. ${bal.credit.toLocaleString("en-IN")}` : "-",
      ]);
    } else {
      body = [
        ["Share Capital", "-", "Rs. 10,00,000"],
        ["Secured Loans (HDFC Bank)", "-", "Rs. 5,00,000"],
        ["Cash in Hand", "Rs. 1,20,000", "-"],
        ["HDFC Current Account", "Rs. 6,80,000", "-"],
        ["Spice Stock (Valued at cost)", "Rs. 2,45,000", "-"],
        ["Plant & Machinery", "Rs. 4,50,000", "-"],
        ["Sundry Creditors (Mandi Vendors)", "-", "Rs. 1,45,000"],
        ["Sundry Debtors (Spice Traders)", "Rs. 1,50,000", "-"],
      ];
    }
  } else if (reportTitle === "Warehouse Wise Inventory Report") {
    headers = [["Product SKU", "Product Name", "Warehouse", "Stock Volume"]];
    const { data: movements } = await supabase
      .from("stock_movements")
      .select("*, products(name, sku), warehouses(name)");

    if (movements && movements.length > 0) {
      const stock: Record<string, { name: string; wh: string; qty: number }> = {};
      movements.forEach((m: any) => {
        const sku = m.products?.sku || "N/A";
        const key = `${sku}-${m.warehouses?.name || "Main"}`;
        if (!stock[key]) {
          stock[key] = {
            name: m.products?.name || "Unknown",
            wh: m.warehouses?.name || "Main Warehouse",
            qty: 0,
          };
        }
        stock[key].qty += m.quantity;
      });
      body = Object.entries(stock).map(([skuKey, info]) => [
        skuKey.split("-")[0],
        info.name,
        info.wh,
        `${info.qty} kg`,
      ]);
    } else {
      body = [
        ["AG-TUR-01", "Turmeric Powder (Grade A)", "Deesa Central WH", "1,200 kg"],
        ["AG-CHL-02", "Guntur Red Chilli Powder", "Deesa Central WH", "850 kg"],
        ["AG-CUM-03", "Cumin Seeds (Whole)", "Deesa Central WH", "600 kg"],
        ["AG-COR-04", "Coriander Seeds", "Secondary Zone WH", "1,500 kg"],
        ["AG-GAR-05", "Garam Masala Premium Blend", "Deesa Central WH", "400 kg"],
      ];
    }
  } else if (reportTitle === "Quality Assurance Batch Log") {
    headers = [["Batch #", "Spice Product", "Moisture", "Aroma Check", "Color Standard", "Status"]];
    const { data: tests } = await supabase
      .from("qc_tests")
      .select("*, production_batches(batch_number, products(name))");

    if (tests && tests.length > 0) {
      body = tests.map((t: any) => [
        t.production_batches?.batch_number || "BT-?",
        t.production_batches?.products?.name || "Spice Product",
        `${t.moisture_percentage}%`,
        t.aroma_inspection || "Normal",
        t.color_standard || "Normal",
        t.status.toUpperCase(),
      ]);
    } else {
      body = [
        ["BT-TUR-0601", "Premium Turmeric Powder", "5.2%", "Rich & Earthy", "Deep Golden Yellow", "APPROVED"],
        ["BT-CHL-0602", "Red Chilli Powder", "6.1%", "Pungent & Spicy", "Vibrant Red", "APPROVED"],
        ["BT-CUM-0603", "Cumin Seeds", "4.8%", "Warm & Aromatic", "Brownish Grey", "APPROVED"],
        ["BT-TUR-0604", "Turmeric Powder (Batch 2)", "8.5%", "Musty / High Humidity", "Dull Yellow", "REJECTED"],
      ];
    }
  } else if (reportTitle === "Payroll Pay Slip Summary") {
    headers = [["Employee Code", "Name", "Department", "Basic", "HRA", "Net Pay"]];
    const { data: slips } = await supabase.from("salary_slips").select(`
      basic, hra, net_pay,
      employees(employee_code, department, user_profiles(name))
    `);

    if (slips && slips.length > 0) {
      body = slips.map((s: any) => [
        s.employees?.employee_code || "EMP-?",
        s.employees?.user_profiles?.name || "Staff",
        s.employees?.department || "General",
        `Rs. ${s.basic}`,
        `Rs. ${s.hra}`,
        `Rs. ${s.net_pay}`,
      ]);
    } else {
      body = [
        ["EMP-001", "Owner & CEO", "Management", "Rs. 1,50,000", "Rs. 30,000", "Rs. 1,80,000"],
        ["EMP-002", "Senior Accountant", "Accounts", "Rs. 45,000", "Rs. 9,000", "Rs. 54,000"],
        ["EMP-003", "Plant Supervisor", "Factory Floor", "Rs. 35,000", "Rs. 7,000", "Rs. 42,000"],
        ["EMP-004", "QC Specialist", "Quality Control", "Rs. 30,000", "Rs. 6,000", "Rs. 36,000"],
      ];
    }
  } else {
    headers = [["Info", "Description"]];
    body = [
      ["Report Title", reportTitle],
      ["Generated", new Date().toLocaleString()],
    ];
  }

  autoTable(doc, {
    startY: y,
    head: headers,
    body: body,
    headStyles: {
      fillColor: [37, 99, 235], // royal blue
      textColor: [255, 255, 255], // white text
      fontStyle: "bold",
      fontSize: 9,
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
    "Agrozaar Foods LLP ERP system. Confidential Business Intelligence Report.",
    W / 2,
    pageH - 28,
    { align: "center" },
  );

  doc.save(`${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
}

export function ReportsModule() {
  const [salesSum, setSalesSum] = useState(0);
  const [stockSum, setStockSum] = useState(0);
  const [batchCount, setBatchCount] = useState(0);

  const calculateStats = async () => {
    // 1. Sum Sales Orders
    const { data: so } = await supabase.from("sales_orders").select("grand_total");
    setSalesSum(so?.reduce((acc, o) => acc + o.grand_total, 0) || 0);

    // 2. Count Production Batches
    const { count } = await supabase
      .from("production_batches")
      .select("*", { count: "exact", head: true });
    setBatchCount(count || 0);

    // 3. Count Inventory movements
    const { data: st } = await supabase.from("stock_movements").select("quantity");
    setStockSum(st?.reduce((acc, o) => acc + o.quantity, 0) || 0);
  };

  useEffect(() => {
    calculateStats();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="ERP Business & Financial Reports"
        subtitle="Aggregate ledger logs, stock valuation, and operational analytics"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Sales Revenue MTD"
          value={inr(salesSum)}
          icon={TrendingUp}
          tone="primary"
        />
        <StatCard
          label="Production Batches Ran"
          value={String(batchCount)}
          icon={Factory}
          tone="accent"
        />
        <StatCard
          label="Total Physical Stock Volume"
          value={stockSum.toFixed(2) + " kg"}
          icon={Boxes}
          tone="brown"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Profit & Loss Statement (Aggregated)">
          <div className="p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gross Sales Revenue</span>
              <span className="font-semibold text-accent">{inr(salesSum)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cost of Goods Sold (Est)</span>
              <span className="font-semibold text-destructive">{inr(salesSum * 0.55)}</span>
            </div>
            <hr />
            <div className="flex justify-between text-sm font-semibold">
              <span>Estimated Net Margin (45%)</span>
              <span className="text-accent">{inr(salesSum * 0.45)}</span>
            </div>
          </div>
        </Panel>

        <Panel title="Available Operational PDF Exports">
          <div className="divide-y divide-border text-sm">
            {[
              "Trial Balance Statement",
              "Warehouse Wise Inventory Report",
              "Quality Assurance Batch Log",
              "Payroll Pay Slip Summary",
            ].map((r) => (
              <div key={r} className="flex justify-between items-center px-5 py-3.5">
                <span>{r}</span>
                <button
                  onClick={async () => {
                    await downloadReportPDF(r);
                    toast.success(`Generated ${r}!`);
                  }}
                  className="rounded-lg border border-input bg-card px-2.5 py-1 text-xs hover:bg-secondary"
                >
                  Generate PDF
                </button>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ====================================================================
   11. SETTINGS MODULE
   ==================================================================== */
export function SettingsModule() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Utilities"
        subtitle="Configure tax settings, connection parameters, and seed test data"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Database Utilities & Seeding">
          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              If your database tables (Products, Warehouses, Suppliers, Customers) are empty, you
              can instantly populate them with realistic demo spice manufacturing records by
              clicking below.
            </p>
            <button
              onClick={seedModuleDemoData}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
            >
              Seed Demo Spice Records
            </button>
          </div>
        </Panel>

        <Panel title="System Configuration">
          <div className="p-6 space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Active Database Instance:</span>
              <span className="font-mono text-xs">wefogwllfidvnkxgswjd (Supabase)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">CORS Policy:</span>
              <span className="text-accent font-semibold">Allowed</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Tax Settings:</span>
              <span>GST 5.00% (Spices default)</span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
