export type UserRole = "ADMIN" | "INSTRUCTOR" | "MANAGER" | "FINANCE" | "LEARNER";

export function getDashboardUrl(role: UserRole): string {
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
