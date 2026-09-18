// SellerProductForm.jsx
// Handles both "Add Product" (/seller/products/new) and "Edit Product"
// (/seller/products/:productId/edit) using the shared /products endpoints —
// the backend enforces that a seller can only edit/delete products they
// created (product.controller.js), even though the route is shared with admins.
//
// Scope note: this covers the simple (no color/size variants) product shape —
// name, description, category, price, discountPrice, stock, sku, brand, images.
// The backend also supports a full color+size variant builder (colorVariants),
// which isn't exposed here yet; products created here simply have an empty
// colorVariants array, same as the existing admin Add Product form.
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { FiUpload, FiX } from 'react-icons/fi';
import * as productsApi from '../../api/products.api';
import * as categoriesApi from '../../api/categories.api';
import * as sellerApi from '../../api/seller.api';
import './SellerProductForm.css';

const EMPTY_FORM = {
  name: '',
  description: '',
  category: '',
  price: '',
  discountPrice: '',
  stock: '',
  sku: '',
  brand: '',
};

const SellerProductForm = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const location = useLocation();
  const isEdit = Boolean(productId);

  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // URLs already on the product (edit mode)
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    categoriesApi.getAllCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;

    const populateFrom = (product) => {
      setForm({
        name: product.name || '',
        description: product.description || '',
        category: product.category?._id || product.category || '',
        price: product.price ?? '',
        discountPrice: product.discountPrice || '',
        stock: product.stock ?? '',
        sku: product.sku || '',
        brand: product.brand || '',
      });
      setExistingImages(product.images || []);
      setLoading(false);
    };

    // Fast path: came here via the Edit link, which already has the product
    if (location.state?.product) {
      populateFrom(location.state.product);
      return;
    }

    // Fallback (e.g. direct URL / page refresh) — look it up among this
    // seller's own products, since there's no "get product by id" endpoint.
    sellerApi
      .getMyProducts({ page: 1, limit: 1000 })
      .then((res) => {
        const found = res.data.products.find((p) => p._id === productId);
        if (found) {
          populateFrom(found);
        } else {
          setNotFound(true);
          setLoading(false);
        }
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [isEdit, productId, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 5 - existingImages.length - newFiles.length;
    const accepted = files.slice(0, Math.max(remainingSlots, 0));

    if (files.length > accepted.length) {
      toast.error('Up to 5 images total per product');
    }

    const validFiles = accepted.filter((f) => {
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name} isn't an image`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} is over 5MB`);
        return false;
      }
      return true;
    });

    setNewFiles((prev) => [...prev, ...validFiles]);
    setNewPreviews((prev) => [...prev, ...validFiles.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeNewImage = (idx) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return toast.error('Product name is required');
    if (!form.description.trim()) return toast.error('Description is required');
    if (!form.category) return toast.error('Please select a category');
    if (!form.price || Number(form.price) <= 0) return toast.error('Please enter a valid price');
    if (!isEdit && newFiles.length === 0) return toast.error('At least one image is required');

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('name', form.name.trim());
      payload.append('description', form.description);
      payload.append('category', form.category);
      payload.append('price', form.price);
      if (form.discountPrice) payload.append('discountPrice', form.discountPrice);
      payload.append('stock', form.stock || 0);
      if (form.sku) payload.append('sku', form.sku);
      if (form.brand) payload.append('brand', form.brand);
      newFiles.forEach((file) => payload.append('images', file));

      if (isEdit) {
        await productsApi.updateProduct(productId, payload);
        toast.success('Product updated');
      } else {
        await productsApi.createProduct(payload);
        toast.success('Product created');
      }

      setTimeout(() => navigate('/seller/products'), 700);
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="spf-loading">Loading product…</div>;
  }

  if (notFound) {
    return (
      <div className="spf-loading">
        Couldn't find that product — it may have been removed, or belongs to a different seller.
      </div>
    );
  }

  return (
    <div className="spf-page">
      <Toaster position="top-center" />
      <h1>{isEdit ? 'Edit Product' : 'Add Product'}</h1>

      <form onSubmit={handleSubmit} className="spf-form">
        <div className="spf-group">
          <label>Product Images {!isEdit && '*'}</label>
          <div className="spf-image-grid">
            {existingImages.map((url, idx) => (
              <div key={`existing-${idx}`} className="spf-image-box spf-image-existing">
                <img src={url} alt={`Product ${idx + 1}`} />
              </div>
            ))}
            {newPreviews.map((url, idx) => (
              <div key={`new-${idx}`} className="spf-image-box">
                <img src={url} alt={`New ${idx + 1}`} />
                <button type="button" className="spf-remove-img" onClick={() => removeNewImage(idx)}>
                  <FiX />
                </button>
              </div>
            ))}
            {existingImages.length + newFiles.length < 5 && (
              <label className="spf-image-upload">
                <FiUpload />
                <span>Upload</span>
                <input type="file" accept="image/*" multiple onChange={handleFilesChange} hidden />
              </label>
            )}
          </div>
          <small className="spf-hint">
            {isEdit
              ? 'Existing images can\'t be removed here — new uploads are added alongside them (up to 5 total).'
              : 'Up to 5 images.'}
          </small>
        </div>

        <div className="spf-group">
          <label htmlFor="name">Product Name *</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} required />
        </div>

        <div className="spf-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="spf-row">
          <div className="spf-group">
            <label htmlFor="category">Category *</label>
            <select id="category" name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="spf-group">
            <label htmlFor="brand">Brand</label>
            <input id="brand" name="brand" value={form.brand} onChange={handleChange} placeholder="Optional" />
          </div>
        </div>

        <div className="spf-row">
          <div className="spf-group">
            <label htmlFor="price">Price (₹) *</label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="spf-group">
            <label htmlFor="discountPrice">Discount Price (₹)</label>
            <input
              id="discountPrice"
              name="discountPrice"
              type="number"
              min="0"
              step="0.01"
              value={form.discountPrice}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="spf-row">
          <div className="spf-group">
            <label htmlFor="stock">Stock Quantity</label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
            />
          </div>
          <div className="spf-group">
            <label htmlFor="sku">SKU</label>
            <input id="sku" name="sku" value={form.sku} onChange={handleChange} placeholder="Optional" />
          </div>
        </div>

        <button type="submit" className="spf-submit-btn" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default SellerProductForm;
