"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight, Building2, Train, Shield, Factory, Layers, Cpu, Globe } from "lucide-react";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";

const capabilities = [
  {
    icon: Building2,
    title: "Digital Twin Development",
    description: "We create data-connected 3D models that mirror real-world assets, enabling monitoring, analysis, and smarter decision-making for complex infrastructure.",
    applications: ["Smart Cities", "Facilities Management", "Asset Monitoring"],
  },
  {
    icon: Globe,
    title: "Immersive Visualization",
    description: "Transform complex data and environments into interactive 3D experiences that communicate clearly and drive stakeholder engagement.",
    applications: ["Public Presentations", "Design Reviews", "Stakeholder Buy-in"],
  },
  {
    icon: Shield,
    title: "VR Training Simulations",
    description: "Build realistic, risk-free training environments that improve retention, readiness, and safety for high-stakes scenarios.",
    applications: ["Emergency Response", "Operations Training", "Safety Protocols"],
  },
  {
    icon: Cpu,
    title: "MR/AR Solutions",
    description: "Overlay critical data onto the real world for on-site guidance, remote collaboration, and enhanced field operations.",
    applications: ["Construction Review", "Maintenance Support", "Field Training"],
  },
];

const projectTypes = [
  "Government Digital Twins",
  "Infrastructure Visualization", 
  "Training Simulations",
  "Interactive Configurators",
  "Public Safety Tools",
  "Smart City Platforms",
];

function CapabilityCard({ capability, index }: { capability: typeof capabilities[0]; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 150);
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [index]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden rounded-xl border border-primary/10 bg-card/30 backdrop-blur-sm transition-all duration-700 hover:border-primary/30 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      onMouseMove={handleMouseMove}
    >
      {/* Mouse follow gradient */}
      <div
        className="absolute w-64 h-64 transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%)",
          left: mousePosition.x - 128,
          top: mousePosition.y - 128,
        }}
      />

      {/* Visual - Abstract 3D representation */}
      <div className="relative h-48 overflow-hidden border-b border-primary/10">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Wireframe grid animation */}
          <div className="relative w-full h-full">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
              <defs>
                <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              {/* Animated grid lines */}
              {[...Array(8)].map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1="0"
                  y1={25 + i * 25}
                  x2="400"
                  y2={25 + i * 25}
                  stroke="#60a5fa"
                  strokeOpacity="0.1"
                  strokeWidth="1"
                  className="group-hover:stroke-opacity-30 transition-all duration-500"
                  style={{ transitionDelay: `${i * 50}ms` }}
                />
              ))}
              {[...Array(16)].map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={25 + i * 25}
                  y1="0"
                  x2={25 + i * 25}
                  y2="200"
                  stroke="#60a5fa"
                  strokeOpacity="0.1"
                  strokeWidth="1"
                  className="group-hover:stroke-opacity-30 transition-all duration-500"
                  style={{ transitionDelay: `${i * 30}ms` }}
                />
              ))}
              {/* Animated shapes */}
              <rect
                x="150"
                y="60"
                width="100"
                height="80"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2"
                className="group-hover:stroke-opacity-80 transition-all duration-700"
                strokeOpacity="0.3"
              />
              <polygon
                points="200,30 250,80 200,80"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="1.5"
                className="group-hover:stroke-opacity-80 transition-all duration-700"
                strokeOpacity="0.2"
              />
            </svg>
          </div>
        </div>

        {/* Icon */}
        <div className="absolute bottom-4 right-4 z-10">
          <div className="p-3 rounded-xl bg-background/80 backdrop-blur-sm border border-primary/20">
            <capability.icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="relative p-6">
        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
          {capability.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {capability.description}
        </p>

        {/* Applications */}
        <div className="flex flex-wrap gap-2 mb-6">
          {capability.applications.map((app) => (
            <span
              key={app}
              className="text-xs px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary"
            >
              {app}
            </span>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="#contact"
          className="inline-flex items-center text-primary text-sm font-medium transition-all group-hover:gap-2"
        >
          Discuss Your Project
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

export function Portfolio() {
  return (
    <section id="work" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 text-primary text-sm font-medium tracking-wide mb-4">
              <span className="w-12 h-px bg-gradient-to-r from-primary to-transparent" />
              <span>WHAT WE BUILD</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
              <span className="text-foreground">SOLUTIONS THAT</span>
              <br />
              <span className="text-primary">DRIVE RESULTS.</span>
            </h2>
          </div>
          <div className="lg:max-w-md">
            <p className="text-muted-foreground leading-relaxed">
              We specialize in creating immersive digital experiences that help 
              organizations visualize, train, and make better decisions. Every 
              project is built to deliver measurable impact.
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-6 border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary transition-all"
            >
              <Link href="#contact">
                Start a Conversation
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Capabilities Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {capabilities.map((capability, index) => (
            <CapabilityCard key={capability.title} capability={capability} index={index} />
          ))}
        </div>

        {/* Project Types */}
        <div className="rounded-2xl border border-primary/10 bg-card/30 p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Types of Projects We Deliver
              </h3>
              <p className="text-muted-foreground text-sm">
                From concept to deployment, we create solutions for complex challenges.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {projectTypes.map((type) => (
                <span
                  key={type}
                  className="text-sm px-4 py-2 rounded-lg bg-primary/5 border border-primary/20 text-foreground hover:bg-primary/10 hover:border-primary/40 transition-all cursor-default"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
