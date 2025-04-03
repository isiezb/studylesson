from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import logging
from dotenv import load_dotenv
import traceback

# Import routers
from api.routers.lesson import router as lesson_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

logger = logging.getLogger("api")

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Lesson Generator API",
    description="API for generating and managing educational lessons",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; in production, specify exact domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error", "detail": str(exc)}
    )

# Root route
@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Welcome to Lesson Generator API", "version": "1.0.0"}

# Health check
@app.get("/api/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}

# Include routers
app.include_router(lesson_router, prefix="/api", tags=["lessons"])

# Run app with uvicorn if this file is run directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)