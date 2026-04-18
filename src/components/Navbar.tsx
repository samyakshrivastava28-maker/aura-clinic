import { NavLink } from "react-router-dom";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/appointment", label: "Book Appointment" },
    { to: "/contact", label: "Contact" },
    { to: "/admin", label: "Settings" },
  ];

  return (
    <nav className="bg-white sticky top-0 z-40 w-full border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="bg-teal-600 text-white p-1.5 rounded-lg">
              <Activity className="h-6 w-6" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-800">Aura Clinic</span>
          </NavLink>
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                      isActive
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="flex md:hidden">
            {/* Simple mobile menu links for now */}
            <div className="flex items-center space-x-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      "px-2 py-1 rounded text-xs font-medium transition-colors",
                      isActive
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
