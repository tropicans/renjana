import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-utils";

function getDashboardUrl(role: string) {
    switch (role) {
        case "ADMIN":
            return "/admin";
        case "INSTRUCTOR":
            return "/instructor";
        case "MANAGER":
            return "/manager";
        case "FINANCE":
            return "/finance";
        case "LEARNER":
        default:
            return "/dashboard";
    }
}

export default async function AuthRedirectPage() {
    const user = await getServerUser();

    if (!user) {
        redirect("/login");
    }

    redirect(getDashboardUrl(user.role));
}
