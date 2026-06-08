# Agrozaar Spices ERP — User Guide

Welcome to the **Agrozaar Spices ERP** system. This guide provides a walkthrough of the application features, login credentials, database configuration, and day-to-day workflow sequences.

---

## 1. Getting Started & Initial Setup

To begin testing the system with live production-ready data, follow these steps:

### A. Apply the Database Policies
If you haven't already done so, ensure you have applied the Row-Level Security (RLS) policies to your Supabase project. 
* Open your **Supabase Dashboard** > **SQL Editor** > **New Query**.
* Copy the contents of `supabase/migrations/20260605130000_erp_all_policies.sql` and `supabase/migrations/20260605120000_payroll_policies.sql` and run the execution script.

### B. Seed the Demo Records
To instantly populate the database with realistic spice products, suppliers, warehouses, employees, and payroll histories:
1. Log in to the application as the Super Admin (see credentials below).
2. Go to **Settings** in the left sidebar navigation.
3. Click the **Seed Demo Spice Records** button.
4. You will receive a success notification, and all aggregates on your dashboard will update dynamically!

---

## 2. Default Login Credentials

The system includes pre-seeded user accounts, each corresponding to an enterprise role with specific RLS permissions:

| User Email | Password | Role | Permissions |
| :--- | :--- | :--- | :--- |
| **owner@agrozaar.com** | `password123` | **Super Admin** | Full access to all modules, including the Owner Vault and financial reports. |
| **supervisor@agrozaar.com** | `password123` | **Plant Supervisor** | Access to Products, Warehouses, Production Batches, and Stock Ledger. |
| **qc@agrozaar.com** | `password123` | **QC Analyst** | QC Testing log access and batch approval/release. |
| **warehouse@agrozaar.com** | `password123` | **Store Keeper** | Inward/outward inventory ledger logging, warehouse dispatch, and delivery. |
| **sales@agrozaar.com** | `password123` | **Sales Executive** | Lead pipeline, Customer Directory, and Sales Invoice creation. |
| **accountant@agrozaar.com** | `password123` | **Accountant** | Journal entries, payroll registers, and financial ledgers. |

---

## 3. Workflow Sequences & How-To Guides

### Workflow A: CRM to Sales Order & Delivery

1. **Capture a Lead**:
   * Navigate to **CRM & Pipeline** in the sidebar.
   * Click **Add Lead**, fill in the contact details, company name, and current pipeline notes, then click **Add Lead to CRM**.
2. **Convert/Register Customer**:
   * Once a deal moves forward, go to **Customer Management** (or use the lead information) to add the customer to the official client directory, including their tax registration details (**GSTIN**).
3. **Record a Sales Order**:
   * Go to the **Sales** module.
   * Click **Record Sales Order**, choose the registered customer, assign an invoice number (e.g., `SO-1025`), input the grand total invoice value, and click **Save**.
4. **Issue a Delivery Challan**:
   * Navigate to **Export Management** (under Logistics/Delivery).
   * Review the dispatch queue, fill out transport vehicles and dispatch dates, and generate the official **Delivery Challan** to authorize warehouse loading.

---

### Workflow B: Spice Production, QC, and Inventory

1. **Schedule a Production Batch**:
   * Go to **Production** in the sidebar.
   * Click **Schedule Batch**, select the Target Spice Product SKU from the dropdown, assign a unique batch reference (e.g., `BT-TUR-2026`), specify the planned output weight (kg), and select a start date.
2. **Log Raw Material Inflow**:
   * When raw whole spices arrive from vendors, go to **Stock Ledger** > **Log Movement**.
   * Choose the spice, select the raw transit warehouse, enter a positive quantity value (e.g. `+1000 kg`), set type to `purchase`, and submit.
3. **Perform Quality Control (QC)**:
   * Once production grinding completes, the batch will appear in the pending list.
   * Log in as the **QC Analyst** and go to **QC Management**.
   * Click **Record QC Check**, select the batch, input the tested moisture percentage (e.g. `4.8%`), aroma parameters, and set the status to **QC Approved** (which automatically marks the production batch completed and updates your warehouse inventory levels).

---

### Workflow C: Payroll Management

1. **Check Employee Directory**:
   * Navigate to **Payroll & Register**.
   * The page dynamically pulls all active company employees, departments, and specific designations.
2. **Process Monthly Register**:
   * View the processed salary register. The system automatically fetches basic salaries, HRA, allowances, and deductions from the relational database.
   * Click the individual row to inspect details like bank accounts and Net Pay.
   * Authorized roles (Super Admin, Accountant, Partner) can toggle status between **Pending** and **Paid**.

---

### Workflow D: Authority Delegation

1. **Delegate Authority**:
   * Navigate to **Authority Delegation** in the sidebar.
   * Click **Delegate Access**, select the Employee (Delegatee), choose the permission scopes (e.g., *Warehouse*, *Production*, *QC*), specify the duration (e.g. `2 Hours`), and click **Issue Delegation**.
2. **Real-time Auditing**:
   * The lower panel contains a real-time audit ledger logging every delegation state change, ensuring full compliance and trace audits for quality standards.

---

## 4. Troubleshooting & FAQ

* **Why am I seeing "violates row-level security policy" errors?**
  This means the user role you are logged in with does not have write permissions for that specific table (e.g., a Warehouse Store Keeper trying to edit the Chart of Accounts). Log in with the appropriate credentials (like Accountant or Super Admin).
* **Where are my recipes and formulations?**
  Product recipes, blending ratios, and chemical formulation limits are stored in the **Owner Vault**, which is restricted strictly to the `super-admin` role for trade-secret protection.
