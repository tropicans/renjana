import { SiteHeader } from "@/components/ui/site-header";
import Link from "next/link";
import { ArrowRight, MapPin, Briefcase, Clock, BookOpen, Users, TrendingUp } from "lucide-react";

const openPositions = [
  {
    title: "Legal Trainer",
    department: "Training",
    location: "Jakarta",
    type: "Full-time",
    description: "Deliver high-quality legal training programs and develop course materials for law professionals."
  },
  {
    title: "Course Coordinator",
    department: "Operations",
    location: "Remote",
    type: "Full-time",
    description: "Coordinate training programs, manage schedules, and ensure smooth delivery of courses."
  },
  {
    title: "Business Development",
    department: "Sales",
    location: "Jakarta",
    type: "Full-time",
    description: "Drive partnerships and expand our client base through strategic business development initiatives."
  },
  {
    title: "Content Writer",
    department: "Marketing",
    location: "Remote",
    type: "Part-time",
    description: "Create engaging content for our courses, marketing materials, and digital platforms."
  }
];

export default function CareerPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#111418] dark:text-white antialiased">
      <SiteHeader />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-[800px] mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">Join Our Team</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium mb-10">
              Build your career with Renjana and help empower legal professionals across Indonesia.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="#positions"
                className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-all"
              >
                View Open Positions
              </Link>
              <Link
                href="#contact"
                className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-8 py-4 rounded-full font-bold hover:border-primary/50 transition-all"
              >
                Send Your CV
              </Link>
            </div>
          </div>
        </section>

        {/* Why Join Us */}
        <section className="py-24 px-6 bg-white dark:bg-[#0a0f14]">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Why Work at Renjana?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background-light dark:bg-[#1a242f] p-10 rounded-2xl border border-gray-100 dark:border-gray-800 text-center hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <BookOpen className="size-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Continuous Learning</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Access to professional development programs and legal training resources.</p>
              </div>
              <div className="bg-background-light dark:bg-[#1a242f] p-10 rounded-2xl border border-gray-100 dark:border-gray-800 text-center hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Users className="size-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Collaborative Environment</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Work with passionate professionals committed to excellence in legal education.</p>
              </div>
              <div className="bg-background-light dark:bg-[#1a242f] p-10 rounded-2xl border border-gray-100 dark:border-gray-800 text-center hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <TrendingUp className="size-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Growth Opportunities</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Clear career progression paths and opportunities for advancement.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section id="positions" className="py-24 px-6 bg-background-light dark:bg-background-dark">
          <div className="max-w-[1000px] mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Open Positions</h2>
            <p className="text-gray-500 text-center mb-16 max-w-2xl mx-auto">
              Explore our current job openings and find the perfect role to advance your career.
            </p>

            <div className="space-y-6">
              {openPositions.map((position, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-[#1a242f] rounded-2xl border border-gray-100 dark:border-gray-800 p-8 hover:border-primary/50 transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{position.title}</h3>
                      <p className="text-gray-500 text-sm mb-4">{position.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {position.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {position.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {position.type}
                        </span>
                      </div>
                    </div>
                    <Link
                      href="#contact"
                      className="bg-primary/10 text-primary px-6 py-3 rounded-full font-bold text-sm hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                    >
                      Apply Now <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 px-6 bg-white dark:bg-[#0a0f14]">
          <div className="max-w-[600px] mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Don&apos;t see the right fit?</h2>
            <p className="text-gray-500 mb-10">
              We&apos;re always looking for talented individuals to join our team. Send us your CV and we&apos;ll keep you in mind for future opportunities.
            </p>
            <div className="bg-background-light dark:bg-[#1a242f] rounded-2xl border border-gray-100 dark:border-gray-800 p-10">
              <span className="material-symbols-outlined text-5xl text-primary mb-4">mail</span>
              <h3 className="font-bold text-lg mb-2">Submit Your Application</h3>
              <p className="text-gray-500 text-sm mb-6">
                Email your CV to: <span className="text-primary font-semibold">careers@renjanahp.com</span>
              </p>
              <Link
                href="mailto:careers@renjanahp.com"
                className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-all inline-flex items-center gap-2"
              >
                Send Email <ArrowRight className="size-4" />
              </Link>
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
