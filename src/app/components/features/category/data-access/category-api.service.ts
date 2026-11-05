import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Category, CategoryRequestDto } from "./category.models";

@Injectable({
    providedIn: 'root'
})
export class CategoryApiService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = 'https://localhost:7126/api/categories';

    getAll(): Observable<Category[]> {
        return this.http.get<Category[]>(this.apiUrl);
    }

    getById(id: number): Observable<Category> {
        return this.http.get<Category>(`${this.apiUrl}/${id}`);
    }

    create(request: CategoryRequestDto): Observable<Category> {
        return this.http.post<Category>(this.apiUrl, request);
    }

    update(id: number, request: CategoryRequestDto): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}