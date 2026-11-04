import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ProductRequestDto, Product, ProductsResponse, ProductsQuery } from "./products.models";

@Injectable({
    providedIn: 'root'
})
export class ProductsApiService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = 'https://localhost:7126/api/products';

    getAll(query: ProductsQuery): Observable<ProductsResponse> {
        let params = new HttpParams()
        .set('page', query.page)
        .set('pageSize', query.pageSize)
        .set('sortBy', query.sortBy)
        .set('sortOrder', query.sortOrder);

        if (query.searchInput.trim()) {
            params = params.set('searchInput', query.searchInput.trim());
        }

        return this.http.get<ProductsResponse>(this.apiUrl, { params });
    }

    getById(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`);
    }

    create(request: ProductRequestDto): Observable<Product> {
        return this.http.post<Product>(this.apiUrl, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
