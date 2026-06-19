"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight, Box, Glasses, Database, GraduationCap, Play } from "lucide-react";
import Link from "next/link";
import { HeroScene } from "./hero-scene";
import { useEffect, useState } from "react";

const capabilities = [
  { icon: Box, label: "3D Visualization" },
  { icon: Glasses, label: "VR / MR" },
  { icon: Database, label: "Digital Twins" },
  { icon: GraduationCap, label: "Training Simulations" },
];

function TypewriterText({ texts }: { texts: string[] }) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullText = texts[currentTextIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentFullText.length) {
          setDisplayText(currentFullText.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? 30 : 80);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentTextIndex, texts]);

  return (
    <span className="text-primary">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 lg:pt-0 overflow-hidden">
      {/* 3D Background Scene */}
      <HeroScene />
      
      {/* Gradient Overlays for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50 z-10 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24 w-full z-20">
        <div className="max-w-3xl">
          {/* Tagline */}
          <div className="flex items-center gap-3 text-primary text-sm font-medium tracking-wide mb-8">
            <span className="w-12 h-px bg-gradient-to-r from-primary to-transparent" />
            <span className="uppercase">3D • VR • MR • Digital Twins</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] mb-8">
            <span className="text-foreground block">IMMERSIVE DIGITAL</span>
            <span className="text-foreground block">EXPERIENCES FOR</span>
            <span className="block mt-2">
              <TypewriterText texts={["REAL-WORLD IMPACT", "SMARTER DECISIONS", "BETTER OUTCOMES", "MISSION SUCCESS"]} />
            </span>
          </h1>

          {/* Value Proposition */}
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
            FrostWaterStudios delivers next-generation 3D visualization, VR/MR solutions, 
            digital twins, and training simulations that help teams visualize, decide, 
            and perform with confidence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button
              asChild
              size="lg"
              className="bg-primary text-background hover:bg-primary/90 px-8 py-6 text-lg shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 hover:scale-105"
            >
              <Link href="#contact">
                Book a Consultation
                <ArrowUpRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-foreground/30 text-foreground hover:bg-foreground/10 hover:border-primary px-8 py-6 text-lg transition-all hover:scale-105"
            >
              <Link href="#work">
                <Play className="mr-2 h-5 w-5" />
                View Our Work
              </Link>
            </Button>
          </div>

          {/* Capability Pills */}
          <div className="flex flex-wrap gap-3">
            {capabilities.map((cap, index) => (
              <div
                key={cap.label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/50 transition-all cursor-default group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <cap.icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm text-foreground/80">{cap.label}</span>
              </div>
            ))}
          </div>
        </div>


      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden lg:flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground uppercase tracking-widest">Scroll to explore</span>
        <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-primary rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
