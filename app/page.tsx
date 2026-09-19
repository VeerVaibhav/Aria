import { AlertOctagon } from "lucide-react";
import DashboardClient from "@/components/DashboardClient";
import { getDashboardData } from "@/lib/queries";

export const dynamic = "force-dynamic";

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="civic-card p-6">
        <div className="flex items-start gap-3">
          <AlertOctagon className="mt-0.5 h-6 w-6 shrink-0" style={{ color: "var(--alert)" }} aria-hidden />
          <div>
            <h1 className="text-lg font-bold">Statistical service unavailable</h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              APIx does not render simulated values. The live data connection returned:
            </p>
            <p className="mt-2 font-mono text-xs" style={{ color: "var(--alert)" }}>
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  try {
    const data = await getDashboardData();
    return <DashboardClient data={data} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return <ErrorPanel message={message} />;
  }
}
