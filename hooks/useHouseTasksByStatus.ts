import { Task } from "@/redux/slices/taskSlice";
import { User as Member } from "@/redux/slices/userSlice";

export function useHouseReduxTasksByStatus(members: Member[], houseName: string) {
  const tasksByStatus = {
    pending: [] as Task[],
    completed: [] as Task[],
    overdue: [] as Task[],
  };

  members
    .filter((m) => m.house && m.house.name === houseName)
    .forEach((member) => {
      member.task?.forEach((task: Task) => {
        if (task.progress === "PENDING") tasksByStatus.pending.push(task);
        else if (task.progress === "COMPLETED") tasksByStatus.completed.push(task);
        else if (task.progress === "OVERDUE") tasksByStatus.overdue.push(task);
      });
    });

  return tasksByStatus;
}