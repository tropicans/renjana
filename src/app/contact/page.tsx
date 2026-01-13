import { SiteHeader } from "@/components/ui/site-header";
import Link from "next/link";
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#111418] dark:text-white antialiased">
            <SiteHeader />

            <main className="pt-20">
                {/* Hero Section */}
                <section className="py-24 px-6 text-center">
                    <div className="max-w-[800px] mx-auto">
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">Get in Touch</h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
                            Have questions about our programs? Our team is here to help you navigate your legal education journey.
                        </p>
                    </div>
                </section>

                {/* Contact Content */}
                <section className="py-16 px-6">
                    <div className="max-w-[1000px] mx-auto grid md:grid-cols-2 gap-16">
                        {/* Contact Form */}
                        <div className="bg-white dark:bg-[#1a242f] p-10 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-2xl font-bold mb-8">Send us a message</h2>
                            <form className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Your name"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Subject</label>
                                    <input
                                        type="text"
                                        placeholder="How can we help?"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Message</label>
                                    <textarea
                                        rows={5}
                                        placeholder="Tell us more about your inquiry..."
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-primary text-white py-4 rounded-full font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                >
                                    Send Message <ArrowRight className="size-4" />
                                </button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-10">
                            <div>
                                <h2 className="text-2xl font-bold mb-8">Contact Information</h2>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Mail className="size-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold mb-1">Email</h3>
                                            <p className="text-gray-500 dark:text-gray-400">info@renjanahp.com</p>
                                            <p className="text-gray-500 dark:text-gray-400">support@renjanahp.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Phone className="size-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold mb-1">Phone & WhatsApp</h3>
                                            <p className="text-gray-500 dark:text-gray-400">+62 812-3456-7890</p>
                                            <p className="text-gray-500 dark:text-gray-400">(021) 789-1234</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <MapPin className="size-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold mb-1">Office Location</h3>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                Jl. Sudirman Kav. 52-53<br />
                                                Jakarta Selatan 12190<br />
                                                Indonesia
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Map Placeholder */}
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-64 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                <div className="text-center text-gray-400">
                                    <span className="material-symbols-outlined text-4xl mb-2">map</span>
                                    <p className="text-sm">Interactive Map</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-100 dark:border-white/10 py-12 bg-white dark:bg-background-dark">
                    <div className="max-w-[1200px] mx-auto px-6 text-center">
                        <p className="text-gray-400 dark:text-gray-600 text-xs">
                            © {new Date().getFullYear()} Renjana Legal Training. All rights reserved.
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    );
}
