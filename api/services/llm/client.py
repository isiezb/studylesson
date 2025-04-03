import httpx
import logging
import os
import json
from typing import Optional, Dict, Any, List

logger = logging.getLogger("api.services.llm.client")

class LLMClient:
    """Client for interacting with OpenRouter API for Google Gemini 2.0 Flash and other LLMs"""
    
    def __init__(self):
        """Initialize the LLM client with API keys from environment variables"""
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        self.http_client = httpx.AsyncClient(timeout=60.0)
        
        if self.openrouter_api_key:
            logger.info("Initialized OpenRouter client")
        else:
            logger.warning("No OpenRouter API key found, using fallback content generation")
            
    async def generate_content(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4000,
        model: str = None
    ) -> str:
        """
        Generate content using the OpenRouter API
        
        Args:
            prompt: The user prompt to send to the LLM
            system_prompt: Optional system prompt for context
            temperature: Controls randomness (0.0-1.0)
            max_tokens: Maximum number of tokens to generate
            model: Which model to use (defaults to Google Gemini 2.0 Flash)
            
        Returns:
            The generated content as a string
        """
        if not model:
            model = "google/gemini-2.0-flash"  # Default to Google Gemini 2.0 Flash
            
        logger.info(f"Generating content with model: {model}")
        
        try:
            if self.openrouter_api_key:
                # Use OpenRouter API
                messages: List[Dict[str, str]] = []
                
                if system_prompt:
                    messages.append({"role": "system", "content": system_prompt})
                    
                messages.append({"role": "user", "content": prompt})
                
                # Prepare the request data
                data = {
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens
                }
                
                # Send the API request
                response = await self.http_client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openrouter_api_key}",
                        "HTTP-Referer": "https://replit.com",
                        "X-Title": "Lesson Generator"
                    },
                    json=data
                )
                
                # Process the response
                if response.status_code == 200:
                    response_data = response.json()
                    return response_data["choices"][0]["message"]["content"]
                else:
                    logger.error(f"OpenRouter API error: {response.status_code} - {response.text}")
                    return self._generate_fallback_content(prompt)
            else:
                # Use fallback method (for development/testing only)
                return self._generate_fallback_content(prompt)
                
        except Exception as e:
            logger.error(f"Error generating content: {str(e)}", exc_info=True)
            # Use fallback content in case of error
            return self._generate_fallback_content(prompt)
    
    def _generate_fallback_content(self, prompt: str) -> str:
        """Generate fallback content when no API keys are available (for development only)"""
        logger.warning("Using fallback content generation")
        
        # Extract the topic from the prompt (simple heuristic)
        topic = "the requested topic"
        if "topic:" in prompt.lower():
            topic_idx = prompt.lower().find("topic:") + 6
            next_linebreak = prompt.find("\n", topic_idx)
            if next_linebreak > -1:
                topic = prompt[topic_idx:next_linebreak].strip()
            else:
                topic = prompt[topic_idx:].strip()
                
        grade_level = "middle school"
        if "grade level:" in prompt.lower():
            grade_idx = prompt.lower().find("grade level:") + 12
            next_linebreak = prompt.find("\n", grade_idx)
            if next_linebreak > -1:
                grade_level = prompt[grade_idx:next_linebreak].strip()
            else:
                grade_level = prompt[grade_idx:].strip()
        
        # Check if this is a continuation request
        is_continuation = "continuation" in prompt.lower() or "continue" in prompt.lower()
        
        # Generate a simple response based on the context
        if is_continuation:
            return json.dumps({
                "continuation": f"""## Additional Information about {topic}

This section provides more in-depth information about {topic} for {grade_level} students.

### Key Concepts in Detail

When studying {topic}, it's important to understand these additional concepts:

1. The historical development of {topic}
2. Modern applications of {topic}
3. Future directions and innovations related to {topic}

### Practical Examples

Here are some practical examples that illustrate {topic} in real-world contexts:

- Example 1: A real-world application in everyday life
- Example 2: How {topic} is used in professional settings
- Example 3: An interesting case study that demonstrates the importance of {topic}

### Review Questions

1. What are the main principles of {topic}?
2. How does {topic} apply to real-world situations?
3. Why is understanding {topic} important for future learning?""",
                "readTimeIncrement": 3
            })
        else:
            # For new lesson creation
            include_quiz = "quiz" in prompt.lower() and "include" in prompt.lower()
            
            response = {
                "title": f"Introduction to {topic.title()}",
                "content": f"""# Introduction to {topic.title()}

This is an introduction to {topic} designed for {grade_level} students.

## What is {topic.title()}?

{topic.title()} is an important concept that involves understanding key principles and applications.

## Key Concepts

Here are some important concepts related to {topic}:

1. Fundamental principles of {topic}
2. Historical development of {topic}
3. Modern applications of {topic}
4. Future directions in {topic}

## Why Study {topic.title()}?

Studying {topic} is important because:

- It helps us understand the world around us
- It provides practical skills for everyday life
- It forms the foundation for advanced studies in related areas

## Main Components

The main components of {topic} include:

1. Component A: Description and examples
2. Component B: Description and examples
3. Component C: Description and examples

## Activities and Applications

Here are some ways to apply knowledge of {topic}:

- Activity 1: Description of a hands-on activity
- Activity 2: A real-world application
- Activity 3: A group project idea

## Summary

In this lesson, we've explored the fundamental aspects of {topic}, including its key concepts, why it matters, and how it can be applied in various contexts.""",
                "readTime": 5
            }
            
            # Add quiz if requested
            if include_quiz:
                response["quiz"] = [
                    {
                        "question": f"What is the main purpose of studying {topic}?",
                        "options": [
                            "To pass exams only",
                            "To understand the world and gain practical skills",
                            "To memorize facts",
                            "To complete homework assignments"
                        ],
                        "correctAnswer": 1
                    },
                    {
                        "question": f"Which of the following is NOT a key concept related to {topic}?",
                        "options": [
                            "Fundamental principles",
                            "Historical development",
                            "Unrelated subjects",
                            "Future directions"
                        ],
                        "correctAnswer": 2
                    },
                    {
                        "question": f"How many main components of {topic} were discussed in the lesson?",
                        "options": [
                            "One",
                            "Two",
                            "Three",
                            "Four"
                        ],
                        "correctAnswer": 2
                    }
                ]
            
            return json.dumps(response)