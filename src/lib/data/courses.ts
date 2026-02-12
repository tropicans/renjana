// Mock Course/Program Data Store
export type CourseCategory = 'foundation' | 'certification' | 'masterclass';
export type CourseModality = 'luring' | 'daring' | 'hybrid';

export interface Activity {
    id: string;
    title: string;
    type: 'video' | 'quiz' | 'assignment' | 'reading' | 'live-session';
    duration: number; // in minutes
    content?: string;
    videoUrl?: string;
}

export interface Module {
    id: string;
    title: string;
    description: string;
    activities: Activity[];
    duration: number; // total duration in minutes
}

export interface Course {
    id: string;
    title: string;
    description: string;
    shortDescription: string;
    category: CourseCategory;
    modality: CourseModality;
    instructor: {
        id: string;
        name: string;
        avatar: string;
        title: string;
    };
    image: string;
    price: number;
    duration: number; // total hours
    modules: Module[];
    learnerCount: number;
    rating: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    features: string[];
    createdAt: string;
}

export const courses: Course[] = [
    {
        id: 'course-1',
        title: 'Corporate Governance 101',
        description: 'Master the foundational principles of corporate oversight, compliance, and global legal structures. This comprehensive course covers board responsibilities, shareholder rights, regulatory compliance, and best practices for emerging executives in the corporate legal landscape.',
        shortDescription: 'Foundational principles of corporate oversight and compliance.',
        category: 'foundation',
        modality: 'daring',
        instructor: {
            id: 'user-3',
            name: 'Budi Santoso',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
            title: 'Senior Partner, Corporate Law',
        },
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800',
        price: 2500000,
        duration: 12,
        learnerCount: 1250,
        rating: 4.8,
        level: 'beginner',
        features: [
            'Certificate of Completion',
            'Lifetime Access',
            '12 Hours of Content',
            'Downloadable Resources',
        ],
        createdAt: '2024-01-01',
        modules: [
            {
                id: 'mod-1-1',
                title: 'Introduction to Corporate Governance',
                description: 'Understanding the fundamentals of corporate governance',
                duration: 90,
                activities: [
                    { id: 'act-1-1-1', title: 'Welcome & Course Overview', type: 'video', duration: 15 },
                    { id: 'act-1-1-2', title: 'What is Corporate Governance?', type: 'video', duration: 30 },
                    { id: 'act-1-1-3', title: 'Key Stakeholders', type: 'reading', duration: 20 },
                    { id: 'act-1-1-4', title: 'Module 1 Quiz', type: 'quiz', duration: 25 },
                ],
            },
            {
                id: 'mod-1-2',
                title: 'Board of Directors',
                description: 'Roles, responsibilities, and best practices',
                duration: 120,
                activities: [
                    { id: 'act-1-2-1', title: 'Board Structure & Composition', type: 'video', duration: 35 },
                    { id: 'act-1-2-2', title: 'Director Duties & Liabilities', type: 'video', duration: 40 },
                    { id: 'act-1-2-3', title: 'Case Study: Board Failures', type: 'reading', duration: 25 },
                    { id: 'act-1-2-4', title: 'Module 2 Quiz', type: 'quiz', duration: 20 },
                ],
            },
            {
                id: 'mod-1-3',
                title: 'Regulatory Compliance',
                description: 'Navigating regulatory requirements',
                duration: 100,
                activities: [
                    { id: 'act-1-3-1', title: 'Regulatory Framework Overview', type: 'video', duration: 30 },
                    { id: 'act-1-3-2', title: 'Compliance Best Practices', type: 'video', duration: 35 },
                    { id: 'act-1-3-3', title: 'Final Assignment', type: 'assignment', duration: 35 },
                ],
            },
        ],
    },
    {
        id: 'course-2',
        title: 'International Arbitration',
        description: 'Advanced strategies for cross-border legal dispute resolution and multinational mediation protocols. Learn from real case studies and develop practical skills in international arbitration procedures.',
        shortDescription: 'Cross-border dispute resolution and mediation.',
        category: 'certification',
        modality: 'hybrid',
        instructor: {
            id: 'user-3',
            name: 'Budi Santoso',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
            title: 'Senior Partner, Corporate Law',
        },
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800',
        price: 4500000,
        duration: 20,
        learnerCount: 820,
        rating: 4.9,
        level: 'advanced',
        features: [
            'Professional Certification',
            'Live Workshop Sessions',
            'Real Case Studies',
            'Expert Mentorship',
        ],
        createdAt: '2024-02-15',
        modules: [
            {
                id: 'mod-2-1',
                title: 'Fundamentals of International Arbitration',
                description: 'Core concepts and frameworks',
                duration: 150,
                activities: [
                    { id: 'act-2-1-1', title: 'Introduction to International Arbitration', type: 'video', duration: 45 },
                    { id: 'act-2-1-2', title: 'Key International Conventions', type: 'video', duration: 50 },
                    { id: 'act-2-1-3', title: 'Arbitration vs Litigation', type: 'reading', duration: 30 },
                    { id: 'act-2-1-4', title: 'Module Quiz', type: 'quiz', duration: 25 },
                ],
            },
            {
                id: 'mod-2-2',
                title: 'Arbitration Procedures',
                description: 'Step-by-step process and documentation',
                duration: 180,
                activities: [
                    { id: 'act-2-2-1', title: 'Initiating Arbitration', type: 'video', duration: 40 },
                    { id: 'act-2-2-2', title: 'Evidence & Discovery', type: 'video', duration: 45 },
                    { id: 'act-2-2-3', title: 'Live Session: Mock Arbitration', type: 'live-session', duration: 60 },
                    { id: 'act-2-2-4', title: 'Practice Assignment', type: 'assignment', duration: 35 },
                ],
            },
        ],
    },
    {
        id: 'course-3',
        title: 'Legal Tech & AI Essentials',
        description: 'Modernizing your legal practice with AI integration and digital transformation for the 21st century. Learn to leverage technology for contract analysis, legal research, and practice management.',
        shortDescription: 'AI and digital transformation for legal professionals.',
        category: 'masterclass',
        modality: 'daring',
        instructor: {
            id: 'user-3',
            name: 'Budi Santoso',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
            title: 'Senior Partner, Corporate Law',
        },
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800',
        price: 3500000,
        duration: 15,
        learnerCount: 980,
        rating: 4.7,
        level: 'intermediate',
        features: [
            'Hands-on AI Tools Training',
            'Industry Certificate',
            'Project-Based Learning',
            'Community Access',
        ],
        createdAt: '2024-03-01',
        modules: [
            {
                id: 'mod-3-1',
                title: 'Introduction to Legal Tech',
                description: 'Overview of technology in legal practice',
                duration: 120,
                activities: [
                    { id: 'act-3-1-1', title: 'The Digital Legal Landscape', type: 'video', duration: 30 },
                    { id: 'act-3-1-2', title: 'Key Legal Tech Categories', type: 'video', duration: 35 },
                    { id: 'act-3-1-3', title: 'Evaluating Tech Solutions', type: 'reading', duration: 30 },
                    { id: 'act-3-1-4', title: 'Module Quiz', type: 'quiz', duration: 25 },
                ],
            },
            {
                id: 'mod-3-2',
                title: 'AI for Legal Research',
                description: 'Leveraging AI for efficient research',
                duration: 150,
                activities: [
                    { id: 'act-3-2-1', title: 'AI-Powered Research Tools', type: 'video', duration: 40 },
                    { id: 'act-3-2-2', title: 'Contract Analysis with AI', type: 'video', duration: 45 },
                    { id: 'act-3-2-3', title: 'Hands-on: Using AI Tools', type: 'assignment', duration: 40 },
                    { id: 'act-3-2-4', title: 'Best Practices & Ethics', type: 'reading', duration: 25 },
                ],
            },
        ],
    },
    {
        id: 'course-4',
        title: 'Pelatihan Mediator Bersertifikat',
        description: 'Pelatihan dan sertifikasi mediator sesuai PERMA. Materi meliputi dasar-dasar mediasi, administrasi mediasi di pengadilan, teknik negosiasi, dan simulasi proses mediasi.',
        shortDescription: 'Sertifikasi mediator sesuai PERMA.',
        category: 'certification',
        modality: 'luring',
        instructor: {
            id: 'user-3',
            name: 'Budi Santoso',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
            title: 'Senior Partner, Corporate Law',
        },
        image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800',
        price: 5500000,
        duration: 24,
        learnerCount: 450,
        rating: 4.9,
        level: 'intermediate',
        features: [
            'Sertifikasi Resmi Mediator',
            'Simulasi Praktik Mediasi',
            'Materi Lengkap PERMA',
            'Networking dengan Profesional',
        ],
        createdAt: '2024-04-01',
        modules: [
            {
                id: 'mod-4-1',
                title: 'Dasar-Dasar Mediasi',
                description: 'Fundamentals menurut PERMA',
                duration: 180,
                activities: [
                    { id: 'act-4-1-1', title: 'Pengertian & Prinsip Mediasi', type: 'video', duration: 45 },
                    { id: 'act-4-1-2', title: 'Kerangka Hukum Mediasi', type: 'video', duration: 50 },
                    { id: 'act-4-1-3', title: 'Peran Mediator', type: 'reading', duration: 40 },
                    { id: 'act-4-1-4', title: 'Kuis Modul 1', type: 'quiz', duration: 45 },
                ],
            },
            {
                id: 'mod-4-2',
                title: 'Teknik Negosiasi & Mediasi',
                description: 'Strategi dan teknik praktis',
                duration: 240,
                activities: [
                    { id: 'act-4-2-1', title: 'Teknik Komunikasi Efektif', type: 'video', duration: 50 },
                    { id: 'act-4-2-2', title: 'Strategi Negosiasi', type: 'video', duration: 55 },
                    { id: 'act-4-2-3', title: 'Sesi Praktik: Simulasi Mediasi', type: 'live-session', duration: 90 },
                    { id: 'act-4-2-4', title: 'Tugas Akhir', type: 'assignment', duration: 45 },
                ],
            },
        ],
    },
];

// Helper functions
export function getCourseById(id: string): Course | undefined {
    return courses.find(course => course.id === id);
}

export function getCoursesByCategory(category: CourseCategory): Course[] {
    return courses.filter(course => course.category === category);
}

export function getCoursesByInstructor(instructorId: string): Course[] {
    return courses.filter(course => course.instructor.id === instructorId);
}

export function searchCourses(query: string): Course[] {
    const lowerQuery = query.toLowerCase();
    return courses.filter(
        course =>
            course.title.toLowerCase().includes(lowerQuery) ||
            course.description.toLowerCase().includes(lowerQuery)
    );
}

export function getActivityById(courseId: string, activityId: string): Activity | undefined {
    const course = getCourseById(courseId);
    if (!course) return undefined;

    for (const courseModule of course.modules) {
        const activity = courseModule.activities.find(a => a.id === activityId);
        if (activity) return activity;
    }
    return undefined;
}
