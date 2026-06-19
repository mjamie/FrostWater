"use client";

import { Search, Target, Palette, Code, Rocket, HeadphonesIcon, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Discover",
    description: "We learn your goals, challenges, and environment to define opportunities.",
  },
  {
    number: "02",
    icon: Target,
    title: "Strategize",
    description: "We align on scope, priorities, and success metrics to build the right roadmap.",
  },
  {
    number: "03",
    icon: Palette,
    title: "Design",
    description: "We craft concepts and experiences that are intuitive, impactful, and purpose-built.",
  },
  {
    number: "04",
    icon: Code,
    title: "Develop",
    description: "We build with precision using industry-leading tools and secure, scalable pipelines.",
  },
  {
    number: "05",
    icon: Rocket,
    title: "Deliver",
    description: "We deploy, optimize, and ensure seamless integration into your workflows.",
  },
  {
    number: "06",
    icon: HeadphonesIcon,
    title: "Support",
    description: "We provide ongoing support and enhancements to drive long-term value.",
  },
];

function ProcessStep({ step, index, activeStep }: { step: typeof steps[0]; index: number; activeStep: number }) {
  const isActive = index === activeStep;
  const isPast = index < activeStep;

  return (
    <div
      className={`group relative rounded-xl p-6 transition-all duration-500 border ${
        isActive
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
          : isPast
          ? "border-primary/30 bg-primary/5"
          : "border-primary/10 bg-card/30"
      }`}
    >
      {/* Progress indicator */}
      <div className={`absolute top-0 left-0 h-1 bg-primary transition-all duration-500 rounded-t-xl ${isActive ? "w-full" : isPast ? "w-full" : "w-0"}`} />
      
      <div className="flex items-start gap-4">
        <div className="shrink-0 relative">
          {/* Number with glow effect */}
          <div className={`text-4xl font-bold transition-all duration-500 ${isActive ? "text-primary" : "text-primary/20"}`}>
            {step.number}
          </div>
          {isActive && (
            <div className="absolute inset-0 bg-primary/30 blur-xl" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-2 rounded-lg transition-all duration-500 ${isActive ? "bg-primary text-background" : "bg-primary/10 text-primary border border-primary/20"}`}>
              <step.icon className="h-4 w-4" />
            </div>
            <h3 className={`text-lg font-semibold uppercase tracking-wide transition-colors duration-500 ${isActive ? "text-primary" : "text-foreground"}`}>
              {step.title}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Process() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section id="about" ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 text-primary text-sm font-medium tracking-wide mb-4">
              <span className="w-12 h-px bg-gradient-to-r from-primary to-transparent" />
              <span>HOW WE WORK</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
              <span className="text-foreground">A PROVEN PROCESS.</span>
              <br />
              <span className="text-primary">MEASURABLE RESULTS.</span>
            </h2>
          </div>
          <div className="lg:max-w-md">
            <p className="text-muted-foreground leading-relaxed">
              We combine creative vision, technical expertise, and industry knowledge 
              to deliver solutions that are efficient, effective, and built to last.
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-12 relative">
          <div className="h-1 bg-primary/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          {/* Step indicators */}
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <button
                key={step.number}
                onClick={() => setActiveStep(index)}
                className={`flex items-center gap-1 text-xs transition-all ${
                  index <= activeStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span className="font-bold">{step.number}</span>
                <span className="hidden sm:inline">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Process Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative"
            >
              <ProcessStep step={step} index={index} activeStep={activeStep} />
              
              {/* Connector arrow */}
              {index < steps.length - 1 && index !== 2 && (
                <div className="hidden lg:flex absolute top-1/2 -right-3 z-10 transform -translate-y-1/2">
                  <ArrowRight className={`h-4 w-4 transition-colors duration-500 ${index < activeStep ? "text-primary" : "text-primary/20"}`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
