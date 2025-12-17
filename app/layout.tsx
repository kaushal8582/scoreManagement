import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Team Points Dashboard",
  description: "Monitor team and user performance at a glance."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}


