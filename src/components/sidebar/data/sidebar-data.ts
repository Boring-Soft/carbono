import {
  Home,
  Phone,
  PhoneCall,
  TestTube2,
  Megaphone,
  Users,
  MessageSquare,
  Workflow,
  Database,
  Command,
} from "lucide-react";
import type { SidebarData } from "../types";

export const sidebarData: SidebarData = {
  user: {
    name: "satnaing",
    email: "satnaingdev@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Boring Automation",
      logo: Command,
      plan: "Professional",
    },
    {
      name: "My Workspace",
      logo: Command,
      plan: "Free",
    },
  ],
  navGroups: [
    {
      title: "Main",
      items: [
        {
          title: "Home",
          url: "/dashboard",
          icon: Home,
        },
        {
          title: "Voice Agents",
          icon: Phone,
          items: [
            {
              title: "Agents",
              url: "/dashboard/voice-agents/agents",
              icon: PhoneCall,
            },
            {
              title: "Phone Numbers",
              url: "/dashboard/voice-agents/phone-numbers",
              icon: Phone,
            },
            {
              title: "Test Numbers",
              url: "/dashboard/voice-agents/test-numbers",
              icon: TestTube2,
            },
          ],
        },
        {
          title: "Campaigns",
          url: "/dashboard/campaigns",
          icon: Megaphone,
        },
        {
          title: "CRM",
          url: "/dashboard/crm",
          icon: Users,
        },
        {
          title: "Text Agents",
          url: "/dashboard/text-agents",
          icon: MessageSquare,
        },
        {
          title: "Flow Studio",
          url: "/dashboard/flow-studio",
          icon: Workflow,
        },
        {
          title: "Data Studio",
          url: "/dashboard/data-studio",
          icon: Database,
        },
      ],
    },
  ],
};
