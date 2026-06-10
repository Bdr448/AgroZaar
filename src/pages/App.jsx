import { useEffect, Suspense, lazy } from 'react';
import { Navigate, useRouter } from '../lib/simple-router';
import { useSession } from '../lib/erp/auth';
import { initDelegationStore } from '../lib/erp/delegation';
import { ErpSidebar } from '../components/erp/ErpSidebar';
import { ErpHeader } from '../components/erp/ErpHeader';
import { ROLE_NAV } from '../lib/erp/roles';
import { useState } from 'react';

// Lazy load components
const RoleDashboard = lazy(() => import('../components/erp/dashboards').then((m) => ({ default: m.RoleDashboard })));
const ModuleRouter = lazy(() => import('../routes/app.$'));
const AccountingPage = lazy(() => import('../routes/app.accounting'));
const BillingPage = lazy(() => import('../routes/app.billing'));
const PayrollPage = lazy(() => import('../routes/app.payroll'));
const DelegatedAuthorityPage = lazy(() => import('../routes/app.delegated-authority'));
const OwnerVaultPage = lazy(() => import('../routes/app.owner-vault'));

let delegationInitialized = false;

export default function App() {
  const user = useSession();
  const { route } = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user && !delegationInitialized) {
      delegationInitialized = true;
      initDelegationStore();
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const nav = ROLE_NAV[user.role] || [];

  // Route content based on path
  let content = null;
  const Loading = () => <div className="flex h-40 items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  
  if (route === '/app' || route === '/app/' || route === '/app/dashboard') {
    content = <Suspense fallback={<Loading />}><RoleDashboard role={user.role} /></Suspense>;
  } else if (route === '/app/accounting') {
    content = <Suspense fallback={<Loading />}><AccountingPage /></Suspense>;
  } else if (route === '/app/billing') {
    content = <Suspense fallback={<Loading />}><BillingPage /></Suspense>;
  } else if (route === '/app/payroll') {
    content = <Suspense fallback={<Loading />}><PayrollPage /></Suspense>;
  } else if (route === '/app/delegated-authority') {
    content = <Suspense fallback={<Loading />}><DelegatedAuthorityPage /></Suspense>;
  } else if (route === '/app/owner-vault') {
    content = <Suspense fallback={<Loading />}><OwnerVaultPage /></Suspense>;
  } else if (route.startsWith('/app/')) {
    // All other /app/* routes handled by ModuleRouter (catch-all)
    content = <Suspense fallback={<Loading />}><ModuleRouter /></Suspense>;
  } else {
    content = <div className="text-center py-8"><h2 className="text-2xl font-bold">404</h2><p className="mt-2 text-muted-foreground">Page not found</p></div>;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <ErpSidebar
        nav={nav}
        role={user.role}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <ErpHeader user={user} onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-x-hidden p-4 lg:p-6">
          {content}
        </main>
      </div>
    </div>
  );
}
