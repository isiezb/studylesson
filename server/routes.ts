import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { createProxyMiddleware } from "http-proxy-middleware";
import { storage } from "./storage";
import { createLessonInputSchema, insertLessonSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import axios from "axios";
import { log } from "./vite";

// Constants
const FASTAPI_URL = "http://localhost:8000";
const useFastAPI = process.env.USE_FASTAPI === "true";

// Function to check if FastAPI server is running
async function checkFastApi() {
  try {
    const response = await axios.get(`${FASTAPI_URL}/api/health`, { timeout: 2000 });
    if (response.status === 200) {
      log("FastAPI server is running", "express");
      return true;
    }
  } catch (error) {
    log("FastAPI server is not available, using database storage", "express");
    return false;
  }
  return false;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoints for monitoring - using multiple paths for different services
  app.get("/api/health-check", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok", message: "Server is running" });
  });
  
  // Additional health check endpoint for Render.com deployment platform
  app.get("/api/healthz", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok", message: "Health check passed" });
  });

  // Check if FastAPI is running (only if configured to use it)
  const fastApiRunning = useFastAPI ? await checkFastApi() : false;

  // If FastAPI is running and we're configured to use it, proxy API requests
  if (fastApiRunning) {
    log("Setting up proxy to FastAPI server", "express");
    
    // Create a proxy for the FastAPI server
    const apiProxy = createProxyMiddleware({
      target: FASTAPI_URL,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'  // No rewrite needed in this case
      },
      // @ts-ignore - logLevel is actually a valid option but TypeScript doesn't recognize it
      logLevel: 'debug'
    });

    // Use the proxy for API requests
    app.use('/api', apiProxy);
  } else {
    // Use database storage instead of FastAPI
    log("Using database storage for API endpoints", "express");
    
    // Get all lessons
    app.get("/api/lessons", async (_req: Request, res: Response) => {
      try {
        const lessons = await storage.getLessons();
        res.json(lessons);
      } catch (error) {
        console.error("Error fetching lessons:", error);
        res.status(500).json({ message: "Failed to fetch lessons" });
      }
    });

    // Get a specific lesson by ID
    app.get("/api/lessons/:id", async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid lesson ID" });
        }

        const lesson = await storage.getLesson(id);
        if (!lesson) {
          return res.status(404).json({ message: "Lesson not found" });
        }

        res.json(lesson);
      } catch (error) {
        console.error("Error fetching lesson:", error);
        res.status(500).json({ message: "Failed to fetch lesson" });
      }
    });

    // Create a new lesson
    app.post("/api/lessons", async (req: Request, res: Response) => {
      try {
        // Validate input
        const validatedInput = createLessonInputSchema.parse(req.body);
        
        // For a real AI-powered app, this would send the input to an AI service
        // For now, we'll use a simulated response
        
        // Generate lesson content based on input
        const simulatedAIContent = `<h2>Introduction to ${validatedInput.topic}</h2>
<p>This is an AI-generated lesson about ${validatedInput.topic}. It's designed for ${validatedInput.gradeLevel} students using a ${validatedInput.lessonStyle} approach.</p>

<h2>Key Concepts</h2>
<p>Here are some important concepts related to ${validatedInput.topic}:</p>
<ul>
  <li>Understanding the fundamentals</li>
  <li>Historical development</li>
  <li>Modern applications</li>
  <li>Future directions</li>
</ul>

<h2>Main Principles</h2>
<p>The main principles underlying ${validatedInput.topic} include systematic approaches, analytical thinking, and creative problem-solving. These principles help us understand how ${validatedInput.topic} works in various contexts.</p>

<h2>Practical Applications</h2>
<p>There are numerous practical applications of ${validatedInput.topic} in everyday life and professional settings. These applications demonstrate the versatility and importance of this subject area.</p>

<h2>Summary</h2>
<p>In this lesson, we have explored the fundamental aspects of ${validatedInput.topic}, including its key concepts, main principles, and practical applications. Understanding these elements provides a solid foundation for further study and application of this important subject.</p>`;
        
        // Create lesson object
        const lessonData = {
          ...validatedInput,
          content: simulatedAIContent,
          readTime: 5, // Default read time
        };
        
        // Validate the full lesson data
        const validatedLesson = insertLessonSchema.parse(lessonData);
        
        // Store the lesson
        const newLesson = await storage.createLesson(validatedLesson);
        
        res.status(201).json(newLesson);
      } catch (error) {
        console.error("Error creating lesson:", error);
        if (error instanceof ZodError) {
          return res.status(400).json({ 
            message: "Validation error", 
            errors: fromZodError(error).message 
          });
        }
        res.status(500).json({ message: "Failed to create lesson" });
      }
    });

    // Delete a lesson
    app.delete("/api/lessons/:id", async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid lesson ID" });
        }

        const success = await storage.deleteLesson(id);
        if (!success) {
          return res.status(404).json({ message: "Lesson not found" });
        }

        res.status(200).json({ message: "Lesson deleted successfully" });
      } catch (error) {
        console.error("Error deleting lesson:", error);
        res.status(500).json({ message: "Failed to delete lesson" });
      }
    });

    // Continue a lesson (add more content)
    app.post("/api/lessons/:id/continue", async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid lesson ID" });
        }

        const updatedLesson = await storage.continueLesson(id);
        if (!updatedLesson) {
          return res.status(404).json({ message: "Lesson not found" });
        }

        res.json(updatedLesson);
      } catch (error) {
        console.error("Error continuing lesson:", error);
        res.status(500).json({ message: "Failed to continue lesson" });
      }
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
