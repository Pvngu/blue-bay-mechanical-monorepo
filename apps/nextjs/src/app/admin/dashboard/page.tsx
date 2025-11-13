import DashboardClient from "@/components/dashboard/DashboardClient";

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your business operations and performance metrics
        </p>
      </div>
      <DashboardClient />
    </div>
  );
}
