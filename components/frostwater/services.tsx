"use client";

import { Button } from "@/components/ui/button";
import {
  Box,
  Glasses,
  Layers,
  GraduationCap,
  Settings,
  MessageSquare,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";

const services = [
  {
    icon: Box,
    title: "3D Visualization",
    description:
      "Photorealistic renders and animations that bring design intent to life and accelerate decision-making.",
    features: ["Architectural Renders", "Product Visualization", "Animation"],
  },
  {
    icon: Glasses,
    title: "VR / MR Experiences",
    description:
      "Immersive experiences for training, collaboration, and stakeholder buy-in that transform how teams work.",
    features: ["Virtual Walkthroughs", "Mixed Reality Apps", "Collaboration Tools"],
  },
  {
    icon: Layers,
    title: "Digital Twins",
    description:
      "Data-connected models for monitoring, analysis, and smarter operations across complex systems.",
    features: ["Real-Time Data", "Predictive Analytics", "Asset Management"],
  },
  {
    icon: GraduationCap,
    title: "Training Simulations",
    description:
      "Realistic simulations that enhance readiness, reduce risk, and save lives and resources.",
    features: ["Safety Training", "Procedure Practice", "Assessment Tools"],
  },
  {
    icon: Settings,
    title: "Interactive Tools",
    description:
      "Custom configurators and platforms that simplify complex choices and empower customers to explore.",
    features: ["Product Configurators", "Sales Tools", "Self-Service Platforms"],
  },
  {
    icon: MessageSquare,
    title: "Technical Consulting",
    description:
      "Strategic guidance and technical expertise to define, plan, and execute your digital initiatives.",
    features: ["Technology Strategy", "Implementation Planning", "Team Augmentation"],
  },
];

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 100);
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden rounded-xl border border-primary/10 bg-card/30 backdrop-blur-sm transition-all duration-500 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent transition-opacity duration-500 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      />
      
      {/* Floating particles effect on hover */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-primary/40 rounded-full transition-all duration-1000 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            style={{
              left: `${20 + i * 15}%`,
              top: isHovered ? "20%" : "100%",
              transitionDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>

      <div className="relative p-6">
        {/* Icon with glow effect */}
        <div className="relative mb-4">
          <div className={`absolute inset-0 bg-primary/20 rounded-lg blur-xl transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`} />
          <div className="relative p-3 rounded-lg bg-primary/10 border border-primary/20 w-fit transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
            <service.icon className="h-6 w-6 text-primary" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-foreground uppercase tracking-wide mb-3">
          {service.title}
        </h3>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          {service.description}
        </p>

        {/* Features list */}
        <div className="flex flex-wrap gap-2 mb-6">
          {service.features.map((feature) => (
            <span
              key={feature}
              className="text-xs px-2 py-1 rounded-full bg-primary/5 text-primary/80 border border-primary/10"
            >
              {feature}
            </span>
          ))}
        </div>

        <Link
          href="#contact"
          className="inline-flex items-center text-primary text-sm font-medium transition-all group-hover:gap-2"
        >
          Learn More
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

export function Services() {
  return (
    <section id="services" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 text-primary text-sm font-medium tracking-wide mb-4">
              <span className="w-12 h-px bg-gradient-to-r from-primary to-transparent" />
              <span>OUR SERVICES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
              <span className="text-foreground">DIGITAL SOLUTIONS.</span>
              <br />
              <span className="text-primary">REAL-WORLD IMPACT.</span>
            </h2>
          </div>
          <div className="lg:max-w-md">
            <p className="text-muted-foreground leading-relaxed">
              From concept to deployment, we create immersive digital solutions
              that solve complex challenges and accelerate mission-critical
              outcomes.
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-6 border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary transition-all"
            >
              <Link href="#contact">
                Explore Services
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
