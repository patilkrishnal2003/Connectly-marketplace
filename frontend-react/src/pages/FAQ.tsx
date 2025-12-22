import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Sparkles, Search, MessageCircle, Zap, Shield, CreditCard, Users } from "lucide-react";
import BackToHomeButton from "../components/BackToHomeButton";
import Footer from "../components/Footer";
import HeroNavbar from "../components/HeroNavbar";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    { name: "All", icon: Sparkles },
    { name: "Getting Started", icon: Zap },
    { name: "Pricing", icon: CreditCard },
    { name: "Security", icon: Shield },
    { name: "Account", icon: Users },
    { name: "Support", icon: MessageCircle },
  ];

  const faqs: FAQItem[] = [
    {
      category: "Getting Started",
      question: "What is Connecttly and how does it work?",
      answer: "Connecttly is a marketplace for startup perks that gives you access to exclusive deals from 200+ SaaS providers. Simply sign up, browse available deals, and claim the ones that fit your business needs. Each deal is verified and provides significant savings on tools and services essential for growing your startup."
    },
    {
      category: "Getting Started",
      question: "How do I claim a deal on Connecttly?",
      answer: "Claiming a deal is simple! Browse our marketplace, find a deal you're interested in, and click 'Claim Deal'. You'll be guided through a quick verification process to confirm your startup status, and then you'll receive instructions on how to redeem your exclusive offer with the partner."
    },
    {
      category: "Getting Started",
      question: "What types of startups are eligible for these deals?",
      answer: "Most deals are available to startups at various stages - from pre-seed to Series A and beyond. Some deals may have specific requirements like funding stage, company age, or team size. Each deal listing clearly shows any eligibility requirements before you claim it."
    },
    {
      category: "Pricing",
      question: "Is Connecttly free to use?",
      answer: "We offer both free and premium tiers. Our free tier gives you access to a curated selection of deals, while our Pro plan unlocks the full marketplace with 200+ exclusive deals, priority support, and additional perks worth over $100,000 in savings."
    },
    {
      category: "Pricing",
      question: "What's included in the Pro plan?",
      answer: "The Pro plan includes unlimited access to all 200+ deals, exclusive Pro-only offers, priority customer support, early access to new deals, personalized deal recommendations, and a dedicated account manager for enterprise-level support."
    },
    {
      category: "Pricing",
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. If you cancel, you'll continue to have access to your plan's benefits until the end of your current billing period. Any deals you've already claimed will remain active according to their individual terms."
    },
    {
      category: "Security",
      question: "How does Connecttly protect my data?",
      answer: "We take security seriously. All data is encrypted in transit and at rest using industry-standard AES-256 encryption. We're SOC 2 Type II certified and undergo regular security audits. We never share your personal information with third parties without your explicit consent."
    },
    {
      category: "Security",
      question: "Is my payment information safe?",
      answer: "Absolutely. We use Stripe for payment processing, which is PCI DSS Level 1 certified - the highest level of certification in the payments industry. We never store your full credit card details on our servers."
    },
    {
      category: "Account",
      question: "How do I update my account information?",
      answer: "You can update your account information by logging into your dashboard and navigating to Settings > Account. From there, you can update your profile, company information, email preferences, and billing details."
    },
    {
      category: "Account",
      question: "Can I have multiple team members on one account?",
      answer: "Yes! Our Pro plan supports unlimited team members. You can invite colleagues to your workspace, manage permissions, and collaborate on finding the best deals for your startup. Each team member gets their own login credentials."
    },
    {
      category: "Support",
      question: "How can I contact customer support?",
      answer: "We offer multiple support channels: Live chat available 24/7 for Pro members, email support with response within 24 hours, and an extensive knowledge base with guides and tutorials. Pro members also get access to priority support with faster response times."
    },
    {
      category: "Support",
      question: "What if a deal doesn't work as expected?",
      answer: "If you encounter any issues with a claimed deal, our support team is here to help. Contact us within 30 days of claiming a deal, and we'll work directly with the partner to resolve any issues. We're committed to ensuring you get the full value of every deal you claim."
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeroNavbar />

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 overflow-hidden bg-gradient-hero text-slate-900 md:pt-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/12 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/12 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="absolute top-6 right-6">
            <BackToHomeButton />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <MessageCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Help Center</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Find answers to common questions about Connecttly. Can't find what you're looking for? 
            Our support team is always here to help.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>
      </section>

      <main className="flex-1">
        {/* Category Pills */}
        <section className="py-8 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.name}
                    onClick={() => setActiveCategory(category.name)}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                      activeCategory === category.name
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "bg-card border border-border/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl border transition-all duration-300 ${
                      openIndex === index
                        ? "bg-card border-primary/30 shadow-lg shadow-primary/5"
                        : "bg-card/50 border-border/50 hover:border-border"
                    }`}
                  >
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full flex items-center justify-between p-6 text-left"
                    >
                      <div className="flex items-start gap-4 pr-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <span className="text-xs font-medium text-primary/70 uppercase tracking-wider">
                            {faq.category}
                          </span>
                          <h3 className="text-lg font-semibold text-foreground mt-1">
                            {faq.question}
                          </h3>
                        </div>
                      </div>
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        openIndex === index
                          ? "bg-primary text-primary-foreground rotate-180"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {openIndex === index ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </button>
                    
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-6 pb-6 pl-18">
                        <div className="pl-12 border-l-2 border-primary/20">
                          <p className="text-muted-foreground leading-relaxed pl-4">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-card to-accent/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-card rounded-3xl border border-border/50 p-8 md:p-12 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Still have questions?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Our support team is available 24/7 to help you with any questions or concerns. 
                We typically respond within a few hours.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="mailto:support@connecttly.com"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact Support
                </a>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-card border border-border text-foreground font-semibold hover:bg-accent transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
