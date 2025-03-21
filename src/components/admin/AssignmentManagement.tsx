
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckSquare, Calendar, Clock, Plus, X, Pencil, Trash2, 
  AlertTriangle, CheckCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { database } from "@/firebase";
import { ref, push, get, remove, set, query, orderByChild, equalTo } from "firebase/database";
import { toast } from "sonner";

export const AssignmentManagement = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    course_id: '',
    due_date: '',
    points: 100
  });

  // Fetch assignments and courses
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // For teachers, fetch courses they teach
        // For admins, fetch all courses
        const coursesRef = user.role === 'teacher' 
          ? query(ref(database, 'courses'), orderByChild('instructor_id'), equalTo(user.id))
          : ref(database, 'courses');
        
        const coursesSnapshot = await get(coursesRef);
        const coursesData = [];
        
        if (coursesSnapshot.exists()) {
          coursesSnapshot.forEach((childSnapshot) => {
            coursesData.push({
              id: childSnapshot.key,
              ...childSnapshot.val()
            });
          });
        }
        
        setCourses(coursesData);
        
        // Fetch assignments related to these courses
        const assignmentsData = [];
        for (const course of coursesData) {
          const assignmentsRef = query(
            ref(database, 'assignments'),
            orderByChild('course_id'),
            equalTo(course.id)
          );
          
          const assignmentsSnapshot = await get(assignmentsRef);
          if (assignmentsSnapshot.exists()) {
            assignmentsSnapshot.forEach((childSnapshot) => {
              assignmentsData.push({
                id: childSnapshot.key,
                ...childSnapshot.val(),
                course_title: course.title
              });
            });
          }
        }
        
        // Get submission stats for each assignment
        for (let i = 0; i < assignmentsData.length; i++) {
          const assignment = assignmentsData[i];
          const submissionsRef = query(
            ref(database, 'submissions'),
            orderByChild('assignment_id'),
            equalTo(assignment.id)
          );
          
          const submissionsSnapshot = await get(submissionsRef);
          let submissionCount = 0;
          
          if (submissionsSnapshot.exists()) {
            submissionsSnapshot.forEach(() => {
              submissionCount++;
            });
          }
          
          assignmentsData[i].submissions_count = submissionCount;
        }
        
        // Sort by created date, most recent first
        assignmentsData.sort((a, b) => {
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
        
        setAssignments(assignmentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load assignments.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id, user?.role]);

  const handleCreateAssignment = async () => {
    try {
      if (!newAssignment.title || !newAssignment.course_id) {
        toast.error("Title and course are required");
        return;
      }

      // Create new assignment in Firebase
      const assignmentData = {
        ...newAssignment,
        created_at: new Date().toISOString(),
        created_by: user.id
      };

      const assignmentsRef = ref(database, 'assignments');
      await push(assignmentsRef, assignmentData);

      toast.success("Assignment created successfully");
      setIsAddDialogOpen(false);
      
      // Reset form
      setNewAssignment({
        title: '',
        description: '',
        course_id: '',
        due_date: '',
        points: 100
      });
      
      // Refresh assignments list
      window.location.reload();
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("Failed to create assignment");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment({
      ...newAssignment,
      [name]: value
    });
  };

  const handlePointsChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setNewAssignment({
      ...newAssignment,
      points: value
    });
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      try {
        // Delete the assignment
        await remove(ref(database, `assignments/${assignmentId}`));
        
        // Update UI
        setAssignments(assignments.filter(a => a.id !== assignmentId));
        toast.success("Assignment deleted successfully");
      } catch (error) {
        console.error("Error deleting assignment:", error);
        toast.error("Failed to delete assignment");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold">Assignment & Grading</h2>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input 
                  id="title" 
                  name="title"
                  value={newAssignment.title}
                  onChange={handleInputChange}
                  placeholder="Enter assignment title"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="course">Course</Label>
                <Select 
                  value={newAssignment.course_id} 
                  onValueChange={(value) => setNewAssignment({...newAssignment, course_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  value={newAssignment.description}
                  onChange={handleInputChange}
                  placeholder="Provide instructions for students"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input 
                    id="due_date" 
                    name="due_date"
                    type="date"
                    value={newAssignment.due_date}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="points">Points</Label>
                  <Input 
                    id="points" 
                    name="points"
                    type="number"
                    value={newAssignment.points}
                    onChange={handlePointsChange}
                    min={1}
                    max={1000}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAssignment}>
                Create Assignment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Clock className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : assignments.filter(a => {
                  const isDueDatePassed = a.due_date && new Date(a.due_date) < new Date();
                  return !isDueDatePassed;
                }).map((assignment) => (
                <div key={assignment.id} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{assignment.title}</h3>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteAssignment(assignment.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{assignment.course_title}</p>
                  <div className="flex gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckSquare className="h-4 w-4 text-primary" />
                      <span>{assignment.submissions_count || 0} submitted</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{assignment.points} points</span>
                    </div>
                  </div>
                </div>
              ))}
              {!isLoading && assignments.filter(a => {
                const isDueDatePassed = a.due_date && new Date(a.due_date) < new Date();
                return !isDueDatePassed;
              }).length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>No active assignments</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Grading</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Clock className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : assignments.filter(a => a.submissions_count > 0).map((assignment) => (
                <div key={assignment.id} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{assignment.title}</h3>
                    <Badge variant="outline">{assignment.submissions_count} submissions</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{assignment.course_title}</p>
                  <div className="flex gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{assignment.points} points</span>
                    </div>
                  </div>
                </div>
              ))}
              {!isLoading && assignments.filter(a => a.submissions_count > 0).length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>No pending submissions to grade</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recently Graded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Clock className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : assignments.length > 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>No graded assignments yet</p>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>No graded assignments yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Grade Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Completed Assignments" value={assignments.length.toString()} subtitle="Total assignments" />
          <StatsCard title="Average Score" value="N/A" subtitle="Across all courses" />
          <StatsCard title="Highest Grade" value="N/A" subtitle="Not available yet" />
          <StatsCard title="Grade Improvements" value="N/A" subtitle="Not available yet" />
        </div>
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
}

const StatsCard = ({ title, value, subtitle }: StatsCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
};
