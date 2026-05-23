"use client"

import * as React from "react"
import {
  IconDashboard,
  IconSettings,
  IconBook,
  IconSitemap,
  IconFolderOpen,
  IconPlugConnected,
  IconUsers,
  IconUpload,
  IconChartLine,
  IconArrowsSplit2,
  IconMessageQuestion,
  IconListCheck,
  IconFileReport,
} from "@tabler/icons-react"

import { NavMain } from "@/components/ui/nav-main"
import { NavJourneys } from "@/components/ui/nav-journeys"
import { NavSecondary } from "@/components/ui/nav-secondary"
import { NavUser } from "@/components/ui/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Logo from "../logo/Logo"
import Link from "next/link"

const data = {
  user: {
    name: "Rahul Gattani",
    email: "rahul@cohnreznick.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navTop: [
    { title: "Dashboard", url: "/", icon: IconDashboard },
  ],
  navJourneys: [
    { title: "Customer Management",  url: "/workflows/customers",          icon: IconUsers            },
    { title: "TB Ingestion",         url: "/workflows/tb-ingestion",       icon: IconUpload           },
    { title: "Anomaly Detection",    url: "/workflows/anomaly-detection",  icon: IconChartLine        },
    { title: "Driver Analysis",      url: "/workflows/driver-analysis",    icon: IconArrowsSplit2     },
    { title: "Follow-Up Questions",  url: "/workflows/follow-up-questions",icon: IconMessageQuestion  },
    { title: "Issue Tracker",        url: "/workflows/issue-tracker",      icon: IconListCheck        },
    { title: "Report Drafting",      url: "/workflows/report-drafting",    icon: IconFileReport       },
  ],
  navTools: [
    {
      title: "Tools & Config",
      url: "/tools",
      icon: IconPlugConnected,
      subItems: [
        { title: "Skills Library",     url: "/tools/skills",       icon: IconBook         },
        { title: "Integrations",       url: "/tools",              icon: IconPlugConnected },
        { title: "Agent Architecture", url: "/tools/architecture", icon: IconSitemap      },
        { title: "File System",        url: "/tools/files",        icon: IconFolderOpen   },
      ],
    },
  ],
  navSecondary: [
    { title: "Settings", url: "/settings", icon: IconSettings },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Link href="/">
                <Logo />
                <span className="text-base font-semibold">CohnReznick</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navTop} />
        <NavJourneys items={data.navJourneys} />
        <NavMain items={data.navTools} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
