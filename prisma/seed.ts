import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const mockUsers = [
    { email: "ahmad@example.com", password: "password123", fullName: "Ahmad Pratama", role: "LEARNER" as const, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad", phone: null },
    { email: "siti@example.com", password: "password123", fullName: "Siti Rahayu", role: "LEARNER" as const, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti", phone: null },
    { email: "budi@example.com", password: "password123", fullName: "Budi Santoso", role: "INSTRUCTOR" as const, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi", phone: null },
    { email: "admin@renjana.com", password: "admin123", fullName: "Admin Renjana", role: "ADMIN" as const, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin", phone: null },
    { email: "diana@example.com", password: "password123", fullName: "Diana Putri", role: "MANAGER" as const, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana", phone: null },
    { email: "eko@example.com", password: "password123", fullName: "Eko Wijaya", role: "FINANCE" as const, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eko", phone: null },
];

const mockCourses = [
    {
        title: "Dasar Hukum Perdata Indonesia",
        description: "Pengantar hukum perdata mencakup hukum keluarga, kontrak, dan properti.",
        status: "PUBLISHED" as const,
        modules: [
            { title: "Pengantar Hukum Perdata", order: 1, lessons: [{ title: "Apa itu Hukum Perdata?", type: "VIDEO", order: 1, durationMin: 15 }, { title: "Sumber-sumber Hukum Perdata", type: "READING", order: 2 }, { title: "Kuis: Pengantar", type: "QUIZ", order: 3 }] },
            { title: "Hukum Kontrak", order: 2, lessons: [{ title: "Unsur Sahnya Perjanjian", type: "VIDEO", order: 1, durationMin: 20 }, { title: "Studi Kasus Kontrak", type: "ASSIGNMENT", order: 2 }] },
        ],
    },
    {
        title: "Hukum Acara Perdata & Pidana",
        description: "Memahami prosedur beracara di pengadilan, dari gugatan hingga eksekusi putusan.",
        status: "PUBLISHED" as const,
        modules: [
            { title: "Surat Gugatan", order: 1, lessons: [{ title: "Cara Membuat Surat Gugatan", type: "VIDEO", order: 1, durationMin: 25 }] },
            { title: "Proses Persidangan", order: 2, lessons: [{ title: "Tahap-tahap Sidang Perdata", type: "VIDEO", order: 1, durationMin: 30 }, { title: "Simulasi Persidangan", type: "ASSIGNMENT", order: 2 }] },
        ],
    },
    {
        title: "Webinar PKPA & Sertifikasi Mediator",
        description: "Event offline khusus: Pendidikan Khusus Profesi Advokat dan Sertifikasi Mediator dengan lokasi terpusat di Jakarta.",
        status: "PUBLISHED" as const,
        type: "OFFLINE_EVENT" as const,
        modules: [
            { title: "Materi Pra-Event", order: 1, lessons: [{ title: "Rundown dan Tata Tertib", type: "READING", order: 1 }] },
            { title: "Pelaksanaan Event", order: 2, lessons: [{ title: "Check-in Kehadiran (Lokasi)", type: "LIVE_SESSION", order: 1 }] },
        ],
    },
];

type SeedEvent = (typeof mockEvents)[number];

const mockEvents = [
    {
        title: "PKPA FH UNDIP 2026 Batch V",
        slug: "pkpa-fh-undip-2026-batch-v",
        category: "PKPA",
        modality: "HYBRID" as const,
        summary: "Program pendidikan profesi advokat dengan alur registrasi, dokumen, pembayaran, pembelajaran, pre/post test, dan evaluasi.",
        scheduleSummary: "Mulai 2 Mei 2026 - selesai, setiap Sabtu dan Minggu.",
        registrationFee: 500000,
        onlineTuitionFee: 5250000,
        offlineTuitionFee: 5500000,
        alumniRegistrationFee: 0,
        registrationStart: new Date("2026-04-09T00:00:00.000Z"),
        registrationEnd: new Date("2026-05-01T23:59:59.000Z"),
        eventStart: new Date("2026-05-02T00:00:00.000Z"),
        location: "Fakultas Hukum UNDIP / Zoom",
        contactName: "Renjana",
        contactPhone: "081717777247",
        termsSummary: `Peserta diwajibkan menaati tata tertib selama pelatihan berlangsung.
Materi dari pengajar diberikan kepada peserta di dalam Google Drive sebelum sesi berlangsung dan hanya untuk dipelajari secara pribadi, tidak untuk disebarluaskan.
Rekaman sesi belajar hanya untuk arsip internal panitia dan tidak untuk dibagikan.
Peserta harus berpakaian rapi dan sopan selama sesi PKPA.
Nama dan memori perangkat peserta wajib dijaga dengan baik selama mengikuti sesi PKPA.
Selama pembelajaran menyala, peserta wajib menyalakan kamera dan mengikuti instruksi panitia.
Peserta dilarang meninggalkan handphone selama pelatihan berlangsung.
Minimal kehadiran untuk dapat menyelesaikan PKPA dan mendapatkan sertifikat adalah 80%.
Untuk peserta online, link Zoom Meeting dibagikan khusus untuk peserta dan panitia serta tidak diperkenankan dibagikan ke pihak lain.
Peserta wajib menggunakan nama lengkap pada Zoom masing-masing, bukan nama panggilan atau nama samaran.
Peserta yang hendak bertanya diharapkan mengangkat fitur raise hand terlebih dahulu atau menulis pertanyaan di kolom chat dengan format nama, asal instansi.
Daftar hadir peserta online dan offline diabsen setiap akhir sesi, dan peserta wajib mengisi form kehadiran.
Kehadiran dan proses check-in kehadiran melalui Google Form peserta dan pendataan kehadiran manual oleh panitia.
Peserta offline diharapkan sudah hadir di tempat PKPA paling lambat 15 menit sebelum dimulai dan mengisi daftar hadir yang disediakan.
Peserta yang akan meninggalkan ruang kelas pada saat pelatihan berlangsung harus seizin panitia.
Menjaga barang pribadi menjadi tanggung jawab masing-masing peserta.
Pelanggaran terhadap tata tertib dapat menjadi bahan pertimbangan panitia dalam pemberian sertifikat pelatihan kepada peserta yang melakukan pelanggaran tersebut.`,
        refundPolicySummary: `Dengan mengisi formulir ini, saya telah memahami bahwa pendaftaran yang saya lakukan ini tidak dapat dibatalkan.
Biaya pendaftaran yang akan dan/atau telah saya bayarkan tidak dapat dikembalikan dengan alasan apa pun kecuali tidak terlaksananya kegiatan oleh pihak penyelenggara.
Biaya tersebut tidak dapat pula dialihkan untuk dan atas nama orang lain.
Biaya tersebut tidak dapat digunakan untuk kegiatan apa pun setelah lewat tahun berjalan.`,
        status: "REGISTRATION_OPEN" as const,
        learningEnabled: true,
        preTestEnabled: true,
        postTestEnabled: true,
        evaluationEnabled: true,
        certificateEnabled: true,
        isFeatured: true,
        courseIndex: 2,
    },
    {
        title: "Workshop Legal Drafting for In-House Counsel",
        slug: "workshop-legal-drafting-in-house-counsel",
        category: "WORKSHOP",
        modality: "ONLINE" as const,
        summary: "Workshop intensif satu hari untuk memperkuat struktur kontrak dan drafting clause kritikal.",
        scheduleSummary: "Sesi intensif 1 hari via Zoom.",
        registrationFee: 250000,
        onlineTuitionFee: 1250000,
        offlineTuitionFee: null,
        alumniRegistrationFee: null,
        registrationStart: new Date("2026-06-01T00:00:00.000Z"),
        registrationEnd: new Date("2026-06-20T23:59:59.000Z"),
        eventStart: new Date("2026-06-28T00:00:00.000Z"),
        platform: "Zoom Meeting",
        contactName: "Renjana Learning Desk",
        contactPhone: "081717777247",
        status: "PUBLISHED" as const,
        learningEnabled: true,
        preTestEnabled: false,
        postTestEnabled: true,
        evaluationEnabled: true,
        certificateEnabled: true,
        isFeatured: false,
        courseIndex: 0,
    },
];

async function main() {
    console.log("🌱 Mulai seeding database Renjana LMS...\n");

    // --- Seed Users ---
    console.log("👥 Membuat users...");
    const createdUsers = [];
    for (const user of mockUsers) {
        const passwordHash = await bcrypt.hash(user.password, 10);
        const created = await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: {
                email: user.email,
                passwordHash,
                fullName: user.fullName,
                role: user.role,
                avatarUrl: user.avatarUrl,
                phone: user.phone,
            },
        });
        createdUsers.push(created);
        console.log(`   ✅ ${created.role}: ${created.fullName} (${created.email})`);
    }

    // --- Seed Courses ---
    console.log("\n📚 Membuat courses dan modules...");
    const createdCourses = [];
    for (const courseData of mockCourses) {
        const course = await prisma.course.create({
            data: {
                title: courseData.title,
                description: courseData.description,
                status: courseData.status,
                type: "type" in courseData ? courseData.type : "ONLINE",
                modules: {
                    create: courseData.modules.map((mod) => ({
                        title: mod.title,
                        order: mod.order,
                        lessons: {
                            create: mod.lessons.map((lesson) => ({
                                title: lesson.title,
                                type: lesson.type,
                                order: lesson.order,
                                durationMin: "durationMin" in lesson ? lesson.durationMin ?? null : null,
                            })),
                        },
                    })),
                },
            },
        });
        createdCourses.push(course);
        console.log(`   ✅ Kursus: ${course.title}`);
    }

    console.log("\n🗓️ Membuat event offerings...");
    const createdEvents = [];
    for (const eventData of mockEvents) {
        const event = await prisma.event.upsert({
            where: { slug: eventData.slug },
            update: {
                title: eventData.title,
                category: eventData.category,
                modality: eventData.modality,
                summary: eventData.summary,
                scheduleSummary: eventData.scheduleSummary,
                registrationFee: eventData.registrationFee,
                onlineTuitionFee: eventData.onlineTuitionFee,
                offlineTuitionFee: eventData.offlineTuitionFee,
                alumniRegistrationFee: eventData.alumniRegistrationFee,
                registrationStart: eventData.registrationStart,
                registrationEnd: eventData.registrationEnd,
                eventStart: eventData.eventStart,
                location: eventDataLocation(eventData),
                platform: eventDataPlatform(eventData),
                contactName: eventData.contactName,
                contactPhone: eventData.contactPhone,
                termsSummary: eventData.termsSummary,
                refundPolicySummary: eventData.refundPolicySummary,
                status: eventData.status,
                learningEnabled: eventData.learningEnabled,
                preTestEnabled: eventData.preTestEnabled,
                postTestEnabled: eventData.postTestEnabled,
                evaluationEnabled: eventData.evaluationEnabled,
                certificateEnabled: eventData.certificateEnabled,
                isFeatured: eventData.isFeatured,
                courseId: createdCourses[eventData.courseIndex].id,
            },
            create: {
                title: eventData.title,
                slug: eventData.slug,
                category: eventData.category,
                modality: eventData.modality,
                summary: eventData.summary,
                description: eventData.summary,
                scheduleSummary: eventData.scheduleSummary,
                registrationFee: eventData.registrationFee,
                onlineTuitionFee: eventData.onlineTuitionFee,
                offlineTuitionFee: eventData.offlineTuitionFee,
                alumniRegistrationFee: eventData.alumniRegistrationFee,
                registrationStart: eventData.registrationStart,
                registrationEnd: eventData.registrationEnd,
                eventStart: eventData.eventStart,
                location: eventDataLocation(eventData),
                platform: eventDataPlatform(eventData),
                contactName: eventData.contactName,
                contactPhone: eventData.contactPhone,
                termsSummary: eventData.termsSummary,
                refundPolicySummary: eventData.refundPolicySummary,
                status: eventData.status,
                learningEnabled: eventData.learningEnabled,
                preTestEnabled: eventData.preTestEnabled,
                postTestEnabled: eventData.postTestEnabled,
                evaluationEnabled: eventData.evaluationEnabled,
                certificateEnabled: eventData.certificateEnabled,
                isFeatured: eventData.isFeatured,
                courseId: createdCourses[eventData.courseIndex].id,
            },
        });
        createdEvents.push(event);
        console.log(`   ✅ Event: ${event.title}`);
    }

    // --- Seed Enrollments for Learners ---
    console.log("\n🎓 Mendaftarkan learners ke kursus pertama...");
    const learners = createdUsers.filter((u) => u.role === "LEARNER");
    for (const learner of learners) {
        await prisma.enrollment.upsert({
            where: { userId_courseId: { userId: learner.id, courseId: createdCourses[0].id } },
            update: {},
            create: {
                userId: learner.id,
                courseId: createdCourses[0].id,
                status: "ACTIVE",
                completionPercentage: 0,
            },
        });
        console.log(`   ✅ ${learner.fullName} → ${createdCourses[0].title}`);
    }

    console.log("\n📝 Membuat sample registrations...");
    for (const learner of learners) {
        await prisma.registration.upsert({
            where: {
                userId_eventId: {
                    userId: learner.id,
                    eventId: createdEvents[0].id,
                },
            },
            update: {},
            create: {
                userId: learner.id,
                eventId: createdEvents[0].id,
                participantMode: learner.email === "siti@example.com" ? "OFFLINE" : "ONLINE",
                status: learner.email === "siti@example.com" ? "SUBMITTED" : "DRAFT",
                paymentStatus: learner.email === "siti@example.com" ? "UPLOADED" : "PENDING",
                fullName: learner.fullName,
                birthPlace: "Semarang",
                birthDate: new Date("1998-01-10T00:00:00.000Z"),
                gender: learner.email === "siti@example.com" ? "Perempuan" : "Laki-Laki",
                domicileAddress: "Semarang, Jawa Tengah",
                whatsapp: "081234567890",
                institution: "Universitas Diponegoro",
                titlePrefix: "",
                titleSuffix: "S.H.",
                agreedTerms: true,
                agreedRefundPolicy: true,
                sourceChannel: learner.email === "siti@example.com" ? "INSTAGRAM" : "TIKTOK",
                totalFee: learner.email === "siti@example.com" ? 6000000 : 5750000,
                submittedAt: learner.email === "siti@example.com" ? new Date() : null,
            },
        });
        console.log(`   ✅ Registration: ${learner.fullName} → ${createdEvents[0].title}`);
    }

    console.log("\n✨ Seeding selesai!");
    console.log("\n📋 Kredensial Login:");
    console.log("   admin@renjana.com   → admin123");
    console.log("   ahmad@example.com   → password123");
    console.log("   budi@example.com    → password123");
    console.log("   diana@example.com   → password123");
    console.log("   eko@example.com     → password123");
}

function eventDataLocation(eventData: SeedEvent) {
    return "location" in eventData ? eventData.location ?? null : null;
}

function eventDataPlatform(eventData: SeedEvent) {
    return "platform" in eventData ? eventData.platform ?? null : null;
}

main()
    .catch((e) => {
        console.error("❌ Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
