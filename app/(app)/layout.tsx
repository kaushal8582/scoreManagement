"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings", label: "Settings" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setSidebarOpen(false);
    router.push("/");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/");
  }, [pathname, router]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      {/* ================= HEADER ================= */}
      <header className="bg-[#DC2627] shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile only) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-white sm:hidden"
            >
              <Menu size={26} />
            </button>

            {/* Logo */}
            <div
              onClick={() => router.push("/dashboard")}
              className="flex cursor-pointer items-center "
            >
              <img src="/image.png" className="h-[30px]" />
              <h1 className="text-[18px] sm:text-[22px] font-bold text-white mt-[10px]">
                Diamonds Power Team
              </h1>
            </div>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-2 sm:flex">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium border ${
                    active
                      ? "bg-white text-black border-white"
                      : "text-white border-white hover:bg-white hover:text-black"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="rounded-lg border border-white px-3 py-1.5 text-sm text-white hover:bg-white hover:text-black"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* ================= MOBILE SIDEBAR ================= */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex text-black">
          {/* Overlay */}
          <div
            className="flex-1 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div className="w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between bg-[#DC2627] px-4 py-3">
              <span className="font-semibold text-white">Menu</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="text-white" />
              </button>
            </div>

            <div className="flex flex-col p-3">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                      active
                        ? "bg-red-100 text-[#DC2627]"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                className="mt-3 rounded-lg bg-[#DC2627] px-3 py-2 text-sm text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONTENT ================= */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {children}
      </main>

      {/* ================= FOOTER ================= */}
      <footer className=" sticky bottom-0 border-t bg-white text-center text-black text-sm py-3">
          <span>
            Developed by{" "}
            <a
              href="https://bni-chandigarh.in/chandigarh-bni-diamonds/en-IN/memberdetails?encryptedMemberId=15%2FEZAjfSifjfpN2xT8tWQ%3D%3D&cmsv3=true&name=Ashish+Garg"
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 underline"
            >
              Ashish Garg (IT Consultant)
            </a>
          </span>
        </footer>
    </div>
  );
}
