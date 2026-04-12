import { redirect } from "next/navigation";

export default function AdminLocationsLegacyPage() {
    redirect("/admin/events?fromLegacy=locations");
}
