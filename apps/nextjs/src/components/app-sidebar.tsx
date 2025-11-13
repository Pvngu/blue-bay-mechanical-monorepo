"use client"

import * as React from "react"
import {
  PieChart,
  Settings2,
  SquareTerminal,
  ShieldCheck,
  User,
  UsersRound,
  ShieldUser,
  Calendar,
  Receipt,
  Bell,
  LayoutDashboard,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { title } from "process"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  // navMain: [
  //   {
  //     title: "Admin Settings",
  //     url: "#",
  //     icon: SquareTerminal,
  //     isActive: true,
  //     items: [
  //       {
  //         title: "Technicians",
  //         url: "technicians"
  //       },
  //       {
  //         title: "Clients",
  //         url: "clients"
  //       }
  //     ],
  //   },
    
  // ],
    projects: [
      {
        name: "Dashboard",
        url: "dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Scheduling",
        url: "scheduling",
        icon: Calendar,
      },
      {
        name: "Work Orders",
        url: "work-orders",
        icon: User,
      },
      {
        name: "Inventory",
        url: "inventory",
        icon: Settings2,
      },
      {
        name: "Billing",
        url: "billing",
        icon: Receipt,
      },
      {
        name: "Notifications",
        url: "notifications",
        icon: Bell,
      },
      {
        name: "Technicians",
        url: "technicians",
        icon: ShieldUser,
      },
      {
        name: "Clients",
        url: "clients",
        icon: UsersRound  
      }
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="ml-2">
          <img src="/assets/logo.png" alt="Logo" className="h-10 pt-2" /> 
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
        {/* <NavMain items={data.navMain} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
