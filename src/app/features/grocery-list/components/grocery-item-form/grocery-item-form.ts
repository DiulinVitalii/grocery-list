import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import {
  type FormControl,
  type FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { type GroceryItemFormValue } from '../../models';
import { trimmedRequired } from '../../../../shared/utils';
import { AMOUNT_MAX, AMOUNT_MIN, TITLE_MAX_LENGTH } from '../../constants';

type GroceryItemForm = FormGroup<{
  title: FormControl<string>;
  amount: FormControl<number>;
}>;

const DEFAULT_VALUE: GroceryItemFormValue = { title: '', amount: AMOUNT_MIN };

@Component({
  selector: 'app-grocery-item-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './grocery-item-form.html',
  styleUrl: './grocery-item-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroceryItemFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly initialValue = input<GroceryItemFormValue>(DEFAULT_VALUE);
  readonly submitLabel = input<string>('Add');
  readonly cancelLabel = input<string>('Cancel');
  readonly submitting = input<boolean>(false);
  readonly cancellable = input<boolean>(false);

  readonly formSubmit = output<GroceryItemFormValue>();
  readonly formCancel = output<void>();

  protected readonly amountMin = AMOUNT_MIN;
  protected readonly amountMax = AMOUNT_MAX;
  protected readonly titleMaxLength = TITLE_MAX_LENGTH;

  protected readonly form: GroceryItemForm = this.fb.group({
    title: this.fb.control('', [Validators.required, trimmedRequired()]),
    amount: this.fb.control(AMOUNT_MIN, [
      Validators.required,
      Validators.min(AMOUNT_MIN),
      Validators.max(AMOUNT_MAX),
    ]),
  });

  constructor() {
    effect(() => {
      const seed = this.initialValue();
      this.form.reset(seed);
    });
  }

  reset(): void {
    this.form.reset(this.initialValue());
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) return;
    const { title, amount } = this.form.getRawValue();
    this.formSubmit.emit({ title: title.trim(), amount });
  }

  protected onCancel(): void {
    if (this.submitting()) return;
    this.formCancel.emit();
  }
}
