import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - RoR Trader',
  description: 'Monitor your trading bots and portfolio performance',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
