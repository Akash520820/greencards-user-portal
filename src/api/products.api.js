import api, { unwrap } from "./client";

// query: { search, category, minPrice, maxPrice, sort, page, limit }
export const getAllProducts = (params = {}) =>
  unwrap(api.get("/products", { params }));

export const getProductBySlug = (slug) => unwrap(api.get(`/products/${slug}`));

// productData is a FormData: name, description, category, price, discountPrice,
// stock, sku, brand, colorVariants (JSON string), images (up to 5 files)
export const createProduct = (productData) =>
  unwrap(
    api.post("/products", productData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );

export const updateProduct = (productId, productData) =>
  unwrap(
    api.patch(`/products/${productId}`, productData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );

export const deleteProduct = (productId) => unwrap(api.delete(`/products/${productId}`));

export const updateStock = (productId, payload) =>
  unwrap(api.patch(`/products/${productId}/stock`, payload));

export const addColorVariantImages = (productId, formData) =>
  unwrap(
    api.patch(`/products/${productId}/color-images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );

export const getBestSellers = (params = {}) =>
  unwrap(api.get("/products/bestsellers", { params }));

export const getFlashSaleProducts = (params = {}) =>
  unwrap(api.get("/products/flash-sale", { params }));
