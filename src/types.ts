export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  assigned_to: string | null;
  project_id: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
}

export interface User {
  id: string;
  full_name: string;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
}
