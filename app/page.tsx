import DashboardClient from "@/components/DashboardClient";
import ErrorPanel from "@/components/ErrorPanel";
import { getDashboardData } from "@/lib/queries";

export const dynamic = "force-dynamic";


export default async function Home() {
  try {
    const data = await getDashboardData();
    return <DashboardClient data={data} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return <ErrorPanel message={message} />;
  }
}
