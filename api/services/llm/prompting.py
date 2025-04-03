import json
import re
from typing import Dict, Any, Optional
import logging
import math

from api.models.lesson import LessonGenerationRequest, LessonContinuationRequest

logger = logging.getLogger("api.services.llm.prompting")

class PromptGenerator:
    """Generate prompts for lesson creation and continuation"""
    
    SYSTEM_PROMPT = """You are an expert educational content creator with years of experience in curriculum development.
    Your task is to create high-quality, engaging, and educational lesson content based on user specifications.
    Format your responses in markdown, with proper headings, lists, and emphasis where appropriate.
    Make the content accurate, age-appropriate, and aligned with educational standards.
    Focus on clarity, engagement, and educational value.
    """
    
    @staticmethod
    def create_lesson_prompt(request: LessonGenerationRequest) -> str:
        """
        Generate a prompt for creating a new lesson
        
        Args:
            request: The lesson generation request containing topic, grade level, etc.
            
        Returns:
            A formatted prompt string to send to the LLM
        """
        grade_level_desc = PromptGenerator._get_grade_level_description(request.gradeLevel)
        
        style_desc = ""
        if request.lessonStyle:
            style_desc = PromptGenerator._get_lesson_style_description(request.lessonStyle)
        
        quiz_instructions = ""
        if request.includeQuiz:
            quiz_instructions = """
Include a quiz at the end of the lesson with 3-5 multiple-choice questions that test understanding of the key concepts.
For each question, provide:
- The question text
- Four answer options
- The index of the correct answer (0-3)
"""

        additional = ""
        if request.additionalInstructions:
            additional = f"Additional instructions: {request.additionalInstructions}\n"
            
        prompt = f"""Create an educational lesson on the following topic:
Topic: {request.topic}
Grade Level: {grade_level_desc}
{style_desc}
{additional}

The lesson should be comprehensive, accurate, and engaging for the specified grade level.
Include a clear introduction, body with key concepts, and conclusion.
Use markdown formatting with headings, lists, and emphasis for clarity.
{quiz_instructions}

Return your response as a JSON object with the following structure:
{{
  "title": "The title of the lesson",
  "content": "The full lesson content in markdown",
  "readTime": estimated_read_time_in_minutes
"""

        if request.includeQuiz:
            prompt += """,
  "quiz": [
    {
      "question": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": correct_answer_index
    },
    // Additional questions...
  ]
"""

        prompt += "\n}"
        
        return prompt
    
    @staticmethod
    def create_continuation_prompt(original_content: str, request: Optional[LessonContinuationRequest] = None) -> str:
        """
        Generate a prompt for continuing an existing lesson
        
        Args:
            original_content: The original lesson content
            request: Optional continuation request with additional instructions
            
        Returns:
            A formatted prompt string to send to the LLM
        """
        additional = ""
        if request and request.additionalInstructions:
            additional = f"Additional instructions: {request.additionalInstructions}\n"
            
        prompt = f"""Continue the following educational lesson by adding more content.

Original lesson:
```
{original_content}
```

{additional}
Continue this lesson by adding additional content that builds on what's already covered.
Add new sections, examples, or activities that enhance the educational value.
Maintain the same tone, style, and grade level as the original content.
Use markdown formatting with headings, lists, and emphasis for clarity.

Return your response as a JSON object with the following structure:
{{
  "continuation": "The additional content to append to the lesson",
  "readTimeIncrement": estimated_additional_read_time_in_minutes
}}
"""
        
        return prompt
    
    @staticmethod
    def _get_grade_level_description(grade_level: str) -> str:
        """Convert grade level code to descriptive text"""
        grade_level_map = {
            "elementary": "Elementary School (Grades K-5)",
            "middle_school": "Middle School (Grades 6-8)",
            "high_school": "High School (Grades 9-12)",
            "college": "College/University Level",
            "adult": "Adult Education",
            "professional": "Professional Development"
        }
        
        return grade_level_map.get(grade_level, grade_level)
    
    @staticmethod
    def _get_lesson_style_description(style: str) -> str:
        """Convert lesson style code to descriptive text"""
        style_map = {
            "standard": "Use a standard, straightforward teaching approach.",
            "interactive": "Make the lesson interactive with activities and engagement opportunities.",
            "visual": "Emphasize visual learning with descriptive examples and mental imagery.",
            "inquiry": "Use an inquiry-based approach that encourages critical thinking and questioning.",
            "project": "Design the lesson around a project-based learning approach.",
            "discussion": "Structure the lesson to facilitate discussion and debate.",
            "storytelling": "Use narrative techniques and storytelling to convey information."
        }
        
        return style_map.get(style, f"Style: {style}")
    
    @staticmethod
    def parse_llm_response(response_text: str) -> Dict[str, Any]:
        """
        Parse the JSON response from the LLM
        
        Args:
            response_text: The raw text response from the LLM
            
        Returns:
            Parsed dictionary containing the lesson data
        """
        # Try to extract JSON from the response if it contains other text
        json_pattern = r'```json\n([\s\S]*?)\n```'
        json_match = re.search(json_pattern, response_text)
        
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                logger.warning("Failed to parse JSON in code block")
                
        # Try to find any JSON object in the text
        try:
            # Look for content between curly braces
            json_content_pattern = r'\{[\s\S]*\}'
            json_content_match = re.search(json_content_pattern, response_text)
            
            if json_content_match:
                return json.loads(json_content_match.group(0))
            
            # If we're here, try to parse the entire response as JSON
            return json.loads(response_text)
        except (json.JSONDecodeError, ValueError) as e:
            logger.warning(f"Failed to parse LLM response as JSON: {str(e)}")
            raise ValueError(f"Could not parse LLM response as JSON: {str(e)}")
    
    @staticmethod
    def estimate_read_time(content: str) -> int:
        """
        Estimate reading time in minutes based on content length
        
        Args:
            content: The content to estimate reading time for
            
        Returns:
            Estimated reading time in minutes
        """
        # Average reading speed (words per minute)
        wpm = 200
        
        # Count words (simple approximation)
        word_count = len(content.split())
        
        # Calculate reading time and round up to nearest minute
        reading_time = math.ceil(word_count / wpm)
        
        # Minimum reading time of 1 minute
        return max(1, reading_time)