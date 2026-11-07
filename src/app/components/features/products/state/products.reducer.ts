import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { Product, ProductsQuery } from '../data-access/products.models';
import * as ProductsActions from './products.actions';

export const productsFeatureKey = 'products';

export interface State extends EntityState<Product> {
  creationStatus: 'idle' | 'saving' | 'success' | 'error';
  creationError: unknown;
  status: 'init' | 'loading' | 'loaded' | 'error';
  error: unknown | null;
  selectedProductId: number | null;
  totalCount: number;
  totalPages: number;
  query: ProductsQuery;
}

export const adapter = createEntityAdapter<Product>();

export const initialState: State = adapter.getInitialState({
  creationStatus: 'idle',
  creationError: null,
  status: 'init',
  error: null,
  selectedProductId: null,
  totalCount: 0,
  totalPages: 0,
  query: {
    page: 1,
    pageSize: 20,
    sortBy: 'name',
    sortOrder: 'asc',
    searchInput: '',
  },
});

export const ProductsReducer = createReducer(
  initialState,
  on(ProductsActions.categoryChanged, (state, { categoryId }) => ({ ...state, query: { ...state.query, categoryId, page: 1 }, status: 'loading' as const })),
  on(ProductsActions.resetCreation, state => ({ ...state, creationStatus: 'idle' as const, creationError: null })),
  on(ProductsActions.createProduct, state => ({ ...state, creationStatus: 'saving' as const, creationError: null })),
  on(ProductsActions.createProductFailure, (state, { error }) => ({ ...state, creationStatus: 'error' as const, creationError: error })),
  on(ProductsActions.loadProducts, (state, { page, pageSize, sortBy, sortOrder }) => ({
    ...state,
    query: {
      ...state.query,
      page,
      pageSize,
      sortBy: sortBy ?? state.query.sortBy,
      sortOrder: sortOrder ?? state.query.sortOrder,
    },
    status: 'loading' as const,
    error: null,
  })),
  on(ProductsActions.loadProductById, (state) => ({
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
      query: {
        ...state.query,
        page: response.page,
        pageSize: response.pageSize,
      },
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
    adapter.addOne(product, { ...state, creationStatus: 'success', status: 'loaded', error: null }),
  ),
  on(ProductsActions.deleteProductSuccess, (state, { id }) =>
    adapter.removeOne(id, {
      ...state,
      status: 'loaded',
      error: null,
      selectedProductId: state.selectedProductId === id ? null : state.selectedProductId,
    }),
  ),
  on(ProductsActions.searchProducts, (state, { searchInput }) => ({
    ...state,
    query: {
      ...state.query,
      searchInput,
      page: 1,
    },
    status: 'loading' as const,
  })),
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

export const selectProductsQuery = productsFeature.selectQuery;
