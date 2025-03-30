"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ThumbsDown, ThumbsUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function Feedback() {
  const [feedbackType, setFeedbackType] = useState<"positive" | "negative" | null>(null)
  const [sqlQuery, setSqlQuery] = useState("")
  const [feedbackText, setFeedbackText] = useState("")
  const { toast } = useToast()

  const handleSubmitFeedback = () => {
    if (!feedbackType) {
      toast({
        title: "Feedback type required",
        description: "Please select whether this is positive or negative feedback.",
        variant: "destructive",
      })
      return
    }

    if (!sqlQuery.trim()) {
      toast({
        title: "SQL query required",
        description: "Please paste the SQL query you're providing feedback on.",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would send the feedback to a backend service
    toast({
      title: "Feedback submitted",
      description: "Thank you for your feedback! It helps us improve our AI models.",
    })

    // Reset form
    setFeedbackType(null)
    setSqlQuery("")
    setFeedbackText("")
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
        <p className="text-muted-foreground">Provide feedback on AI-generated SQL to help us improve.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
          <CardDescription>Your feedback helps us improve our AI models for SQL generation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Feedback Type</Label>
            <RadioGroup
              value={feedbackType || ""}
              onValueChange={(value) => setFeedbackType(value as "positive" | "negative")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="positive" id="positive" />
                <Label htmlFor="positive" className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Positive
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="negative" id="negative" />
                <Label htmlFor="negative" className="flex items-center">
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Negative
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sql-query">SQL Query</Label>
            <Textarea
              id="sql-query"
              placeholder="Paste the SQL query you're providing feedback on..."
              className="min-h-[150px] font-mono"
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-text">Your Feedback</Label>
            <Textarea
              id="feedback-text"
              placeholder="Please describe what was good or what could be improved..."
              className="min-h-[100px]"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmitFeedback}>Submit Feedback</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

