import { redirect } from "next/navigation";

export default function AdminActivitiesNewLegacyPage() {
    redirect("/admin/events?fromLegacy=activities");
}
