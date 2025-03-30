"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Download, Play, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useDebounce } from "use-debounce"

export default function WriteSql() {
  const [schemaDescription, setSchemaDescription] = useState("")
  const [sqlQuery, setSqlQuery] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)
  const [queryResults, setQueryResults] = useState<any>(null)
  const [queryError, setQueryError] = useState<string | null>(null)
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const [suggestion, setSuggestion] = useState("")
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false)
  const [suggestionError, setSuggestionError] = useState<string | null>(null)
  const { toast } = useToast()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [debouncedQuery] = useDebounce(sqlQuery, 500)

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestion = async () => {
      if (!debouncedQuery.trim() || debouncedQuery.split(/\s+/).length < 3) {
        setSuggestion("")
        setShowSuggestion(false)
        return
      }
    
      try {
        setIsLoadingSuggestion(true)
        setSuggestionError(null)
        
        const response = await fetch('http://localhost:5000/suggest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: debouncedQuery,
            schema: schemaDescription
          })
        });
    
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }
    
        const data = await response.json()
        if (data.suggestion && data.suggestion !== debouncedQuery) {
          setSuggestion(data.suggestion)
          setShowSuggestion(true)
        } else {
          setShowSuggestion(false)
        }
      } catch (err: any) {
        setSuggestionError(err.message)
        console.error('Error fetching suggestion:', err)
        setShowSuggestion(false)
        toast({
          title: "Suggestion Error",
          description: "Couldn't fetch suggestions. Make sure the API server is running.",
          variant: "destructive"
        })
      } finally {
        setIsLoadingSuggestion(false)
      }
    }

    fetchSuggestion()
  }, [debouncedQuery, schemaDescription, toast])

  // Handle tab key to accept suggestion
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && showSuggestion && suggestion) {
      e.preventDefault()
      setSqlQuery(suggestion)
      setShowSuggestion(false)
    }
  }

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSqlQuery(e.target.value)
    setShowSuggestion(true)
  }

  const getGhostText = () => {
    if (!showSuggestion || !suggestion || sqlQuery === suggestion) return ""
    
    let i = 0
    while (i < sqlQuery.length && i < suggestion.length && sqlQuery[i] === suggestion[i]) {
      i++
    }
    
    return suggestion.slice(i)
  }

  const ghostText = getGhostText()

  const handleExecuteQuery = async () => {
    if (!schemaDescription.trim()) {
      toast({
        title: "Schema description required",
        description: "Please describe your database schema before executing a query.",
        variant: "destructive",
      })
      return
    }

    if (!sqlQuery.trim()) {
      toast({
        title: "SQL query required",
        description: "Please enter a SQL query to execute.",
        variant: "destructive",
      })
      return
    }

    setIsExecuting(true)
    setQueryError(null)
    setQueryResults(null)
    setShowSuggestion(false)

    try {
      // Here you would typically call your actual API endpoint
      // For now we'll keep the mock implementation
      setTimeout(() => {
        setIsExecuting(false)
        
        if (
          !sqlQuery.toLowerCase().includes("select") &&
          !sqlQuery.toLowerCase().includes("insert") &&
          !sqlQuery.toLowerCase().includes("update") &&
          !sqlQuery.toLowerCase().includes("delete")
        ) {
          setQueryError("Invalid SQL syntax. Query must include SELECT, INSERT, UPDATE, or DELETE statement.")
          toast({
            title: "Query execution failed",
            description: "There was an error in your SQL syntax.",
            variant: "destructive",
          })
          return
        }

        if (sqlQuery.toLowerCase().includes("select")) {
          const mockResults = {
            columns: ["id", "username", "email", "created_at"],
            rows: [
              { id: 1, username: "johndoe", email: "john@example.com", created_at: "2023-01-15 14:30:45" },
              { id: 2, username: "janedoe", email: "jane@example.com", created_at: "2023-02-20 09:15:22" },
              { id: 3, username: "bobsmith", email: "bob@example.com", created_at: "2023-03-10 16:45:33" },
              { id: 4, username: "alicejones", email: "alice@example.com", created_at: "2023-04-05 11:20:18" },
              { id: 5, username: "mikebrown", email: "mike@example.com", created_at: "2023-05-12 08:55:41" },
            ],
            totalRows: 5,
            executionTime: 0.127,
          }

          setQueryResults(mockResults)
          setExecutionTime(mockResults.executionTime)

          toast({
            title: "Query executed successfully",
            description: `Retrieved ${mockResults.totalRows} rows in ${mockResults.executionTime} seconds.`,
          })
        } else {
          setQueryResults({
            affectedRows: 3,
            executionTime: 0.085,
          })
          setExecutionTime(0.085)

          toast({
            title: "Query executed successfully",
            description: `Affected 3 rows in 0.085 seconds.`,
          })
        }
      }, 1500)
    } catch (error) {
      setIsExecuting(false)
      setQueryError("Failed to execute query")
      toast({
        title: "Execution Error",
        description: "Couldn't execute the query. Please try again.",
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The SQL query has been copied to your clipboard.",
    })
  }

  const downloadQuery = () => {
    const element = document.createElement("a")
    const file = new Blob([sqlQuery], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "query.sql"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">SQL Copilot</h1>
        <p className="text-muted-foreground">Describe your schema and get AI-powered SQL suggestions</p>
      </div>

      <div className="grid gap-16 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schema Description</CardTitle>
            <CardDescription>
              Describe your database tables and relationships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Example: users table with id, name, email columns; posts table with id, user_id, title, content"
              className="min-h-[200px]"
              value={schemaDescription}
              onChange={(e) => setSchemaDescription(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader >
            <CardTitle>SQL Query</CardTitle>
            <CardDescription>
              Write your query or accept AI suggestions with Tab
            </CardDescription>
          </CardHeader>
          <CardContent >
            <div className="relative">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  placeholder="Start typing your SQL query (e.g. SELECT * FROM users)..."
                  className="min-h-[200px] font-mono relative z-10 bg-transparent"
                  value={sqlQuery}
                  onChange={handleQueryChange}
                  onKeyDown={handleKeyDown}
                />
                {showSuggestion && ghostText && (
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="font-mono text-muted-foreground opacity-50 p-3 whitespace-pre-wrap">
                      {sqlQuery}
                      <span className="text-primary opacity-70">{ghostText}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(sqlQuery)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={downloadQuery}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {isLoadingSuggestion ? (
                <span>Generating suggestions...</span>
              ) : suggestionError ? (
                <span className="text-destructive">Suggestion service unavailable</span>
              ) : showSuggestion && ghostText ? (
                <span>Press <kbd className="px-2 py-1 bg-muted rounded-md">Tab</kbd> to accept suggestion</span>
              ) : null}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              {executionTime !== null && `Last execution: ${executionTime}s`}
            </div>
            <Button onClick={handleExecuteQuery} disabled={isExecuting}>
              <Play className="h-4 w-4 mr-2" />
              {isExecuting ? "Executing..." : "Execute Query"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {queryError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{queryError}</AlertDescription>
        </Alert>
      )}

      {queryResults && !queryError && (
        <Card>
          <CardHeader>
            <CardTitle>Query Results</CardTitle>
            <CardDescription>
              {queryResults.totalRows ? `${queryResults.totalRows} rows returned` : `${queryResults.affectedRows} rows affected`}
              {executionTime !== null && ` in ${executionTime} seconds`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {queryResults.rows ? (
              <Tabs defaultValue="table">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="table">Table View</TabsTrigger>
                  <TabsTrigger value="json">JSON View</TabsTrigger>
                </TabsList>
                <TabsContent value="table">
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
                </TabsContent>
                <TabsContent value="json">
                  <pre className="bg-secondary p-4 rounded-md overflow-x-auto">
                    <code>{JSON.stringify(queryResults.rows, null, 2)}</code>
                  </pre>
                </TabsContent>
              </Tabs>
            ) : (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Query executed successfully. {queryResults.affectedRows} rows affected.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}