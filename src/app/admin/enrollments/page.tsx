import { redirect } from "next/navigation";

export default function AdminEnrollmentsLegacyPage() {
    redirect("/admin/registrations?fromLegacy=enrollments");
}
