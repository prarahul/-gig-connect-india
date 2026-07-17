import { Link, useLocation } from "wouter";
import { Menu, Phone, Mail, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navLinks = [
  { name: "Home",             sectionId: null },
  { name: "Membership",       sectionId: "membership" },
  { name: "Welfare Schemes",  sectionId: "welfare" },
  { name: "Partner With Us",  sectionId: "partner" },
  { name: "Events",           sectionId: "events" },
  { name: "FAQ",              sectionId: "faq" },
  { name: "Contact Us",       sectionId: "contact" },
];

function scrollToSection(sectionId: string | null) {
  if (!sectionId) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.getElementById(sectionId);
  if (el) {
    const offset = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleNav(sectionId: string | null) {
    if (location !== "/") {
      window.location.href = "/";
      setTimeout(() => scrollToSection(sectionId), 300);
    } else {
      scrollToSection(sectionId);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top info bar */}
      <div className="w-full bg-primary text-primary-foreground py-2 px-4 hidden md:flex justify-between items-center text-xs">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> +91 98765 43210</span>
          <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> contact@gigconnectindia.org</span>
        </div>
        <div className="flex gap-3">
          <span className="cursor-pointer hover:text-accent transition-colors">Facebook</span>
          <span className="cursor-pointer hover:text-accent transition-colors">Twitter</span>
          <span className="cursor-pointer hover:text-accent transition-colors">LinkedIn</span>
          <span className="cursor-pointer hover:text-accent transition-colors">Instagram</span>
        </div>
      </div>

      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => handleNav(null)} className="flex items-center gap-2 group text-left">
          <div className="flex flex-col">
            <span className="font-heading font-black text-xl tracking-tight text-primary leading-none group-hover:text-accent transition-colors">
              GIG CONNECT INDIA
            </span>
            <span className="text-[0.6rem] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
              Connecting Workers. Creating Opportunities.
            </span>
          </div>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNav(link.sectionId)}
              className="text-sm font-medium px-3 py-2 rounded-md transition-colors hover:bg-accent/10 hover:text-accent text-foreground/80 cursor-pointer bg-transparent border-none whitespace-nowrap"
            >
              {link.name}
            </button>
          ))}
          <Link href="/join">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-5 ml-2">
              Join Us
            </Button>
          </Link>
        </nav>

        {/* Mobile Nav */}
        <div className="flex lg:hidden items-center gap-3">
          <Link href="/join">
            <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">Join</Button>
          </Link>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 mt-6">
                <span className="font-heading font-bold text-lg text-primary">GIG CONNECT INDIA</span>
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <button
                      key={link.name}
                      onClick={() => {
                        setMobileOpen(false);
                        setTimeout(() => handleNav(link.sectionId), 150);
                      }}
                      className="text-base font-medium text-left px-3 py-2.5 rounded-lg bg-transparent border-none cursor-pointer hover:bg-accent/10 hover:text-accent transition-colors"
                    >
                      {link.name}
                    </button>
                  ))}
                  <Link href="/join" className="mt-4" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                      Join Us Today
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
