import { Navbar } from "@/components/marketing/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { ProgrammesGrid } from "@/components/marketing/ProgrammesGrid";
import { SocialProof } from "@/components/marketing/SocialProof";
import { Pricing } from "@/components/marketing/Pricing";
import { Footer } from "@/components/marketing/Footer";

function Home() {
  return (
    <div className="w-full min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <ProgrammesGrid />
      <SocialProof />
      <Pricing />
      <Footer />
    </div>
  );
}

export default Home;
