import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function LoadingOverlay() {
  const [showLoading, setShowLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  // Track network requests
  useEffect(() => {
    const originalFetch = window.fetch;
    let activeRequests = 0;
    let timer: NodeJS.Timeout;
    
    // Replace fetch with our instrumented version
    window.fetch = function instrumentedFetch(...args) {
      activeRequests++;
      setIsPending(true);
      
      // Show loading overlay after a delay if request is taking time
      timer = setTimeout(() => {
        if (activeRequests > 0) {
          setShowLoading(true);
        }
      }, 500); // Only show loading overlay after 500ms
      
      return originalFetch(...args)
        .then(response => {
          activeRequests--;
          if (activeRequests === 0) {
            clearTimeout(timer);
            setShowLoading(false);
            setTimeout(() => setIsPending(false), 300); // Small delay to prevent flashing
          }
          return response;
        })
        .catch(error => {
          activeRequests--;
          if (activeRequests === 0) {
            clearTimeout(timer);
            setShowLoading(false);
            setTimeout(() => setIsPending(false), 300);
          }
          throw error;
        });
    };
    
    return () => {
      window.fetch = originalFetch;
      clearTimeout(timer);
    };
  }, []);
  
  if (!showLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 flex items-center space-x-4">
        <Loader2 className="h-8 w-8 text-primary-600 dark:text-primary-400 animate-spin" />
        <p className="text-gray-700 dark:text-gray-300">Processing your request...</p>
      </div>
    </div>
  );
}
