import { Link } from "wouter";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";

function scrollTo(sectionId: string | null) {
  if (!sectionId) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
  const el = document.getElementById(sectionId);
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
}

function FooterLink({ label, sectionId, href }: { label: string; sectionId?: string; href?: string }) {
  if (href) {
    return (
      <li>
        <Link href={href} className="text-primary-foreground/70 hover:text-accent transition-colors flex items-center gap-2 text-sm">
          <ArrowRight className="h-3 w-3 shrink-0" /> {label}
        </Link>
      </li>
    );
  }
  return (
    <li>
      <button
        onClick={() => scrollTo(sectionId ?? null)}
        className="text-primary-foreground/70 hover:text-accent transition-colors flex items-center gap-2 text-sm bg-transparent border-none cursor-pointer p-0 text-left"
      >
        <ArrowRight className="h-3 w-3 shrink-0" /> {label}
      </button>
    </li>
  );
}

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <span className="font-heading font-black text-2xl tracking-tight text-white leading-none">GIG CONNECT INDIA</span>
              <span className="text-xs font-semibold text-accent uppercase tracking-widest mt-1">Connecting Workers. Creating Opportunities.</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mt-2">
              A nationwide movement empowering gig and platform workers across India through community, advocacy, and welfare support.
            </p>
            <div className="flex gap-3 mt-2">
              {["f", "X", "in", "ig"].map((icon) => (
                <div key={icon} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors cursor-pointer text-sm font-bold">
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-5 text-white">Quick Links</h3>
            <ul className="flex flex-col gap-3">
              <FooterLink label="Home"       sectionId={undefined} />
              <FooterLink label="About Us"   sectionId="about" />
              <FooterLink label="Our Work"   sectionId="services" />
              <FooterLink label="Benefits"   sectionId="benefits" />
              <FooterLink label="Contact Us" sectionId="contact" />
            </ul>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-5 text-white">Important Links</h3>
            <ul className="flex flex-col gap-3">
              <FooterLink label="Membership"       sectionId="membership" />
              <FooterLink label="Welfare Schemes"  sectionId="welfare" />
              <FooterLink label="Partner With Us"  sectionId="partner" />
              <FooterLink label="Events"           sectionId="events" />
              <FooterLink label="FAQ"              sectionId="faq" />
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-5 text-white">Contact Info</h3>
            <ul className="flex flex-col gap-4 text-sm text-primary-foreground/70">
              <li className="flex gap-3 items-start">
                <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span>123 Worker Center, Hazratganj<br />Lucknow, UP 226001</span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone className="h-5 w-5 text-accent shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex gap-3 items-center">
                <Mail className="h-5 w-5 text-accent shrink-0" />
                <span>contact@gigconnectindia.org</span>
              </li>
              <li className="mt-2 text-xs leading-relaxed">
                <strong className="text-white">Office Hours:</strong><br />Mon–Sat: 10:00 AM – 6:00 PM
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/50">
          <p>© {new Date().getFullYear()} Gig Connect India. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            <Link href="/admin" className="hover:text-white transition-colors">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
