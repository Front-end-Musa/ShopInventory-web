import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CreateProductRequest, Product } from "./products.models";

@Injectable({
    providedIn: 'root'
})
export class ProductsApiService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = '/api/products';

    getAll(): Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl);
    }

    getById(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`);
    }

    create(request: CreateProductRequest): Observable<Product> {
        return this.http.post<Product>(this.apiUrl, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}