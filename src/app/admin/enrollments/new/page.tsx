import { redirect } from "next/navigation";

export default function AdminEnrollmentsNewLegacyPage() {
    redirect("/admin/registrations?fromLegacy=enrollments");
}
