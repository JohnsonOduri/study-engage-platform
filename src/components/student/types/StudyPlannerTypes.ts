
export interface StudyTask {
  id: string;
  title: string;
  course: string;
  time: string;
  duration: number;
  completed: boolean;
  user_id: string;
  created_at: string;
}

export interface CourseTaskGroup {
  title: string;
  tasks: StudyTask[];
}
