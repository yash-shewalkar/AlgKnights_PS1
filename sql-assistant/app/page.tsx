"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import {
  Calendar,
  Code2,
  Database,
  MessageSquare,
  Play,
  ThumbsUp,
  HistoryIcon,
  BarChart3,
  PieChart,
  LineChart,
  ScatterChart,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Server,
  TableIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  const [chartType, setChartType] = useState("line")

  const features = [
    {
      title: "Schema Designer",
      description: "Design database schemas using natural language",
      icon: Database,
      href: "/schema-designer",
    },
    {
      title: "SQL Generator",
      description: "Generate SQL for table creation and data manipulation",
      icon: Code2,
      href: "/sql-generator",
    },
    {
      title: "Query Translator",
      description: "Convert natural language to SQL queries",
      icon: MessageSquare,
      href: "/query-translator",
    },
    {
      title: "Query Execution",
      description: "Execute SQL queries and view results",
      icon: Play,
      href: "/query-execution",
    },
    {
      title: "Date Filtering",
      description: "Filter data by date ranges with a visual calendar",
      icon: Calendar,
      href: "/date-filtering",
    },
    {
      title: "Feedback",
      description: "Provide feedback on AI-generated SQL",
      icon: ThumbsUp,
      href: "/feedback",
    },
    {
      title: "History",
      description: "View and reuse your previous queries",
      icon: HistoryIcon,
      href: "/history",
    },
  ]

  const renderChart = () => {
    return (
      <div className="h-80 w-full p-4">
        <div className="flex justify-center items-center h-full w-full bg-muted/50 rounded-lg">
          <div className="text-center">
            {chartType === "line" && <LineChart className="h-16 w-16 mx-auto text-muted-foreground" />}
            {chartType === "bar" && <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground" />}
            {chartType === "pie" && <PieChart className="h-16 w-16 mx-auto text-muted-foreground" />}
            {chartType === "scatter" && <ScatterChart className="h-16 w-16 mx-auto text-muted-foreground" />}
            <p className="mt-2 text-sm text-muted-foreground">Chart visualization would appear here</p>
            <p className="text-xs text-muted-foreground">(Using Chart.js or similar library)</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your AI-powered SQL Assistant. Select a feature to get started.
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Query Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <div className="mt-2">
              <Progress value={94.2} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">2.1%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Execution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245ms</div>
            <div className="mt-2">
              <Progress value={75} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center">
              <ArrowDownRight className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">18ms</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Healthy</div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                Connected
              </Badge>
              <Badge variant="outline">3 Databases</Badge>
              <Badge variant="outline">24 Tables</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Last checked 5 minutes ago</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <HistoryIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42 Queries</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Today</span>
                <span>12 queries</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Yesterday</span>
                <span>18 queries</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">This Week</span>
                <span>42 queries</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualization Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Query Results Visualization</CardTitle>
              <CardDescription>Toggle between different chart types to visualize your data</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>
            <TabsContent value="chart">{renderChart()}</TabsContent>
            <TabsContent value="table">
              <div className="h-80 w-full p-4">
                <div className="flex justify-center items-center h-full w-full bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <TableIcon className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Table view would appear here</p>
                    <p className="text-xs text-muted-foreground">(With pagination and sorting)</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">Showing data for last 7 days</div>
          <Button variant="outline" size="sm">
            Configure Chart
          </Button>
        </CardFooter>
      </Card>

      {/* Feature Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <feature.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

