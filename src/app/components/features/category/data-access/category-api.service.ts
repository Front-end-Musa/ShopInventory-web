import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Category, CategoryRequestDto } from "./category.models";

@Injectable({
    providedIn: 'root'
})
export class CategoryApiService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = '/api/category';

    getAll(): Observable<Category[]> {
        return this.http.get<Category[]>(this.apiUrl);
    }

    getById(id: number): Observable<Category> {
        return this.http.get<Category>(`${this.apiUrl}/${id}`);
    }

    create(request: CategoryRequestDto): Observable<Category> {
        return this.http.post<Category>(this.apiUrl, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}