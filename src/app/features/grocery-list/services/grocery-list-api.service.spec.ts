import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { API_CONFIG } from '../../../core/config';
import { type GroceryItem } from '../models';
import { GroceryListApiService } from './grocery-list-api.service';

const TEST_BASE_URL = 'http://api.test';
const ITEMS_URL = `${TEST_BASE_URL}/items`;

function makeItem(overrides: Partial<GroceryItem> = {}): GroceryItem {
  return {
    id: 'test-1',
    title: 'Milk',
    amount: 2,
    bought: false,
    createdAt: '2026-04-20T00:00:00.000Z',
    updatedAt: '2026-04-20T00:00:00.000Z',
    ...overrides,
  };
}

describe('GroceryListApiService', () => {
  let service: GroceryListApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl: TEST_BASE_URL } },
      ],
    });
    service = TestBed.inject(GroceryListApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('getItems issues GET /items', () => {
    const items = [makeItem()];
    let received: GroceryItem[] | undefined;

    service.getItems().subscribe((value) => (received = value));
    const req = http.expectOne(ITEMS_URL);
    expect(req.request.method).toBe('GET');
    req.flush(items);

    expect(received).toEqual(items);
  });

  it('createItem POSTs the DTO and returns the created item', () => {
    const dto = {
      title: 'Bread',
      amount: 1,
      bought: false,
      createdAt: '2026-04-20T00:00:00.000Z',
      updatedAt: '2026-04-20T00:00:00.000Z',
    };
    const created = makeItem({ id: 'new', title: 'Bread', amount: 1 });

    let received: GroceryItem | undefined;
    service.createItem(dto).subscribe((value) => (received = value));

    const req = http.expectOne(ITEMS_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(created);

    expect(received).toEqual(created);
  });

  it('updateItem PATCHes /items/:id with the partial DTO', () => {
    const patch = { bought: true, updatedAt: '2026-04-20T01:00:00.000Z' };
    const updated = makeItem({ bought: true });

    let received: GroceryItem | undefined;
    service.updateItem('test-1', patch).subscribe((value) => (received = value));

    const req = http.expectOne(`${ITEMS_URL}/test-1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(patch);
    req.flush(updated);

    expect(received).toEqual(updated);
  });

  it('deleteItem DELETEs /items/:id', () => {
    let completed = false;
    service.deleteItem('test-1').subscribe({ complete: () => (completed = true) });

    const req = http.expectOne(`${ITEMS_URL}/test-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(completed).toBe(true);
  });
});
