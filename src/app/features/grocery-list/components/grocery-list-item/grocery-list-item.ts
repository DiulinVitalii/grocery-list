import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

import { type GroceryItem, type GroceryItemBoughtChange } from '../../models';
@Component({
  selector: 'app-grocery-list-item',
  imports: [MatButtonModule, MatCheckboxModule, MatIconModule],
  templateUrl: './grocery-list-item.html',
  styleUrl: './grocery-list-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroceryListItemComponent {
  readonly item = input.required<GroceryItem>();

  readonly editRequest = output<GroceryItem>();
  readonly deleteRequest = output<GroceryItem>();
  readonly boughtChange = output<GroceryItemBoughtChange>();

  protected onBoughtToggle(item: GroceryItem, checked: boolean): void {
    this.boughtChange.emit({ item, bought: checked });
  }
}
