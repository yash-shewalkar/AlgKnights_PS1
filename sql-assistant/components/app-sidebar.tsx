"use client"

import {
  Calendar,
  Code2,
  Database,
  Home,
  MessageSquare,
  Play,
  ThumbsUp,
  HistoryIcon,
  BarChart3,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"

export function AppSidebar() {
  const pathname = usePathname()

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
    },
    {
      title: "Schema Designer",
      icon: Database,
      href: "/schema-designer",
    },
    {
      title: "SQL Generator",
      icon: Code2,
      href: "/sql-generator",
    },
    {
      title: "Query Translator",
      icon: MessageSquare,
      href: "/query-translator",
    },
    {
      title: "Write SQL",
      icon: FileText,
      href: "/write-sql",
    },
    {
      title: "Query Execution",
      icon: Play,
      href: "/query-execution",
    },
    {
      title: "Date Filtering",
      icon: Calendar,
      href: "/date-filtering",
    },
    {
      title: "Visualization",
      icon: BarChart3,
      href: "/visualization",
    },
    {
      title: "Feedback",
      icon: ThumbsUp,
      href: "/feedback",
    },
    {
      title: "History",
      icon: HistoryIcon,
      href: "/history",
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-2">
          <Database className="h-6 w-6" />
          <span className="font-bold text-xl">SQL Assistant</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">v1.0.0</span>
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

