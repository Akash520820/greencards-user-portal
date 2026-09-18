import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import * as productsApi from '../../api/products.api';
import * as adminApi from '../../api/admin.api';
import toast, { Toaster } from 'react-hot-toast';
import './AddProduct.css';

const MAX_BASE_IMAGES = 5;
const MAX_COLOR_IMAGES = 4;

const emptySize = () => ({ size: '', sku: '', priceModifier: '', stock: '' });
const emptyColorVariant = () => ({
  color: '',
  priceModifier: '',
  imageFiles: [],
  imagePreviews: [],
  sizes: [emptySize()],
});

const AddProduct = () => {
  const navigate = useNavigate();
  const { addProduct, categories } = useProducts();
  const [sellers, setSellers] = useState([]);

  // ---- Simple / top-level fields ----
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    sellerId: '',
    brand: '',
    sku: '',
    price: '',
    discountPrice: '',
    stock: '',
    isActive: true,
  });

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await adminApi.getSellersByStatus('approved');
        if (res.data) setSellers(res.data);
      } catch (err) {
        console.error('Failed to load sellers list:', err);
      }
    };
    fetchSellers();
  }, []);

  // ---- Base product images ----
  // Required when the product has NO color variants (this is its only image set then).
  // When color variants are turned on, this becomes optional — used only as a fallback
  // for a color that doesn't upload its own photos.
  const [imageFiles, setImageFiles] = useState(Array(MAX_BASE_IMAGES).fill(null));
  const [imagePreviews, setImagePreviews] = useState(Array(MAX_BASE_IMAGES).fill(null));

  // ---- Does this product come in color variants? Asked explicitly, up front. ----
  const [variantMode, setVariantMode] = useState(null); // null (unanswered) | 'none' | 'colors'
  const hasVariants = variantMode === 'colors';

  // ---- Color variants (Amazon/Flipkart style: color -> its own images/price -> sizes -> stock) ----
  const [colorVariants, setColorVariants] = useState([]);

  const [loading, setLoading] = useState(false);

  const handleVariantModeChange = (mode) => {
    setVariantMode(mode);
    if (mode === 'colors' && colorVariants.length === 0) {
      setColorVariants([emptyColorVariant()]);
    }
  };

  // ---------------- top-level field handlers ----------------
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload only image files');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const newFiles = [...imageFiles];
    newFiles[index] = file;
    setImageFiles(newFiles);

    const newPreviews = [...imagePreviews];
    newPreviews[index] = URL.createObjectURL(file);
    setImagePreviews(newPreviews);
  };

  const removeImage = (index) => {
    const newPreviews = [...imagePreviews];
    newPreviews[index] = null;
    setImagePreviews(newPreviews);

    const newFiles = [...imageFiles];
    newFiles[index] = null;
    setImageFiles(newFiles);
  };

  // ---------------- color variant handlers ----------------
  const addColorVariant = () => {
    setColorVariants((prev) => [...prev, emptyColorVariant()]);
  };

  const removeColorVariant = (colorIndex) => {
    setColorVariants((prev) => {
      const next = prev.filter((_, i) => i !== colorIndex);
      if (next.length === 0) {
        setVariantMode(null);
      }
      return next;
    });
  };

  const updateColorField = (colorIndex, field, value) => {
    setColorVariants((prev) =>
      prev.map((cv, i) => (i === colorIndex ? { ...cv, [field]: value } : cv))
    );
  };

  const handleColorImagesChange = (colorIndex, fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    setColorVariants((prev) =>
      prev.map((cv, i) => {
        if (i !== colorIndex) return cv;
        const room = MAX_COLOR_IMAGES - cv.imageFiles.length;
        if (room <= 0) {
          toast.error(`Max ${MAX_COLOR_IMAGES} images per color`);
          return cv;
        }
        const accepted = files.slice(0, room).filter((f) => {
          if (!f.type.startsWith('image/')) {
            toast.error('Please upload only image files');
            return false;
          }
          if (f.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return false;
          }
          return true;
        });
        return {
          ...cv,
          imageFiles: [...cv.imageFiles, ...accepted],
          imagePreviews: [...cv.imagePreviews, ...accepted.map((f) => URL.createObjectURL(f))],
        };
      })
    );
  };

  const removeColorImage = (colorIndex, imageIndex) => {
    setColorVariants((prev) =>
      prev.map((cv, i) => {
        if (i !== colorIndex) return cv;
        return {
          ...cv,
          imageFiles: cv.imageFiles.filter((_, idx) => idx !== imageIndex),
          imagePreviews: cv.imagePreviews.filter((_, idx) => idx !== imageIndex),
        };
      })
    );
  };

  const addSizeRow = (colorIndex) => {
    setColorVariants((prev) =>
      prev.map((cv, i) => (i === colorIndex ? { ...cv, sizes: [...cv.sizes, emptySize()] } : cv))
    );
  };

  const removeSizeRow = (colorIndex, sizeIndex) => {
    setColorVariants((prev) =>
      prev.map((cv, i) =>
        i === colorIndex ? { ...cv, sizes: cv.sizes.filter((_, si) => si !== sizeIndex) } : cv
      )
    );
  };

  const updateSizeField = (colorIndex, sizeIndex, field, value) => {
    setColorVariants((prev) =>
      prev.map((cv, i) =>
        i === colorIndex
          ? {
              ...cv,
              sizes: cv.sizes.map((s, si) => (si === sizeIndex ? { ...s, [field]: value } : s)),
            }
          : cv
      )
    );
  };

  // ---------------- validation ----------------
  const validate = (filteredFiles) => {
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Product description is required');
      return false;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return false;
    }

    if (variantMode === null) {
      toast.error('Please answer whether this product has color variants');
      return false;
    }

    if (!hasVariants) {
      // no color variants — the base image set is this product's only images, so it's required
      if (!filteredFiles.length) {
        toast.error('Please upload at least one product image');
        return false;
      }
      return true;
    }

    // hasVariants === true
    if (!colorVariants.length) {
      toast.error('Add at least one color, or switch "Color Variants" off');
      return false;
    }

    for (const cv of colorVariants) {
      if (!cv.color.trim()) {
        toast.error('Every color needs a name (e.g. "Red")');
        return false;
      }
      if (!cv.imageFiles.length) {
        toast.error(`Please upload at least one image for "${cv.color.trim() || 'this color'}" — an image is required for every color variant`);
        return false;
      }
      if (!cv.sizes.length || cv.sizes.every((s) => !s.size.trim())) {
        toast.error(`Color "${cv.color}" needs at least one size — use "One Size" if it doesn't vary`);
        return false;
      }
    }
    const colorNames = colorVariants.map((cv) => cv.color.trim().toLowerCase());
    if (new Set(colorNames).size !== colorNames.length) {
      toast.error('Color names must be unique');
      return false;
    }

    return true;
  };

  // ---------------- submit ----------------
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      brand: '',
      sku: '',
      price: '',
      discountPrice: '',
      stock: '',
      isActive: true,
    });
    setImageFiles(Array(MAX_BASE_IMAGES).fill(null));
    setImagePreviews(Array(MAX_BASE_IMAGES).fill(null));
    setVariantMode(null);
    setColorVariants([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const filteredFiles = imageFiles.filter(Boolean);
    if (!validate(filteredFiles)) return;

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('description', formData.description);
      payload.append('category', formData.category);
      payload.append('price', formData.price);
      if (formData.discountPrice) payload.append('discountPrice', formData.discountPrice);
      if (formData.brand.trim()) payload.append('brand', formData.brand.trim());
      payload.append('isActive', String(formData.isActive));

      if (hasVariants) {
        // stock/sku live per-size when variants exist — top-level stock/sku are ignored by the backend in this case
        const variantsPayload = colorVariants.map((cv) => ({
          color: cv.color.trim(),
          priceModifier: Number(cv.priceModifier) || 0,
          images: [], // uploaded in a second step below, once the product (and its variant array) exists
          sizes: cv.sizes
            .filter((s) => s.size.trim())
            .map((s) => ({
              size: s.size.trim(),
              sku: s.sku.trim(),
              priceModifier: Number(s.priceModifier) || 0,
              stock: Number(s.stock) || 0,
            })),
        }));
        payload.append('colorVariants', JSON.stringify(variantsPayload));
      } else {
        payload.append('stock', formData.stock || 0);
        if (formData.sku.trim()) payload.append('sku', formData.sku.trim());
      }

      filteredFiles.forEach((file) => payload.append('images', file));

      const newProduct = await addProduct(payload);

      // second step: upload each color's own images now that the product (and its
      // colorVariants array) exists on the server
      if (hasVariants && newProduct?._id) {
        for (const cv of colorVariants) {
          if (!cv.imageFiles.length) continue;
          try {
            const colorPayload = new FormData();
            colorPayload.append('color', cv.color.trim());
            cv.imageFiles.forEach((file) => colorPayload.append('images', file));
            await productsApi.addColorVariantImages(newProduct._id, colorPayload);
          } catch (err) {
            console.error(`Error uploading images for color "${cv.color}":`, err);
            toast.error(`Product saved, but images for "${cv.color}" failed to upload`);
          }
        }
      }

      toast.success('Product added successfully! 🎉', {
        duration: 2000,
        position: 'top-center',
      });

      resetForm();

      setTimeout(() => {
        navigate('/admin/inventory');
      }, 1000);
    } catch (err) {
      console.error('Error adding product:', err);
      toast.error(err.message || 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      <Toaster />

      <div className="add-product-header">
        <h1 className="add-product-title">Add New Product</h1>
        <p className="add-product-subtitle">Add your product details and images</p>
      </div>

      <form onSubmit={handleSubmit} className="add-product-form">
        {/* ---------------- Does this product have color variants? ---------------- */}
        <div className="form-section">
          <label className="form-label">Does this product come in color variants?</label>
          <p className="field-hint">
            e.g. the same t-shirt available in Red, Blue, etc. Answer this first — it decides
            whether you upload one image set below, or one image set per color.
          </p>
          <div className="variant-choice-row">
            <button
              type="button"
              className={`variant-choice-btn ${variantMode === 'none' ? 'active' : ''}`}
              onClick={() => handleVariantModeChange('none')}
            >
              No — single product
            </button>
            <button
              type="button"
              className={`variant-choice-btn ${variantMode === 'colors' ? 'active' : ''}`}
              onClick={() => handleVariantModeChange('colors')}
            >
              Yes — has color variants
            </button>
          </div>
        </div>

        {/* ---------------- Base images ---------------- */}
        {variantMode !== null && (
          <div className="form-section">
            <label className="form-label">
              Product Images (Max {MAX_BASE_IMAGES})
              {!hasVariants && <span className="required-mark"> *</span>}
              {hasVariants && <span className="optional-mark"> (optional)</span>}
            </label>
            <p className="field-hint">
              {hasVariants
                ? "Optional fallback photos, only used for a color that doesn't upload its own images. Since this product has color variants, each color's own images below are what's required."
                : 'Required — these are the only photos this product will have.'}
            </p>
            <div className="image-upload-grid">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="image-upload-box">
                  {preview ? (
                    <div className="image-preview-container">
                      <img src={preview} alt={`Preview ${index + 1}`} className="image-preview" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <i className="bi bi-x-circle-fill" aria-hidden="true"></i>
                      </button>
                    </div>
                  ) : (
                    <label className="upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, index)}
                        className="file-input"
                      />
                      <i className="bi bi-cloud-upload upload-icon"></i>
                      <span className="upload-text">Upload</span>
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- Name ---------------- */}
        <div className="form-section">
          <label htmlFor="name" className="form-label">Product Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g. Classic Cotton T-Shirt"
            className="form-input"
            required
          />
        </div>

        {/* ---------------- Description ---------------- */}
        <div className="form-section">
          <label htmlFor="description" className="form-label">Product Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="What makes this product worth buying?"
            className="form-textarea"
            rows="4"
            required
          ></textarea>
        </div>

        {/* ---------------- Category ---------------- */}
        <div className="form-section">
          <label htmlFor="category" className="form-label">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="form-select"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          {categories.length === 0 && (
            <small className="text-muted d-block mt-1">
              No categories yet — create one from your database/admin tools first.
            </small>
          )}
        </div>

        {/* ---------------- Seller / Store Selection (Admin/SuperAdmin feature) ---------------- */}
        <div className="form-section">
          <label htmlFor="sellerId" className="form-label">
            Select Seller / Store <span className="optional-mark">(optional — default: SuperAdmin)</span>
          </label>
          <select
            id="sellerId"
            name="sellerId"
            value={formData.sellerId}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="">Default (SuperAdmin / Admin Store)</option>
            {sellers.map((s) => (
              <option key={s._id} value={s.userId?._id || s._id}>
                {s.storeName || s.userId?.fullName || s.userId?.userName || s.companyEmail} ({s.storeCategory || 'Seller'})
              </option>
            ))}
          </select>
          <p className="field-hint">
            Specify which seller account requested or owns this product.
          </p>
        </div>

        {/* ---------------- Brand ---------------- */}
        <div className="form-section">
          <label htmlFor="brand" className="form-label">Brand</label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            placeholder="e.g. YourBrand (optional)"
            className="form-input"
          />
        </div>

        {/* ---------------- Price / Discount price ---------------- */}
        <div className="form-row">
          <div className="form-section form-section-half">
            <label htmlFor="price" className="form-label">Price (MRP)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0"
              className="form-input"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-section form-section-half">
            <label htmlFor="discountPrice" className="form-label">Discount Price</label>
            <input
              type="number"
              id="discountPrice"
              name="discountPrice"
              value={formData.discountPrice}
              onChange={handleInputChange}
              placeholder="0"
              className="form-input"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* ---------------- Simple-product stock / SKU (hidden once variants exist) ---------------- */}
        {!hasVariants && (
          <div className="form-row">
            <div className="form-section form-section-half">
              <label htmlFor="stock" className="form-label">Stock Quantity</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
                className="form-input"
                min="0"
              />
            </div>

            <div className="form-section form-section-half">
              <label htmlFor="sku" className="form-label">SKU</label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="e.g. MUG-BLACK-001 (optional)"
                className="form-input"
              />
            </div>
          </div>
        )}
        {hasVariants && (
          <p className="field-hint variant-note">
            This product has color variants, so stock and SKU are tracked per size below instead
            of at the product level.
          </p>
        )}

        {/* ---------------- Active toggle ---------------- */}
        <div className="form-section">
          <label className="toggle-row">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="toggle-checkbox"
            />
            <span className="toggle-switch"></span>
            <span className="toggle-label">
              {formData.isActive ? 'Visible to customers' : 'Hidden (draft)'}
            </span>
          </label>
        </div>

        {/* ---------------- Color variants ---------------- */}
        {hasVariants && (
          <div className="form-section">
            <div className="section-header-row">
              <label className="form-label mb-0">Color Variants</label>
              <button type="button" className="add-color-btn" onClick={addColorVariant}>
                <i className="bi bi-plus-lg"></i> Add Color
              </button>
            </div>
            <p className="field-hint">
              Add one entry for every color this product comes in (e.g. "Red", "Blue"). Each color
              below requires at least one image of its own.
            </p>

            {colorVariants.map((cv, colorIndex) => (
            <div className="color-variant-card" key={colorIndex}>
              <div className="color-variant-header">
                <span className="color-variant-index">Color {colorIndex + 1}</span>
                <button
                  type="button"
                  className="remove-color-btn"
                  onClick={() => removeColorVariant(colorIndex)}
                  aria-label={`Remove color ${colorIndex + 1}`}
                >
                  <i className="bi bi-trash"></i> Remove
                </button>
              </div>

              <div className="form-row">
                <div className="form-section form-section-half">
                  <label className="form-label">Color Name</label>
                  <input
                    type="text"
                    value={cv.color}
                    onChange={(e) => updateColorField(colorIndex, 'color', e.target.value)}
                    placeholder="e.g. Red"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-section form-section-half">
                  <label className="form-label">Price Modifier</label>
                  <input
                    type="number"
                    value={cv.priceModifier}
                    onChange={(e) => updateColorField(colorIndex, 'priceModifier', e.target.value)}
                    placeholder="0"
                    className="form-input"
                    step="0.01"
                  />
                  <small className="field-hint">Added on top of the base price for this color</small>
                </div>
              </div>

              {/* per-color images */}
              <div className="form-section">
                <label className="form-label">
                  Images for this color (Max {MAX_COLOR_IMAGES})
                  <span className="required-mark"> *</span>
                </label>
                <p className="field-hint">
                  Required — upload at least one photo for "{cv.color || 'this color'}". Uploaded
                  right after the product is saved.
                </p>
                <div className="image-upload-grid color-image-grid">
                  {cv.imagePreviews.map((preview, imgIndex) => (
                    <div key={imgIndex} className="image-upload-box">
                      <div className="image-preview-container">
                        <img src={preview} alt={`${cv.color} ${imgIndex + 1}`} className="image-preview" />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeColorImage(colorIndex, imgIndex)}
                          aria-label="Remove image"
                        >
                          <i className="bi bi-x-circle-fill" aria-hidden="true"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                  {cv.imageFiles.length < MAX_COLOR_IMAGES && (
                    <div className="image-upload-box">
                      <label className="upload-label">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleColorImagesChange(colorIndex, e.target.files)}
                          className="file-input"
                        />
                        <i className="bi bi-cloud-upload upload-icon"></i>
                        <span className="upload-text">Upload</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* sizes */}
              <div className="form-section">
                <div className="section-header-row">
                  <label className="form-label mb-0">Sizes</label>
                  <button type="button" className="add-size-btn" onClick={() => addSizeRow(colorIndex)}>
                    <i className="bi bi-plus-lg"></i> Add Size
                  </button>
                </div>
                <p className="field-hint">Use a single "One Size" row if this color doesn't come in sizes.</p>

                <div className="size-table">
                  <div className="size-table-head">
                    <span>Size</span>
                    <span>SKU</span>
                    <span>Price Modifier</span>
                    <span>Stock</span>
                    <span></span>
                  </div>
                  {cv.sizes.map((s, sizeIndex) => (
                    <div className="size-table-row" key={sizeIndex}>
                      <input
                        type="text"
                        value={s.size}
                        onChange={(e) => updateSizeField(colorIndex, sizeIndex, 'size', e.target.value)}
                        placeholder="S / M / L / One Size"
                        className="form-input"
                        required
                      />
                      <input
                        type="text"
                        value={s.sku}
                        onChange={(e) => updateSizeField(colorIndex, sizeIndex, 'sku', e.target.value)}
                        placeholder="Optional"
                        className="form-input"
                      />
                      <input
                        type="number"
                        value={s.priceModifier}
                        onChange={(e) => updateSizeField(colorIndex, sizeIndex, 'priceModifier', e.target.value)}
                        placeholder="0"
                        className="form-input"
                        step="0.01"
                      />
                      <input
                        type="number"
                        value={s.stock}
                        onChange={(e) => updateSizeField(colorIndex, sizeIndex, 'stock', e.target.value)}
                        placeholder="0"
                        className="form-input"
                        min="0"
                      />
                      <button
                        type="button"
                        className="remove-size-btn"
                        onClick={() => removeSizeRow(colorIndex, sizeIndex)}
                        disabled={cv.sizes.length === 1}
                        aria-label={`Remove size row ${sizeIndex + 1}`}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Adding Product...' : 'ADD'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
