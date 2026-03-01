import { SiteHeader } from "@/components/ui/site-header";
import { FAQSection } from "@/components/ui/faq-section";
import { WhatsAppWidget } from "@/components/ui/whatsapp-widget";
import { LearningMethodsSection } from "@/components/ui/learning-methods-section";
import Image from "next/image";
import Link from "next/link";
import { PlayCircle, ArrowRight, Phone, Mail, MapPin } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-[#1d1d1f] dark:text-gray-100 antialiased overflow-x-hidden font-display min-h-screen">
      <SiteHeader />

      {/* Hero Section */}
      <section className="hero-gradient pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="max-w-[960px] mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] animate-slide-up">
            Empowering Professionals. <br />
            <span className="text-primary">Redefining Legal Excellence.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto mb-10 animate-slide-up-delay-1">
            Elite legal training designed for the next generation of practitioners.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up-delay-2">
            <Link
              href="/courses"
              className="bg-primary text-white text-base font-bold px-8 py-4 rounded-full min-w-[200px] hover:shadow-lg hover:scale-105 transition-all text-center"
            >
              Explore Courses
            </Link>
            <button className="flex items-center gap-2 text-primary text-base font-semibold hover:underline group">
              Watch the film <PlayCircle className="size-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Partners Strip */}
      <section id="partners" className="py-12 bg-white dark:bg-background-dark border-y border-gray-100 dark:border-gray-800 animate-fade-in">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 text-center mb-8">Trusted by Leading Firms Worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-20 text-gray-500 dark:text-gray-400 transition-all duration-500 hover:text-gray-900 dark:hover:text-white stagger-children">
            <div className="flex items-center gap-2 hover:scale-110 transition-transform cursor-default">
              <span className="material-symbols-outlined text-3xl">account_balance</span>
              <span className="font-bold text-lg">LEXINGTON</span>
            </div>
            <div className="flex items-center gap-2 hover:scale-110 transition-transform cursor-default">
              <span className="material-symbols-outlined text-3xl">gavel</span>
              <span className="font-bold text-lg">JUSTICE CO</span>
            </div>
            <div className="flex items-center gap-2 hover:scale-110 transition-transform cursor-default">
              <span className="material-symbols-outlined text-3xl">shield_with_heart</span>
              <span className="font-bold text-lg">PROTECT</span>
            </div>
            <div className="flex items-center gap-2 hover:scale-110 transition-transform cursor-default">
              <span className="material-symbols-outlined text-3xl">domain</span>
              <span className="font-bold text-lg">GLOBAL LAW</span>
            </div>
          </div>
        </div>
      </section>

      {/* Exclusive Courses Grid */}
      <section className="py-24 px-6 bg-[#fbfbfb] dark:bg-[#151d28]">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Curated Excellence</h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Master the complexities of modern law with our exclusive masterclasses.</p>
            </div>
            <Link className="text-primary font-semibold hover:underline hidden md:flex items-center gap-1 group" href="/courses">
              View all courses <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {[
              {
                tag: "Foundations",
                title: "Corporate Law Mastery",
                desc: "Navigating mergers, acquisitions, and cross-border governance.",
                img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop"
              },
              {
                tag: "Advanced",
                title: "Litigation Strategy",
                desc: "Mastering the art of persuasion and trial tactics.",
                img: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop"
              },
              {
                tag: "Specialized",
                title: "Intellectual Property",
                desc: "Protecting innovation in the age of global digital disruption.",
                img: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=800&auto=format&fit=crop"
              },
              {
                tag: "Innovation",
                title: "Legal Tech & AI",
                desc: "Leveraging automation and data to streamline legal workflows.",
                img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop"
              }
            ].map((course, i) => (
              <Link key={i} href="/courses" className="group apple-shadow bg-white dark:bg-gray-900 rounded-xl overflow-hidden block">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <Image
                    src={course.img}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="p-6">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 block">{course.tag}</span>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{course.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Features Section */}
      <section className="py-24 px-6 bg-white dark:bg-background-dark">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {/* Large Feature */}
            <div className="md:col-span-2 bg-[#f5f5f7] dark:bg-gray-900 rounded-3xl p-10 flex flex-col justify-between min-h-[400px] border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-500 group">
              <div>
                <h3 className="text-4xl font-bold tracking-tight mb-4 group-hover:text-primary transition-colors">Elite Mentorship</h3>
                <p className="text-lg text-gray-500 max-w-sm">One-on-one sessions with partners from tier-1 global law firms.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary">groups</span>
                </div>
                <span className="font-bold">Connect with experts</span>
              </div>
            </div>
            {/* Small Feature 1 */}
            <div className="bg-primary text-white rounded-3xl p-10 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 animate-pulse-soft">
              <span className="material-symbols-outlined text-4xl animate-float">verified</span>
              <div>
                <h3 className="text-2xl font-bold mb-2">Certified Excellence</h3>
                <p className="text-white/80 text-sm">Official CLE credits recognized across all major jurisdictions.</p>
              </div>
            </div>
            {/* Small Feature 2 */}
            <div className="bg-black text-white dark:bg-gray-800 rounded-3xl p-10 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
              <span className="material-symbols-outlined text-4xl">distance</span>
              <div>
                <h3 className="text-2xl font-bold mb-2">Hybrid Learning</h3>
                <p className="text-white/60 text-sm">Flexible digital content paired with intensive in-person workshops.</p>
              </div>
            </div>
            {/* Medium Feature */}
            <div className="md:col-span-2 bg-[#f5f5f7] dark:bg-gray-900 rounded-3xl p-10 flex items-center gap-10 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-500 group">
              <div className="hidden sm:flex w-48 h-48 bg-primary/20 rounded-2xl items-center justify-center group-hover:bg-primary/30 transition-colors">
                <span className="material-symbols-outlined text-6xl text-primary group-hover:scale-110 transition-transform">school</span>
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-4 group-hover:text-primary transition-colors">Career Acceleration</h3>
                <p className="text-gray-500 mb-6">Our alumni have seen a 40% increase in placement at magic circle firms.</p>
                <button className="text-primary font-bold hover:underline group/btn flex items-center gap-1">
                  Read the success stories <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Methods Narratives */}
      <LearningMethodsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <footer className="bg-background-light dark:bg-background-dark pt-20 pb-10 px-6 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">balance</span>
                </div>
                <div>
                  <span className="font-bold text-lg tracking-tight">Renjana</span>
                  <p className="text-[10px] text-gray-500">Elite Legal Training</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Redefining the standard of legal education through innovation and expert-led training.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mb-6">Explore</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link className="hover:text-primary transition-colors" href="/courses">All Courses</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Masterclasses</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Corporate Training</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Certifications</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mb-6">Company</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link className="hover:text-primary transition-colors" href="/about-us">About Us</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/career">Careers</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/#partners">Partners</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Press Kit</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mb-6">Contact</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>+62 812-3456-7890</span>
                </li>
                <li className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>info@renjana.com</span>
                </li>
                <li className="flex items-start gap-3 text-gray-500 dark:text-gray-400">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Jakarta, Indonesia</span>
                </li>
              </ul>
            </div>
            <div className="col-span-2 lg:col-span-1">
              <h4 className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mb-6">Stay Updated</h4>
              <form className="flex gap-2 mb-4">
                <input
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-sm w-full focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="Email"
                  type="email"
                />
                <button className="bg-black dark:bg-white text-white dark:text-black p-2 rounded-lg hover:scale-110 transition-transform flex items-center justify-center">
                  <ArrowRight className="size-4" />
                </button>
              </form>
              <p className="text-xs text-gray-400">Subscribe for updates on new courses and events.</p>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">Copyright © {new Date().getFullYear()} Renjana Legal. All rights reserved.</p>
            <div className="flex gap-6">
              <Link className="text-gray-400 hover:text-primary hover:scale-110 transition-all" href="#"><span className="material-symbols-outlined text-xl">brand_family</span></Link>
              <Link className="text-gray-400 hover:text-primary hover:scale-110 transition-all" href="#"><span className="material-symbols-outlined text-xl">share</span></Link>
              <Link className="text-gray-400 hover:text-primary hover:scale-110 transition-all" href="#"><span className="material-symbols-outlined text-xl">public</span></Link>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Widget */}
      <WhatsAppWidget />
    </div>
  );
}
