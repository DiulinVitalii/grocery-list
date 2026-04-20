import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, finalize } from 'rxjs';

import { GroceryItemFormComponent, GroceryListComponent } from '../../components';
import { ERROR_SNACKBAR_DURATION_MS, SNACKBAR_DISMISS_LABEL } from '../../constants';
import {
  type CreateGroceryItemDto,
  type GroceryItem,
  type GroceryItemBoughtChange,
  type GroceryItemEditSubmit,
  type GroceryItemFormValue,
  type UpdateGroceryItemDto,
} from '../../models';
import { GroceryListApiService } from '../../services';
import { getErrorMessage } from '../../../../shared/utils';
import { ConfirmDialogComponent, type ConfirmDialogData } from '../../../../shared/components';
@Component({
  selector: 'app-grocery-list-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    GroceryListComponent,
    GroceryItemFormComponent,
  ],
  templateUrl: './grocery-list-page.html',
  styleUrl: './grocery-list-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroceryListPage {
  private readonly api = inject(GroceryListApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly itemsResource = rxResource({
    stream: () => this.api.getItems(),
  });

  protected readonly creating = signal(false);
  protected readonly saving = signal(false);
  protected readonly editingId = signal<string | null>(null);

  protected readonly boughtSummary = computed(() => {
    const items = this.itemsResource.value();
    if (!items || items.length === 0) return null;
    const bought = items.reduce((count, item) => (item.bought ? count + 1 : count), 0);
    return { bought, total: items.length };
  });

  private readonly itemFormRef = viewChild(GroceryItemFormComponent);

  protected onAddItem(value: GroceryItemFormValue): void {
    if (this.creating()) return;

    const now = new Date().toISOString();
    const dto: CreateGroceryItemDto = {
      title: value.title,
      amount: value.amount,
      bought: false,
      createdAt: now,
      updatedAt: now,
    };

    this.creating.set(true);
    this.api
      .createItem(dto)
      .pipe(
        finalize(() => this.creating.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.itemFormRef()?.reset();
          this.itemsResource.reload();
        },
        error: (err: unknown) => this.notifyError(err),
      });
  }

  protected onEditRequest(item: GroceryItem): void {
    this.editingId.set(item.id);
  }

  protected onEditSubmit({ id, value }: GroceryItemEditSubmit): void {
    if (this.saving()) return;

    const dto: UpdateGroceryItemDto = {
      title: value.title,
      amount: value.amount,
      updatedAt: new Date().toISOString(),
    };

    this.saving.set(true);
    this.api
      .updateItem(id, dto)
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.editingId.set(null);
          this.itemsResource.reload();
        },
        error: (err: unknown) => this.notifyError(err),
      });
  }

  protected onEditCancel(): void {
    this.editingId.set(null);
  }

  protected onDeleteRequest(item: GroceryItem): void {
    const data: ConfirmDialogData = {
      title: 'Delete item?',
      message: `Remove "${item.title}" from your list?`,
      confirmLabel: 'Delete',
    };

    this.dialog
      .open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
        data,
        autoFocus: 'dialog',
        restoreFocus: true,
      })
      .afterClosed()
      .pipe(
        filter((confirmed): confirmed is true => confirmed === true),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.deleteItem(item));
  }

  protected onBoughtChange({ item, bought }: GroceryItemBoughtChange): void {
    const snapshot = this.itemsResource.value();

    this.itemsResource.update((items) =>
      items?.map((entry) => (entry.id === item.id ? { ...entry, bought } : entry)),
    );

    const dto: UpdateGroceryItemDto = {
      bought,
      updatedAt: new Date().toISOString(),
    };

    this.api
      .updateItem(item.id, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err: unknown) => {
          this.itemsResource.set(snapshot);
          this.notifyError(err);
        },
      });
  }

  private deleteItem(item: GroceryItem): void {
    if (this.editingId() === item.id) {
      this.editingId.set(null);
    }

    this.api
      .deleteItem(item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.itemsResource.reload(),
        error: (err: unknown) => this.notifyError(err),
      });
  }

  private notifyError(err: unknown): void {
    this.snackBar.open(getErrorMessage(err), SNACKBAR_DISMISS_LABEL, {
      duration: ERROR_SNACKBAR_DURATION_MS,
    });
  }
}
