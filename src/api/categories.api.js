import api, { unwrap } from "./client";

export const getAllCategories = () => unwrap(api.get("/categories"));

export const getCategoryBySlug = (slug) => unwrap(api.get(`/categories/${slug}`));

// FormData: name, description, image (file), parentCategory
export const createCategory = (formData) =>
  unwrap(
    api.post("/categories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );

export const updateCategory = (categoryId, formData) =>
  unwrap(
    api.patch(`/categories/${categoryId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );

export const deleteCategory = (categoryId) => unwrap(api.delete(`/categories/${categoryId}`));
