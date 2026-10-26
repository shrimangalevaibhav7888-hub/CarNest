import type { Metadata } from "next";
import "./globals.css";
import { CareNestProvider } from "@/context/CareNestContext";
import { CareNestNavbar } from "@/components/layout/CareNestNavbar";
import { CareNestFooter } from "@/components/layout/CareNestFooter";
import { EmergencySosModal } from "@/components/emergency/EmergencySosModal";
import { BookingModal } from "@/components/booking/BookingModal";
import { ToastContainer } from "@/components/ui/ToastContainer";

export const metadata: Metadata = {
  title: "CareNest — Elderly Home-Care Platform | Care at Home. Peace of Mind.",
  description:
    "CareNest connects elderly patients aged 60+ with background-verified caregivers while helping families coordinate daily care, medicines, home visits, health updates, and emergency support.",
  keywords: [
    "elderly care",
    "senior home care",
    "verified caregivers",
    "medicine reminder",
    "geriatric nursing",
    "emergency SOS",
    "family care coordination",
  ],
  authors: [{ name: "CareNest Technologies Inc." }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-[#f8faff]">
      <body className="min-h-screen flex flex-col antialiased selection:bg-indigo-600 selection:text-white text-slate-900 bg-[#f8faff]">
        <CareNestProvider>
          <CareNestNavbar />
          <main className="flex-1 min-w-0">{children}</main>
          <CareNestFooter />

          {/* Global Modals & Notifications */}
          <EmergencySosModal />
          <BookingModal />
          <ToastContainer />
        </CareNestProvider>
      </body>
    </html>
  );
}
