import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useCurrency } from "@/hooks/useCurrency";
import { createMetadata } from "@/lib/metadata";
import { WrapperWithQuery } from "@/components/common/wrapper";
import { ClientProviders } from "@/components/providers/client-providers";
import { APP_BASE_URL } from "@/config/urls";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LayoutWrapper } from "@/components/common/layout-wrapper";
import { defaultOrgSettings, defaultUserSettings } from "@/lib/app-settings/default";
import { HydrateSettings } from "@/components/providers/hydrate-settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = createMetadata({
  title: {
    template: "%s | Alcorabooks",
    default: "Alcorabooks",
  },
  description: "Distribution. Distribution. Distribution",
  metadataBase: new URL(APP_BASE_URL),
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });

  let org: any = {}
  if (session) {
    org = await auth.api.getFullOrganization({
      query: { organizationSlug: session?.organizationSlug },
      headers: hdrs,
    });
  }

  const orgSettings = (org as any)?.settings ?? defaultOrgSettings;
  const userSettings = (org as any)?.user?.settings ?? defaultUserSettings;

  // Partial settings
  //   const orgSettings = { ...defaultOrgSettings, ...org?.settings };
  // const userSettings = { ...defaultUserSettings, ...org?.user?.settings };


  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientProviders>
          <HydrateSettings orgSettings={orgSettings} userSettings={userSettings}>
            <WrapperWithQuery>
              <LayoutWrapper session={session}>{children}</LayoutWrapper>
            </WrapperWithQuery>
          </HydrateSettings>
        </ClientProviders>
      </body>
    </html>
  );
}
