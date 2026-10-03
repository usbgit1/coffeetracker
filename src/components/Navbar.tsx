"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CoffeeBeanIcon from "@/components/icons/CoffeeBeanIcon";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/registrar", label: "Registrar" },
  { href: "/historico", label: "Histórico" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-espresso text-cream sticky top-0 z-10 shadow-md shadow-espresso/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <span
          className="flex items-center gap-2 text-xl tracking-wide"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          <CoffeeBeanIcon className="w-6 h-6 text-gold" />
          Coffee Tracker
        </span>
        <nav className="flex gap-1 sm:gap-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-gold text-espresso"
                    : "text-cream/80 hover:bg-coffee-dark hover:text-cream"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
