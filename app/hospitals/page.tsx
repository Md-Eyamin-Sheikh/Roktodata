'use client';

import { AppShell } from '@/components/layout/AppShell';

export default function HospitalsPage() {
  return <AppShell initialTab="home" initialOpenHospitals={true} />;
}
