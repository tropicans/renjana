"use client";

import React from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageSwitcher, useLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function SiteHeader({ className }: { className?: string }) {
    const { t } = useLanguage()
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    const menuItems = [
        { name: t.nav.courses, href: '/courses' },
        { name: 'Mentorship', href: '#' },
        { name: 'Partners', href: '/#partners' },
        { name: t.nav.about, href: '/about-us' },
    ]

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className={cn(
            "fixed top-0 w-full z-50 border-b transition-all duration-300",
            isScrolled ? "glass-nav h-14 border-gray-200/50 dark:border-gray-800/50 shadow-sm" : "bg-transparent h-16 border-transparent",
            className
        )}>
            <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
                {/* Logo */}
                <Logo size="sm" showTagline={false} />

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="text-xs font-medium text-black/70 dark:text-white/70 hover:text-primary transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    <Link href="/login" className="hidden sm:block text-xs font-medium text-black/80 dark:text-white/80 hover:text-primary transition-colors">
                        {t.nav.login}
                    </Link>
                    <Button asChild className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-opacity-90 transition-all h-9">
                        <Link href="/register">
                            {t.nav.register}
                        </Link>
                    </Button>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMenuState(!menuState)}
                        className="lg:hidden block text-black/70 dark:text-white/70"
                    >
                        {menuState ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {menuState && (
                <div className="lg:hidden fixed inset-0 top-14 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
                    <nav className="flex flex-col items-center gap-8 pt-12">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                onClick={() => setMenuState(false)}
                                className="text-lg font-medium text-black/70 dark:text-white/70 hover:text-primary"
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            href="/login"
                            onClick={() => setMenuState(false)}
                            className="text-lg font-medium text-black/70 dark:text-white/70 hover:text-primary"
                        >
                            {t.nav.login}
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    )
}
