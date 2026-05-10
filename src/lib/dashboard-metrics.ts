export function summarizeFinanceRegistrationMetrics(registrations: Array<{ totalFee: number | null; paymentStatus: string }>) {
    const totalRegistrations = registrations.length;
    const pendingPayments = registrations.filter((registration) => ["PENDING", "UPLOADED"].includes(registration.paymentStatus)).length;
    const verifiedPayments = registrations.filter((registration) => registration.paymentStatus === "VERIFIED").length;
    const rejectedPayments = registrations.filter((registration) => registration.paymentStatus === "REJECTED").length;
    const totalBilled = registrations.reduce((sum, registration) => sum + (registration.totalFee ?? 0), 0);
    const totalCollected = registrations.reduce((sum, registration) => (
        registration.paymentStatus === "VERIFIED" ? sum + (registration.totalFee ?? 0) : sum
    ), 0);

    return {
        totalRegistrations,
        pendingPayments,
        verifiedPayments,
        rejectedPayments,
        totalBilled,
        totalCollected,
    };
}
