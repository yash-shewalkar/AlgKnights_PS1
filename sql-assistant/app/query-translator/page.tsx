"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Download, Edit, Play } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function QueryTranslator() {
  const [naturalLanguage, setNaturalLanguage] = useState("")
  const [sqlDialect, setSqlDialect] = useState("trino")
  const [translatedSQL, setTranslatedSQL] = useState("")
  const { toast } = useToast()

  const handleTranslate = () => {
    // In a real app, this would call an AI service
    // For demo purposes, we'll simulate a response
    let mockSQL = ""

    if (sqlDialect === "trino") {
      mockSQL = `SELECT 
  u.username,
  COUNT(p.id) AS post_count
FROM 
  users u
JOIN 
  posts p ON u.id = p.user_id
WHERE 
  p.created_at >= DATE '2023-01-01'
GROUP BY 
  u.username
HAVING 
  COUNT(p.id) > 5
ORDER BY 
  post_count DESC
LIMIT 10;`
    } else {
      mockSQL = `SELECT 
  u.username,
  COUNT(p.id) AS post_count
FROM 
  users u
JOIN 
  posts p ON u.id = p.user_id
WHERE 
  p.created_at >= '2023-01-01'
GROUP BY 
  u.username
HAVING 
  COUNT(p.id) > 5
ORDER BY 
  post_count DESC
LIMIT 10;`
    }

    setTranslatedSQL(mockSQL)

    toast({
      title: "Query translated",
      description: "Your natural language query has been translated to SQL.",
    })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedSQL)
    toast({
      title: "Copied to clipboard",
      description: "The SQL query has been copied to your clipboard.",
    })
  }

  const downloadSQL = () => {
    const element = document.createElement("a")
    const file = new Blob([translatedSQL], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `query_${sqlDialect}.sql`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Query Translator</h1>
        <p className="text-muted-foreground">Translate natural language to SQL queries.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Natural Language Query</CardTitle>
            <CardDescription>Describe the query you want to run in plain English.</CardDescription>
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
              <label htmlFor="natural-language">Query Description</label>
              <Textarea
                id="natural-language"
                placeholder="Example: Show me the top 10 users with the most posts created since January 1, 2023, who have more than 5 posts."
                className="min-h-[150px]"
                value={naturalLanguage}
                onChange={(e) => setNaturalLanguage(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleTranslate} disabled={!naturalLanguage.trim()}>
              Translate to SQL
            </Button>
          </CardFooter>
        </Card>

        {translatedSQL && (
          <Card>
            <CardHeader>
              <CardTitle>Translated SQL</CardTitle>
              <CardDescription>AI-translated SQL query for {sqlDialect.toUpperCase()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-secondary p-4 rounded-md overflow-x-auto">
                  <code>{translatedSQL}</code>
                </pre>
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button variant="outline" size="icon" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={downloadSQL}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary">
                <Play className="h-4 w-4 mr-2" />
                Execute Query
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}

