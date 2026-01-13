"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: "What is Renjana?",
        answer: "Renjana is a professional training provider specializing in law education and development. We deliver tailored programs to help individuals and organizations enhance their legal knowledge and skills."
    },
    {
        question: "How are the training sessions conducted?",
        answer: "We offer both virtual and in-person training sessions, ensuring flexibility to accommodate your schedule and location. Our hybrid learning approach combines digital content with intensive workshops."
    },
    {
        question: "What types of law training programs do you offer?",
        answer: "We offer training on Corporate Law, Litigation Strategy, Intellectual Property, Legal Tech & AI, Contract Drafting, and more. You can access our Learning Management System with flexible study hours."
    },
    {
        question: "Who can join Renjana's training programs?",
        answer: "Our training programs are open to legal professionals, law students, corporate professionals, and organizations looking to enhance their expertise in various areas of law."
    },
    {
        question: "Do you provide certifications?",
        answer: "Yes! We provide official CLE credits and certifications recognized across major jurisdictions. Our certified programs are designed to boost your professional credentials."
    },
    {
        question: "How can I contact Renjana?",
        answer: "You can reach us via email at info@renjana.com, WhatsApp us at +62 812-3456-7890, or fill out the contact form on our website. Our team typically responds within 24 hours."
    }
];

function FAQAccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
    return (
        <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
            <button
                onClick={onToggle}
                className="w-full py-6 flex items-center justify-between text-left group"
            >
                <span className="font-bold text-lg group-hover:text-primary transition-colors pr-8">
                    {item.question}
                </span>
                <ChevronDown
                    className={cn(
                        "h-5 w-5 text-gray-400 transition-transform duration-300 shrink-0",
                        isOpen && "rotate-180 text-primary"
                    )}
                />
            </button>
            <div
                className={cn(
                    "overflow-hidden transition-all duration-300",
                    isOpen ? "max-h-96 pb-6" : "max-h-0"
                )}
            >
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                    {item.answer}
                </p>
            </div>
        </div>
    );
}

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 px-6 bg-[#fbfbfb] dark:bg-[#151d28]">
            <div className="max-w-[800px] mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="text-primary text-sm font-bold uppercase tracking-widest">FAQ</span>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-4 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        Everything you need to know about our training programs
                    </p>
                </div>

                {/* Accordion */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                    {faqs.map((faq, index) => (
                        <FAQAccordionItem
                            key={index}
                            item={faq}
                            isOpen={openIndex === index}
                            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-10">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Still have questions?
                    </p>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
                    >
                        Contact our team →
                    </a>
                </div>
            </div>
        </section>
    );
}
