"use client";

import { Button } from "@/components/ui/button";
import {
  Building2,
  Shield,
  HardHat,
  GraduationCap,
  Siren,
  Zap,
  Home,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";

const industries = [
  {
    icon: Building2,
    title: "Government",
    problem: "Complex projects, limited budgets, and public scrutiny demand clarity and accountability.",
    solution: "Digital twins and immersive visualizations that improve transparency, collaboration, and public trust.",
    benefits: ["Stakeholder Alignment", "Budget Visibility", "Public Trust"],
  },
  {
    icon: HardHat,
    title: "Infrastructure",
    problem: "Aging assets, tight timelines, and high stakes require precision and foresight.",
    solution: "Digital twin platforms and 4D simulations that streamline planning, construction, and operations.",
    benefits: ["Asset Lifecycle", "Risk Reduction", "4D Planning"],
  },
  {
    icon: Shield,
    title: "AEC",
    problem: "Disconnected workflows and design changes drive delays and cost overruns.",
    solution: "VR collaboration and real-time 3D models that align teams and bring projects to life before they're built.",
    benefits: ["Design Coordination", "Clash Detection", "Client Buy-in"],
  },
  {
    icon: GraduationCap,
    title: "Education & Training",
    problem: "Traditional training lacks engagement and real-world context.",
    solution: "Immersive simulations and VR training environments that improve retention and readiness.",
    benefits: ["Higher Retention", "Safe Practice", "Measurable Skills"],
  },
  {
    icon: Siren,
    title: "Public Safety",
    problem: "High-pressure situations demand preparedness and precision.",
    solution: "Realistic VR simulations and command visualizations that enhance training, planning, and response.",
    benefits: ["Response Readiness", "Scenario Training", "Team Coordination"],
  },
  {
    icon: Zap,
    title: "Energy & Utilities",
    problem: "Complex systems and assets require continuous optimization and risk mitigation.",
    solution: "3D asset models and digital twins that improve reliability, safety, and operational efficiency.",
    benefits: ["Predictive Maintenance", "Safety Compliance", "Asset Visibility"],
  },
  {
    icon: Home,
    title: "Real Estate",
    problem: "Investors and stakeholders need confidence before ground is broken.",
    solution: "Photorealistic visualizations and interactive experiences that accelerate approvals and drive engagement.",
    benefits: ["Faster Approvals", "Pre-Sales", "Investor Confidence"],
  },
];

function IndustryCard({ industry, index }: { industry: typeof industries[0]; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 80);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden rounded-xl border border-primary/10 bg-card/30 backdrop-blur-sm transition-all duration-500 hover:border-primary/40 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`} />
      
      {/* Scanning line animation */}
      <div 
        className={`absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent transition-all duration-1000 ${isHovered ? "opacity-100" : "opacity-0"}`}
        style={{ top: isHovered ? "100%" : "0%", transition: "top 1.5s ease-out, opacity 0.3s" }}
      />

      <div className="relative p-6">
        <div className="flex items-start gap-4">
          {/* Icon with glow */}
          <div className="relative shrink-0">
            <div className={`absolute inset-0 bg-primary/30 rounded-lg blur-lg transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`} />
            <div className="relative p-3 rounded-lg bg-primary/10 border border-primary/20 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
              <industry.icon className="h-5 w-5 text-primary" />
            </div>
          </div>
          
          <div className="space-y-3 flex-1">
            <h3 className="text-lg font-semibold text-foreground uppercase tracking-wide group-hover:text-primary transition-colors">
              {industry.title}
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground/80 font-medium">Challenge:</span>{" "}
                {industry.problem}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="text-primary font-medium">Solution:</span>{" "}
                {industry.solution}
              </p>
            </div>
            
            {/* Benefits pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {industry.benefits.map((benefit) => (
                <span
                  key={benefit}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/5 text-primary/80 border border-primary/10"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Industries() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % industries.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="industries" className="relative py-24 lg:py-32 bg-card/20">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 text-primary text-sm font-medium tracking-wide mb-4">
            <span className="w-12 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <span>INDUSTRIES & SOLUTIONS</span>
            <span className="w-12 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance mb-6">
            <span className="text-foreground">DIGITAL SOLUTIONS</span>
            <br />
            <span className="text-primary">BUILT FOR THE REAL WORLD</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From mission-critical infrastructure to immersive training, we help organizations 
            across industries harness the power of 3D, VR, MR, and digital twins to solve 
            complex challenges and drive measurable impact.
          </p>
        </div>

        {/* Industry Pills - Animated Ticker */}
        <div className="mb-12 overflow-hidden">
          <div className="flex gap-3 justify-center flex-wrap">
            {industries.map((industry, idx) => (
              <button
                key={industry.title}
                onClick={() => setActiveIndex(idx)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
                  activeIndex === idx
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-card/30 border-primary/20 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <industry.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{industry.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Industries Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {industries.map((industry, index) => (
            <IndustryCard key={industry.title} industry={industry} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 text-center">
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              BUILT FOR IMPACT. DESIGNED FOR YOU.
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Every industry faces unique challenges. We combine deep domain understanding 
              with cutting-edge technology to deliver solutions that make a measurable difference.
            </p>
            <Button
              asChild
              className="bg-primary text-background hover:bg-primary/90 shadow-lg shadow-primary/30"
            >
              <Link href="#contact">
                Talk to Our Team
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
