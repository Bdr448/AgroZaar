# 🌿 Agrozaar Foods LLP — ERP User Guide

### (Hinglish mein — Sabke liye aasaan guide)

---

## 📌 ERP Kya Hai?

Agrozaar Foods LLP ka yeh ERP system ek **all-in-one business management platform** hai.
Isme aap customers manage kar sakte ho, production track kar sakte ho, salary dekh sakte ho, invoices banaa sakte ho — sab kuch ek hi jagah.

**Live URL:** `https://agro-zaar.vercel.app`

---

## 🔐 Login Kaise Karein?

1. Browser mein `https://agro-zaar.vercel.app/login` open karo
2. Apna **Email** daalo
3. **Password** daalo
4. **Access Role** dropdown se apna role select karo
5. **"Secure Login"** button dabaao

---

## 👥 Sabke Login Details

| Role                   | Email                      | Password      |
| ---------------------- | -------------------------- | ------------- |
| 🔴 Super Admin (Owner) | `owner@agrozaar.com`       | `password123` |
| 🟠 Admin               | `admin@agrozaar.com`       | `password123` |
| 🟡 Business Partner    | `partner@agrozaar.com`     | `password123` |
| 🟢 Accounts Manager    | `accountant@agrozaar.com`  | `password123` |
| 🔵 Plant Supervisor    | `supervisor@agrozaar.com`  | `password123` |
| 🟣 QC Manager          | `qc@agrozaar.com`          | `password123` |
| ⚪ Sales Executive     | `sales@agrozaar.com`       | `password123` |
| 🟤 Warehouse User      | `warehouse@agrozaar.com`   | `password123` |
| ⬛ Distributor         | `distributor@agrozaar.com` | `password123` |
| ⬜ Retailer            | `retailer@agrozaar.com`    | `password123` |

---

## 🖥️ Screen Layout Samajhna

Login ke baad screen 3 parts mein divided hoti hai:

```
┌─────────────────────────────────────────────┐
│  🔝 TOP HEADER  (Search, Bell, Profile)      │
├──────────────┬──────────────────────────────┤
│              │                              │
│  📋 LEFT     │   📄 MAIN CONTENT            │
│  SIDEBAR     │   (Modules yahan load hote)  │
│  (Nav Menu)  │                              │
│              │                              │
└──────────────┴──────────────────────────────┘
```

### Header ke Buttons:

- 🔍 **Search bar** — koi bhi module ka naam type karo, directly wahan chale jaoge
- ➕ **"New Invoice"** button — billing page pe directly jaata hai
- 🔔 **Bell icon** — notifications dikhta hai, click karo toh relevant module pe jaata hai
- 👤 **Profile icon** — apna naam/role, Settings, aur Sign Out

---

---

# 🔴 SUPER ADMIN (Owner)

**Email:** `owner@agrozaar.com` | **Password:** `password123`

Sabse zyada power wala account. Poora system control karta hai.

### Kya Kya Kar Sakta Hai:

#### 📊 Dashboard

- Company ka **complete overview** — Sales, Purchases, Production, Profit sab ek screen pe
- **Sales Trend chart** — monthly performance graph
- **Low Stock Alerts** — kaun sa item kam hai
- **Recent Export Orders** — latest international orders
- **Activity Timeline** — kisne kya kiya uski history

#### 👥 CRM (Customer Relationship Management)

- Naye **leads/prospects** add karo
- Lead ka naam, company, email, phone daalo
- Pipeline track karo — kaun sa deal confirm hoga

#### 🧑 Customers

- Customers ki **complete list** dekho
- Naya customer add karo — naam, company, GSTIN, email, phone
- Corporate accounts aur tax registrations count dekho

#### 🚛 Suppliers

- Raw material suppliers ki list
- Naye supplier add karo — farm ka naam, contact details, GSTIN
- Mandi vendors track karo

#### 📦 Products

- Spice products ka **catalog** manage karo
- Naya product add karo — SKU code, HSN code, GST rate
- **3 price tiers** set karo: Standard / Distributor / Retailer price

#### 📦 Inventory (Stock Ledger)

- Sabhi **stock movements** dekho — kya aaya, kya gaya
- Naya movement log karo — product select karo, warehouse select karo, quantity daalo
- Movement types: Purchase / Production Input / Sales Dispatch / Adjustment

#### 🛒 Purchases

- Raw material purchases track karo
- Supplier se kitna aaya, kab aaya sab record hota hai

#### 🏭 Production

- **Production batches** schedule karo
- Batch number, product, quantity, start date daalo
- Batch status track karo: Scheduled → Grinding → Completed

#### ✅ QC Management

- Production batches ka **quality check** karo
- Moisture %, aroma, colour check karo
- QC Approve ya Reject karo — approve hone pe stock mein aata hai

#### 📈 Sales

- Sales orders record karo
- Customer select karo, order number, amount daalo
- Status track karo: Pending → Processing → Dispatched → Delivered

#### 💳 Accounts

- Bank accounts aur cash ledgers dekho

#### 🧾 Billing

- **Invoices banao** — full form: customer details, line items, discount, GST
- Invoice PDF download karo (role-wise alag content)
- Status: Paid / Pending / Overdue
- Search aur filter karo

#### 📚 Accounting

- **Journal Vouchers, Payment Vouchers, Receipt Vouchers** dekho
- Accounting Masters: Chart of Accounts, Ledgers
- Financial Reports: Trial Balance, Balance Sheet, P&L, Cash Flow generate karo

#### 💰 Payroll

- **Sabhi employees ki salary** dekho
- Basic, HRA, Allowances, Deductions, Net Pay
- Salary slip PDF download karo
- Payroll Reports export karo
- Approval flow: HR → Accounts → Management

#### 📊 Reports

- Sales Revenue, Production Batches, Stock Volume
- **Profit & Loss Statement**
- PDF exports: Trial Balance, Inventory Report, QC Batch Log, Payroll Summary

#### 🌍 Export Management

- Delivery Challans banao
- Sales order select karo, challan number, vehicle/container details daalo
- Order automatically "Dispatched" mark ho jaata hai

#### 🛡️ Delegated Authority

- Kisi bhi employee ko **temporary extra permissions** do
- Role select karo (Partner, Supervisor, etc.)
- Permissions choose karo (Purchase Approval, Payment Approval, etc.)
- Duration set karo: 1 day / 3 days / 7 days / Custom / Until Revoked
- Kabhi bhi **Revoke** kar sakte ho
- **Protected permissions** (jo kabhi delegate nahi ho sakti): Ownership Transfer, Delete Audit Logs, etc.

#### 🔒 Owner Vault _(Sirf Super Admin dekh sakta hai)_

- **Confidential business information** — banking details, export contracts, API keys
- "Reveal" button se sensitive data dikhta hai
- Kisi aur role ko yeh page accessible nahi hai

#### 🔔 Notifications

- Sabhi system alerts — low stock, payment received, QC pending, new orders
- Har notification click karne pe relevant module pe jaata hai
- "Mark all read" se saari notifications clear

#### 👤 User Management

- Sab users ki list dekho — naam, email, role
- **Role change karo** — dropdown se naya role select karo, turant update

#### ⚙️ Settings

- Database seed karo — demo data add karo (products, customers, suppliers)
- System configuration dekho — Supabase connection, GST settings

---

# 🟠 ADMIN

**Email:** `admin@agrozaar.com` | **Password:** `password123`

Super Admin jaisi hi powers hain — **sirf Owner Vault nahi dikha**.

### Kya Kya Kar Sakta Hai:

Super Admin wali poori list — **Owner Vault ke bina**.

Yani: CRM, Customers, Suppliers, Products, Inventory, Purchases, Production, QC, Sales, Billing, Accounting, Payroll, Reports, Export, Delegated Authority, Notifications, User Management, Settings — **sab access hai**.

---

# 🟡 BUSINESS PARTNER

**Email:** `partner@agrozaar.com` | **Password:** `password123`

Business mein paise lagaye hain toh financial performance dekhne ka access hai.

### Kya Kya Kar Sakta Hai:

#### 📊 Dashboard

- **Revenue YTD, Expenses, Net Profit, Outstanding** — sab high level numbers
- Revenue Growth chart
- Quarterly Output chart

#### 📈 Sales Reports

- Month-wise sales performance
- Product-wise revenue breakdown

#### 🛒 Purchase Reports

- Raw material procurement cost
- Supplier-wise purchase analysis

#### 📋 Outstanding Reports

- Kaun sa customer payment nahi diya
- Receivables aur payables summary

#### 💹 Profit & Loss

- Company ka financial health report
- Net margin analysis

#### 📉 Business Analytics

- Trends, growth metrics, operational KPIs

> ⚠️ Partner **sirf reports dekh sakta hai** — koi data add/edit nahi kar sakta.

---

# 🟢 ACCOUNTS MANAGER (Accountant)

**Email:** `accountant@agrozaar.com` | **Password:** `password123`

Sabhi financial transactions handle karta hai.

### Kya Kya Kar Sakta Hai:

#### 📊 Dashboard

- Pending tasks, completed work, alerts

#### 🧾 Invoices

- Customer invoices dekho aur manage karo

#### 💳 Billing

- Invoices banao aur PDF download karo
- **Full financial details** milte hain PDF mein — discount, GST breakdown, bank details

#### 💳 Payments

- Incoming aur outgoing payments track karo

#### 📚 Accounting

- **Journal Entries** create karo
- Voucher types: Journal / Payment / Receipt / Contra / Adjustment
- Financial Reports: Trial Balance, Balance Sheet, P&L, Cash Book, Bank Book, Day Book, Ledger

#### 💰 Payroll

- **Sabhi employees ki salary** process karo
- Salary register dekho — Basic, HRA, Deductions, Net Pay
- Payroll reports export karo
- Salary slip PDF download karo

#### 📋 Outstanding Reports

- Pending receivables aur payables

#### 📄 Expenses

- Business expenses log karo aur categorise karo

#### 💹 Profit & Loss

- Financial performance report

---

# 🔵 PLANT SUPERVISOR

**Email:** `supervisor@agrozaar.com` | **Password:** `password123`

Factory floor manage karta hai — production aur dispatch.

### Kya Kya Kar Sakta Hai:

#### 📊 Dashboard

- **Today's Production** quantity
- **Pending QC** batches count
- **Active Batches** running
- **Dispatch Queue** — kitne orders pending hain
- Weekly Production bar chart
- Warehouse stock levels

#### 📦 Raw Material Entry

- Supplier se aaya raw material log karo
- Supplier select karo, product select karo, weight daalo

#### 🏭 Production

- Production batches create karo
- Product, batch number, quantity, start date
- Batch status update karo

#### 🧪 Batch Creation

- Grinding/blending ke liye naya batch schedule karo
- Batch number assign karo

#### 🏢 Warehouse

- Warehouse locations aur storage dekho

#### 📤 Dispatch

- Sales orders dispatch karo
- Delivery challan generate karo
- Vehicle/container details daalo

#### 💰 Payroll _(Sirf apni salary)_

- Apni salary slip dekho
- Basic, HRA, Deductions, Net Pay
- PDF download karo

---

# 🟣 QC MANAGER

**Email:** `qc@agrozaar.com` | **Password:** `password123`

Quality ensure karta hai — koi bhi kharab batch market mein na jaaye.

### Kya Kya Kar Sakta Hai:

#### 📊 Dashboard

- Pending tasks aur completed inspections count

#### ✅ Pending QC

- Jo batches QC ke liye ready hain unki list
- Batch select karo aur inspection shuru karo

#### 🧪 Batch Testing

- **QC inspection record karo:**
  - Batch select karo
  - **Moisture %** daalo (e.g. 5.0%)
  - **Aroma** check likho
  - **Colour** standard check karo
  - Status select karo: **QC Approved** ya **QC Rejected**
- Approve hone pe batch automatically stock mein jaata hai
- Reject hone pe batch cancel ho jaata hai

#### 📊 QC Reports

- Historical quality results
- Approved vs Rejected batches statistics

#### 📋 Standards

- Har product ke liye acceptable QC parameters define karo
- Moisture limit, colour standard, aroma benchmark

#### 💰 Payroll _(Sirf apni salary)_

- Apni salary slip dekho aur PDF download karo

---

# ⚪ SALES EXECUTIVE

**Email:** `sales@agrozaar.com` | **Password:** `password123`

Customers dhundho, deals close karo.

### Kya Kya Kar Sakta Hai:

#### 📊 Dashboard

- **Active Leads** count
- **Open Quotations** count
- **Pending Follow-ups** count
- **Monthly Sales** amount
- Sales trend chart
- Customer activity feed — "Quote sent", "Call scheduled", etc.

#### 🎯 Leads

- Naye prospects add karo
- Contact name, company, email, phone daalo
- Pipeline notes likho

#### 👥 Customers

- Existing customers ki list dekho
- Naya customer add karo

#### 📄 Quotations

- Customer ko price quotation prepare karo
- Products aur rates daalo

#### 📋 Sales Orders

- Confirmed orders record karo
- Customer select karo, order number, total amount daalo
- Status track karo

#### 🔔 Follow Ups

- Pending follow-ups schedule karo
- Reminder set karo

#### 💰 Payroll _(Sirf apni salary)_

- Apni salary slip dekho aur PDF download karo

---

# 🟤 WAREHOUSE USER

**Email:** `warehouse@agrozaar.com` | **Password:** `password123`

Stock aana-jaana manage karta hai.

### Kya Kya Kar Sakta Hai:

#### 📊 Dashboard

- Pending tasks, completed entries, alerts

#### 📦 Inventory

- Sabhi stock movements ki list dekho
- Product, warehouse, quantity, type — sab dikhta hai

#### 📥 Stock Entry

- **Naya stock movement log karo:**
  - Product select karo
  - Warehouse select karo
  - Quantity daalo (positive = inward, negative = outward)
  - Type select karo: Purchase / Production / Sales Dispatch / Adjustment
  - Description daalo

#### 📤 Dispatch

- Orders dispatch karo
- Delivery challan generate karo

#### 🏢 Warehouse

- Warehouse locations aur zones dekho

#### 💰 Payroll _(Sirf apni salary)_

- Apni salary slip dekho aur PDF download karo

---

# ⬛ DISTRIBUTOR

**Email:** `distributor@agrozaar.com` | **Password:** `password123`

Limited access — sirf apne orders aur invoices.

### Kya Kya Kar Sakta Hai:

#### 📊 Dashboard

- Basic overview

#### 📋 My Orders

- Apne purchase orders ki list dekho
- Order status track karo

#### 📦 Products

- Available products aur pricing dekho

#### 📋 Outstanding Reports

- Apna pending payment summary

#### 🧾 Invoices

- Apni invoices dekho

---

# ⬜ RETAILER

**Email:** `retailer@agrozaar.com` | **Password:** `password123`

Sabse limited access — sirf orders aur invoices.

### Kya Kya Kar Sakta Hai:

#### 📊 Dashboard

- Basic overview

#### 📋 My Orders

- Apne orders dekho

#### 📦 Products

- Product catalog aur retail pricing dekho

#### 🧾 Invoices

- Apni invoices dekho

---

---

# 🧾 BILLING MODULE — Detailed Guide

Billing module **sabse important feature** hai — yahan invoices banate hain.

## Invoice Kaise Banayein? _(Admin/Super Admin only)_

1. Left sidebar mein **"Billing"** click karo
2. Top right mein **"New Invoice"** button dabaao
3. Form fill karo:

   **Invoice Details:**
   - Invoice number (auto-generate hota hai)
   - Date aur Due Date select karo
   - Status: Pending / Paid / Overdue

   **Customer Details:**
   - Customer ka naam, email, phone
   - GSTIN number
   - Complete address

   **Line Items:**
   - Product/service description daalo
   - Quantity aur unit select karo (Kg/Ton/Pcs/Box/Bag/Ltr)
   - Rate daalo — amount automatically calculate hota hai
   - ➕ "Add Item" se multiple items add kar sakte ho

   **Financial:**
   - Discount % daalo (agar koi)
   - Tax/GST % daalo
   - Live total neeche dikhta hai

   **Notes aur Bank Details:**
   - Payment terms (Net 15, Net 30)
   - Bank account details (PDF mein aayenge)
   - Additional notes

4. **"Save Invoice"** click karo

## Invoice PDF Download Karna

Koi bhi role invoice PDF download kar sakta hai — **lekin content alag hota hai:**

| Role                        | Kya Dikhta Hai PDF Mein                              |
| --------------------------- | ---------------------------------------------------- |
| Super Admin / Admin         | Sab kuch — items, discount, GST, bank details, notes |
| Accountant                  | Sab kuch — items, discount, GST, bank details, notes |
| Partner                     | Items + discount + GST breakdown (bank details nahi) |
| Sales / Supervisor / Others | Sirf items aur total amount                          |

**PDF download karne ke steps:**

1. Invoice ki row mein **"View"** click karo
2. Modal mein **"Download PDF"** button dabaao
3. PDF automatically download ho jaayega

## Invoice Search aur Filter

- **Search box** — invoice number ya customer naam se dhundho
- **Filter buttons** — All / Paid / Pending / Overdue

---

# 🔔 NOTIFICATIONS — Kaise Kaam Karta Hai

1. Header mein **Bell icon** pe click karo
2. **4 notifications** dikhti hain — har ek ka icon aur colour alag:
   - 🔴 Red = Stock Alert → Inventory page pe jaata hai
   - 🟢 Green = Payment/Order → Accounts/Export page pe jaata hai
   - 🟡 Yellow = QC Pending → QC Management pe jaata hai
3. **Kisi bhi notification pe click karo** → relevant module automatically open hoga
4. Unread notifications ka **blue dot** aur **number badge** dikhta hai
5. **"Mark all read"** → sab clear
6. **"View all notifications"** → Notifications page pe jaata hai

---

# 🔍 SEARCH — Kaise Use Karein

Header mein search bar hai — **module ka naam type karo:**

| Type karo              | Jaata hai         |
| ---------------------- | ----------------- |
| `billing`              | Billing module    |
| `inventory`            | Inventory/Stock   |
| `salary` ya `payroll`  | Payroll module    |
| `qc` ya `quality`      | QC Management     |
| `export` ya `dispatch` | Export Management |
| `user` ya `role`       | User Management   |

Results mein click karo → directly wahan chale jaoge.

---

# 💡 Common Kaam — Step by Step

## Naya Product Add Karna

1. **Products** → "Add Product" click karo
2. Product naam, SKU (e.g. AG-TUR-001), HSN code, GST rate daalo
3. 3 prices daalo: Standard / Distributor / Retailer
4. "Save Product SKU & Prices" click karo

## Stock Movement Log Karna

1. **Inventory** → "Log Movement" click karo
2. Product select karo
3. Warehouse select karo
4. Quantity daalo (+ve inward, -ve outward)
5. Movement type select karo
6. "Submit Entry" click karo

## Production Batch Schedule Karna

1. **Production** → "Schedule Batch" click karo
2. Product select karo
3. Batch number daalo (e.g. BT-TUR-0605)
4. Planned quantity (kg) daalo
5. Start date select karo
6. "Schedule Batch" click karo

## QC Inspection Record Karna

1. **QC Management** → "Record QC Check" click karo
2. Batch select karo
3. Moisture %, aroma, colour fill karo
4. Status select karo: Approved ya Rejected
5. "Record Inspection" click karo

## Salary Dekhi Karne Ke Steps

1. **Payroll** pe click karo
2. Apni row dhundho
3. **"PDF"** button click karo → salary slip download ho jaayegi

## User Ka Role Change Karna _(Admin only)_

1. **User Management** pe jaao
2. Employee ki row mein "Modify Access" dropdown dhundho
3. Naya role select karo
4. Automatically save ho jaata hai

---

# ⚠️ Important Rules

| Rule                   | Detail                                                           |
| ---------------------- | ---------------------------------------------------------------- |
| 🔒 Owner Vault         | Sirf Super Admin dekh sakta hai — kisi aur ko visible nahi       |
| 🛡️ Delegated Authority | Temporary permissions dene ke baad kabhi bhi revoke kar sakte ho |
| 📄 Accounting Vouchers | Kabhi delete nahi hote — sirf Active, Cancelled, ya Reversed     |
| 💰 Payroll             | Sirf apni salary dekh sakte ho (employee roles)                  |
| 📊 Partner             | Sirf reports dekh sakta hai — koi bhi data edit nahi kar sakta   |
| 🔔 Notifications       | Har notification click karne pe relevant module khulta hai       |

---

# 🆘 Problem Aaye Toh Kya Karein?

| Problem                   | Solution                                                                         |
| ------------------------- | -------------------------------------------------------------------------------- |
| Login nahi ho raha        | Email aur password dobara check karo — exactly wahi daalo jo upar table mein hai |
| Page 404 dikha raha hai   | `/login` pe jaao aur dobara login karo                                           |
| Data nahi dikh raha       | Settings → "Seed Demo Spice Records" click karo                                  |
| PDF mein kuch missing hai | Apna role check karo — role ke hisaab se PDF content alag hota hai               |
| White screen aa rahi hai  | Browser refresh karo (Ctrl+R)                                                    |
| Koi module nahi khul raha | Apne role ke allowed modules check karo — har role ke limited pages hote hain    |

---

_© 2025 Agrozaar Foods LLP — Confidential ERP System_
_Sabhi information sirf authorized users ke liye hai._
