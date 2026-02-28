import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
});

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
                modules: {
                    create: courseData.modules.map((mod) => ({
                        title: mod.title,
                        order: mod.order,
                        lessons: {
                            create: mod.lessons.map((lesson) => ({
                                title: lesson.title,
                                type: lesson.type,
                                order: lesson.order,
                                durationMin: lesson.durationMin ?? null,
                            })),
                        },
                    })),
                },
            },
        });
        createdCourses.push(course);
        console.log(`   ✅ Kursus: ${course.title}`);
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

    console.log("\n✨ Seeding selesai!");
    console.log("\n📋 Kredensial Login:");
    console.log("   admin@renjana.com   → admin123");
    console.log("   ahmad@example.com   → password123");
    console.log("   budi@example.com    → password123");
    console.log("   diana@example.com   → password123");
    console.log("   eko@example.com     → password123");
}

main()
    .catch((e) => {
        console.error("❌ Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
