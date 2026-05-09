export { fetchFinanceRegistrations } from "@/lib/api";

export function financeRegistrationsKey(page = 1) {
    return ["finance-registrations", page] as const;
}