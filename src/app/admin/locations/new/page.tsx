import { redirect } from "next/navigation";

export default function AdminLocationsNewLegacyPage() {
    redirect("/admin/events?fromLegacy=locations");
}
