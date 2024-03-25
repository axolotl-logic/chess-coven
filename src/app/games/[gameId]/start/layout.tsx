// React
import React from "react";

// NextJS
import Link from "next/link";

// Components
import { SiteNav } from "@/components/SiteNav";

// Styles
import "@/app/globals.css";
import { Footer } from "@/components/Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex-1 flex justify-center items-center flex-wrap-reverse">
        <header className="flex-1 flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/"
              className="mb-2 whitespace-nowrap font-header text-3xl font-bold text-amber-300"
            >
              Chess Coven
            </Link>
            <SiteNav />
          </div>
        </header>
        <div className="w-full xl:w-auto">
          <div className="mx-auto max-w-2xl p-4">{children}</div>
        </div>
        <div className="flex-1" />
      </div>
      <Footer />
    </>
  );
}
