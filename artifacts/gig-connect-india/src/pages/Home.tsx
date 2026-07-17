import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Shield, Users, Briefcase, GraduationCap, Scale, Heart, ArrowRight,
  MapPin, Phone, Mail, CheckCircle2, CalendarDays, HandshakeIcon, HelpCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGetCommunityStats, useSubmitContact, getGetCommunityStatsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

function AnimatedCounter({ end, duration = 2, suffix = "+" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) animationFrame = requestAnimationFrame(step);
    };
    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(2, "Subject must be at least 2 characters").max(200),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const faqItems = [
  {
    q: "Who can join Gig Connect India?",
    a: "Any worker earning through digital platforms or informal gig economy — delivery riders, cab drivers, domestic workers, freelancers, construction workers, and more — can join for free.",
  },
  {
    q: "Is membership free?",
    a: "Yes, basic membership is completely free. We believe every worker deserves access to community support, regardless of income level.",
  },
  {
    q: "What welfare schemes am I eligible for?",
    a: "Eligibility depends on your state and work category. After registration, our team will reach out with a personalised list of central and state government schemes you qualify for.",
  },
  {
    q: "How do I apply for the emergency relief fund?",
    a: "Registered members can apply through our helpline (+91 98765 43210) or by submitting a request via the Contact Us form. Applications are reviewed within 48 hours.",
  },
  {
    q: "Can organisations or NGOs partner with you?",
    a: "Absolutely. We actively seek partnerships with NGOs, CSR initiatives, government bodies, and legal aid clinics. Fill in the Partner With Us form or contact us directly.",
  },
  {
    q: "Will my data be kept private?",
    a: "Yes. Your personal information is stored securely and never shared with third parties without your consent. It is only used to connect you to welfare schemes and community updates.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border border-gray-200 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-primary pr-4">{q}</span>
        {open ? <ChevronUp className="h-5 w-5 text-accent shrink-0" /> : <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 bg-white text-muted-foreground leading-relaxed text-sm border-t border-gray-100">
          <p className="pt-4">{a}</p>
        </div>
      )}
    </div>
  );
}

export function Home() {
  const { data: stats } = useGetCommunityStats({ query: { queryKey: getGetCommunityStatsQueryKey() } });
  const submitContact = useSubmitContact();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  const onSubmit = (data: z.infer<typeof contactFormSchema>) => {
    submitContact.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Message Sent!", description: "Thank you for reaching out. We will get back to you soon." });
        form.reset();
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
      },
    });
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative w-full bg-primary text-primary-foreground min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/attached_assets/generated_images/hero-gig-workers.jpg"
            alt="Gig Workers India"
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/40" />
        </div>
        <div className="container relative z-10 px-4 py-20 md:py-32">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Join India's Largest Worker Network
              </div>
              <h1 className="font-heading text-5xl md:text-7xl font-black leading-tight mb-6">
                Empowering India's <span className="text-accent">Gig Workforce</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl leading-relaxed">
                We are a nationwide community platform uniting delivery riders, drivers, freelancers, and domestic workers. Together, we fight for fair rights, welfare, and a better future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/join">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground h-14 px-8 text-lg font-bold w-full sm:w-auto shadow-lg shadow-accent/20">
                    Join the Community
                  </Button>
                </Link>
                <button
                  onClick={() => {
                    const el = document.getElementById("membership");
                    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center h-14 px-8 text-lg font-bold w-full sm:w-auto rounded-md border border-white/30 hover:bg-white/10 bg-transparent text-white transition-colors"
                >
                  Know More
                </button>
              </div>
              <div className="mt-12 flex flex-wrap gap-4">
                {["Unity", "Welfare", "Growth", "Empowerment"].map((badge) => (
                  <div key={badge} className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
                    <Shield className="h-4 w-4 text-accent" />
                    <span className="font-medium text-sm">{badge}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b py-12 relative z-20 shadow-sm">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50">
            {[
              { label: "Workers Connected", value: stats?.workersConnected },
              { label: "Cities Active",     value: stats?.cities },
              { label: "Welfare Partners",  value: stats?.welfarePartners },
              { label: "Events Organized",  value: stats?.eventsOrganized },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center text-center px-4">
                <span className="text-4xl md:text-5xl font-black font-heading text-primary mb-2">
                  {value != null ? <AnimatedCounter end={value} /> : "..."}
                </span>
                <span className="text-sm md:text-base font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ───────────────────────────────────────────────────────────── */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="container px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-accent/10 rounded-3xl transform -rotate-3 z-0" />
                <img
                  src="/attached_assets/generated_images/about-community.jpg"
                  alt="Gig Connect India Community"
                  className="relative z-10 rounded-2xl shadow-xl w-full object-cover aspect-video"
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg z-20 hidden md:block">
                  <div className="font-heading font-bold text-2xl text-primary">5+ Years</div>
                  <div className="text-sm text-muted-foreground font-medium">Of Empowering Workers</div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="mb-4 text-accent font-bold tracking-widest uppercase text-sm">Who We Are</div>
              <h2 className="font-heading text-4xl md:text-5xl font-black text-primary mb-6">
                The Backbone of India's Platform Economy
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Gig Connect India is more than an organisation; it's a movement. We were born out of the necessity to give voice to the millions of invisible workers who drive our cities forward every single day.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                From food delivery riders braving the monsoon to domestic workers supporting countless households, we are building a united front to secure the dignity, fair pay, and social security that every gig worker deserves.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {["Worker-first approach", "Policy advocacy", "Direct welfare support", "Community strength"].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    </div>
                    <span className="font-semibold text-primary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Work / Services ─────────────────────────────────────────────── */}
      <section id="services" className="py-24 bg-white">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="mb-4 text-accent font-bold tracking-widest uppercase text-sm">Our Work</div>
            <h2 className="font-heading text-4xl md:text-5xl font-black text-primary mb-6">
              How We Support Our Community
            </h2>
            <p className="text-lg text-muted-foreground">
              We provide comprehensive support across multiple dimensions of a gig worker's life — rights, welfare, skills, finances, legal aid, and community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Scale className="h-8 w-8 text-blue-500" />,    title: "Rights & Advocacy",    desc: "Fighting for fair pay, better working conditions, and recognition of gig workers' rights at the policy level." },
              { icon: <Heart className="h-8 w-8 text-rose-500" />,    title: "Welfare & Benefits",   desc: "Connecting workers to government schemes, health insurance, and emergency relief funds." },
              { icon: <GraduationCap className="h-8 w-8 text-green-500" />, title: "Skill Development", desc: "Training programmes to upgrade skills, improve ratings, and open doors to better earning opportunities." },
              { icon: <Briefcase className="h-8 w-8 text-amber-500" />, title: "Financial Literacy",  desc: "Workshops on savings, debt management, and accessing micro-loans without falling into debt traps." },
              { icon: <Shield className="h-8 w-8 text-indigo-500" />, title: "Legal Support",         desc: "Legal counsel and support for platform disputes, arbitrary deactivations, and worker grievances." },
              { icon: <Users className="h-8 w-8 text-accent" />,      title: "Community Building",   desc: "Fostering solidarity through local chapters, regular meetups, and a strong peer support network." },
            ].map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-shadow group relative overflow-hidden"
              >
                <div className="mb-6 bg-white w-16 h-16 rounded-xl flex items-center justify-center shadow-sm group-hover:-translate-y-1 transition-transform">
                  {service.icon}
                </div>
                <h3 className="font-heading text-xl font-bold text-primary mb-3">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ────────────────────────────────────────────────────────── */}
      <section id="benefits" className="py-24 bg-gray-50">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="mb-4 text-accent font-bold tracking-widest uppercase text-sm">Benefits</div>
            <h2 className="font-heading text-4xl md:text-5xl font-black text-primary mb-6">
              What You Get as a Member
            </h2>
            <p className="text-lg text-muted-foreground">
              Joining Gig Connect India gives you access to a range of exclusive benefits designed to protect and empower you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Accident Insurance",  desc: "Free accident insurance coverage for all registered members, ensuring financial protection during emergencies.",        color: "bg-blue-50 border-blue-100" },
              { title: "Health Camps",         desc: "Regular free health check-up camps in your city organised by our welfare partners.",                                    color: "bg-green-50 border-green-100" },
              { title: "Legal Aid",            desc: "Free legal consultation for platform disputes, payment issues, and arbitrary deactivations.",                           color: "bg-purple-50 border-purple-100" },
              { title: "Skill Training",       desc: "Subsidised skill development programmes to help you earn more and diversify your income sources.",                      color: "bg-amber-50 border-amber-100" },
              { title: "Emergency Fund",       desc: "Access to an emergency relief fund during illness, accidents, or periods without work.",                                color: "bg-rose-50 border-rose-100" },
              { title: "Community Network",    desc: "Connect with thousands of workers across India, share experiences, and support each other.",                           color: "bg-teal-50 border-teal-100" },
            ].map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`rounded-2xl p-7 border ${benefit.color}`}
              >
                <div className="w-3 h-3 rounded-full bg-accent mb-4" />
                <h3 className="font-heading text-lg font-bold text-primary mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Membership ──────────────────────────────────────────────────────── */}
      <section id="membership" className="py-24 bg-white">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="mb-4 text-accent font-bold tracking-widest uppercase text-sm">Membership</div>
            <h2 className="font-heading text-4xl md:text-5xl font-black text-primary mb-6">
              Join Free — Get Lifelong Benefits
            </h2>
            <p className="text-lg text-muted-foreground">
              Registering takes two minutes. What you get lasts a lifetime. Here's what every member receives from day one.
            </p>
          </div>

          {/* Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                tier: "Basic Member",
                price: "Free",
                color: "border-gray-200",
                highlight: false,
                perks: ["Community membership card", "Access to welfare scheme directory", "Monthly newsletter", "Local chapter access", "Emergency helpline"],
              },
              {
                tier: "Active Member",
                price: "Free",
                color: "border-accent",
                highlight: true,
                perks: ["Everything in Basic", "Accident insurance coverage", "Free health check-up camps", "Skill training workshops", "Legal aid consultation", "Emergency relief fund access"],
              },
              {
                tier: "Leader / Organiser",
                price: "Free",
                color: "border-primary/30",
                highlight: false,
                perks: ["Everything in Active", "Lead a local chapter", "Direct policy advocacy access", "Priority legal support", "National conference invites", "Recognition & awards"],
              },
            ].map((plan) => (
              <motion.div
                key={plan.tier}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`rounded-2xl p-8 border-2 ${plan.color} ${plan.highlight ? "bg-accent/5 shadow-xl scale-105" : "bg-gray-50"} relative`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>
                )}
                <div className="mb-4">
                  <p className="text-sm font-bold text-accent uppercase tracking-wider mb-1">{plan.tier}</p>
                  <p className="font-heading text-3xl font-black text-primary">{plan.price}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link href="/join">
                  <Button className={`w-full ${plan.highlight ? "bg-accent hover:bg-accent/90 text-white" : "bg-primary hover:bg-primary/90 text-white"}`}>
                    Register Now
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Welfare Schemes ─────────────────────────────────────────────────── */}
      <section id="welfare" className="py-24 bg-gray-50">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="mb-4 text-accent font-bold tracking-widest uppercase text-sm">Welfare Schemes</div>
            <h2 className="font-heading text-4xl md:text-5xl font-black text-primary mb-6">
              Government & Community Support You Deserve
            </h2>
            <p className="text-lg text-muted-foreground">
              We connect you to central and state government welfare schemes, insurance programmes, and community relief funds — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              { name: "PM-SYM (Pradhan Mantri Shram Yogi Maandhan)", tag: "Central Govt", desc: "Monthly pension of ₹3,000 after age 60 for unorganised sector workers with income below ₹15,000/month.", color: "bg-blue-50 border-blue-100" },
              { name: "e-Shram Card", tag: "Central Govt", desc: "National database of unorganised workers. Get a UAN number and access to ₹2 lakh accident insurance free of cost.", color: "bg-green-50 border-green-100" },
              { name: "BOCW Welfare Scheme", tag: "State Govt", desc: "Construction workers can access maternity, accident, education, and housing assistance through state-level boards.", color: "bg-purple-50 border-purple-100" },
              { name: "Gig Worker Health Insurance", tag: "GCI Welfare Fund", desc: "Exclusive for GCI members — subsidised OPD, hospitalisation coverage, and free health check-up camps in 20+ cities.", color: "bg-amber-50 border-amber-100" },
              { name: "Skill India / PMKVY", tag: "Central Govt", desc: "Free government-certified skill training courses for gig workers looking to upgrade or change career tracks.", color: "bg-teal-50 border-teal-100" },
              { name: "Emergency Relief Fund", tag: "GCI Welfare Fund", desc: "Rapid financial assistance for members facing accidents, illness, or sudden income loss. Applications processed within 48 hours.", color: "bg-rose-50 border-rose-100" },
            ].map((scheme, i) => (
              <motion.div
                key={scheme.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`rounded-2xl p-6 border ${scheme.color} flex gap-4`}
              >
                <div className="shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mt-1">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-bold text-accent uppercase tracking-wider mb-1">{scheme.tag}</div>
                  <h3 className="font-heading font-bold text-primary mb-1 leading-snug">{scheme.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{scheme.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">Register as a member to find out which schemes you personally qualify for.</p>
            <Link href="/join">
              <Button className="bg-primary hover:bg-primary/90 text-white px-8">
                Check My Eligibility <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Partner With Us ─────────────────────────────────────────────────── */}
      <section id="partner" className="py-24 bg-primary text-primary-foreground">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="mb-4 text-accent font-bold tracking-widest uppercase text-sm">Partner With Us</div>
            <h2 className="font-heading text-4xl md:text-5xl font-black mb-6">
              Together We Create Real Change
            </h2>
            <p className="text-lg text-primary-foreground/70">
              We work with NGOs, corporates, legal firms, healthcare providers, and government bodies to deliver impactful welfare programmes at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { title: "NGO & Civil Society",    icon: <Users className="h-7 w-7" />,          desc: "Co-run welfare drives, legal aid clinics, and community outreach programmes across India." },
              { title: "CSR & Corporate",        icon: <Briefcase className="h-7 w-7" />,      desc: "Channel your CSR funds into direct worker welfare — health camps, skill training, and relief funds." },
              { title: "Legal & Healthcare",     icon: <Scale className="h-7 w-7" />,          desc: "Pro bono legal aid, subsidised diagnostics, and affordable healthcare for our 25,000+ members." },
              { title: "Government Bodies",      icon: <Shield className="h-7 w-7" />,         desc: "Help us bridge the gap between scheme rollout and last-mile delivery to workers on the ground." },
            ].map((type, i) => (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white/10 border border-white/10 rounded-2xl p-7 hover:bg-white/15 transition-colors"
              >
                <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-5 text-accent">
                  {type.icon}
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{type.title}</h3>
                <p className="text-sm text-primary-foreground/70 leading-relaxed">{type.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-white/10 border border-white/10 rounded-2xl p-8 md:p-12 max-w-2xl mx-auto text-center">
            <h3 className="font-heading text-2xl font-bold mb-4">Interested in Partnering?</h3>
            <p className="text-primary-foreground/70 mb-6">
              Send us a message and our partnerships team will respond within 2 working days.
            </p>
            <button
              onClick={() => {
                const el = document.getElementById("contact");
                if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-8 py-3 rounded-lg transition-colors"
            >
              Get In Touch <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Events ──────────────────────────────────────────────────────────── */}
      <section id="events" className="py-24 bg-white">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="mb-4 text-accent font-bold tracking-widest uppercase text-sm">Events</div>
            <h2 className="font-heading text-4xl md:text-5xl font-black text-primary mb-6">
              Upcoming & Recent Events
            </h2>
            <p className="text-lg text-muted-foreground">
              Join us at community meetups, health camps, skill workshops, and policy dialogues happening across India.
            </p>
          </div>

          {/* Upcoming */}
          <h3 className="font-heading font-bold text-xl text-primary mb-6 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-accent" /> Upcoming Events
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {[
              { title: "Free Health Camp — Lucknow",       date: "20 July 2026",   location: "Hazratganj Community Hall, Lucknow", type: "Health",   spots: "200 spots left" },
              { title: "Skill Workshop — Digital Payments", date: "27 July 2026",   location: "District Library, Kanpur",            type: "Training", spots: "80 spots left" },
              { title: "Legal Aid Clinic — Delhi NCR",     date: "3 August 2026",  location: "Saket NGO Hub, New Delhi",            type: "Legal",    spots: "50 spots left" },
            ].map((event, i) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-3 bg-accent" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">{event.type}</span>
                    <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">{event.spots}</span>
                  </div>
                  <h4 className="font-heading font-bold text-primary mb-3 leading-snug">{event.title}</h4>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-accent" /> {event.date}</div>
                    <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" /> {event.location}</div>
                  </div>
                  <button
                    onClick={() => {
                      const el = document.getElementById("contact");
                      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
                    }}
                    className="mt-5 w-full inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
                  >
                    Register for Event
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Past Events */}
          <h3 className="font-heading font-bold text-xl text-primary mb-6 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" /> Past Events
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Worker Rally, Lucknow",    year: "June 2026" },
              { label: "Health Camp, Delhi",        year: "May 2026" },
              { label: "Skill Workshop, Mumbai",    year: "April 2026" },
              { label: "Annual Meet, Bengaluru",    year: "March 2026" },
              { label: "Legal Aid Drive, Jaipur",   year: "Feb 2026" },
              { label: "Community Feast, Patna",    year: "Jan 2026" },
              { label: "Youth Training, Chennai",   year: "Dec 2025" },
              { label: "Welfare Drive, Hyderabad",  year: "Nov 2025" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4 hover:shadow-sm transition-shadow"
              >
                <Users className="h-5 w-5 text-accent mb-2" />
                <p className="text-sm font-semibold text-primary leading-tight">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.year}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="mb-4 text-accent font-bold tracking-widest uppercase text-sm">FAQ</div>
            <h2 className="font-heading text-4xl md:text-5xl font-black text-primary mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about joining, membership benefits, welfare schemes, and partnerships.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqItems.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <button
              onClick={() => {
                const el = document.getElementById("contact");
                if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-lg transition-colors"
            >
              Ask Us Directly <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA Band ────────────────────────────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/10" />
        <div className="absolute w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl -top-40 -right-40 mix-blend-screen pointer-events-none" />
        <div className="container px-4 relative z-10 text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-black mb-6 max-w-4xl mx-auto leading-tight">
            Be a Part of India's Largest Gig Worker Community
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Your voice matters. Join thousands of workers standing together for a better future, stronger rights, and shared growth.
          </p>
          <Link href="/join">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground h-16 px-10 text-xl font-bold rounded-full shadow-lg shadow-accent/20">
              Join Us Today
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Contact ─────────────────────────────────────────────────────────── */}
      <section id="contact" className="py-24 bg-white">
        <div className="container px-4">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-5/12">
              <div className="mb-4 text-accent font-bold tracking-widest uppercase text-sm">Contact Us</div>
              <h2 className="font-heading text-4xl font-black text-primary mb-6">
                Let's Build the Future Together
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Have questions about membership, want to partner with us, or need immediate assistance? Our team is here to help.
              </p>
              <div className="space-y-6">
                {[
                  { icon: <MapPin className="h-6 w-6 text-accent" />, title: "Head Office", body: <>123 Worker Center, Hazratganj<br />Lucknow, Uttar Pradesh 226001</> },
                  { icon: <Phone className="h-6 w-6 text-accent" />,  title: "Phone",       body: <>+91 98765 43210</> },
                  { icon: <Mail className="h-6 w-6 text-accent" />,   title: "Email",       body: <>contact@gigconnectindia.org</> },
                ].map(({ icon, title, body }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center shadow-sm shrink-0">{icon}</div>
                    <div>
                      <h4 className="font-bold text-primary mb-1">{title}</h4>
                      <p className="text-muted-foreground">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-7/12">
              <div className="bg-gray-50 p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-heading text-2xl font-bold text-primary mb-6">Send us a Message</h3>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary font-semibold">Full Name *</FormLabel>
                          <FormControl><Input placeholder="Your name" className="bg-white" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary font-semibold">Phone Number</FormLabel>
                          <FormControl><Input placeholder="+91 XXXXX XXXXX" className="bg-white" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-semibold">Email Address *</FormLabel>
                        <FormControl><Input placeholder="you@example.com" type="email" className="bg-white" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="subject" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-semibold">Subject *</FormLabel>
                        <FormControl><Input placeholder="Membership / Partnership / Welfare query…" className="bg-white" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="message" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-semibold">Message *</FormLabel>
                        <FormControl><Textarea placeholder="Tell us how we can help…" className="min-h-[120px] bg-white" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={submitContact.isPending}>
                      {submitContact.isPending ? "Sending…" : "Send Message"}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
