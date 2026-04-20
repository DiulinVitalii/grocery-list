import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { GroceryListItemComponent } from './grocery-list-item';
import { type GroceryItem, type GroceryItemBoughtChange } from '../../models';

function makeItem(overrides: Partial<GroceryItem> = {}): GroceryItem {
  return {
    id: 'a1',
    title: 'Apples',
    amount: 6,
    bought: false,
    createdAt: '2026-04-20T00:00:00.000Z',
    updatedAt: '2026-04-20T00:00:00.000Z',
    ...overrides,
  };
}

function render(item: GroceryItem): ComponentFixture<GroceryListItemComponent> {
  const fixture = TestBed.createComponent(GroceryListItemComponent);
  fixture.componentRef.setInput('item', item);
  fixture.detectChanges();
  return fixture;
}

describe('GroceryListItemComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroceryListItemComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  it('renders title and amount', () => {
    const fixture = render(makeItem());
    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Apples');
    expect(host.textContent).toContain('× 6');
  });

  it('applies strikethrough styling only when bought', () => {
    const notBought = render(makeItem({ bought: false }));
    expect(notBought.nativeElement.querySelector('.line-through')).toBeNull();

    const bought = render(makeItem({ bought: true }));
    expect(bought.nativeElement.querySelector('.line-through')).not.toBeNull();
  });

  it('emits editRequest with the current item when the edit button is clicked', () => {
    const fixture = render(makeItem());
    const host = fixture.nativeElement as HTMLElement;
    const emitted: GroceryItem[] = [];
    fixture.componentInstance.editRequest.subscribe((v) => emitted.push(v));

    const editBtn = host.querySelector<HTMLButtonElement>('button[aria-label^="Edit "]');
    editBtn?.click();

    expect(emitted.length).toBe(1);
    expect(emitted[0].id).toBe('a1');
  });

  it('emits deleteRequest with the current item when the delete button is clicked', () => {
    const fixture = render(makeItem());
    const host = fixture.nativeElement as HTMLElement;
    const emitted: GroceryItem[] = [];
    fixture.componentInstance.deleteRequest.subscribe((v) => emitted.push(v));

    const deleteBtn = host.querySelector<HTMLButtonElement>('button[aria-label^="Delete "]');
    deleteBtn?.click();

    expect(emitted.length).toBe(1);
    expect(emitted[0].id).toBe('a1');
  });

  it('emits boughtChange with the new state when the checkbox changes', () => {
    const fixture = render(makeItem({ bought: false }));
    const host = fixture.nativeElement as HTMLElement;
    const emitted: GroceryItemBoughtChange[] = [];
    fixture.componentInstance.boughtChange.subscribe((v) => emitted.push(v));

    const checkboxInput = host.querySelector<HTMLInputElement>(
      'mat-checkbox input[type="checkbox"]',
    );
    checkboxInput?.click();
    fixture.detectChanges();

    expect(emitted.length).toBe(1);
    expect(emitted[0].bought).toBe(true);
    expect(emitted[0].item.id).toBe('a1');
  });
});
