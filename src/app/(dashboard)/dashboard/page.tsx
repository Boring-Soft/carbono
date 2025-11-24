import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Redirect to CARBONO dashboard
  redirect("/dashboard/carbono");
} 