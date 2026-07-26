import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Amenities from "@/components/landing/Amenities";
import Betterway from "@/components/landing/Betterway";
import Tickets from "@/components/landing/Tickets";
import Supported from "@/components/landing/Supported";
import Takeoff from "@/components/landing/Takeoff";
import Boarding from "@/components/landing/Boarding";
import Footer from "@/components/landing/Footer";
import EaModal from "@/components/landing/EaModal";
import LandingEffects from "./LandingEffects";

export default function Home() {
  return (
    <>
      <div className="sky-fixed" aria-hidden="true">
        <canvas id="skyCanvas"></canvas>
      </div>
      <div className="preloader" id="preloader">
        <span className="preloader-logo">Runway</span>
      </div>
      <Header />
      <main id="top">
        <Hero />
        <div className="sky-zone" id="skyZone">
          <Amenities />
        </div>
        <Betterway />
        <div className="sky-zone sky-zone-2">
          <Tickets />
        </div>
        <section className="takeoff-wrap" id="takeoffWrap">
          <div className="dark-rig" id="darkRig">
            <Supported />
            <Takeoff />
          </div>
          <Boarding />
        </section>
      </main>
      <Footer />
      <EaModal />
      <LandingEffects />
    </>
  );
}
