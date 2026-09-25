import DashboardClient from "@/components/dashboard/DashboardClient";
import { getCoffees } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const coffees = await getCoffees();
  return <DashboardClient coffees={coffees} />;
}
