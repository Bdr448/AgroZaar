import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DataTable, type Column } from "./DataTable";
import { PageHeader, Panel, StatCard, StatusBadge } from "./widgets";
import { toast } from "sonner";
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
} from "lucide-react";

const inr = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

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
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", gstin: "" });

  const loadData = async () => {
    setLoading(true);
    const { data: res } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
    setData(res || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return toast.error("Name is required");
    const { error } = await supabase.from("customers").insert([form]);
    if (error) return toast.error(error.message);
    toast.success("Customer added successfully");
    setForm({ name: "", company: "", email: "", phone: "", gstin: "" });
    setShowForm(false);
    loadData();
  };

  const columns: Column<any>[] = [
    { key: "name", header: "Customer Name", sortable: true },
    { key: "company", header: "Company" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "gstin", header: "GSTIN" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Management"
        subtitle="Manage client portfolios, billing contacts, and tax info"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> {showForm ? "View Directory" : "Add Customer"}
          </button>
        }
      />

      {showForm ? (
        <Panel title="Add New Customer">
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
              <label className="text-sm font-medium">Phone Number</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground sm:col-span-2"
            >
              Save Customer
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
              label="Corporate Accounts"
              value={String(data.filter((d) => d.company).length)}
              icon={Landmark}
              tone="accent"
            />
            <StatCard
              label="Tax Registrations"
              value={String(data.filter((d) => d.gstin).length)}
              icon={ShieldCheck}
              tone="brown"
            />
          </div>
          <DataTable columns={columns} data={data} emptyLabel="No customers registered yet." />
        </>
      )}
    </div>
  );
}

export function SuppliersModule() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", gstin: "" });

  const loadData = async () => {
    setLoading(true);
    const { data: res } = await supabase
      .from("suppliers")
      .select("*")
      .order("created_at", { ascending: false });
    setData(res || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return toast.error("Name is required");
    const { error } = await supabase.from("suppliers").insert([form]);
    if (error) return toast.error(error.message);
    toast.success("Supplier added successfully");
    setForm({ name: "", company: "", email: "", phone: "", gstin: "" });
    setShowForm(false);
    loadData();
  };

  const columns: Column<any>[] = [
    { key: "name", header: "Supplier Name", sortable: true },
    { key: "company", header: "Company" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "gstin", header: "GSTIN" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Management"
        subtitle="Manage agricultural farms, wholesale mandi merchants, and raw spice vendors"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> {showForm ? "View Directory" : "Add Supplier"}
          </button>
        }
      />

      {showForm ? (
        <Panel title="Add New Supplier">
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
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground sm:col-span-2"
            >
              Save Supplier
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
    </div>
  );
}

/* ====================================================================
   2. PRODUCTS MODULE
   ==================================================================== */
export function ProductsModule() {
  const [data, setData] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    hsn_code: "",
    gst_rate: 5.0,
    standard_price: 0,
    distributor_price: 0,
    retailer_price: 0,
  });

  const loadData = async () => {
    const { data: products } = await supabase.from("products").select("*, product_prices(*)");
    setData(products || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku) return toast.error("Name and SKU are required");

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
    }

    toast.success("Product and pricing tiers saved!");
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
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products Catalog"
        subtitle="Manage export spice SKU catalogs and active pricing structures"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> {showForm ? "View Catalog" : "Add Product"}
          </button>
        }
      />

      {showForm ? (
        <Panel title="Create New Product SKU">
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
                onChange={(e) => setForm({ ...form, gst_rate: parseFloat(e.target.value) })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <hr className="sm:col-span-2 my-1" />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Standard Price (INR/kg)</label>
              <input
                type="number"
                value={form.standard_price}
                onChange={(e) => setForm({ ...form, standard_price: parseFloat(e.target.value) })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Distributor Price (INR/kg)</label>
              <input
                type="number"
                value={form.distributor_price}
                onChange={(e) =>
                  setForm({ ...form, distributor_price: parseFloat(e.target.value) })
                }
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Retailer Price (INR/kg)</label>
              <input
                type="number"
                value={form.retailer_price}
                onChange={(e) => setForm({ ...form, retailer_price: parseFloat(e.target.value) })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground sm:col-span-2 mt-2"
            >
              Save Product SKU & Prices
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
                onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) })}
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
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    notes: "New lead captured",
  });

  const loadData = async () => {
    // In our simplified database structure, we use the customers table but tag leads without orders
    const { data: res } = await supabase
      .from("customers")
      .select("*")
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
      },
    ]);
    if (error) return toast.error(error.message);
    toast.success("Lead added successfully to pipeline");
    setForm({ name: "", company: "", email: "", phone: "", notes: "" });
    setShowForm(false);
    loadData();
  };

  const columns: Column<any>[] = [
    { key: "name", header: "Lead / Contact", sortable: true },
    { key: "company", header: "Prospective Client" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    {
      key: "created_at",
      header: "Captured At",
      render: (r) => new Date(r.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM & Pipeline"
        subtitle="Track prospective spice deals, followups, and client conversions"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> {showForm ? "View Pipeline" : "Add Lead"}
          </button>
        }
      />

      {showForm ? (
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
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="+44 20-7946-0958"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Pipeline Notes / Status Details</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 h-24"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground sm:col-span-2"
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
            <StatCard label="Scheduled followups" value="8 deals" icon={Bell} tone="accent" />
            <StatCard label="Pipeline status" value="Active" icon={ShieldCheck} tone="brown" />
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
                onChange={(e) => setForm({ ...form, planned_qty: parseFloat(e.target.value) })}
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
  const [data, setData] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    batch_id: "",
    moisture: 5.0,
    aroma: "Premium spice aroma",
    color: "Correct standard color",
    status: "approved",
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
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.batch_id || !form.moisture || !form.aroma)
      return toast.error("Moisture and aroma checks are required");

    const { error } = await supabase.from("qc_tests").insert([form]);
    if (error) return toast.error(error.message);

    // Update the production batch status to completed/rejected
    await supabase
      .from("production_batches")
      .update({ status: form.status === "approved" ? "completed" : "cancelled" })
      .eq("id", form.batch_id);

    toast.success("Quality Control test recorded successfully!");
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
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quality Control Tests"
        subtitle="Inspect moisture percentages, physical parameters, and release batches to inventory"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> {showForm ? "View QC Tests" : "Record QC Check"}
          </button>
        }
      />

      {showForm ? (
        <Panel title="Record Quality Control Inspection">
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Select Production Batch *</label>
              <select
                value={form.batch_id}
                onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
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
                onChange={(e) => setForm({ ...form, moisture: parseFloat(e.target.value) })}
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
              Record Inspection & Update Batch
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
                onChange={(e) => setForm({ ...form, grand_total: parseFloat(e.target.value) })}
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
      .select("*, products(name, sku), suppliers(*)")
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
                onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) })}
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
                  onClick={() => toast.success(`Generated ${r}!`)}
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
