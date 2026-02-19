
export interface Person {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  assignedTo: string[]; // array of person IDs
}

export interface CalculationResult {
  personId: string;
  name: string;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  assignedItems: Item[]; // New: track what they ate for the summary
}
