import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Wand2, Book } from "lucide-react";

export default function TabNavigation() {
  const [location, setLocation] = useLocation();
  
  // Determine active tab based on route
  const isHome = location === "/" || location.startsWith("/?");
  const isLessons = location === "/lessons" || location.startsWith("/lessons/");
  
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex space-x-4 sm:space-x-8">
          <Link href="/">
            <a className={`py-4 px-1 border-b-2 font-medium flex items-center space-x-2 ${
              isHome 
                ? "border-primary-500 text-primary-600 dark:text-primary-400" 
                : "border-transparent hover:border-gray-300 dark:hover:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}>
              <Wand2 className="h-4 w-4" />
              <span>Generate Lesson</span>
            </a>
          </Link>
          
          <Link href="/lessons">
            <a className={`py-4 px-1 border-b-2 font-medium flex items-center space-x-2 ${
              isLessons 
                ? "border-primary-500 text-primary-600 dark:text-primary-400" 
                : "border-transparent hover:border-gray-300 dark:hover:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}>
              <Book className="h-4 w-4" />
              <span>My Lessons</span>
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
}
