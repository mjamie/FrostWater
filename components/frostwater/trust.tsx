"use client";

import {
  Globe,
  Award,
  Quote,
  Sparkles,
  Target,
  Lightbulb,
  Shield,
  Gem,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";

const capabilities = [
  {
    icon: Sparkles,
    title: "3D Visualization & Rendering",
    description: "Photorealistic visuals that communicate complexity with clarity.",
  },
  {
    icon: Globe,
    title: "VR / MR Experiences",
    description: "Immersive training, collaboration, and stakeholder engagement.",
  },
  {
    icon: Target,
    title: "Digital Twins",
    description: "Data-connected models for monitoring and decision-making.",
  },
  {
    icon: Shield,
    title: "Training Simulations",
    description: "Realistic, scalable simulations that build confidence.",
  },
  {
    icon: Lightbulb,
    title: "Interactive Solutions",
    description: "Custom tools and platforms tailored to your mission.",
  },
  {
    icon: Award,
    title: "Technical Consulting",
    description: "Strategic guidance to define and execute digital initiatives.",
  },
];

const values = [
  {
    icon: Target,
    title: "Impact First",
    description: "We start with the mission and design for outcomes.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We explore emerging tech to solve tomorrow's challenges today.",
  },
  {
    icon: Shield,
    title: "Integrity",
    description: "We believe in clear communication and transparent collaboration.",
  },
  {
    icon: Gem,
    title: "Excellence",
    description: "We hold ourselves to the highest standards in every detail.",
  },
];

export function Trust() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative py-24 lg:py-32 bg-card/20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Public Sector Experience - Featured Banner */}
        <div className="mb-20">
          <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 lg:p-12 max-w-4xl mx-auto overflow-hidden">
            {/* Animated glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <span className="text-primary text-sm font-medium tracking-wide uppercase">
                  Public Sector Experience
                </span>
              </div>
              
              <p className="text-xl lg:text-2xl text-foreground leading-relaxed">
                FrostWaterStudios is currently involved in government-related digital twin 
                and immersive visualization work in South Africa, helping translate complex 
                infrastructure environments into interactive 3D experiences.
              </p>

              {/* Subtle indicator */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-primary/10">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4 text-primary" />
                  <span>Active Government Projects</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4 text-primary" />
                  <span>Infrastructure Focus</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 text-primary text-sm font-medium tracking-wide mb-4">
              <span className="w-12 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
              <span>KEY CAPABILITIES</span>
              <span className="w-12 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              WHAT WE BRING TO THE TABLE
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our team combines technical expertise with creative vision to deliver 
              solutions that make a real difference.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((capability, index) => (
              <div
                key={capability.title}
                className={`group relative rounded-xl border border-primary/10 bg-card/30 p-6 transition-all duration-700 hover:border-primary/40 hover:bg-primary/5 overflow-hidden ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="inline-flex p-3 rounded-lg bg-primary/10 border border-primary/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <capability.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {capability.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {capability.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 text-primary text-sm font-medium tracking-wide mb-4">
            <span className="w-12 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <span>OUR VALUES</span>
            <span className="w-12 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            WHAT DRIVES US
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div
              key={value.title}
              className="group relative rounded-xl border border-primary/10 bg-card/30 p-6 text-center transition-all duration-500 hover:border-primary/40 overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Animated border */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 rounded-xl border border-primary/50" style={{ animation: "pulse 2s infinite" }} />
              </div>
              
              <div className="relative z-10">
                <div className="inline-flex p-3 rounded-lg bg-primary/10 border border-primary/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-3 uppercase tracking-wide">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
