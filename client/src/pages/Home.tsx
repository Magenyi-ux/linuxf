import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Download, BookOpen, Brain, Zap, Wifi, Lock, Cpu } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * SphereLearn Examply Landing Page
 * Design: Modern Academic Excellence
 * - Deep Purple (#6B4CE6) primary color
 * - Warm Cream (#F9F7F4) background
 * - Teal (#00A896) accents for CTAs
 * - Playfair Display + Poppins typography
 * - Features: Offline AI (fflie ai), 3D splash screen welcome
 */

// 3D Splash Screen Component
function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary via-purple-600 to-accent flex items-center justify-center overflow-hidden">
      {/* Animated background spheres */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* 3D Sphere Container */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Main 3D Sphere */}
        <div className="relative w-48 h-48 mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-accent/30 backdrop-blur-md shadow-2xl"
            style={{
              animation: "spin 6s linear infinite, float 3s ease-in-out infinite",
            }}>
            {/* Inner sphere glow */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-t from-accent/40 to-white/20 blur-xl"></div>
            {/* Sphere highlight */}
            <div className="absolute top-8 left-8 w-16 h-16 rounded-full bg-white/40 blur-lg"></div>
          </div>
        </div>

        {/* Text content */}
        <div className="text-center relative z-20">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 font-serif">
            SphereLearn
          </h1>
          <p className="text-xl text-white/90 mb-6">
            Powered by Examply
          </p>
          <div className="flex items-center justify-center gap-2 text-white/80">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <span className="text-sm">Loading your learning experience</span>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotateX(0deg) rotateY(0deg); }
          to { transform: rotateX(360deg) rotateY(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [showSplash, setShowSplash] = useState(true);

  const pricing = {
    monthly: {
      starter: 0,
      professional: 9.99,
      premium: 19.99,
    },
    yearly: {
      starter: 0,
      professional: 99.9,
      premium: 199.9,
    },
  };

  const features = [
    {
      icon: Wifi,
      title: "Offline AI (fflie ai)",
      description:
        "Revolutionary offline AI technology that works without internet. Study anywhere, anytime with instant AI-powered responses and guidance.",
    },
    {
      icon: Lock,
      title: "Privacy-First Learning",
      description:
        "Your data stays on your device. No cloud dependency, no tracking. Complete control over your learning data.",
    },
    {
      icon: Download,
      title: "Offline Access",
      description:
        "Download practice packs and study anywhere, anytime. Perfect for students without constant internet.",
    },
    {
      icon: BookOpen,
      title: "Comprehensive Coverage",
      description:
        "Practice papers from 2010-2025 across JAMB, WAEC, and NECO exams with detailed solutions.",
    },
    {
      icon: Brain,
      title: "AI-Powered Tutor",
      description:
        "Professor AI provides personalized guidance, answers questions, and explains complex concepts.",
    },
    {
      icon: Zap,
      title: "Smart Quiz Mode",
      description:
        "Study Rand randomizes questions to test your knowledge comprehensively and identify weak areas.",
    },
  ];

  const offlineAIBenefits = [
    {
      icon: Cpu,
      title: "Lightning Fast",
      description: "No network latency. Get instant responses from your offline AI tutor.",
    },
    {
      icon: Lock,
      title: "100% Private",
      description: "All processing happens locally. Your learning data never leaves your device.",
    },
    {
      icon: Wifi,
      title: "Works Anywhere",
      description: "Study in remote areas, on flights, or anywhere without internet connectivity.",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: pricing[billingCycle].starter,
      description: "Perfect for exploring Examply",
      features: [
        "Access to sample practice papers",
        "Basic subject browsing",
        "Limited AI tutor queries",
        "Mobile app access",
      ],
      highlighted: false,
    },
    {
      name: "Professional",
      price: pricing[billingCycle].professional,
      description: "Ideal for serious exam prep",
      features: [
        "All Starter features",
        "Full access to all practice papers (2010-2025)",
        "Unlimited AI tutor access",
        "Offline download capability",
        "Offline AI (fflie ai) access",
        "Progress tracking",
        "Study Rand unlimited access",
      ],
      highlighted: true,
    },
    {
      name: "Premium",
      price: pricing[billingCycle].premium,
      description: "Complete exam mastery",
      features: [
        "All Professional features",
        "Advanced offline AI features",
        "Personalized study plans",
        "Performance analytics",
        "Priority AI tutor support",
        "Group study features",
        "Exam prediction tools",
        "Exclusive webinars & tips",
      ],
      highlighted: false,
    },
  ];

  const examStats = [
    { exam: "JAMB", coverage: "95%", students: "50K+" },
    { exam: "WAEC", coverage: "92%", students: "35K+" },
    { exam: "NECO", coverage: "88%", students: "25K+" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* 3D Splash Screen */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-foreground">SphereLearn</span>
              <span className="text-xs text-muted-foreground">Examply</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground hover:text-primary transition">
              Features
            </a>
            <a href="#offline-ai" className="text-foreground hover:text-primary transition">
              Offline AI
            </a>
            <a href="#pricing" className="text-foreground hover:text-primary transition">
              Pricing
            </a>
          </div>
          <Button className="bg-accent hover:bg-accent/90">Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 opacity-40">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663665862886/bvDm7qyvJHJUGnifDD2Azk/examply-hero-bg-Lx9PVf7WAeuUQwaMVmESUQ.webp"
            alt="Hero background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-accent/10 rounded-full border border-accent/30">
                <span className="text-accent text-sm font-semibold">
                  Trusted by 110K+ Students
                </span>
              </div>

              <h1 className="text-foreground leading-tight">
                Master Your Exams with{" "}
                <span className="text-primary">Examply</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg">
                The smartest way to prepare for WAEC, JAMB & NECO. Download practice packs, study offline with AI-powered guidance, and ace your exams. Powered by SphereLearn's revolutionary offline AI technology.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Start Free Trial
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-8 text-sm">
                <div>
                  <div className="font-bold text-foreground">15+</div>
                  <div className="text-muted-foreground">Years of Papers</div>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div>
                  <div className="font-bold text-foreground">1000+</div>
                  <div className="text-muted-foreground">Practice Questions</div>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div>
                  <div className="font-bold text-foreground">24/7</div>
                  <div className="text-muted-foreground">Offline AI Support</div>
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663665862886/bvDm7qyvJHJUGnifDD2Azk/examply-exam-categories-VwonQyxUKmnXZxznwdPxNu.webp"
                alt="Exam categories"
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Offline AI Highlight Section */}
      <section id="offline-ai" className="py-20 bg-gradient-to-r from-primary/5 to-accent/5 border-y border-border">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-accent/20 rounded-full border border-accent/50 mb-4">
              <span className="text-accent text-sm font-semibold">Revolutionary Technology</span>
            </div>
            <h2 className="text-foreground mb-4">Offline AI (fflie ai) - The Future of Learning</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the power of AI that works without internet. Study anywhere, anytime with instant responses and complete privacy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {offlineAIBenefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <Card key={idx} className="p-8 border-accent/30 bg-white hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </Card>
              );
            })}
          </div>

          <div className="bg-white rounded-xl p-8 md:p-12 border border-accent/20">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Why Offline AI Matters</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">No internet required - study in any location</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">Lightning-fast responses with zero latency</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">Complete data privacy - nothing stored in cloud</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">Works on low-bandwidth connections</span>
                  </li>
                </ul>
              </div>
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663665862886/bvDm7qyvJHJUGnifDD2Azk/examply-student-success-mRp3kmtzNUC9rXn5iqpkL8.webp"
                alt="Offline AI benefits"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-foreground mb-4">Why Choose Examply?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive exam preparation tools designed specifically for West African students, powered by SphereLearn's cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={idx}
                  className="p-8 hover:shadow-lg transition-shadow duration-300 border-border"
                >
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Exam Coverage Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-foreground mb-4">Comprehensive Exam Coverage</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access thousands of practice questions and past papers across all major West African exams
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {examStats.map((stat, idx) => (
              <Card key={idx} className="p-8 text-center border-border">
                <h3 className="text-2xl font-bold text-primary mb-2">
                  {stat.exam}
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-3xl font-bold text-accent">
                      {stat.coverage}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Question Coverage
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {stat.students}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Active Students
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-foreground mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Choose the plan that fits your exam prep needs
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 bg-secondary rounded-full p-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white text-primary shadow-md"
                    : "text-muted-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  billingCycle === "yearly"
                    ? "bg-white text-primary shadow-md"
                    : "text-muted-foreground"
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-accent text-white px-2 py-1 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, idx) => (
              <Card
                key={idx}
                className={`p-8 flex flex-col transition-all duration-300 ${
                  plan.highlighted
                    ? "border-2 border-accent shadow-xl scale-105 md:scale-100 md:ring-2 md:ring-accent/20"
                    : "border-border"
                }`}
              >
                {plan.highlighted && (
                  <div className="mb-4 inline-block">
                    <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary">
                    ₦{plan.price.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    /{billingCycle === "monthly" ? "month" : "year"}
                  </span>
                </div>

                <Button
                  className={`w-full mb-8 ${
                    plan.highlighted
                      ? "bg-accent hover:bg-accent/90 text-white"
                      : "bg-primary hover:bg-primary/90 text-white"
                  }`}
                >
                  Get Started
                </Button>

                <div className="space-y-4 flex-1">
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-foreground text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              All plans include 14-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663665862886/bvDm7qyvJHJUGnifDD2Azk/examply-learning-pattern-7XZMxrZqe6twvQiY26TP3H.webp"
            alt="Pattern"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container relative z-10 text-center">
          <h2 className="mb-4 text-white">Ready to Master Your Exams?</h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            Join over 110,000 students who are already preparing smarter with Examply, powered by SphereLearn's offline AI technology
          </p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 font-semibold"
          >
            Start Your Free Trial Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="font-bold text-foreground">SphereLearn</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The smartest way to prepare for West African exams with offline AI technology.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Exams</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition">
                    JAMB
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    WAEC
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    NECO
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>
              © 2026 SphereLearn. All rights reserved. Examply - Helping students succeed across West Africa.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
