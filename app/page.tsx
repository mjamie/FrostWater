import { Header } from "@/components/frostwater/header";
import { Hero } from "@/components/frostwater/hero";
import { Services } from "@/components/frostwater/services";
import { Industries } from "@/components/frostwater/industries";
import { Portfolio } from "@/components/frostwater/portfolio";
import { Process } from "@/components/frostwater/process";
import { Trust } from "@/components/frostwater/trust";
import { Contact } from "@/components/frostwater/contact";
import { Footer } from "@/components/frostwater/footer";
import { AnimatedGridBackground } from "@/components/frostwater/animated-background";

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <AnimatedGridBackground />
      <Header />
      <Hero />
      <Services />
      <Industries />
      <Portfolio />
      <Process />
      <Trust />
      <Contact />
      <Footer />
    </main>
  );
}
