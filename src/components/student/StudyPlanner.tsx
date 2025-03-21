
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CourseTaskGroup as CourseTaskGroupComponent } from "./CourseTaskGroup";
import { AddStudySession } from "./AddStudySession";
import { StudyTips } from "./StudyTips";
import { StudyPlannerHeader } from "./StudyPlannerHeader";
import { CourseTaskGroup } from "./types/StudyPlannerTypes";
import { toast } from "sonner";
import * as StudyPlannerService from "./services/StudyPlannerService";

export const StudyPlanner = () => {
  const { user, isAuthenticated } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [studyPlanData, setStudyPlanData] = useState<CourseTaskGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudyPlan = async () => {
    if (!isAuthenticated || !user) return;

    try {
      setIsLoading(true);
      const data = await StudyPlannerService.fetchStudyPlan(user.id);
      setStudyPlanData(data);
    } catch (error) {
      console.error("Error in fetchStudyPlan:", error);
      toast.error("Failed to fetch study plan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudyPlan();
  }, [isAuthenticated, user]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast.error("Please login to add a task");
      return;
    }

    // Get form data
    const formData = new FormData(e.currentTarget);
    const formValues = {
      title: formData.get('task-title') as string,
      course: formData.get('course') as string,
      time: formData.get('time') as string,
      duration: formData.get('duration') as string
    };

    // Validate form fields
    if (!formValues.title || !formValues.course || !formValues.time || !formValues.duration) {
      toast.error("Please fill out all fields");
      return;
    }

    // Add the task to Firestore
    const newTask = await StudyPlannerService.addTask(user.id, formValues);
    
    if (newTask) {
      // Update local state
      setStudyPlanData(prevData => {
        const courseIndex = prevData.findIndex(c => c.title === formValues.course);
        if (courseIndex !== -1) {
          const updatedCourse = {
            ...prevData[courseIndex],
            tasks: [...prevData[courseIndex].tasks, newTask]
          };
          return [...prevData.slice(0, courseIndex), updatedCourse, ...prevData.slice(courseIndex + 1)];
        } else {
          return [...prevData, { title: formValues.course, tasks: [newTask] }];
        }
      });

      // Reset the form
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleToggleTaskCompletion = async (courseTitle: string, taskId: string) => {
    // Find the task in the local state
    const courseIndex = studyPlanData.findIndex(c => c.title === courseTitle);
    if (courseIndex === -1) return;
    
    const taskIndex = studyPlanData[courseIndex].tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const task = studyPlanData[courseIndex].tasks[taskIndex];
    
    // Update in Firestore
    const success = await StudyPlannerService.toggleTaskCompletion(taskId, task.completed);
    
    if (success) {
      // Update local state
      const updatedData = [...studyPlanData];
      updatedData[courseIndex].tasks[taskIndex] = {
        ...task,
        completed: !task.completed
      };
      
      setStudyPlanData(updatedData);
    }
  };
  
  const handleDeleteTask = async (courseTitle: string, taskId: string) => {
    // Delete from Firestore
    const success = await StudyPlannerService.deleteTask(taskId);
    
    if (success) {
      // Update local state
      const updatedData = studyPlanData.map(course => {
        if (course.title === courseTitle) {
          return {
            ...course,
            tasks: course.tasks.filter(task => task.id !== taskId)
          };
        }
        return course;
      }).filter(course => course.tasks.length > 0); // Remove empty courses
      
      setStudyPlanData(updatedData);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <StudyPlannerHeader date={date} setDate={setDate} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {studyPlanData.map((course) => (
              <CourseTaskGroupComponent
                key={course.title}
                course={course}
                onToggleTaskCompletion={handleToggleTaskCompletion}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>

          <div className="space-y-6">
            <AddStudySession onSubmit={handleFormSubmit} />
            <StudyTips />
          </div>
        </div>
      </div>
    </div>
  );
};
