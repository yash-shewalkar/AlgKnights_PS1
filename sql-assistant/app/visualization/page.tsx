"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  Download,
  Plus,
  Move,
  Palette,
  Save,
  FolderOpen,
  ArrowUpDown,
  ArrowLeftRight,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function VisualizationDashboard() {
  const [chartType, setChartType] = useState("line")
  const [colorPalette, setColorPalette] = useState("default")
  const [dashboardLayout, setDashboardLayout] = useState("2x2")

  const renderChart = (type: string) => {
    return (
      <div className="h-full w-full p-4 bg-muted/30 rounded-lg border">
        <div className="flex justify-center items-center h-full w-full">
          <div className="text-center">
            {type === "line" && <LineChart className="h-16 w-16 mx-auto text-muted-foreground" />}
            {type === "bar" && <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground" />}
            {type === "pie" && <PieChart className="h-16 w-16 mx-auto text-muted-foreground" />}
            {type === "scatter" && <ScatterChart className="h-16 w-16 mx-auto text-muted-foreground" />}
            <p className="mt-2 text-sm text-muted-foreground">{type.charAt(0).toUpperCase() + type.slice(1)} Chart</p>
          </div>
        </div>
      </div>
    )
  }

  const dimensions = [
    { name: "Date", type: "date" },
    { name: "Category", type: "string" },
    { name: "Region", type: "string" },
    { name: "Product", type: "string" },
  ]

  const measures = [
    { name: "Revenue", type: "currency" },
    { name: "Quantity", type: "number" },
    { name: "Profit", type: "currency" },
    { name: "Discount", type: "percent" },
  ]

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Visualization Dashboard</h1>
        <p className="text-muted-foreground">Create and customize visualizations for your SQL query results.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chart Configuration</CardTitle>
              <CardDescription>Customize your visualization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Chart Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={chartType === "line" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("line")}
                    className="justify-start"
                  >
                    <LineChart className="h-4 w-4 mr-2" />
                    Line
                  </Button>
                  <Button
                    variant={chartType === "bar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("bar")}
                    className="justify-start"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Bar
                  </Button>
                  <Button
                    variant={chartType === "pie" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("pie")}
                    className="justify-start"
                  >
                    <PieChart className="h-4 w-4 mr-2" />
                    Pie
                  </Button>
                  <Button
                    variant={chartType === "scatter" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("scatter")}
                    className="justify-start"
                  >
                    <ScatterChart className="h-4 w-4 mr-2" />
                    Scatter
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Dimensions</label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {dimensions.map((dim) => (
                    <div key={dim.name} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <div className="flex items-center">
                        <Move className="h-3 w-3 mr-2 text-muted-foreground cursor-move" />
                        <span className="text-sm">{dim.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {dim.type}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-3 w-3 mr-2" />
                  Add Dimension
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Measures</label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {measures.map((measure) => (
                    <div key={measure.name} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <div className="flex items-center">
                        <Move className="h-3 w-3 mr-2 text-muted-foreground cursor-move" />
                        <span className="text-sm">{measure.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {measure.type}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-3 w-3 mr-2" />
                  Add Measure
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Color Palette</label>
                <Select value={colorPalette} onValueChange={setColorPalette}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color palette" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="pastel">Pastel</SelectItem>
                    <SelectItem value="vibrant">Vibrant</SelectItem>
                    <SelectItem value="monochrome">Monochrome</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {colorPalette === "custom" && (
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    <div className="h-6 w-full bg-blue-500 rounded-md"></div>
                    <div className="h-6 w-full bg-green-500 rounded-md"></div>
                    <div className="h-6 w-full bg-yellow-500 rounded-md"></div>
                    <div className="h-6 w-full bg-red-500 rounded-md"></div>
                    <Button variant="outline" size="sm" className="h-6 w-full p-0">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Axis Labels</label>
                <div className="space-y-2">
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs text-muted-foreground">X-Axis</label>
                    <Input placeholder="X-Axis Label" defaultValue="Date" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs text-muted-foreground">Y-Axis</label>
                    <Input placeholder="Y-Axis Label" defaultValue="Revenue" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dashboard Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Layout</label>
                <Select value={dashboardLayout} onValueChange={setDashboardLayout}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1x1">Single Chart</SelectItem>
                    <SelectItem value="2x1">Two Charts (Row)</SelectItem>
                    <SelectItem value="1x2">Two Charts (Column)</SelectItem>
                    <SelectItem value="2x2">Four Charts (Grid)</SelectItem>
                    <SelectItem value="custom">Custom Grid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="auto-refresh" />
                <Label htmlFor="auto-refresh">Auto-refresh (30s)</Label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Dashboard Actions</label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Load
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Area */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Sales Performance Dashboard</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                    Resize
                  </Button>
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Reorder
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {dashboardLayout === "1x1" && <div className="h-[500px]">{renderChart(chartType)}</div>}

              {dashboardLayout === "2x1" && (
                <div className="grid grid-cols-2 gap-4 h-[500px]">
                  {renderChart("line")}
                  {renderChart("bar")}
                </div>
              )}

              {dashboardLayout === "1x2" && (
                <div className="grid grid-rows-2 gap-4 h-[500px]">
                  {renderChart("pie")}
                  {renderChart("scatter")}
                </div>
              )}

              {dashboardLayout === "2x2" && (
                <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[500px]">
                  {renderChart("line")}
                  {renderChart("bar")}
                  {renderChart("pie")}
                  {renderChart("scatter")}
                </div>
              )}

              {dashboardLayout === "custom" && (
                <div className="h-[500px] bg-muted/30 rounded-lg border flex items-center justify-center">
                  <div className="text-center p-6">
                    <Palette className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm">Custom dashboard layout</p>
                    <p className="text-xs text-muted-foreground">Drag and drop charts to create your custom layout</p>
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Chart
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">Last updated: March 27, 2024 at 10:45 AM</div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export as PNG
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Table</CardTitle>
              <CardDescription>The source data for your visualizations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>{`2023-0${i + 1}-01`}</TableCell>
                        <TableCell>{["North", "South", "East", "West", "Central"][i]}</TableCell>
                        <TableCell>{["Product A", "Product B", "Product C", "Product D", "Product E"][i]}</TableCell>
                        <TableCell className="text-right">{`$${(Math.random() * 10000).toFixed(2)}`}</TableCell>
                        <TableCell className="text-right">{Math.floor(Math.random() * 100)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

