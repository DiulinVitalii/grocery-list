import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import {
  type GroceryItem,
  type GroceryItemBoughtChange,
  type GroceryItemEditSubmit,
  type GroceryItemFormValue,
} from '../../models';
import { GroceryListItemComponent } from '../grocery-list-item/grocery-list-item';
import { GroceryItemFormComponent } from '../grocery-item-form/grocery-item-form';
@Component({
  selector: 'app-grocery-list',
  imports: [GroceryListItemComponent, GroceryItemFormComponent],
  templateUrl: './grocery-list.html',
  styleUrl: './grocery-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroceryListComponent {
  readonly items = input<readonly GroceryItem[]>();
  readonly editingId = input<string | null>(null);
  readonly saving = input<boolean>(false);

  readonly editRequest = output<GroceryItem>();
  readonly editSubmit = output<GroceryItemEditSubmit>();
  readonly cancelEdit = output<void>();
  readonly deleteRequest = output<GroceryItem>();
  readonly boughtChange = output<GroceryItemBoughtChange>();

  protected onFormSubmit(id: string, value: GroceryItemFormValue): void {
    this.editSubmit.emit({ id, value });
  }
}
