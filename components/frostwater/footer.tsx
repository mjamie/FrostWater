"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Linkedin, Twitter, Youtube } from "lucide-react";

const footerLinks = {
  services: [
    { label: "3D Visualization", href: "#services" },
    { label: "VR / MR Experiences", href: "#services" },
    { label: "Digital Twins", href: "#services" },
    { label: "Training Simulations", href: "#services" },
    { label: "Interactive Solutions", href: "#services" },
  ],
  industries: [
    { label: "Government", href: "#industries" },
    { label: "Infrastructure", href: "#industries" },
    { label: "AEC", href: "#industries" },
    { label: "Energy & Utilities", href: "#industries" },
    { label: "Public Safety", href: "#industries" },
  ],
  company: [
    { label: "About Us", href: "#about" },
    { label: "Our Work", href: "#work" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#contact" },
  ],
};

const socialLinks = [
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="relative bg-card/30 border-t border-primary/10">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 transition-transform group-hover:scale-110">
                <Image
                  src="/images/logo-icon.png"
                  alt="FrostWater Studios"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-bold tracking-tight text-foreground">
                  FROSTWATER
                </span>
                <span className="text-xs tracking-[0.25em] text-primary uppercase">
                  Studios
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              Creative technology solutions that visualize, decide, and perform 
              with confidence. Partner with us to turn complex ideas into powerful 
              experiences.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
              Services
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
              Industries
            </h4>
            <ul className="space-y-3">
              {footerLinks.industries.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="py-8 border-t border-primary/10">
          <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Animated glow */}
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-foreground mb-2">
                READY TO VISUALIZE WHAT&apos;S POSSIBLE?
              </h3>
              <p className="text-muted-foreground">
                Partner with FrostWaterStudios to turn complex ideas into powerful experiences.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="relative z-10 bg-primary text-background hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 shrink-0"
            >
              <Link href="#contact">
                Book a Consultation
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FrostWaterStudios. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
