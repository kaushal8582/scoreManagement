"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { login, register } from "../lib/api";

export default function HomePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent, mode: "login" | "register") => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let resp: { user: any; token: string };
      if (mode === "login") {
        resp = await login(email, password);
      } else {
        if (!firstName || !lastName) {
          throw new Error("Please enter first and last name to register");
        }
        resp = await register(firstName, lastName, email, password);
      }
      localStorage.setItem("token", resp.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-300 px-4">
      <div className="card w-full max-w-md p-8 relative">
        <div className="mb-6 text-center">
          {/* <div className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-brand-100 ring-1 ring-brand-500/40">
            Team Points Dashboard
          </div> */}
          {/* <h1 className="mt-4 text-2xl font-semibold tracking-tight text-black" >
            Welcome back
          </h1> */}
          

          <img
            src="/loog.svg"
            alt="SnabbTech Logo"
            className="w-72 h-24 mx-auto"
          />
          <p className="mt-1 text-[15px] text-slate-400">
            Sign-in to Power Team Dashboard
          </p>
        </div>

        <form className="space-y-4">
          

          <div className="space-y-2">
            <label className="block text-sm font-medium text-black">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-700 bg-gray-300 px-3 py-2 text-sm text-black placeholder:text-slate-500  focus:outline-none "
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-black">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-700 bg-gray-300 px-3 py-2 text-sm text-black placeholder:text-slate-500  focus:outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="btn-primary flex-1 disabled:opacity-60"
              disabled={loading}
              onClick={(e) => handleSubmit(e, "login")}
            >
              {loading ? "Loading..." : "Login"}
            </button>
            {/* <button
              type="button"
              className="btn-ghost flex-1 border border-slate-800"
              onClick={(e) => handleSubmit(e, "register")}
            >
              Register
            </button> */}
          </div>
        </form>

          <footer className=" mt-7  left-0 right-0 flex justify-center text-[15px] text-gray-700">
            <span>
              Developed by{" "}
              <a
                href="https://snabbtech.com/"
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 underline"
              >
                SnabbTech
              </a>
            </span>
          </footer>
      </div>
    </main>
  );
}
