
import { db } from "../../../firebase";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { StudyTask, CourseTaskGroup } from "../types/StudyPlannerTypes";
import { toast } from "sonner";

export const fetchStudyPlan = async (userId: string): Promise<CourseTaskGroup[]> => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, "study_plans"),
        where("user_id", "==", userId)
      )
    );

    const tasks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StudyTask[];

    // Group tasks by course
    const groupedData = tasks.reduce((acc, task) => {
      const course = acc.find(c => c.title === task.course);
      if (course) {
        course.tasks.push(task);
      } else {
        acc.push({ title: task.course, tasks: [task] });
      }
      return acc;
    }, [] as CourseTaskGroup[]);

    return groupedData;
  } catch (error) {
    console.error("Error fetching study plan:", error);
    toast.error("Failed to fetch study plan");
    return [];
  }
};

export const addTask = async (userId: string, formData: { title: string; course: string; time: string; duration: string }): Promise<StudyTask | null> => {
  try {
    const { title, course, time, duration } = formData;
    const newTask = {
      user_id: userId,
      course,
      title,
      duration: parseInt(duration),
      time,
      completed: false,
      created_at: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "study_plans"), newTask);
    toast.success("Task added successfully!");
    
    return { id: docRef.id, ...newTask };
  } catch (error) {
    console.error("Error adding task:", error);
    toast.error("Failed to add task");
    return null;
  }
};

export const toggleTaskCompletion = async (taskId: string, currentStatus: boolean): Promise<boolean> => {
  try {
    const newCompletedStatus = !currentStatus;
    
    // Update in Firestore
    await updateDoc(doc(db, "study_plans", taskId), {
      completed: newCompletedStatus
    });
    
    toast.success(newCompletedStatus ? "Task marked as completed!" : "Task marked as incomplete");
    return true;
  } catch (error) {
    console.error("Error toggling task completion:", error);
    toast.error("Failed to update task");
    return false;
  }
};

export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    // Delete from Firestore
    await deleteDoc(doc(db, "study_plans", taskId));
    
    toast.success("Task deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting task:", error);
    toast.error("Failed to delete task");
    return false;
  }
};
