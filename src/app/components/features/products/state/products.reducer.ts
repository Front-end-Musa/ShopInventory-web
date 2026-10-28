import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { Product } from '../data-access/products.models';
import * as ProductsActions from './products.actions';
import { SortByType, SortOrderType } from '../data-access/products-sorting.types';

export const productsFeatureKey = 'products';

export interface State extends EntityState<Product> {
  status: 'init' | 'loading' | 'loaded' | 'error';
  error: unknown | null;
  selectedProductId: number | null;
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
  sortBy: SortByType;
  sortOrder: SortOrderType;
}

export const adapter = createEntityAdapter<Product>();

export const initialState: State = adapter.getInitialState({
  status: 'init',
  error: null,
  selectedProductId: null,
  totalCount: 0,
  totalPages: 0,
  page: 1,
  pageSize: 10,
  sortBy: 'name',
  sortOrder: 'asc'
});

export const ProductsReducer = createReducer(
  initialState,
  on(ProductsActions.loadProducts, ProductsActions.loadProductById, (state) => ({
    ...state,
    status: 'loading' as const,
    error: null,
  })),
  on(ProductsActions.loadProductsSuccess, (state, { response }) =>
    adapter.setAll(response.products, {
      ...state,
      status: 'loaded',
      error: null,
      totalCount: response.totalCount,
      totalPages: response.totalPages,
      page: response.page,
      pageSize: response.pageSize,
    }),
  ),
  on(ProductsActions.loadProductByIdSuccess, (state, { product }) =>
    adapter.upsertOne(product, {
      ...state,
      status: 'loaded',
      error: null,
      selectedProductId: product.id,
    }),
  ),
  on(
    ProductsActions.loadProductsFailure,
    ProductsActions.loadProductByIdFailure,
    ProductsActions.createProductFailure,
    ProductsActions.deleteProductFailure,
    (state, { error }) => ({ ...state, status: 'error' as const, error }),
  ),
  on(ProductsActions.createProduct, ProductsActions.deleteProduct, (state) => ({
    ...state,
    status: 'loading' as const,
    error: null,
  })),
  on(ProductsActions.createProductSuccess, (state, { product }) =>
    adapter.addOne(product, { ...state, status: 'loaded', error: null }),
  ),
  on(ProductsActions.deleteProductSuccess, (state, { id }) =>
    adapter.removeOne(id, {
      ...state,
      status: 'loaded',
      error: null,
      selectedProductId: state.selectedProductId === id ? null : state.selectedProductId,
    }),
  ),
);

export const productsFeature = createFeature({
  name: productsFeatureKey,
  reducer: ProductsReducer,
});

const entitySelectors = adapter.getSelectors(productsFeature.selectProductsState);

export const selectIds = entitySelectors.selectIds;
export const selectEntities = entitySelectors.selectEntities;
export const selectAllProducts = entitySelectors.selectAll;
export const selectTotalPages = createSelector(
  productsFeature.selectProductsState,
  (state) =>
    state.totalPages
)
export const selectTotalCount = createSelector(
  productsFeature.selectProductsState,
  (state) =>
    state.totalCount
)
export const selectTotal = entitySelectors.selectTotal;
export const selectStatus = productsFeature.selectStatus;
export const selectError = productsFeature.selectError;
export const selectSelectedProductId = productsFeature.selectSelectedProductId;
export const selectSelectedProduct = createSelector(
  productsFeature.selectProductsState,
  (state) =>
    state.selectedProductId === null ? null : state.entities[state.selectedProductId] ?? null,
);
export const selectIsLoading = createSelector(
  selectStatus,
  (status) => status === 'loading',
);

