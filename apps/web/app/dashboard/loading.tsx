export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center">
      <div className="animate-pulse">
        <div className="h-8 w-8 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
