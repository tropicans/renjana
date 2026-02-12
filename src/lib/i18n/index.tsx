"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, translations, Translations } from './translations';

interface LanguageContextType {
    language: Language;
    t: Translations;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'renjana_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        if (typeof window === 'undefined') {
            return 'id';
        }

        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === 'id' || stored === 'en' ? stored : 'id';
    });
    const [t, setT] = useState<Translations>(() => translations[language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        setT(translations[lang]);
        localStorage.setItem(STORAGE_KEY, lang);
    };

    const toggleLanguage = () => {
        const newLang = language === 'id' ? 'en' : 'id';
        setLanguage(newLang);
    };

    return (
        <LanguageContext.Provider value={{ language, t, setLanguage, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

// Language Switcher Component
export function LanguageSwitcher({ className }: { className?: string }) {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            onClick={toggleLanguage}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 ${className}`}
            title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
        >
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                {language === 'id' ? 'ID' : 'EN'}
            </span>
            {/* Hide text on very small screens */}
            <span className="hidden sm:inline text-gray-600 dark:text-gray-400">
                {language === 'id' ? 'Bahasa' : 'English'}
            </span>
        </button>
    );
}
