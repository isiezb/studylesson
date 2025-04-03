import { useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import QuizComponent from '@/components/quiz-component';
import { Pencil, Plus, ArrowLeft } from 'lucide-react';
import type { Lesson } from '@shared/schema';

export default function LessonDetail() {
  const [match, params] = useRoute('/lessons/:id');
  const { toast } = useToast();
  const id = match ? parseInt(params.id) : -1;

  // Fetch lesson data
  const { data: lesson, isLoading, isError } = useQuery<Lesson>({
    queryKey: ['/api/lessons', id],
    enabled: id > 0,
  });

  // Continue lesson mutation
  const continueLesson = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/lessons/${id}/continue`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lessons', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/lessons'] });
      toast({
        title: 'Lesson Continued',
        description: 'Additional content has been added to your lesson',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to continue lesson. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Format creation date
  const formatDate = (dateString: string | Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Handle continue lesson
  const handleContinueLesson = () => {
    continueLesson.mutate();
  };

  // Set page title
  useEffect(() => {
    if (lesson) {
      document.title = `${lesson.topic} | LessonCraft AI`;
    }
    return () => {
      document.title = 'LessonCraft AI';
    };
  }, [lesson]);

  if (!match) {
    return <div>Invalid lesson ID</div>;
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-md">
          <p>Failed to load lesson. The lesson may have been deleted or doesn't exist.</p>
          <Link href="/lessons">
            <a className="text-red-600 dark:text-red-400 font-medium mt-2 inline-block hover:underline">
              Return to lessons
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with back button and actions */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/lessons">
          <Button variant="link" className="text-primary-600 dark:text-primary-400 hover:underline p-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Back to Lessons</span>
          </Button>
        </Link>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled={isLoading}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </Button>
          
          <Button 
            size="sm" 
            onClick={handleContinueLesson}
            disabled={isLoading || continueLesson.isPending}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Continue Lesson</span>
          </Button>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <div className="flex flex-wrap items-center space-x-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          
          <div className="p-6">
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-6" />
            
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />
            
            <Skeleton className="h-6 w-2/5 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      )}
      
      {/* Lesson Content */}
      {lesson && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {lesson.topic}
              </h1>
              <div className="flex flex-wrap items-center mt-3 text-sm text-gray-500 dark:text-gray-400 space-x-4">
                <span className="flex items-center">
                  <span className="mr-1.5">🎓</span>
                  <span>{lesson.gradeLevel}</span>
                </span>
                <span className="flex items-center">
                  <span className="mr-1.5">⏱️</span>
                  <span>{lesson.readTime} min read</span>
                </span>
                <span className="flex items-center">
                  <span className="mr-1.5">📅</span>
                  <span>Created {formatDate(lesson.createdAt)}</span>
                </span>
              </div>
            </div>
            
            <div 
              className="p-6 prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
          
          {/* Quiz Section (if available) */}
          {lesson.includeQuiz && lesson.quiz && (
            <div className="mt-8">
              <QuizComponent quiz={lesson.quiz} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
