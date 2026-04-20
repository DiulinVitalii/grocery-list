export interface GroceryItem {
  readonly id: string;
  readonly title: string;
  readonly amount: number;
  readonly bought: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}
