import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Function Junction — Event Atelier",
    template: "%s · Function Junction",
  },
  description:
    "Function Junction plans and delivers weddings, birthdays and corporate events end to end — decor, catering, entertainment, photography and crew, in one booking.",
  keywords: [
    "event management",
    "wedding planner",
    "birthday party planner",
    "catering",
    "DJ booking",
    "event decor",
  ],
  openGraph: {
    type: "website",
    siteName: "Function Junction",
    title: "Function Junction — Event Atelier",
    description:
      "Weddings, birthdays and everything worth remembering — designed, staffed and delivered end to end.",
  },
};

export const viewport: Viewport = {
  themeColor: "#07060b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jakarta.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
