"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Clock, Database } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function QueryExecution() {
  const [sqlQuery, setSqlQuery] = useState("")
  const [sqlDialect, setSqlDialect] = useState("trino")
  const [isExecuting, setIsExecuting] = useState(false)
  const [queryResults, setQueryResults] = useState<any>(null)
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const { toast } = useToast()

  const handleExecuteQuery = () => {
    // In a real app, this would call a backend service
    // For demo purposes, we'll simulate a response
    setIsExecuting(true)

    setTimeout(() => {
      const mockResults = {
        columns: ["username", "post_count"],
        rows: [
          { username: "johndoe", post_count: 15 },
          { username: "janedoe", post_count: 12 },
          { username: "bobsmith", post_count: 10 },
          { username: "alicejones", post_count: 9 },
          { username: "mikebrown", post_count: 8 },
          { username: "sarahlee", post_count: 7 },
          { username: "davidwilson", post_count: 7 },
          { username: "emilyclark", post_count: 6 },
          { username: "jamesmartin", post_count: 6 },
          { username: "oliviataylor", post_count: 6 },
        ],
        totalRows: 10,
        executionTime: 0.235, // seconds
      }

      setQueryResults(mockResults)
      setExecutionTime(mockResults.executionTime)
      setIsExecuting(false)

      toast({
        title: "Query executed",
        description: `Query completed in ${mockResults.executionTime} seconds.`,
      })
    }, 1500)
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Query Execution</h1>
        <p className="text-muted-foreground">Execute SQL queries and view results.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SQL Query</CardTitle>
          <CardDescription>Enter your SQL query and select the dialect.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="sql-dialect">SQL Dialect</label>
            <Select value={sqlDialect} onValueChange={setSqlDialect}>
              <SelectTrigger>
                <SelectValue placeholder="Select SQL dialect" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trino">Trino SQL</SelectItem>
                <SelectItem value="spark">Spark SQL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label htmlFor="sql-query">SQL Query</label>
            <Textarea
              id="sql-query"
              placeholder="Enter your SQL query here..."
              className="min-h-[150px] font-mono"
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleExecuteQuery} disabled={!sqlQuery.trim() || isExecuting}>
            {isExecuting ? "Executing..." : "Execute Query"}
          </Button>
        </CardFooter>
      </Card>

      {queryResults && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Query Results</CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{executionTime} seconds</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Database className="h-4 w-4 mr-1" />
                  <span>{queryResults.totalRows} rows</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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

