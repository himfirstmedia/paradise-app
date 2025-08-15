export type ChoreCategory = "PRIMARY" | "MAINTENANCE" | "SPECIAL";
export type ChoreStatus = "PENDING" | "REVIEWING" | "APPROVED" | "REJECTED";
export type ChoreType = "PENDING" | "COMPLETED" | "OVERDUE";

export type Chore = {
  id: number;
  name: string;
  description?: string;
  houseId: number;
  status?: ChoreStatus;
  isPrimary?: boolean;

  // House relationship
  house?: {
    id: number;
    name: string;
    abbreviation: string;
  };

  // Assigned user
  currentUser: {
    id: number;
    name: string;
  };
  // Optional fields
  category?: ChoreCategory;
  type?: ChoreType;
  userId?: number | null;
  instruction?: string;
  image?: string;

  // If this chore is a subchore or linked to another
  choreId?: number;
  chore?: {
    id: number;
    name: string;
  };

  // Nested subtasks or related chore instances
  tasks?: {
    id: number;
    name: string;
  }[];
};
