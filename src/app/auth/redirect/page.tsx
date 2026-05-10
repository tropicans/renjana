import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-utils";
import { getDashboardUrl, type UserRole } from "@/lib/dashboard-routing";

export default async function AuthRedirectPage() {
    const user = await getServerUser();

    if (!user) {
        redirect("/login");
    }

    redirect(getDashboardUrl(user.role as UserRole));
}
