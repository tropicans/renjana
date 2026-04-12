import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { calculateEventTotalFee, isParticipantMode, isSourceChannel, REGISTRATION_DOCUMENT_TYPES } from "@/lib/events";

export async function GET() {
    const { user, error } = await requireAuth();
    if (error) return error;

    const registrations = await prisma.registration.findMany({
        where: { userId: user!.id },
        include: {
            event: {
                select: {
                    id: true,
                    courseId: true,
                    slug: true,
                    title: true,
                    category: true,
                    modality: true,
                    status: true,
                    eventStart: true,
                    registrationEnd: true,
                },
            },
            documents: {
                select: {
                    id: true,
                    type: true,
                    reviewStatus: true,
                    fileUrl: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ registrations });
}

export async function POST(req: Request) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await req.json().catch(() => null);
    const eventId = body?.eventId as string | undefined;
    const participantMode = body?.participantMode as string | undefined;

    if (!eventId || !participantMode || !isParticipantMode(participantMode)) {
        return NextResponse.json({ error: "Valid eventId and participantMode are required" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const sourceChannel = body?.sourceChannel as string | undefined;
    if (sourceChannel && !isSourceChannel(sourceChannel)) {
        return NextResponse.json({ error: "Invalid source channel" }, { status: 400 });
    }

    const fees = calculateEventTotalFee(event, participantMode);
    const submit = Boolean(body?.submit);

    const registration = await prisma.registration.upsert({
        where: { userId_eventId: { userId: user!.id, eventId } },
        update: {
            participantMode,
            fullName: body?.fullName?.trim() || null,
            birthPlace: body?.birthPlace?.trim() || null,
            birthDate: body?.birthDate ? new Date(body.birthDate) : null,
            gender: body?.gender?.trim() || null,
            domicileAddress: body?.domicileAddress?.trim() || null,
            whatsapp: body?.whatsapp?.trim() || null,
            institution: body?.institution?.trim() || null,
            titlePrefix: body?.titlePrefix?.trim() || null,
            titleSuffix: body?.titleSuffix?.trim() || null,
            agreedTerms: Boolean(body?.agreedTerms),
            agreedRefundPolicy: Boolean(body?.agreedRefundPolicy),
            sourceChannel: sourceChannel ? (sourceChannel as never) : null,
            sourceOtherText: body?.sourceOtherText?.trim() || null,
            referralName: body?.referralName?.trim() || null,
            totalFee: fees.totalFee,
            status: submit ? "SUBMITTED" : undefined,
            submittedAt: submit ? new Date() : undefined,
        },
        create: {
            userId: user!.id,
            eventId,
            participantMode,
            fullName: body?.fullName?.trim() || null,
            birthPlace: body?.birthPlace?.trim() || null,
            birthDate: body?.birthDate ? new Date(body.birthDate) : null,
            gender: body?.gender?.trim() || null,
            domicileAddress: body?.domicileAddress?.trim() || null,
            whatsapp: body?.whatsapp?.trim() || null,
            institution: body?.institution?.trim() || null,
            titlePrefix: body?.titlePrefix?.trim() || null,
            titleSuffix: body?.titleSuffix?.trim() || null,
            agreedTerms: Boolean(body?.agreedTerms),
            agreedRefundPolicy: Boolean(body?.agreedRefundPolicy),
            sourceChannel: sourceChannel ? (sourceChannel as never) : null,
            sourceOtherText: body?.sourceOtherText?.trim() || null,
            referralName: body?.referralName?.trim() || null,
            totalFee: fees.totalFee,
            status: submit ? "SUBMITTED" : "DRAFT",
            submittedAt: submit ? new Date() : null,
        },
        include: {
            event: true,
            documents: true,
        },
    });

    if (submit) {
        const missingFields = [
            registration.fullName,
            registration.birthPlace,
            registration.birthDate,
            registration.gender,
            registration.domicileAddress,
            registration.whatsapp,
            registration.institution,
        ].some((value) => !value);

        const uploadedTypes = new Set(registration.documents.map((document: { type: string }) => document.type));
        const missingDocuments = REGISTRATION_DOCUMENT_TYPES.filter((type) => !uploadedTypes.has(type));

        if (!registration.agreedTerms || !registration.agreedRefundPolicy || missingFields || missingDocuments.length > 0) {
            await prisma.registration.update({
                where: { id: registration.id },
                data: { status: "DRAFT", submittedAt: null },
            });
            return NextResponse.json(
                { error: "Complete the required form fields and uploads before submitting" },
                { status: 400 },
            );
        }

        await prisma.registration.update({
            where: { id: registration.id },
            data: {
                paymentStatus: uploadedTypes.has("PAYMENT_PROOF") ? "UPLOADED" : "PENDING",
            },
        });
    }

    const freshRegistration = await prisma.registration.findUnique({
        where: { id: registration.id },
        include: {
            event: true,
            documents: true,
        },
    });

    return NextResponse.json({ registration: freshRegistration }, { status: 201 });
}
