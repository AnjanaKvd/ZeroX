import api from './api';

export const getCategories = async (sidebarOnly = false) => {
  try {
    const url = sidebarOnly ? '/categories/sidebar' : '/categories';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCategorySidebarStatus = async (categoryId, showInSidebar) => {
  try {
    const response = await api.patch(`/categories/${categoryId}/sidebar?sidebar=${showInSidebar}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCategoryById = async (categoryId) => {
  try {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    await api.delete(`/categories/${categoryId}`);
  } catch (error) {
    throw error;
  }
}; 