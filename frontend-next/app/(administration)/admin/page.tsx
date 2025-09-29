import Dashboard from "@/app/components/adminDashboard";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<>...</>}>
      <Dashboard />
    </Suspense>
  );
}
