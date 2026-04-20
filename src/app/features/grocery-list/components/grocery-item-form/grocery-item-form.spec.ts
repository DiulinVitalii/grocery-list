import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { GroceryItemFormComponent } from './grocery-item-form';
import { type GroceryItemFormValue } from '../../models';

function host(fixture: ComponentFixture<GroceryItemFormComponent>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

function setInput(
  fixture: ComponentFixture<GroceryItemFormComponent>,
  selector: string,
  value: string,
): void {
  const input = host(fixture).querySelector<HTMLInputElement>(selector);
  if (!input) throw new Error(`No element matches ${selector}`);
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

function submit(fixture: ComponentFixture<GroceryItemFormComponent>): void {
  const form = host(fixture).querySelector<HTMLFormElement>('form');
  form?.dispatchEvent(new Event('submit'));
}

describe('GroceryItemFormComponent', () => {
  let fixture: ComponentFixture<GroceryItemFormComponent>;
  let component: GroceryItemFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroceryItemFormComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
    fixture = TestBed.createComponent(GroceryItemFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not emit formSubmit when the form is invalid', () => {
    const emitted: GroceryItemFormValue[] = [];
    component.formSubmit.subscribe((v) => emitted.push(v));

    submit(fixture);

    expect(emitted).toEqual([]);
  });

  it('emits a trimmed formSubmit payload when valid', () => {
    const emitted: GroceryItemFormValue[] = [];
    component.formSubmit.subscribe((v) => emitted.push(v));

    setInput(fixture, 'input[formControlName="title"]', '  Milk  ');
    setInput(fixture, 'input[formControlName="amount"]', '3');
    fixture.detectChanges();

    submit(fixture);

    expect(emitted).toEqual([{ title: 'Milk', amount: 3 }]);
  });

  it('rejects whitespace-only titles', () => {
    const emitted: GroceryItemFormValue[] = [];
    component.formSubmit.subscribe((v) => emitted.push(v));

    setInput(fixture, 'input[formControlName="title"]', '   ');
    fixture.detectChanges();
    submit(fixture);

    expect(emitted).toEqual([]);
  });

  it('disables submit while submitting is true', async () => {
    setInput(fixture, 'input[formControlName="title"]', 'Bread');
    setInput(fixture, 'input[formControlName="amount"]', '1');
    fixture.detectChanges();

    fixture.componentRef.setInput('submitting', true);
    fixture.detectChanges();

    const submitBtn = host(fixture).querySelector<HTMLButtonElement>('button[type="submit"]');
    expect(submitBtn?.disabled).toBe(true);
  });

  it('emits formCancel when cancel is clicked in cancellable mode', () => {
    let cancels = 0;
    component.formCancel.subscribe(() => cancels++);

    fixture.componentRef.setInput('cancellable', true);
    fixture.detectChanges();

    const cancelBtn = host(fixture).querySelector<HTMLButtonElement>('button[type="button"]');
    cancelBtn?.click();

    expect(cancels).toBe(1);
  });
});
