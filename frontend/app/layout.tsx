import { Toaster } from "react-hot-toast";
import WhatsAppButton from "@/components/WhatsAppButton";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MobileNav from "@/components/MobileNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.afrilinkcapital.com"),
  title: {
    default: "Afrilink Capital | Source, Import & Deliver",
    template: "%s | Afrilink Capital",
  },
  description:
    "Afrilink Capital helps African businesses source products, verify suppliers, negotiate prices, manage imports and receive deliveries.",
  openGraph: {
    title: "Afrilink Capital",
    description: "Your African sourcing, importation and delivery partner.",
    url: "https://www.afrilinkcapital.com",
    siteName: "Afrilink Capital",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-20 md:pb-0">
  <Header />
  <Toaster />
  <main className="flex-1">{children}</main>
  <Footer />
  <WhatsAppButton />
  <MobileNav />
</body>
    </html>
  );
}
