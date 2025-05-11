import "./styles.css";
import Header from "../../components/Navigation/Header/Header";
import Hero from "./components/Hero";
import SmartConvo from "./components/SmartConvo";
import SupportedModels from "./components/SupportedModels";
import Features from "./components/Feature";
import WhyChooseUs from "./components/WhyChooseUs";
import Footer from "../../components/Navigation/Footer/Footer";
import ReadyToStart from "./components/ReadyToStart";
import { metadata } from "./metadata";

export { metadata };

export default function PromptCueHome() {
  return (
    <div className="landing-page">
      <Header />
      <main>
        <Hero />
        <SmartConvo />
        <SupportedModels />
        <Features />
        <WhyChooseUs />
        <ReadyToStart />
      </main>
      <Footer />
    </div>
  );
}
