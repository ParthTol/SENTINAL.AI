import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Home as HomeIcon } from "lucide-react";
import SignalBars from "./SignalBars";

const ROUTE_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/upload", label: "Insert Image" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/reports", label: "Reports" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors ${isActive ? "text-white" : "text-gray hover:text-white"}`;

  return (
    <header
      className="sticky top-0 z-50 transition-colors"
      style={{
        background: scrolled ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.4)",
        backdropFilter: "blur(10px)",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green shrink-0">
            <HomeIcon size={16} color="#000" strokeWidth={2.5} />
          </div>
          <span className="text-white font-extrabold text-sm tracking-tight">SENTINEL AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {ROUTE_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <span className="flex items-center gap-2 text-[11px] font-semibold text-green">
            <SignalBars size="sm" count={3} />
            Live Monitoring
          </span>
          <button
            onClick={() => navigate("/upload")}
            className="px-4 py-2 rounded-full text-xs font-bold bg-green text-black hover:bg-greenBright transition-colors"
          >
            Try Live Demo
          </button>
        </div>

        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-5 pb-5 flex flex-col gap-1 bg-black/95 border-t border-line">
          {ROUTE_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `text-left py-2.5 text-sm font-semibold ${isActive ? "text-white" : "text-gray"}`}>
              {l.label}
            </NavLink>
          ))}
          <button onClick={() => navigate("/upload")} className="mt-2 px-4 py-2.5 rounded-full text-xs font-bold bg-green text-black">
            Try Live Demo
          </button>
        </div>
      )}
    </header>
  );
}
