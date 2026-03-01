import { BookOpen, Laptop, Users, Building, GraduationCap, Zap } from "lucide-react";

export function LearningMethodsSection() {
    return (
        <section className="py-24 px-6 bg-[#fbfbfb] dark:bg-[#151d28] border-y border-gray-100 dark:border-gray-800">
            <div className="max-w-[1200px] mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4 block">Ekosistem Pembelajaran</span>
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
                        LMS & LXP Terintegrasi
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl font-medium leading-relaxed">
                        Renjana tidak sekadar menyajikan kelas. Kami menggabungkan ketangguhan <strong className="text-gray-900 dark:text-white">Learning Management System (LMS)</strong> untuk struktur kurikulum formal, dengan fleksibilitas <strong className="text-gray-900 dark:text-white">Learning Experience Platform (LXP)</strong> yang adaptif, memungkinkan pengalaman belajar digital, mandiri, dan fleksibel sesuai kebutuhan karier Anda.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
                    {/* Mandiri */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl apple-shadow border border-gray-100 dark:border-gray-800 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6">
                            <BookOpen className="text-blue-600 dark:text-blue-400 size-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Mandiri (Self-Paced)</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                            Kendalikan waktu Anda. Akses materi digital berkualitas tinggi, artikel, dan video pembelajaran kapan saja, di mana saja, tanpa terikat jadwal kelas.
                        </p>
                    </div>

                    {/* Daring / Online */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl apple-shadow border border-gray-100 dark:border-gray-800 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-6">
                            <Laptop className="text-indigo-600 dark:text-indigo-400 size-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Online (Daring)</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                            Interaksi tatap muka *virtual* secara langsung via Zoom atau platform *meeting* lainnya. Diskusi interaktif dengan mentor top dari seluruh Indonesia.
                        </p>
                    </div>

                    {/* Luring / Offline */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl apple-shadow border border-gray-100 dark:border-gray-800 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6">
                            <Building className="text-emerald-600 dark:text-emerald-400 size-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Offline (Luring)</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                            Pelatihan intensif di lokasi nyata bersama pakar. Validasi absensi ketat via GPS di *venue* untuk sertifikat, seperti PKPA atau pelatihan lisensi eksklusif.
                        </p>
                    </div>

                    {/* Hybrid */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl apple-shadow border border-gray-100 dark:border-gray-800 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center mb-6">
                            <Users className="text-rose-600 dark:text-rose-400 size-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Hybrid Learning</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                            Solusi paripurna yang menggabungkan kemudahan modul *online* / mandiri dengan *workshop* luring mendalam.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
