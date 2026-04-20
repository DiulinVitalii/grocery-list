import { type GroceryItem } from './grocery-item.model';

export type CreateGroceryItemDto = Omit<GroceryItem, 'id'>;

export type UpdateGroceryItemDto = Partial<Omit<GroceryItem, 'id' | 'createdAt'>>;

export type GroceryItemFormValue = Pick<GroceryItem, 'title' | 'amount'>;

export interface GroceryItemEditSubmit {
  readonly id: string;
  readonly value: GroceryItemFormValue;
}

export interface GroceryItemBoughtChange {
  readonly item: GroceryItem;
  readonly bought: boolean;
}
