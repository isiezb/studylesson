from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
import logging

from api.models.lesson import (
    Lesson,
    LessonCreate,
    LessonGenerationRequest,
    LessonContinuationRequest,
    QuizQuestion
)
from api.services.storage import lesson_storage
from api.services import llm_client
from api.services.llm.prompting import PromptGenerator

router = APIRouter()
logger = logging.getLogger("api.routes.lesson")

@router.get("/lessons", response_model=List[Lesson])
async def get_lessons():
    """Get all lessons"""
    return lesson_storage.get_all_lessons()

@router.get("/lessons/{lesson_id}", response_model=Lesson)
async def get_lesson(lesson_id: int):
    """Get a lesson by ID"""
    lesson = lesson_storage.get_lesson(lesson_id)
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lesson with ID {lesson_id} not found"
        )
    return lesson

@router.post("/lessons", response_model=Lesson, status_code=status.HTTP_201_CREATED)
async def create_lesson(request: LessonGenerationRequest):
    """Create a new lesson using AI generation"""
    try:
        logger.info(f"Generating lesson for topic: {request.topic}")
        
        # Generate prompt for the LLM
        prompt = PromptGenerator.create_lesson_prompt(request)
        
        # Generate content using LLM
        response_text = await llm_client.generate_content(
            prompt=prompt,
            system_prompt=PromptGenerator.SYSTEM_PROMPT
        )
        
        # Parse the LLM response
        try:
            data = PromptGenerator.parse_llm_response(response_text)
            
            # Extract content and other fields
            content = data.get("content", "")
            title = data.get("title", request.topic)
            read_time = data.get("readTime", PromptGenerator.estimate_read_time(content))
            
            # Format content with the title as a heading
            formatted_content = f"# {title}\n\n{content}"
            
            # Extract quiz if present
            quiz = None
            if request.includeQuiz and "quiz" in data:
                quiz_data = data.get("quiz", [])
                quiz = [
                    QuizQuestion(
                        question=q.get("question", ""),
                        options=q.get("options", []),
                        correctAnswer=q.get("correctAnswer", 0)
                    )
                    for q in quiz_data
                ]
            
            # Create the lesson
            lesson_data = LessonCreate(
                topic=request.topic,
                gradeLevel=request.gradeLevel,
                lessonStyle=request.lessonStyle,
                content=formatted_content,
                readTime=read_time,
                includeQuiz=request.includeQuiz,
                quiz=quiz
            )
            
            return lesson_storage.create_lesson(lesson_data)
            
        except ValueError as e:
            logger.error(f"Error parsing LLM response: {str(e)}")
            # Fallback to creating a basic lesson
            estimated_read_time = PromptGenerator.estimate_read_time(response_text)
            
            lesson_data = LessonCreate(
                topic=request.topic,
                gradeLevel=request.gradeLevel,
                lessonStyle=request.lessonStyle,
                content=f"# {request.topic}\n\n{response_text}",
                readTime=estimated_read_time,
                includeQuiz=False
            )
            
            return lesson_storage.create_lesson(lesson_data)
            
    except Exception as e:
        logger.error(f"Error creating lesson: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create lesson: {str(e)}"
        )

@router.delete("/lessons/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lesson(lesson_id: int):
    """Delete a lesson by ID"""
    success = lesson_storage.delete_lesson(lesson_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lesson with ID {lesson_id} not found"
        )
    return None

@router.post("/lessons/{lesson_id}/continue", response_model=Lesson)
async def continue_lesson(lesson_id: int, request: Optional[LessonContinuationRequest] = None):
    """Continue a lesson by adding more content"""
    # Get the existing lesson
    lesson = lesson_storage.get_lesson(lesson_id)
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lesson with ID {lesson_id} not found"
        )
    
    try:
        logger.info(f"Continuing lesson with ID: {lesson_id}")
        
        # Generate prompt for the LLM
        prompt = PromptGenerator.create_continuation_prompt(lesson.content, request)
        
        # Generate content using LLM
        response_text = await llm_client.generate_content(
            prompt=prompt,
            system_prompt=PromptGenerator.SYSTEM_PROMPT
        )
        
        # Parse the LLM response
        try:
            data = PromptGenerator.parse_llm_response(response_text)
            
            # Extract continuation content
            continuation = data.get("continuation", "")
            read_time_increment = data.get("readTimeIncrement", PromptGenerator.estimate_read_time(continuation))
            
            # Update the lesson
            updated_lesson = lesson_storage.update_lesson(
                lesson_id=lesson_id,
                content=continuation,
                read_time_increment=read_time_increment
            )
            
            if not updated_lesson:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Lesson with ID {lesson_id} not found during update"
                )
                
            return updated_lesson
            
        except ValueError as e:
            logger.error(f"Error parsing LLM response for continuation: {str(e)}")
            
            # Fallback to adding the raw response
            estimated_read_time = PromptGenerator.estimate_read_time(response_text)
            
            # Update the lesson with the raw response
            updated_lesson = lesson_storage.update_lesson(
                lesson_id=lesson_id,
                content=response_text,
                read_time_increment=estimated_read_time
            )
            
            if not updated_lesson:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Lesson with ID {lesson_id} not found during update"
                )
                
            return updated_lesson
            
    except Exception as e:
        logger.error(f"Error continuing lesson: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to continue lesson: {str(e)}"
        )