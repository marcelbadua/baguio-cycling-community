import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
//import SiteHeader from "@/components/layout/site-header";
import { Navbar } from '@/components/navigation/navbar'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col">
    {/* <SiteHeader /> */}
    <Navbar />
    <main>{children}</main>
  </div>
  );
}