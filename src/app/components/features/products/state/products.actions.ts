import { createAction, props } from '@ngrx/store';
import { CreateProductRequest, Product } from '../data-access/products.models';

export const loadProducts = createAction('[Products/API] Load Products');
export const loadProductsSuccess = createAction(
  '[Products/API] Load Products Success',
  props<{ products: Product[] }>(),
);
export const loadProductsFailure = createAction(
  '[Products/API] Load Products Failure',
  props<{ error: unknown }>(),
);

export const loadProductById = createAction(
  '[Products/API] Load Product By Id',
  props<{ id: number }>(),
);
export const loadProductByIdSuccess = createAction(
  '[Products/API] Load Product By Id Success',
  props<{ product: Product }>(),
);
export const loadProductByIdFailure = createAction(
  '[Products/API] Load Product By Id Failure',
  props<{ error: unknown }>(),
);

export const createProduct = createAction(
  '[Products/API] Create Product',
  props<{ request: CreateProductRequest }>(),
);
export const createProductSuccess = createAction(
  '[Products/API] Create Product Success',
  props<{ product: Product }>(),
);
export const createProductFailure = createAction(
  '[Products/API] Create Product Failure',
  props<{ error: unknown }>(),
);

export const deleteProduct = createAction(
  '[Products/API] Delete Product',
  props<{ id: number }>(),
);
export const deleteProductSuccess = createAction(
  '[Products/API] Delete Product Success',
  props<{ id: number }>(),
);
export const deleteProductFailure = createAction(
  '[Products/API] Delete Product Failure',
  props<{ error: unknown }>(),
);
