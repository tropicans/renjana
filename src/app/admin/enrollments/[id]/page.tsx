import { redirect } from "next/navigation";

export default function AdminEnrollmentDetailLegacyPage() {
    redirect("/admin/registrations?fromLegacy=enrollments");
}
