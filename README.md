# AI Lesson Generator

An AI-powered lesson creation and management application built with Node.js, React, and FastAPI.

## Features

- Create educational lessons with AI assistance
- Store and manage your lesson library
- Support for multiple grade levels and teaching styles
- Interactive quizzes
- Continue lessons with additional content

## Tech Stack

- **Frontend**: React, Tailwind CSS, Shadcn/UI
- **Backend**: Express, FastAPI
- **Database**: PostgreSQL
- **ORM**: Drizzle
- **API**: RESTful with support for AI-powered content generation
- **AI Integration**: OpenRouter API (Google Gemini 2.0 Flash)

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and add your environment variables:
   ```
   DATABASE_URL=postgresql://username:password@hostname:port/database
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```
4. Run database migrations:
   ```bash
   npm run db:push
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment on Render.com

### Prerequisites

1. A Render.com account
2. A PostgreSQL database (can be provisioned on Render or elsewhere)
3. OpenRouter API key for AI content generation

### Deployment Steps

1. Fork/Clone this repository to your GitHub account
2. Create a new Web Service on Render:
   - Connect your GitHub repository
   - Select the "Node" environment
   - Use the following settings:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
   - Add the required environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `OPENROUTER_API_KEY`: Your OpenRouter API key
     - `NODE_ENV`: Set to `production`
3. Deploy the service

Alternatively, you can use the included `render.yaml` file for Render Blueprints:

```bash
render blueprint apply
```

## API Endpoints

- `GET /api/lessons` - Get all lessons
- `GET /api/lessons/:id` - Get lesson by ID
- `POST /api/lessons` - Create a new lesson
- `DELETE /api/lessons/:id` - Delete a lesson
- `POST /api/lessons/:id/continue` - Continue a lesson with more content
- `GET /api/healthz` - Health check endpoint (used by Render.com)
- `GET /healthz` - Alternative health check endpoint

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `OPENROUTER_API_KEY` - OpenRouter API key for AI content generation
- `OPENAI_API_KEY` - Optional fallback if OpenRouter is not available
- `NODE_ENV` - Environment (development, production)
- `SUPABASE_URL` - Optional Supabase URL (if using Supabase)
- `SUPABASE_KEY` - Optional Supabase key (if using Supabase)

## License

MIT