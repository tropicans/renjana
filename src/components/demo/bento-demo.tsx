import {
    BellIcon,
    CalendarIcon,
    FileTextIcon,
    GlobeIcon,
    InputIcon,
} from "@radix-ui/react-icons";
import Image from "next/image";

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

const features = [
    {
        Icon: FileTextIcon,
        name: "Activity-Based Learning",
        description: "Tracks active learning events and real-time evidence.",
        href: "/",
        cta: "Learn more",
        background: <Image className="absolute -right-20 -top-20 opacity-60" src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=500&auto=format&fit=crop" alt="" width={500} height={500} />,
        className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
    },
    {
        Icon: InputIcon,
        name: "Full Visibility",
        description: "Monitor learner progress with high granularity.",
        href: "/",
        cta: "Learn more",
        background: <Image className="absolute -right-20 -top-20 opacity-60" src="https://images.unsplash.com/photo-1551288049-bbbda536639a?q=80&w=500&auto=format&fit=crop" alt="" width={500} height={500} />,
        className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
    },
    {
        Icon: GlobeIcon,
        name: "Multi-Tenant",
        description: "Scalable architecture for corporate and public edu.",
        href: "/",
        cta: "Learn more",
        background: <Image className="absolute -right-20 -top-20 opacity-60" src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=500&auto=format&fit=crop" alt="" width={500} height={500} />,
        className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    },
    {
        Icon: CalendarIcon,
        name: "Smart Scheduling",
        description: "Auto-assign remedial and notify instructors.",
        href: "/",
        cta: "Learn more",
        background: <Image className="absolute -right-20 -top-20 opacity-60" src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=500&auto=format&fit=crop" alt="" width={500} height={500} />,
        className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
    },
    {
        Icon: BellIcon,
        name: "Rule Engine",
        description: "Event-driven automation triggered by learning events.",
        href: "/",
        cta: "Learn more",
        background: <Image className="absolute -right-20 -top-20 opacity-60" src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500&auto=format&fit=crop" alt="" width={500} height={500} />,
        className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
    },
];

function BentoDemo() {
    return (
        <BentoGrid className="lg:grid-rows-3">
            {features.map((feature) => (
                <BentoCard key={feature.name} {...feature} />
            ))}
        </BentoGrid>
    );
}

export { BentoDemo };
