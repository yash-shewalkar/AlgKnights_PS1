"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Copy, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function History() {
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Mock history data
  const historyItems = [
    {
      id: 1,
      name: "Find top users by post count",
      query:
        "SELECT u.username, COUNT(p.id) AS post_count FROM users u JOIN posts p ON u.id = p.user_id GROUP BY u.username ORDER BY post_count DESC LIMIT 10",
      type: "translator",
      timestamp: "2023-05-15 14:32:45",
    },
    {
      id: 2,
      name: "Create users table",
      query:
        "CREATE TABLE users (id INTEGER PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE, email VARCHAR(100) NOT NULL UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
      type: "generator",
      timestamp: "2023-05-14 10:15:22",
    },
    {
      id: 3,
      name: "Filter orders by date range",
      query:
        "SELECT order_id, customer_id, order_date, total_amount, status FROM orders WHERE order_date BETWEEN DATE '2023-01-01' AND DATE '2023-05-01' ORDER BY order_date DESC",
      type: "date-filter",
      timestamp: "2023-05-13 16:45:10",
    },
    {
      id: 4,
      name: "Count posts by category",
      query:
        "SELECT c.name, COUNT(p.id) AS post_count FROM categories c LEFT JOIN posts p ON c.id = p.category_id GROUP BY c.name ORDER BY post_count DESC",
      type: "execution",
      timestamp: "2023-05-12 09:30:18",
    },
    {
      id: 5,
      name: "Find inactive users",
      query:
        "SELECT username, email, last_login FROM users WHERE last_login < DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY) ORDER BY last_login ASC",
      type: "translator",
      timestamp: "2023-05-11 11:20:33",
    },
  ]

  const filteredHistory = historyItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.query.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const copyToClipboard = (query: string) => {
    navigator.clipboard.writeText(query)
    toast({
      title: "Copied to clipboard",
      description: "The SQL query has been copied to your clipboard.",
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "translator":
        return "bg-blue-500"
      case "generator":
        return "bg-green-500"
      case "date-filter":
        return "bg-purple-500"
      case "execution":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Query History</h1>
        <p className="text-muted-foreground">View and reuse your previous queries.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Queries</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search queries..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>Your query history is saved for easy reference and reuse.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Timestamp</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getTypeColor(item.type)}>
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{item.timestamp}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(item.query)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm">
                          Reuse
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" is />
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
    </div>
  )
}

