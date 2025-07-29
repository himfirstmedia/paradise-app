export type Chore = {
  id: number;
  name: string;
  description?: string;
  houseId: number;
  house?: {
    id: number;
    name: string;
    abbreviation: string;
  };
  currentUser: {
    id: number;
    name: string;
  }
  tasks?: {
    id: number;
    name: string;
  }
}