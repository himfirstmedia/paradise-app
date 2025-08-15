export type House = {
    id: number;
    name: string;
    abbreviation: string;
    capacity: number;
    users: User[{id: number; name: string; role: string}];
}