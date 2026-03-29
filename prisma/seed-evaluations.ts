// Seed script for Evaluasi feature — creates sample quiz data
// Usage: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-evaluations.ts
// Or:    npx tsx prisma/seed-evaluations.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Find the first published course
    const course = await prisma.course.findFirst({
        where: { status: "PUBLISHED" },
    });

    if (!course) {
        console.log("❌ No published course found. Create a course first.");
        return;
    }

    console.log(`📚 Using course: "${course.title}" (${course.id})`);

    // Clean up existing quizzes for this course
    await prisma.quiz.deleteMany({ where: { courseId: course.id } });
    console.log("🧹 Cleaned up existing quizzes");

    // Create Pre-Test
    const preTest = await prisma.quiz.create({
        data: {
            courseId: course.id,
            type: "PRE_TEST",
            title: `Pre-Test: ${course.title}`,
            timeLimit: 15,
            passingScore: 60,
            questions: {
                create: [
                    {
                        question: "Apa tujuan utama dari pembelajaran ini?",
                        options: [
                            "Meningkatkan keterampilan teknis",
                            "Mendapatkan sertifikat",
                            "Memenuhi jam pelatihan",
                            "Mendapatkan promosi",
                        ],
                        correctIdx: 0,
                        order: 1,
                    },
                    {
                        question: "Manakah yang merupakan prinsip pembelajaran efektif?",
                        options: [
                            "Menghafal semua materi",
                            "Praktik langsung dan refleksi",
                            "Hanya membaca teori",
                            "Menonton video tanpa mencatat",
                        ],
                        correctIdx: 1,
                        order: 2,
                    },
                    {
                        question: "Bagaimana cara terbaik untuk menerapkan ilmu yang dipelajari?",
                        options: [
                            "Menunggu sampai situasi tepat",
                            "Langsung mempraktikkan di pekerjaan sehari-hari",
                            "Membuat ringkasan saja",
                            "Mendiskusikan dengan teman",
                        ],
                        correctIdx: 1,
                        order: 3,
                    },
                    {
                        question: "Apa yang harus dilakukan sebelum memulai course?",
                        options: [
                            "Langsung membuka materi pertama",
                            "Membaca silabus dan tujuan pembelajaran",
                            "Mengerjakan post-test",
                            "Menghubungi instruktur",
                        ],
                        correctIdx: 1,
                        order: 4,
                    },
                    {
                        question: "Evaluasi pembelajaran bertujuan untuk?",
                        options: [
                            "Memberi nilai siswa",
                            "Mengukur efektivitas program pembelajaran",
                            "Menguji daya ingat",
                            "Memenuhi administrasi",
                        ],
                        correctIdx: 1,
                        order: 5,
                    },
                ],
            },
        },
        include: { _count: { select: { questions: true } } },
    });

    console.log(`✅ Created Pre-Test: "${preTest.title}" with ${preTest._count.questions} questions`);

    // Create Post-Test
    const postTest = await prisma.quiz.create({
        data: {
            courseId: course.id,
            type: "POST_TEST",
            title: `Post-Test: ${course.title}`,
            timeLimit: 20,
            passingScore: 70,
            questions: {
                create: [
                    {
                        question: "Setelah mengikuti course ini, apa yang Anda pelajari?",
                        options: [
                            "Cara menggunakan tools dengan lebih efisien",
                            "Cara bermain game",
                            "Cara membuat akun media sosial",
                            "Cara menulis email formal",
                        ],
                        correctIdx: 0,
                        order: 1,
                    },
                    {
                        question: "Bagaimana Anda akan menerapkan materi yang dipelajari?",
                        options: [
                            "Tidak perlu diterapkan",
                            "Menerapkan secara bertahap di proyek nyata",
                            "Menunggu perintah atasan",
                            "Hanya untuk sertifikat",
                        ],
                        correctIdx: 1,
                        order: 2,
                    },
                    {
                        question: "Apa perbedaan pre-test dan post-test?",
                        options: [
                            "Tidak ada perbedaan",
                            "Pre-test mengukur pengetahuan awal, post-test mengukur hasil belajar",
                            "Pre-test lebih sulit dari post-test",
                            "Post-test tidak wajib dikerjakan",
                        ],
                        correctIdx: 1,
                        order: 3,
                    },
                    {
                        question: "Metode pembelajaran yang paling efektif adalah?",
                        options: [
                            "Hanya membaca",
                            "Hanya mendengarkan",
                            "Kombinasi teori, praktik, dan kolaborasi",
                            "Hanya menonton video",
                        ],
                        correctIdx: 2,
                        order: 4,
                    },
                    {
                        question: "Apa langkah selanjutnya setelah menyelesaikan course ini?",
                        options: [
                            "Tidak ada",
                            "Mengisi evaluasi penyelenggaraan dan menerapkan ilmu",
                            "Mem-forward materi ke teman",
                            "Mengulang course dari awal",
                        ],
                        correctIdx: 1,
                        order: 5,
                    },
                ],
            },
        },
        include: { _count: { select: { questions: true } } },
    });

    console.log(`✅ Created Post-Test: "${postTest.title}" with ${postTest._count.questions} questions`);
    console.log("\n🎉 Seed data created successfully!");
    console.log(`   Course: ${course.title}`);
    console.log(`   Pre-Test ID: ${preTest.id}`);
    console.log(`   Post-Test ID: ${postTest.id}`);
}

main()
    .catch((e) => {
        console.error("❌ Error:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
