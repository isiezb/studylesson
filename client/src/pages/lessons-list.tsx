import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchInput from "@/components/search-input";
import ViewToggle from "@/components/view-toggle";
import LessonCard from "@/components/lesson-card";
import LessonListItem from "@/components/lesson-list-item";
import { Skeleton } from "@/components/ui/skeleton";
import type { Lesson } from "@shared/schema";

type ViewMode = "grid" | "list";

export default function LessonsList() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch all lessons
  const { data: lessons, isLoading, isError } = useQuery<Lesson[]>({
    queryKey: ['/api/lessons']
  });
  
  // Filter lessons based on search query
  const filteredLessons = lessons?.filter(lesson => 
    lesson.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div>
      {/* Header with search and view toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">My Lessons</h2>
        <div className="flex items-center space-x-3">
          <SearchInput 
            value={searchQuery}
            onChange={(value) => setSearchQuery(value)}
            placeholder="Search lessons..."
          />
          <ViewToggle 
            viewMode={viewMode} 
            onViewModeChange={setViewMode} 
          />
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="p-5">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="bg-gray-50 dark:bg-gray-750 p-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-16" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="mb-4 sm:mb-0">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-full sm:w-96" />
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center sm:space-y-4">
                    <Skeleton className="h-4 w-20" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      
      {/* Error state */}
      {isError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-md">
          <p>Failed to load lessons. Please try again later.</p>
        </div>
      )}
      
      {/* No lessons state */}
      {!isLoading && filteredLessons?.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-3 text-4xl">
            <i className="fas fa-book"></i>
          </div>
          {searchQuery ? (
            <p className="text-gray-600 dark:text-gray-400">No lessons found matching "{searchQuery}"</p>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't created any lessons yet</p>
              <a href="/" className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md">
                <i className="fas fa-magic mr-2"></i>
                <span>Create Your First Lesson</span>
              </a>
            </>
          )}
        </div>
      )}
      
      {/* Lessons Grid View */}
      {!isLoading && viewMode === "grid" && filteredLessons && filteredLessons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map(lesson => (
            <LessonCard 
              key={lesson.id} 
              lesson={lesson}
            />
          ))}
        </div>
      )}
      
      {/* Lessons List View */}
      {!isLoading && viewMode === "list" && filteredLessons && filteredLessons.length > 0 && (
        <div className="space-y-4">
          {filteredLessons.map(lesson => (
            <LessonListItem 
              key={lesson.id} 
              lesson={lesson}
            />
          ))}
        </div>
      )}
    </div>
  );
}
