"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Download, Edit } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SqlGenerator() {
  const [sqlType, setSqlType] = useState("ddl")
  const [sqlDialect, setSqlDialect] = useState("trino")
  const [description, setDescription] = useState("")
  const [generatedSQL, setGeneratedSQL] = useState("")
  const { toast } = useToast()

  const handleGenerateSQL = () => {
    // In a real app, this would call an AI service
    // For demo purposes, we'll simulate a response
    let mockSQL = ""

    if (sqlType === "ddl") {
      if (sqlDialect === "trino") {
        mockSQL = `CREATE TABLE users (
  id BIGINT,
  username VARCHAR,
  email VARCHAR,
  created_at TIMESTAMP,
  PRIMARY KEY (id)
)
WITH (
  format = 'ORC',
  partitioning = ARRAY['created_at']
);`
      } else {
        mockSQL = `CREATE TABLE users (
  id BIGINT,
  username STRING,
  email STRING,
  created_at TIMESTAMP,
  PRIMARY KEY (id)
)
USING DELTA
PARTITIONED BY (created_at);`
      }
    } else {
      if (sqlDialect === "trino") {
        mockSQL = `INSERT INTO users (id, username, email, created_at)
VALUES
  (1, 'johndoe', 'john@example.com', TIMESTAMP '2023-01-01 10:00:00'),
  (2, 'janedoe', 'jane@example.com', TIMESTAMP '2023-01-02 11:30:00');

UPDATE users
SET email = 'john.doe@example.com'
WHERE id = 1;

DELETE FROM users
WHERE id = 2;`
      } else {
        mockSQL = `INSERT INTO users
VALUES
  (1, 'johndoe', 'john@example.com', TIMESTAMP('2023-01-01 10:00:00')),
  (2, 'janedoe', 'jane@example.com', TIMESTAMP('2023-01-02 11:30:00'));

UPDATE users
SET email = 'john.doe@example.com'
WHERE id = 1;

DELETE FROM users
WHERE id = 2;`
      }
    }

    setGeneratedSQL(mockSQL)

    toast({
      title: "SQL generated",
      description: `Your ${sqlType.toUpperCase()} SQL has been generated for ${sqlDialect.toUpperCase()}.`,
    })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSQL)
    toast({
      title: "Copied to clipboard",
      description: "The SQL has been copied to your clipboard.",
    })
  }

  const downloadSQL = () => {
    const element = document.createElement("a")
    const file = new Blob([generatedSQL], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${sqlType}_${sqlDialect}.sql`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">SQL Generator</h1>
        <p className="text-muted-foreground">Generate SQL for table creation and data manipulation.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Generate SQL</CardTitle>
            <CardDescription>Describe what SQL you need and select the SQL dialect.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="sql-type">SQL Type</label>
              <Tabs value={sqlType} onValueChange={setSqlType} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ddl">DDL (Create Tables)</TabsTrigger>
                  <TabsTrigger value="dml">DML (Insert, Update, Delete)</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

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
              <label htmlFor="description">Description</label>
              <Textarea
                id="description"
                placeholder={
                  sqlType === "ddl"
                    ? "Example: Create a users table with id, username, email, and created_at fields."
                    : "Example: Insert two users, update the email of the first user, and delete the second user."
                }
                className="min-h-[150px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateSQL} disabled={!description.trim()}>
              Generate SQL
            </Button>
          </CardFooter>
        </Card>

        {generatedSQL && (
          <Card>
            <CardHeader>
              <CardTitle>Generated SQL</CardTitle>
              <CardDescription>
                AI-generated {sqlType.toUpperCase()} for {sqlDialect.toUpperCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-secondary p-4 rounded-md overflow-x-auto">
                  <code>{generatedSQL}</code>
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
          </Card>
        )}
      </div>
    </div>
  )
}

