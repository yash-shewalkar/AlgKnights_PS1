"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Download, Edit, Upload, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export default function SchemaDesigner() {
  const [schemaDescription, setSchemaDescription] = useState("")
  const [generatedSchema, setGeneratedSchema] = useState<any>(null)
  const [ddlStatements, setDdlStatements] = useState("")
  const [inputMode, setInputMode] = useState("manual")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
      toast({
        title: "PDF uploaded",
        description: `File "${file.name}" has been uploaded successfully.`,
      })
    } else if (file) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
      toast({
        title: "PDF uploaded",
        description: `File "${file.name}" has been uploaded successfully.`,
      })
    } else if (file) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      })
    }
  }

  const handleGenerateSchema = () => {
    // In a real app, this would call an AI service with either text or PDF content
    // For demo purposes, we'll simulate a response

    if (inputMode === "pdf" && pdfFile) {
      toast({
        title: "Processing PDF",
        description: `Extracting schema information from "${pdfFile.name}"...`,
      })
    }

    const mockSchema = {
      tables: [
        {
          name: "users",
          columns: [
            { name: "id", type: "INTEGER", constraints: "PRIMARY KEY" },
            { name: "username", type: "VARCHAR(50)", constraints: "NOT NULL UNIQUE" },
            { name: "email", type: "VARCHAR(100)", constraints: "NOT NULL UNIQUE" },
            { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP" },
          ],
        },
        {
          name: "posts",
          columns: [
            { name: "id", type: "INTEGER", constraints: "PRIMARY KEY" },
            { name: "user_id", type: "INTEGER", constraints: "NOT NULL REFERENCES users(id)" },
            { name: "title", type: "VARCHAR(200)", constraints: "NOT NULL" },
            { name: "content", type: "TEXT", constraints: "" },
            { name: "published", type: "BOOLEAN", constraints: "DEFAULT FALSE" },
            { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP" },
          ],
        },
      ],
    }

    setGeneratedSchema(mockSchema)

    const mockDDL = `CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`

    setDdlStatements(mockDDL)

    toast({
      title: "Schema generated",
      description:
        "Your database schema has been generated based on your " +
        (inputMode === "manual" ? "description" : "PDF document") +
        ".",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The DDL statements have been copied to your clipboard.",
    })
  }

  const downloadDDL = () => {
    const element = document.createElement("a")
    const file = new Blob([ddlStatements], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "schema.sql"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Schema Designer</h1>
        <p className="text-muted-foreground">
          Describe your database schema in natural language and let AI generate it for you.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Describe Your Schema</CardTitle>
            <CardDescription>
              Describe the tables, columns, and relationships you need in your database.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleGroup
              type="single"
              value={inputMode}
              onValueChange={(value) => value && setInputMode(value)}
              className="justify-start"
            >
              <ToggleGroupItem value="manual" aria-label="Manual Description">
                Manual Description
              </ToggleGroupItem>
              <ToggleGroupItem value="pdf" aria-label="PDF Upload">
                PDF Upload
              </ToggleGroupItem>
            </ToggleGroup>

            {inputMode === "manual" ? (
              <Textarea
                placeholder="Example: I need a database for a blog with users and posts. Users have an ID, username, email, and creation date. Posts have an ID, user ID (foreign key to users), title, content, published status, and creation date."
                className="min-h-[200px]"
                value={schemaDescription}
                onChange={(e) => setSchemaDescription(e.target.value)}
              />
            ) : (
              <div
                className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center min-h-[200px]"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {pdfFile ? (
                  <div className="text-center">
                    <FileText className="h-10 w-10 mx-auto text-primary mb-2" />
                    <p className="font-medium">{pdfFile.name}</p>
                    <p className="text-sm text-muted-foreground mb-4">{(pdfFile.size / 1024).toFixed(2)} KB</p>
                    <Button variant="outline" size="sm" onClick={() => setPdfFile(null)}>
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop your PDF file here, or click to browse
                    </p>
                    <label htmlFor="pdf-upload">
                      <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                    <input
                      id="pdf-upload"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleGenerateSchema}
              disabled={(inputMode === "manual" && !schemaDescription.trim()) || (inputMode === "pdf" && !pdfFile)}
            >
              Generate Schema
            </Button>
          </CardFooter>
        </Card>

        {generatedSchema && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Schema</CardTitle>
              <CardDescription>AI-generated database schema based on your description.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="visual">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="visual">Visual Schema</TabsTrigger>
                  <TabsTrigger value="ddl">DDL Statements</TabsTrigger>
                </TabsList>
                <TabsContent value="visual" className="space-y-4">
                  {generatedSchema.tables.map((table: any) => (
                    <div key={table.name} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{table.name}</h3>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                      <div className="border rounded-md">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Column</th>
                              <th className="text-left p-2">Type</th>
                              <th className="text-left p-2">Constraints</th>
                            </tr>
                          </thead>
                          <tbody>
                            {table.columns.map((column: any) => (
                              <tr key={column.name} className="border-b last:border-0">
                                <td className="p-2">{column.name}</td>
                                <td className="p-2">{column.type}</td>
                                <td className="p-2">{column.constraints}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="ddl">
                  <div className="relative">
                    <pre className="bg-secondary p-4 rounded-md overflow-x-auto">
                      <code>{ddlStatements}</code>
                    </pre>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(ddlStatements)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={downloadDDL}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

