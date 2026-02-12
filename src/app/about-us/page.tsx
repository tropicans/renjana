import { SiteHeader } from "@/components/ui/site-header";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#111418] dark:text-white antialiased">
            <SiteHeader />

            <main>
                {/* Hero Section */}
                <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-black/30 z-10"></div>
                        <Image
                            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1920&auto=format&fit=crop"
                            alt="Modern minimalist architectural interior"
                            fill
                            sizes="100vw"
                            className="object-cover scale-105"
                        />
                    </div>
                    <div className="relative z-20 text-center px-6 max-w-4xl">
                        <h1 className="text-white text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
                            Building Excellence, One Lesson at a Time.
                        </h1>
                        <p className="text-white/90 text-lg md:text-xl font-normal max-w-2xl mx-auto mb-10">
                            Redefining legal training through cinematic education and professional rigor.
                        </p>
                        <Link
                            href="/courses"
                            className="bg-white text-black hover:bg-gray-100 px-8 py-4 rounded-full text-base font-bold transition-all inline-flex items-center gap-2"
                        >
                            Explore the Vision
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                        <span className="material-symbols-outlined text-white text-3xl">keyboard_double_arrow_down</span>
                    </div>
                </section>

                {/* Mission Statement */}
                <section className="py-24 md:py-40 px-6">
                    <div className="max-w-[800px] mx-auto text-center">
                        <h2 className="text-[#111418] dark:text-white text-4xl md:text-5xl font-bold tracking-tight mb-8">Our Mission</h2>
                        <div className="w-20 h-1 bg-primary mx-auto mb-12"></div>
                        <p className="text-lg md:text-2xl leading-relaxed text-gray-600 dark:text-gray-400 font-light italic">
                            &ldquo;Renjana was born from the belief that legal education should be as compelling as it is rigorous. We combine architectural precision with academic depth to create a learning experience that empowers the next generation of legal professionals.&rdquo;
                        </p>
                    </div>
                </section>

                {/* Full Bleed Breakout */}
                <section className="w-full h-[60vh] md:h-[80vh] overflow-hidden">
                    <div
                        className="w-full h-full bg-fixed bg-center bg-cover"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1568992687947-868a62a9f521?q=80&w=1920&auto=format&fit=crop')" }}
                    ></div>
                </section>

                {/* Content Section: The Philosophy */}
                <section className="py-24 md:py-40 px-6 bg-white dark:bg-[#0a0f14]">
                    <div className="max-w-[1000px] mx-auto grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <span className="text-primary font-bold tracking-widest text-xs uppercase">The Philosophy</span>
                            <h2 className="text-4xl font-bold tracking-tight">Cinematic Learning</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                                We believe that the medium is as important as the message. Our courses are produced with high-fidelity cinematography, ensuring that complex legal concepts are visually mapped and emotionally resonant.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="text-primary mt-1 size-5" />
                                    <span className="text-gray-800 dark:text-gray-200">High-definition instructional modules</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="text-primary mt-1 size-5" />
                                    <span className="text-gray-800 dark:text-gray-200">Expert-led case study breakdowns</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="text-primary mt-1 size-5" />
                                    <span className="text-gray-800 dark:text-gray-200">Interactive architectural visualizers</span>
                                </li>
                            </ul>
                        </div>
                        <div className="rounded-xl overflow-hidden shadow-2xl">
                            <Image
                                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop"
                                alt="Professional legal documents"
                                width={800}
                                height={1000}
                                className="w-full h-auto aspect-[4/5] object-cover"
                            />
                        </div>
                    </div>
                </section>

                {/* Spec Cards Section */}
                <section className="py-24 md:py-40 px-6 bg-background-light dark:bg-background-dark">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl font-bold tracking-tight mb-4">The Standard</h2>
                            <p className="text-gray-500">Every module is built to exacting professional specifications.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Spec Card 1 */}
                            <div className="bg-white dark:bg-[#1a242f] p-10 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center group hover:shadow-xl transition-all">
                                <span className="material-symbols-outlined text-4xl text-primary mb-6">verified_user</span>
                                <h3 className="text-xl font-bold mb-4">Accreditation</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">Recognized by major bar associations for continuing legal education credits nationwide.</p>
                            </div>
                            {/* Spec Card 2 */}
                            <div className="bg-white dark:bg-[#1a242f] p-10 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center group hover:shadow-xl transition-all">
                                <span className="material-symbols-outlined text-4xl text-primary mb-6">model_training</span>
                                <h3 className="text-xl font-bold mb-4">Interactive Design</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">Dynamic testing modules that adapt to your knowledge gaps in real-time.</p>
                            </div>
                            {/* Spec Card 3 */}
                            <div className="bg-white dark:bg-[#1a242f] p-10 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center group hover:shadow-xl transition-all">
                                <span className="material-symbols-outlined text-4xl text-primary mb-6">history_edu</span>
                                <h3 className="text-xl font-bold mb-4">Expert Curation</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">Curriculum designed by top-tier legal architects and practicing partners.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Banner */}
                <section className="relative h-[50vh] flex items-center justify-center">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-black/50 z-10"></div>
                        <Image
                            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1920&auto=format&fit=crop"
                            alt="Abstract architectural glass patterns"
                            fill
                            sizes="100vw"
                            className="object-cover"
                        />
                    </div>
                    <div className="relative z-20 text-center px-6">
                        <h2 className="text-white text-3xl md:text-5xl font-bold tracking-tight mb-6">Join the Elite.</h2>
                        <Link
                            href="/register"
                            className="bg-primary text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-primary/90 transition-all"
                        >
                            Apply for Membership
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-white dark:bg-background-dark py-20 px-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="size-5 text-primary">
                                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                        <path clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fillRule="evenodd"></path>
                                    </svg>
                                </div>
                                <span className="text-xl font-bold tracking-tight text-black dark:text-white">Renjana</span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                The future of legal education, defined by architectural rigor and cinematic excellence.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Platform</h4>
                            <ul className="space-y-4 text-sm text-gray-500">
                                <li><Link className="hover:text-primary transition-colors" href="/courses">Curriculum</Link></li>
                                <li><Link className="hover:text-primary transition-colors" href="#">Pricing</Link></li>
                                <li><Link className="hover:text-primary transition-colors" href="#">Enterprise</Link></li>
                                <li><Link className="hover:text-primary transition-colors" href="#">FAQ</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Company</h4>
                            <ul className="space-y-4 text-sm text-gray-500">
                                <li><Link className="hover:text-primary transition-colors" href="/about-us">About Us</Link></li>
                                <li><Link className="hover:text-primary transition-colors" href="#">Values</Link></li>
                                <li><Link className="hover:text-primary transition-colors" href="/news-and-publications">Newsroom</Link></li>
                                <li><Link className="hover:text-primary transition-colors" href="/contact">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Legal</h4>
                            <ul className="space-y-4 text-sm text-gray-500">
                                <li><Link className="hover:text-primary transition-colors" href="#">Privacy Policy</Link></li>
                                <li><Link className="hover:text-primary transition-colors" href="#">Terms of Service</Link></li>
                                <li><Link className="hover:text-primary transition-colors" href="#">Cookie Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="max-w-[1200px] mx-auto mt-20 pt-8 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
                        © {new Date().getFullYear()} Renjana Legal Training. All rights reserved. Designed for Excellence.
                    </div>
                </footer>
            </main>
        </div>
    );
}
