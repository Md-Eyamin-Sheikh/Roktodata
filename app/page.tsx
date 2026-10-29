import { AppShell } from '@/components/layout/AppShell';
import { NavTab } from '@/components/navigation/BottomNav';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const resolved = await searchParams;
  const tab = resolved?.tab;
  const validTab: NavTab =
    tab && ['home', 'requests', 'donors', 'profile'].includes(tab)
      ? (tab as NavTab)
      : 'home';

  return <AppShell initialTab={validTab} />;
}

