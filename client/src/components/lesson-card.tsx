import { useState } from "react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Clock, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeletionDialog from "@/components/deletion-dialog";
import type { Lesson } from "@shared/schema";

interface LessonCardProps {
  lesson: Lesson;
}

export default function LessonCard({ lesson }: LessonCardProps) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Format relative time (e.g., "2 days ago")
  const formattedTime = formatDistanceToNow(new Date(lesson.createdAt), { addSuffix: true });
  
  // Format grade level for display
  const formatGradeLevel = (level: string) => {
    const levelMap: Record<string, string> = {
      elementary: "Elementary School",
      middle: "Middle School",
      high: "High School",
      college: "College Level",
      adult: "Adult Education"
    };
    return levelMap[level] || level;
  };
  
  // Delete lesson mutation
  const deleteLesson = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', `/api/lessons/${lesson.id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lessons'] });
      toast({
        title: "Lesson Deleted",
        description: "The lesson has been successfully deleted.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the lesson. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Extract text from HTML content
  const getContentPreview = (content: string) => {
    // Extract text from HTML and limit to a reasonable length
    const div = document.createElement('div');
    div.innerHTML = content;
    const text = div.textContent || div.innerText || "";
    return text.substring(0, 120) + (text.length > 120 ? "..." : "");
  };
  
  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-medium text-lg text-primary-600 dark:text-primary-400">
            {lesson.topic}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatGradeLevel(lesson.gradeLevel)} • Created {formattedTime}
          </p>
        </div>
        <div className="p-5">
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
            {getContentPreview(lesson.content)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-750 px-5 py-3 flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {lesson.readTime} min read
          </span>
          <div className="flex space-x-2">
            <Link href={`/lessons/${lesson.id}`}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-gray-400 hover:text-red-500"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <DeletionDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => deleteLesson.mutate()}
        isPending={deleteLesson.isPending}
      />
    </>
  );
}
