"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface FAQItem {
    question: string;
    answer: string;
}

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
    const { t } = useLanguage();

    const faqs: FAQItem[] = [
        {
            question: t.home.faqQuestion1,
            answer: t.home.faqAnswer1
        },
        {
            question: t.home.faqQuestion2,
            answer: t.home.faqAnswer2
        },
        {
            question: t.home.faqQuestion3,
            answer: t.home.faqAnswer3
        },
        {
            question: t.home.faqQuestion4,
            answer: t.home.faqAnswer4
        },
        {
            question: t.home.faqQuestion5,
            answer: t.home.faqAnswer5
        },
        {
            question: t.home.faqQuestion6,
            answer: t.home.faqAnswer6
        }
    ];

    return (
        <section className="py-24 px-6 bg-[#fbfbfb] dark:bg-[#151d28]">
            <div className="max-w-[800px] mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="text-primary text-sm font-bold uppercase tracking-widest">FAQ</span>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-4 mb-4">
                        {t.home.faqTitle}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        {t.home.faqSubtitle}
                    </p>
                </div>

                {/* Accordion */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                    {faqs.map((faq, index) => (
                        <FAQAccordionItem
                            key={faq.question}
                            item={faq}
                            isOpen={openIndex === index}
                            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-10">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {t.home.faqStillQuestions}
                    </p>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
                    >
                        {t.home.faqContactTeam}
                    </a>
                </div>
            </div>
        </section>
    );
}
