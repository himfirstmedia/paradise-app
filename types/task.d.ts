type TaskCategory = "PRIMARY" | "MAINTENANCE" | "SPECIAL";
type TaskStatus = "PENDING" | "REVIEWING" | "APPROVED";
type TaskType = "PENDING" | "COMPLETED" | "OVERDUE";

export type Task = {
  id: number;
  name: string;
  category: TaskCategory;
  description: string;
  status: TaskStatus;
  progress: string;
  type: TaskType;
  userId?: number | null;
  instruction?: string;
  image?: string;
  choreId?: number;
  chore?: {
    id: number;
    name: string;
  };
};
