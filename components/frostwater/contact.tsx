"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpRight, Mail, Phone, MapPin, Clock, CheckCircle2, Send } from "lucide-react";

const projectTypes = [
  "3D Visualization",
  "VR/MR Experience",
  "Digital Twin",
  "Training Simulation",
  "Interactive Tool",
  "Technical Consulting",
  "Other",
];

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="contact" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 text-primary text-sm font-medium tracking-wide mb-4">
            <span className="w-12 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <span>GET IN TOUCH</span>
            <span className="w-12 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance mb-6">
            <span className="text-foreground">READY TO BUILD</span>
            <br />
            <span className="text-primary">WHAT&apos;S NEXT?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Have a project in mind or need expert guidance? We&apos;re here to help. 
            Reach out to start the conversation and explore what&apos;s possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-primary/10 bg-card/30 backdrop-blur-sm p-6 hover:border-primary/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-foreground mb-6 uppercase tracking-wide">
                Contact Information
              </h3>
              <div className="space-y-5">
                {[
                  { icon: Mail, label: "Email", value: "hello@frostwaterstudios.com", href: "mailto:hello@frostwaterstudios.com" },
                  { icon: Phone, label: "Phone", value: "+1 (202) 555-0148", href: "tel:+12025550148" },
                  { icon: MapPin, label: "Office", value: "123 Innovation Way, Suite 400\nArlington, VA 22202", href: null },
                  { icon: Clock, label: "Hours", value: "Mon - Fri: 9:00 AM - 6:00 PM ET", href: null },
                ].map((item, index) => (
                  <div key={item.label} className="group flex items-start gap-4">
                    <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-foreground hover:text-primary transition-colors whitespace-pre-line"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-foreground whitespace-pre-line">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Consultation CTA */}
            <div className="relative rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 overflow-hidden">
              {/* Animated glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-foreground mb-3 uppercase tracking-wide">
                  Book a Consultation
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Schedule a no-obligation call with our team to explore your goals.
                </p>
                <Button
                  asChild
                  className="w-full bg-primary text-background hover:bg-primary/90 shadow-lg shadow-primary/30"
                >
                  <a href="#contact">
                    Schedule Now
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-primary/10 bg-card/30 backdrop-blur-sm p-8 hover:border-primary/20 transition-all duration-300">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="relative inline-flex">
                    <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
                    <div className="relative p-4 rounded-full bg-primary/10 border border-primary/20">
                      <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mt-6 mb-3">
                    Message Sent!
                  </h3>
                  <p className="text-muted-foreground">
                    Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Full Name
                      </label>
                      <div className={`relative transition-all duration-300 ${focusedField === "name" ? "scale-[1.02]" : ""}`}>
                        <Input
                          required
                          placeholder="John Smith"
                          className="bg-background/50 border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                          onFocus={() => setFocusedField("name")}
                          onBlur={() => setFocusedField(null)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Work Email
                      </label>
                      <div className={`relative transition-all duration-300 ${focusedField === "email" ? "scale-[1.02]" : ""}`}>
                        <Input
                          required
                          type="email"
                          placeholder="john@company.com"
                          className="bg-background/50 border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                          onFocus={() => setFocusedField("email")}
                          onBlur={() => setFocusedField(null)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Organization
                      </label>
                      <Input
                        placeholder="Company or Agency"
                        className="bg-background/50 border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Project Type
                      </label>
                      <Select>
                        <SelectTrigger className="bg-background/50 border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary/30">
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectTypes.map((type) => (
                            <SelectItem key={type} value={type.toLowerCase()}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Tell us about your project
                    </label>
                    <Textarea
                      required
                      placeholder="Describe your project goals, challenges, and timeline..."
                      rows={5}
                      className="bg-background/50 border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none transition-all"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary text-background hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] group"
                  >
                    Send Message
                    <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By submitting this form, you agree to our privacy policy. 
                    We&apos;ll never share your information.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
