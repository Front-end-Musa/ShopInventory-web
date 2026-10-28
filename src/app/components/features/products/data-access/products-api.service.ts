import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ProductRequestDto, Product, ProductsResponse } from "./products.models";
import { SortByType, SortOrderType } from "./products-sorting.types";

@Injectable({
    providedIn: 'root'
})
export class ProductsApiService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = 'https://localhost:7126/api/products';

    getAll(page: number, pageSize: number, sortBy?: SortByType, sortOrder?: SortOrderType): Observable<ProductsResponse> {
        const params: Record<string, string | number> = { page, pageSize };
        if (sortBy && sortOrder) {
            params['sortBy'] = sortBy;
            params['sortOrder'] = sortOrder;
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
