import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { type Observable } from 'rxjs';

import { API_CONFIG } from '../../../core/config';
import { type CreateGroceryItemDto, type GroceryItem, type UpdateGroceryItemDto } from '../models';

@Injectable({ providedIn: 'root' })
export class GroceryListApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${inject(API_CONFIG).baseUrl}/items`;

  getItems(): Observable<GroceryItem[]> {
    return this.http.get<GroceryItem[]>(this.endpoint);
  }

  createItem(dto: CreateGroceryItemDto): Observable<GroceryItem> {
    return this.http.post<GroceryItem>(this.endpoint, dto);
  }

  updateItem(id: string, dto: UpdateGroceryItemDto): Observable<GroceryItem> {
    return this.http.patch<GroceryItem>(`${this.endpoint}/${id}`, dto);
  }

  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
