import { redirect } from "next/navigation";

export default function DashboardCheckinRedirectPage() {
    redirect("/my-registrations");
}
