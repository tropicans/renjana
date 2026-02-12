import { SiteHeader } from "@/components/ui/site-header";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";

const newsItems = [
  {
    id: 1,
    title: "Pelatihan Mediator Bersertifikat: Angkatan Baru Dibuka!",
    excerpt: "Ikafh Undip bekerja sama dengan Renjana membuka pendaftaran program pelatihan mediator bersertifikat angkatan baru.",
    category: "Training",
    date: "November 2024",
    author: "Renjana Team",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Mengapa Mediasi Menjadi Pilihan Utama Penyelesaian Sengketa?",
    excerpt: "Pelajari mengapa mediasi semakin populer sebagai alternatif penyelesaian sengketa yang efektif dan efisien.",
    category: "Article",
    date: "November 2024",
    author: "Legal Team",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Renjana Berkolaborasi dengan Justitia Training Center",
    excerpt: "Kerjasama strategis untuk meningkatkan kualitas pendidikan hukum di Indonesia.",
    category: "Partnership",
    date: "October 2024",
    author: "Renjana Team",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "5 Keterampilan Utama Mediator Profesional",
    excerpt: "Kuasai keterampilan esensial yang diperlukan untuk menjadi mediator yang sukses.",
    category: "Tips",
    date: "October 2024",
    author: "Training Team",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 5,
    title: "Wawancara Eksklusif: Alumni Mediator Renjana",
    excerpt: "Cerita sukses alumni program pelatihan mediator Renjana dalam praktik profesional.",
    category: "Interview",
    date: "October 2024",
    author: "Editorial Team",
    image: "https://images.unsplash.com/photo-1551288049-bbbda536639a?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 6,
    title: "Peluncuran Platform E-Learning Renjana",
    excerpt: "Platform pembelajaran online baru untuk meningkatkan aksesibilitas pendidikan hukum.",
    category: "Announcement",
    date: "October 2024",
    author: "Renjana Team",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop"
  }
];

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#111418] dark:text-white antialiased">
      <SiteHeader />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-[800px] mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">News & Publications</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
              Stay updated with the latest news, insights, and publications from Renjana.
            </p>
          </div>
        </section>

        {/* Featured News */}
        <section className="py-16 px-6 bg-white dark:bg-[#0a0f14]">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-2xl font-bold mb-8">Featured Article</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch bg-background-light dark:bg-[#1a242f] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
              <div className="aspect-video lg:aspect-auto">
                <Image
                  src={newsItems[0].image}
                  alt={newsItems[0].title}
                  width={1200}
                  height={675}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-10 flex flex-col justify-center">
                <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4 w-fit">
                  {newsItems[0].category}
                </span>
                <h3 className="text-2xl font-bold mb-4">{newsItems[0].title}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{newsItems[0].excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {newsItems[0].date}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {newsItems[0].author}
                  </span>
                </div>
                <Link
                  href={`/news/${newsItems[0].id}`}
                  className="bg-primary text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-primary/90 transition-all flex items-center gap-2 w-fit"
                >
                  Read Full Article <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* All News */}
        <section className="py-16 px-6 bg-background-light dark:bg-background-dark">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-2xl font-bold mb-8">Latest Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsItems.slice(1).map((news) => (
                <article
                  key={news.id}
                  className="group bg-white dark:bg-[#1a242f] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-primary/50 transition-all"
                >
                  <div className="aspect-video overflow-hidden">
                    <Image
                      src={news.image}
                      alt={news.title}
                      width={800}
                      height={450}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-3">
                      {news.category}
                    </span>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">{news.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{news.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{news.date}</span>
                      <Link
                        href={`/news/${news.id}`}
                        className="text-primary font-bold hover:underline"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-24 px-6 bg-white dark:bg-[#0a0f14]">
          <div className="max-w-[600px] mx-auto text-center">
            <span className="material-symbols-outlined text-5xl text-primary mb-4">newspaper</span>
            <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-gray-500 mb-10">
              Get the latest updates on legal training programs and insights delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-4 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
              <button
                type="submit"
                className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-all"
              >
                Subscribe
              </button>
            </form>
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
