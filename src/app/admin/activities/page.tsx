import { redirect } from "next/navigation";

export default function AdminActivitiesLegacyPage() {
    redirect("/admin/events?fromLegacy=activities");
}
