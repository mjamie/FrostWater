"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowUpRight } from "lucide-react";

const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#industries", label: "Industries" },
  { href: "#work", label: "Our Work" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-background/90 backdrop-blur-xl border-b border-primary/20 shadow-lg shadow-primary/5" 
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
              <Image
                src="/images/logo-icon.png"
                alt="FrostWater Studios"
                fill
                className="object-contain"
              />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight text-foreground">
                FROSTWATER
              </span>
              <span className="text-[10px] tracking-[0.25em] text-primary uppercase">
                Studios
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              asChild
              className="hidden lg:flex bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-background transition-all duration-300 shadow-lg shadow-primary/20"
            >
              <Link href="#contact">
                Book a Consultation
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              className="lg:hidden bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-background transition-all duration-300 px-3 py-1.5 text-xs shadow-lg shadow-primary/20"
            >
              <Link href="#contact">
                Book Call
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-primary/20 bg-background/95 backdrop-blur-xl">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Button
                asChild
                className="mt-4 bg-primary text-background hover:bg-primary/90"
              >
                <Link href="#contact" onClick={() => setMobileMenuOpen(false)}>
                  Book a Consultation
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
