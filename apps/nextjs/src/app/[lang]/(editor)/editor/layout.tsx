import { notFound } from "next/navigation";

import { getCurrentUser } from "@canvydocs/auth";

import { MainNav } from "~/components/main-nav";
import { DashboardNav } from "~/components/nav";
import { SiteFooter } from "~/components/site-footer";
import { UserAccountNav } from "~/components/user-account-nav";
import type { Locale } from "~/config/i18n-config";
import { getDashboardConfig } from "~/config/ui/dashboard";
import { getDictionary } from "~/lib/get-dictionary";

interface EditLayoutProps {
  children?: React.ReactNode;
  params: {
    lang: Locale;
  };
}

export default async function EditorLayout({
  children,
}: EditLayoutProps) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white">
      {children}
    </div>
  );
}
