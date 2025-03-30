"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { format, subDays, subHours, subMinutes, startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, Edit, Globe, Play, BarChart3 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function DateFiltering() {
  const [table, setTable] = useState("orders")
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date(2023, 0, 1))
  const [toDate, setToDate] = useState<Date | undefined>(new Date())
  const [generatedSQL, setGeneratedSQL] = useState("")
  const [queryResults, setQueryResults] = useState<any>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [timeRangeMode, setTimeRangeMode] = useState("date-range")
  const [timePreset, setTimePreset] = useState("")
  const [timezoneAware, setTimezoneAware] = useState(false)
  const [granularity, setGranularity] = useState("daily")
  const [viewMode, setViewMode] = useState("table")
  const { toast } = useToast()

  const handleTimePresetChange = (preset: string) => {
    setTimePreset(preset)
    const now = new Date()

    switch (preset) {
      // Real-time options
      case "30sec":
        setFromDate(subMinutes(now, 0.5))
        break
      case "1min":
        setFromDate(subMinutes(now, 1))
        break
      case "5min":
        setFromDate(subMinutes(now, 5))
        break
      case "30min":
        setFromDate(subMinutes(now, 30))
        break
      case "1hr":
        setFromDate(subHours(now, 1))
        break

      // Relative ranges
      case "today":
        setFromDate(startOfDay(now))
        break
      case "wtd":
        setFromDate(startOfWeek(now))
        break
      case "mtd":
        setFromDate(startOfMonth(now))
        break
      case "ytd":
        setFromDate(startOfYear(now))
        break

      // Fixed ranges
      case "last-15min":
        setFromDate(subMinutes(now, 15))
        break
      case "last-24hr":
        setFromDate(subHours(now, 24))
        break
      case "last-7days":
        setFromDate(subDays(now, 7))
        break
      case "last-30days":
        setFromDate(subDays(now, 30))
        break
    }

    setToDate(now)
  }

  const handleGenerateSQL = () => {
    if (!fromDate || !toDate) {
      toast({
        title: "Date range required",
        description: "Please select both from and to dates.",
        variant: "destructive",
      })
      return
    }

    // Format dates for SQL
    const fromDateStr = format(fromDate, "yyyy-MM-dd HH:mm:ss")
    const toDateStr = format(toDate, "yyyy-MM-dd HH:mm:ss")

    // Generate SQL based on selected table and granularity
    let sql = ""
    let timeColumn = ""

    if (table === "orders") {
      timeColumn = "order_date"
    } else if (table === "users") {
      timeColumn = "created_at"
    } else {
      timeColumn = "published_at"
    }

    // Add timezone handling if enabled
    const tzHandling = timezoneAware ? `AT TIME ZONE 'UTC' AT TIME ZONE current_setting('TIMEZONE')` : ""

    // Add granularity aggregation
    let timeGrouping = ""
    let selectColumns = ""

    if (granularity === "hourly") {
      timeGrouping = `DATE_TRUNC('hour', ${timeColumn}${tzHandling})`
      selectColumns = `DATE_TRUNC('hour', ${timeColumn}${tzHandling}) AS time_bucket,`
    } else if (granularity === "daily") {
      timeGrouping = `DATE_TRUNC('day', ${timeColumn}${tzHandling})`
      selectColumns = `DATE_TRUNC('day', ${timeColumn}${tzHandling}) AS time_bucket,`
    } else if (granularity === "weekly") {
      timeGrouping = `DATE_TRUNC('week', ${timeColumn}${tzHandling})`
      selectColumns = `DATE_TRUNC('week', ${timeColumn}${tzHandling}) AS time_bucket,`
    } else {
      // No aggregation
      selectColumns = `${timeColumn}${tzHandling} AS timestamp,`
    }

    if (table === "orders") {
      sql = `SELECT 
  ${selectColumns}
  COUNT(*) AS order_count,
  SUM(total_amount) AS total_revenue
FROM 
  orders
WHERE 
  ${timeColumn} BETWEEN TIMESTAMP '${fromDateStr}' AND TIMESTAMP '${toDateStr}'
${
  granularity !== "none"
    ? `GROUP BY time_bucket
ORDER BY time_bucket`
    : `ORDER BY ${timeColumn}`
};`
    } else if (table === "users") {
      sql = `SELECT 
  ${selectColumns}
  COUNT(*) AS new_users
FROM 
  users
WHERE 
  ${timeColumn} BETWEEN TIMESTAMP '${fromDateStr}' AND TIMESTAMP '${toDateStr}'
${
  granularity !== "none"
    ? `GROUP BY time_bucket
ORDER BY time_bucket`
    : `ORDER BY ${timeColumn}`
};`
    } else {
      sql = `SELECT 
  ${selectColumns}
  COUNT(*) AS post_count,
  COUNT(DISTINCT user_id) AS unique_authors
FROM 
  posts
WHERE 
  ${timeColumn} BETWEEN TIMESTAMP '${fromDateStr}' AND TIMESTAMP '${toDateStr}'
${
  granularity !== "none"
    ? `GROUP BY time_bucket
ORDER BY time_bucket`
    : `ORDER BY ${timeColumn}`
};`
    }

    setGeneratedSQL(sql)

    toast({
      title: "SQL generated",
      description: "Date-filtered SQL query has been generated.",
    })
  }

  const handleExecuteQuery = () => {
    if (!generatedSQL) {
      toast({
        title: "No SQL query",
        description: "Please generate a SQL query first.",
        variant: "destructive",
      })
      return
    }

    setIsExecuting(true)

    setTimeout(() => {
      // Mock results based on selected table and granularity
      let mockResults

      if (table === "orders") {
        if (granularity !== "none") {
          mockResults = {
            columns: ["time_bucket", "order_count", "total_revenue"],
            rows: [
              { time_bucket: "2023-05-01 00:00:00", order_count: 125, total_revenue: 12599.99 },
              { time_bucket: "2023-05-02 00:00:00", order_count: 142, total_revenue: 15789.5 },
              { time_bucket: "2023-05-03 00:00:00", order_count: 98, total_revenue: 9845.75 },
              { time_bucket: "2023-05-04 00:00:00", order_count: 110, total_revenue: 11250.25 },
              { time_bucket: "2023-05-05 00:00:00", order_count: 135, total_revenue: 13750.0 },
            ],
            totalRows: 5,
            chartData: {
              labels: ["May 1", "May 2", "May 3", "May 4", "May 5"],
              datasets: [
                {
                  label: "Order Count",
                  data: [125, 142, 98, 110, 135],
                  borderColor: "rgb(59, 130, 246)",
                  backgroundColor: "rgba(59, 130, 246, 0.5)",
                },
                {
                  label: "Revenue",
                  data: [12599.99, 15789.5, 9845.75, 11250.25, 13750.0],
                  borderColor: "rgb(16, 185, 129)",
                  backgroundColor: "rgba(16, 185, 129, 0.5)",
                  yAxisID: "y1",
                },
              ],
            },
          }
        } else {
          mockResults = {
            columns: ["timestamp", "order_id", "customer_id", "total_amount", "status"],
            rows: [
              {
                timestamp: "2023-05-15 14:30:00",
                order_id: 1001,
                customer_id: 5,
                total_amount: 125.99,
                status: "Delivered",
              },
              {
                timestamp: "2023-05-14 10:15:00",
                order_id: 1002,
                customer_id: 8,
                total_amount: 79.5,
                status: "Shipped",
              },
              {
                timestamp: "2023-05-12 16:45:00",
                order_id: 1003,
                customer_id: 12,
                total_amount: 249.99,
                status: "Processing",
              },
              {
                timestamp: "2023-05-10 09:20:00",
                order_id: 1004,
                customer_id: 3,
                total_amount: 34.25,
                status: "Delivered",
              },
              {
                timestamp: "2023-05-08 11:10:00",
                order_id: 1005,
                customer_id: 7,
                total_amount: 189.0,
                status: "Delivered",
              },
            ],
            totalRows: 5,
          }
        }
      } else if (table === "users") {
        if (granularity !== "none") {
          mockResults = {
            columns: ["time_bucket", "new_users"],
            rows: [
              { time_bucket: "2023-05-01 00:00:00", new_users: 45 },
              { time_bucket: "2023-05-02 00:00:00", new_users: 52 },
              { time_bucket: "2023-05-03 00:00:00", new_users: 38 },
              { time_bucket: "2023-05-04 00:00:00", new_users: 41 },
              { time_bucket: "2023-05-05 00:00:00", new_users: 49 },
            ],
            totalRows: 5,
            chartData: {
              labels: ["May 1", "May 2", "May 3", "May 4", "May 5"],
              datasets: [
                {
                  label: "New Users",
                  data: [45, 52, 38, 41, 49],
                  borderColor: "rgb(139, 92, 246)",
                  backgroundColor: "rgba(139, 92, 246, 0.5)",
                },
              ],
            },
          }
        } else {
          mockResults = {
            columns: ["timestamp", "user_id", "username", "email"],
            rows: [
              { timestamp: "2023-05-15 08:30:00", user_id: 101, username: "johndoe", email: "john@example.com" },
              { timestamp: "2023-05-12 14:45:00", user_id: 102, username: "janedoe", email: "jane@example.com" },
              { timestamp: "2023-05-10 11:20:00", user_id: 103, username: "bobsmith", email: "bob@example.com" },
              { timestamp: "2023-05-08 09:15:00", user_id: 104, username: "alicejones", email: "alice@example.com" },
              { timestamp: "2023-05-05 16:30:00", user_id: 105, username: "mikebrown", email: "mike@example.com" },
            ],
            totalRows: 5,
          }
        }
      } else {
        if (granularity !== "none") {
          mockResults = {
            columns: ["time_bucket", "post_count", "unique_authors"],
            rows: [
              { time_bucket: "2023-05-01 00:00:00", post_count: 28, unique_authors: 15 },
              { time_bucket: "2023-05-02 00:00:00", post_count: 32, unique_authors: 18 },
              { time_bucket: "2023-05-03 00:00:00", post_count: 25, unique_authors: 14 },
              { time_bucket: "2023-05-04 00:00:00", post_count: 30, unique_authors: 17 },
              { time_bucket: "2023-05-05 00:00:00", post_count: 35, unique_authors: 20 },
            ],
            totalRows: 5,
            chartData: {
              labels: ["May 1", "May 2", "May 3", "May 4", "May 5"],
              datasets: [
                {
                  label: "Post Count",
                  data: [28, 32, 25, 30, 35],
                  borderColor: "rgb(249, 115, 22)",
                  backgroundColor: "rgba(249, 115, 22, 0.5)",
                },
                {
                  label: "Unique Authors",
                  data: [15, 18, 14, 17, 20],
                  borderColor: "rgb(236, 72, 153)",
                  backgroundColor: "rgba(236, 72, 153, 0.5)",
                },
              ],
            },
          }
        } else {
          mockResults = {
            columns: ["timestamp", "post_id", "user_id", "title"],
            rows: [
              { timestamp: "2023-05-15 10:30:00", post_id: 201, user_id: 101, title: "Getting Started with SQL" },
              { timestamp: "2023-05-14 15:45:00", post_id: 202, user_id: 102, title: "Advanced SQL Techniques" },
              { timestamp: "2023-05-12 11:20:00", post_id: 203, user_id: 101, title: "Data Analysis with SQL" },
              { timestamp: "2023-05-10 09:15:00", post_id: 204, user_id: 103, title: "SQL Best Practices" },
              { timestamp: "2023-05-08 16:30:00", post_id: 205, user_id: 102, title: "SQL vs NoSQL" },
            ],
            totalRows: 5,
          }
        }
      }

      setQueryResults(mockResults)
      setIsExecuting(false)

      toast({
        title: "Query executed",
        description: `Found ${mockResults.totalRows} records in the date range.`,
      })
    }, 1000)
  }

  const navigateDateRange = (direction: "prev" | "next") => {
    if (!fromDate || !toDate) return

    const diff = toDate.getTime() - fromDate.getTime()
    const days = diff / (1000 * 60 * 60 * 24)

    if (direction === "prev") {
      setFromDate(new Date(fromDate.getTime() - diff))
      setToDate(new Date(toDate.getTime() - diff))
    } else {
      setFromDate(new Date(fromDate.getTime() + diff))
      setToDate(new Date(toDate.getTime() + diff))
    }
  }

  const renderChart = () => {
    if (!queryResults?.chartData) return null

    return (
      <div className="h-80 w-full p-4">
        <div className="flex justify-center items-center h-full w-full bg-muted/50 rounded-lg">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground" />
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
        <h1 className="text-3xl font-bold tracking-tight">Enhanced Date Filtering</h1>
        <p className="text-muted-foreground">Filter data by date ranges with advanced time selection options.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Time Range Selection</CardTitle>
          <CardDescription>Select a table and configure your time range options.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="table-select">Select Table</label>
            <Select value={table} onValueChange={setTable}>
              <SelectTrigger>
                <SelectValue placeholder="Select a table" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="orders">Orders</SelectItem>
                <SelectItem value="users">Users</SelectItem>
                <SelectItem value="posts">Posts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Tabs value={timeRangeMode} onValueChange={setTimeRangeMode} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="real-time">Real-time</TabsTrigger>
                <TabsTrigger value="relative">Relative</TabsTrigger>
                <TabsTrigger value="date-range">Date Range</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="real-time" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <Button
                    variant={timePreset === "30sec" ? "default" : "outline"}
                    onClick={() => handleTimePresetChange("30sec")}
                    className="w-full"
                  >
                    30s
                  </Button>
                  <Button
                    variant={timePreset === "1min" ? "default" : "outline"}
                    onClick={() => handleTimePresetChange("1min")}
                    className="w-full"
                  >
                    1m
                  </Button>
                  <Button
                    variant={timePreset === "5min" ? "default" : "outline"}
                    onClick={() => handleTimePresetChange("5min")}
                    className="w-full"
                  >
                    5m
                  </Button>
                  <Button
                    variant={timePreset === "30min" ? "default" : "outline"}
                    onClick={() => handleTimePresetChange("30min")}
                    className="w-full"
                  >
                    30m
                  </Button>
                  <Button
                    variant={timePreset === "1hr" ? "default" : "outline"}
                    onClick={() => handleTimePresetChange("1hr")}
                    className="w-full"
                  >
                    1h
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {fromDate && toDate
                      ? `From ${format(fromDate, "MMM d, yyyy HH:mm")} to ${format(toDate, "MMM d, yyyy HH:mm")}`
                      : "Select a time range"}
                  </span>
                </div>
              </TabsContent>

              <TabsContent value="relative" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    variant={timePreset === "today" ? "default" : "outline"}
                    onClick={() => handleTimePresetChange("today")}
                    className="w-full"
                  >
                    Today
                  </Button>
                  <Button
                    variant={timePreset === "wtd" ? "default" : "outline"}
                    onClick={() => handleTimePresetChange("wtd")}
                    className="w-full"
                  >
                    Week to date
                  </Button>
                  <Button
                    variant={timePreset === "mtd" ? "default" : "outline"}
                    onClick={() => handleTimePresetChange("mtd")}
                    className="w-full"
                  >
                    Month to date
                  </Button>
                  <Button
                    variant={timePreset === "ytd" ? "default" : "outline"}
                    onClick={() => handleTimePresetChange("ytd")}
                    className="w-full"
                  >
                    Year to date
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    variant={timePreset === "last-15min" ? "default" : "outline"}
                    onClick={() => handleTimePresetChange("last-15min")}
                    className="w-full"
                  >
                    Last 15 min
                  </Button>
                  <Button
                    variant={timePreset === "last-24hr" ? "default" : "outline"}
                    onClick={() => handleTimePresetChange("last-24hr")}
                    className="w-full"
                  >
                    Last 24 hours
                  </Button>
                  <Button
                    variant={timePreset === "last-7days" ? "default" : "outline"}
                    onClick={() => handleTimePresetChange("last-7days")}
                    className="w-full"
                  >
                    Last 7 days
                  </Button>
                  <Button
                    variant={timePreset === "last-30days" ? "default" : "outline"}
                    onClick={() => handleTimePresetChange("last-30days")}
                    className="w-full"
                  >
                    Last 30 days
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {fromDate && toDate
                      ? `From ${format(fromDate, "MMM d, yyyy")} to ${format(toDate, "MMM d, yyyy")}`
                      : "Select a time range"}
                  </span>
                </div>
              </TabsContent>

              <TabsContent value="date-range" className="space-y-4 pt-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <label>From Date</label>
                      <Button variant="outline" size="sm" onClick={() => navigateDateRange("prev")}>
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous period</span>
                      </Button>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fromDate ? format(fromDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <label>To Date</label>
                      <Button variant="outline" size="sm" onClick={() => navigateDateRange("next")}>
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next period</span>
                      </Button>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {toDate ? format(toDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label>Timezone Awareness</label>
                    <div className="flex items-center space-x-2">
                      <Switch id="timezone" checked={timezoneAware} onCheckedChange={setTimezoneAware} />
                      <Label htmlFor="timezone" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {timezoneAware ? "Timezone aware" : "No timezone conversion"}
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label>Time Granularity</label>
                    <RadioGroup value={granularity} onValueChange={setGranularity}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="none" />
                        <Label htmlFor="none">None (raw data)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hourly" id="hourly" />
                        <Label htmlFor="hourly">Hourly aggregation</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="daily" />
                        <Label htmlFor="daily">Daily aggregation</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekly" id="weekly" />
                        <Label htmlFor="weekly">Weekly aggregation</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateSQL}>Generate SQL</Button>
        </CardFooter>
      </Card>

      {generatedSQL && (
        <Card>
          <CardHeader>
            <CardTitle>Generated SQL</CardTitle>
            <CardDescription>SQL query with time range filter.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Textarea value={generatedSQL} className="min-h-[150px] font-mono" readOnly />
              <Button variant="outline" size="icon" className="absolute top-2 right-2">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleExecuteQuery} disabled={isExecuting}>
              <Play className="h-4 w-4 mr-2" />
              {isExecuting ? "Executing..." : "Execute Query"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {queryResults && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Query Results</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                >
                  Table
                </Button>
                <Button
                  variant={viewMode === "chart" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("chart")}
                  disabled={!queryResults.chartData}
                >
                  Chart
                </Button>
                <Button variant="outline" size="sm">
                  Export
                </Button>
              </div>
            </div>
            <CardDescription>Data filtered by selected time range.</CardDescription>
          </CardHeader>
          <CardContent>
            {viewMode === "table" ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {queryResults.columns.map((column: string) => (
                        <TableHead key={column}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queryResults.rows.map((row: any, index: number) => (
                      <TableRow key={index}>
                        {queryResults.columns.map((column: string) => (
                          <TableCell key={column}>{row[column]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              renderChart()
            )}

            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

