import HistoricoList from "@/components/HistoricoList";
import { getCoffees } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HistoricoPage() {
  const coffees = await getCoffees();
  return <HistoricoList coffees={coffees} />;
}
