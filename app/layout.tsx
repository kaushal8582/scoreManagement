import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Team Points Dashboard",
  description: "Monitor team and user performance at a glance.",
  icons: {
    icon: "https://www.bniconnectglobal.com/web/dashboard/favicon.ico"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      <body className="min-h-screen bg-slate-950 text-slate-50">
        {children}
        <Toaster/>
      </body>
    </html>
  );
}


