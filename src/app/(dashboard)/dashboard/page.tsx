import { StatsOverview } from "@/components/dashboard/stats-overview";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { CreditsChart } from "@/components/dashboard/credits-chart";
import { DaptaAcademy } from "@/components/dashboard/dapta-academy";

export default async function DashboardPage() {
  // Authentication disabled for frontend design purposes

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your automation performance.
        </p>
      </div>
      <StatsOverview />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="lg:col-span-1">
          <CreditsChart />
        </div>
      </div>
      <DaptaAcademy />
    </div>
  );
} 