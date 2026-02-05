"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { login, register } from "../lib/api";
import { Toaster } from "react-hot-toast";


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
      localStorage.setItem("user", JSON.stringify(resp.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{ background: "rgb(200, 201, 199)" }}
      className="flex min-h-screen items-center justify-center  px-4"
    >
      <div className="card w-full max-w-md p-8 relative !rounded-none">
        <div className="mb-6 text-center">
          {/* <div className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-brand-100 ring-1 ring-brand-500/40">
            Team Points Dashboard
          </div> */}
          {/* <h1 className="mt-4 text-2xl font-semibold tracking-tight text-black" >
            Welcome back
          </h1> */}

          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <img
              src="/snabbTackMainLogo.png"
              alt="SnabbTech Logo"
              className="h-[30px] sm:h-[40px] w-auto flex-shrink-0"
            />
            <div className="mx-1 sm:mx-3 flex-shrink-0">
              <div
                className="h-[30px] sm:h-[40px] md:h-[50px] w-[2px] relative"
                style={{ backgroundColor: "rgb(99, 102, 106)" }}
              >
                <div
                  className="h-[4px] sm:h-[5px] w-[4px] sm:w-[5px] rounded-full absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ backgroundColor: "rgb(99, 102, 106)" }}
                ></div>
                <div
                  className="h-[4px] sm:h-[5px] w-[4px] sm:w-[5px] rounded-full absolute bottom-[-4px] left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ backgroundColor: "rgb(99, 102, 106)" }}
                ></div>
              </div>
            </div>
            <div className="flex" >
              <img
                src="/logo2.png"
                alt="Diamonds Logo"
                className="h-[30px] sm:h-[40px] md:h-[50px] w-auto flex-shrink-0"
              />
              <h1 className="text-[20px] mt-[6px] leading-[24px] md:mt-[26px] mt-[7px]  font-bold text-[#d11d2f] whitespace-nowrap">
                Diamonds
              </h1>
            </div>
          </div>

          <p
            style={{ color: "rgb(99, 102, 106)" }}
            className="mt-2 sm:mt-3 text-base sm:text-xl md:text-[1.37rem] font-bold px-2"
          >
            Sign-in to Power Team Dashboard
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-2">
            {/* <label className="block text-sm font-medium text-black">
              Email
            </label> */}
            <input
              type="email"
              className="
    w-full
    bg-white
    px-3
    py-[11px]
    text-black
    border-0
    rounded-[3px]
    appearance-none
    border-b-[3px] border-b-[#DF2020]
    focus:border-b-[#DF2020]
    focus:border-b-[2px]
    
    focus:outline-none
  "
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                // backgroundColor: "white",
                // padding: "11px",
                // borderRadius: "3px",
                // color: "black",
                // border: "0px",
                boxShadow:
                  "rgba(0, 0, 0, 0.3) 0px 1px 3px inset, rgb(255, 255, 255) 0px 0px 0px, rgb(255, 255, 255) 0px 0px 0px",
                appearance: "none",
                // borderBottom: "3px solid #DF2020",
              }}
            />
          </div>

          <div className="space-y-2">
            {/* <label className="block text-sm font-medium text-black">
              Password
            </label> */}
            <input
              type="password"
              className="
    w-full
    bg-white
    px-3
    py-[11px]
    text-black
    border-0
    rounded-[3px]
    appearance-none
    border-b-[3px] border-b-[#DF2020]
    focus:border-b-[#DF2020]
    focus:outline-none
    focus:border-b-[2px]
  "
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                // backgroundColor: "white",
                // padding: "11px",
                // borderRadius: "3px",
                // color: "black",
                // border: "0px",
                boxShadow:
                  "rgba(0, 0, 0, 0.3) 0px 1px 3px inset, rgb(255, 255, 255) 0px 0px 0px, rgb(255, 255, 255) 0px 0px 0px",
                appearance: "none",
                // borderBottom: "3px solid #DF2020",
              }}
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
              className="btn-primary !w-[120px] px-3 py-1.5 text-sm disabled:opacity-60 !rounded-[4px]"
              disabled={loading || !email || !password}
              onClick={(e) => handleSubmit(e, "login")}
            >
              {loading ? "Loading..." : "Login"}
            </button>
          </div>
        </form>

        <footer className=" mt-7  left-0 right-0 flex justify-center text-[15px] text-gray-700">
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

      <Toaster/>
    </main>
  );
}
