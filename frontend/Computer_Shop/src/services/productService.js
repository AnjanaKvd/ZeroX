import api from "./api";
import { getFullImageUrl } from "../utils/imageUtils";

export const getProducts = async(params = {}) => {
        try {
            // Build query string from params
            const queryParams = new URLSearchParams();
            if (params.page !== undefined) queryParams.append("page", params.page - 1); // API is zero-based
            if (params.size !== undefined) queryParams.append("size", params.size);

            // Sorting
            if (params.sortBy) {
                const direction = params.sortDirection || "asc";
                queryParams.append("sortBy", params.sortBy);
                queryParams.append("sortDirection", direction);
            }

            // Filters
            if (params.query) queryParams.append("query", params.query);
            if (params.categoryId) queryParams.append("categoryId", params.categoryId);
            if (params.minPrice) queryParams.append("minPrice", params.minPrice);
            if (params.maxPrice) queryParams.append("maxPrice", params.maxPrice);
            if (params.brand) queryParams.append("brand", params.brand);

            const queryString = queryParams.toString();
            const response = await api.get(
                    `/products${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  } catch (error) {
    console.error("Product service error:", error);
    throw error;
  }
};

export const getProductById = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
};

export const getProductBySku = async (sku) => {
  try {
    const response = await api.get(`/products/sku/${sku}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with SKU ${sku}:`, error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await fetch("/categories");

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Category service error:", error);
    return [];
  }
};

export const getProductReviews = async (productId, params = {}) => {
  try {
    const response = await api.get(`/reviews/product/${productId}`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    await api.delete(`/products/${productId}`);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await api.post("/products", productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const response = await api.put(`/products/${productId}`, productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const updateStock = async (stockUpdateData) => {
  try {
    const response = await api.post("/products/stock", stockUpdateData);
    return response.data;
  } catch (error) {
    console.error("Error updating stock:", error);
    throw error;
  }
};

export const getInventoryLogs = async (productId, params = {}) => {
  try {
    const response = await api.get(`/products/${productId}/inventory-logs`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory logs:", error);
    throw error;
  }
};
export const searchProducts = async (query) => {
  try {
    if (!query) return [];

    console.log(`Starting search for: ${query}`);

    // Define a placeholder image URL that will definitely work (data URI, no network required)
    const placeholderImageUrl =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' font-size='18' text-anchor='middle' alignment-baseline='middle' font-family='Arial, sans-serif' fill='%23666666'%3ENo Image%3C/text%3E%3C/svg%3E";

    // Try different endpoint URL formats
    // Format 1: Using axios instance with /productssearch/item
    try {
      console.log("Trying format 1: /productssearch/item");
      const response1 = await api.get(
        `/productssearch/item?q=${encodeURIComponent(query)}`
      );
      console.log("Format 1 response:", response1.data);

      if (
        response1.data &&
        (typeof response1.data === "object" || Array.isArray(response1.data))
      ) {
        // Process the results to add image information
        const results = Array.isArray(response1.data)
          ? response1.data
          : [response1.data];

        // Add placeholder image info to each product if missing
        return results.map((product) => {
          let imageUrl = product.imageUrl;

          // If the image URL is relative, convert it to a full URL
          if (
            imageUrl &&
            !imageUrl.startsWith("data:") &&
            !imageUrl.startsWith("http")
          ) {
            imageUrl = `http://localhost:8080${imageUrl}`;
          }

          return {
            ...product,
            imageUrl: imageUrl || placeholderImageUrl,
            description:
              product.description || `${product.name} - Memory/Storage product`,
          };
        });
      }
    } catch (error1) {
      console.error("Format 1 failed:", error1.message);
    }

    // Format 2: Direct fetch to the absolute URL
    try {
      const fullUrl = `http://localhost:8080/api/productssearch/item?q=${encodeURIComponent(
        query
      )}`;
      console.log("Trying format 2:", fullUrl);

      const response2 = await fetch(fullUrl);
      const data2 = await response2.json();
      console.log("Format 2 response:", data2);

      if (data2) {
        const results = Array.isArray(data2) ? data2 : [data2];

        // Add placeholder image info to each product if missing
        return results.map((product) => {
          let imageUrl = product.imageUrl;

          // If the image URL is relative, convert it to a full URL
          if (
            imageUrl &&
            !imageUrl.startsWith("data:") &&
            !imageUrl.startsWith("http")
          ) {
            imageUrl = `http://localhost:8080${imageUrl}`;
          }

          return {
            ...product,
            imageUrl: imageUrl || placeholderImageUrl,
            description:
              product.description || `${product.name} - Memory/Storage product`,
          };
        });
      }
    } catch (error2) {
      console.error("Format 2 failed:", error2.message);
    }

    // Format 3: Using axios instance with different path
    try {
      console.log("Trying format 3: /api/productssearch/item");
      const response3 = await api.get(
        `/api/productssearch/item?q=${encodeURIComponent(query)}`
      );
      console.log("Format 3 response:", response3.data);

      if (response3.data) {
        const results = Array.isArray(response3.data)
          ? response3.data
          : [response3.data];

        // Add placeholder image info to each product if missing
        return results.map((product) => {
          let imageUrl = product.imageUrl;

          // If the image URL is relative, convert it to a full URL
          if (
            imageUrl &&
            !imageUrl.startsWith("data:") &&
            !imageUrl.startsWith("http")
          ) {
            imageUrl = `http://localhost:8080${imageUrl}`;
          }

          return {
            ...product,
            imageUrl: imageUrl || placeholderImageUrl,
            description:
              product.description || `${product.name} - Memory/Storage product`,
          };
        });
      }
    } catch (error3) {
      console.error("Format 3 failed:", error3.message);
    }

    console.error("All API formats failed");
    return [];
  } catch (error) {
    console.error("Product search error:", error);
    throw error;
  }
};