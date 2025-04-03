import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLessonInputSchema, type CreateLessonInput } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Wand2 } from "lucide-react";

interface CreateLessonFormProps {
  onSubmitSuccess?: () => void;
}

export default function CreateLessonForm({ onSubmitSuccess }: CreateLessonFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize form
  const form = useForm<CreateLessonInput>({
    resolver: zodResolver(createLessonInputSchema),
    defaultValues: {
      topic: "",
      gradeLevel: "",
      lessonStyle: "",
      additionalInstructions: "",
      includeQuiz: false,
    },
  });
  
  // Create lesson mutation
  const createLesson = useMutation({
    mutationFn: async (formData: CreateLessonInput) => {
      const res = await apiRequest('POST', '/api/lessons', formData);
      return res.json();
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lessons'] });
      toast({
        title: "Lesson Created",
        description: "Your new lesson has been generated successfully!",
      });
      form.reset();
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create lesson. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating lesson:", error);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
  
  // Form submission handler
  const onSubmit = (data: CreateLessonInput) => {
    createLesson.mutate(data);
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-6">Create a New Lesson</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Introduction to Photosynthesis" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gradeLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade Level</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a grade level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="elementary">Elementary School (K-5)</SelectItem>
                      <SelectItem value="middle">Middle School (6-8)</SelectItem>
                      <SelectItem value="high">High School (9-12)</SelectItem>
                      <SelectItem value="college">College Level</SelectItem>
                      <SelectItem value="adult">Adult Education</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lessonStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Style</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teaching style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="exploratory">Exploratory/Discovery</SelectItem>
                      <SelectItem value="lecture">Traditional Lecture</SelectItem>
                      <SelectItem value="socratic">Socratic Method</SelectItem>
                      <SelectItem value="practical">Practical/Hands-on</SelectItem>
                      <SelectItem value="storytelling">Narrative/Storytelling</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="additionalInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Instructions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Include specific points to cover, examples to use, or particular approaches..." 
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="includeQuiz"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Include a comprehension quiz</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={isLoading || createLesson.isPending}
                className="flex items-center space-x-2"
              >
                <Wand2 className="h-4 w-4" />
                <span>Generate Lesson</span>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
