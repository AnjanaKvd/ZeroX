import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Check, X } from 'lucide-react';
import * as categoryService from '../services/categoryService';
import CategoryModal from '../components/admin/CategoryModal';
import ConfirmModal from '../components/admin/ConfirmModal';
import LoadingOverlay from '../components/common/LoadingOverlay';
import { IconRenderer } from '../utils/iconRegistry';

// Helper function to get category ID from various possible properties
const getCategoryId = (category) => {
  if (!category) return null;
  // Try all possible ID property names
  return category.id || category._id || category.categoryId || category.uuid;
};

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({
    showAdd: false,
    showEdit: false,
    showDelete: false,
    selectedCategory: null,
  });
  const [error, setError] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getCategories();
      setCategories(data || []);
    } catch (error) {
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (formData) => {
    try {
      setLoading(true);
      await categoryService.createCategory(formData);
      await fetchCategories();
      closeModal();
    } catch (error) {
      setError('Failed to create category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async (formData) => {
    try {
      const categoryId = getCategoryId(modalState.selectedCategory);
      if (!categoryId) {
        throw new Error('No category ID found');
      }
      setLoading(true);
      await categoryService.updateCategory(categoryId, formData);
      await fetchCategories();
      closeModal();
    } catch (error) {
      setError('Failed to update category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

    const handleDeleteConfirm = async () => {
    try {
      const categoryId = getCategoryId(modalState.selectedCategory);
      if (!categoryId) {
        throw new Error('No category ID found');
      }
      setLoading(true);
      await categoryService.deleteCategory(categoryId);
      await fetchCategories();
      closeModal();
    } catch (error) {
      setError('Failed to delete category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSidebarToggle = async (category, e) => {
    e.stopPropagation();
    const categoryId = getCategoryId(category);
    if (!categoryId) return;

    try {
      setLoading(true);
      await categoryService.updateCategorySidebarStatus(categoryId, !category.sidebar);
      // Update the local state to reflect the change immediately
      setCategories(categories.map(cat => 
        getCategoryId(cat) === categoryId 
          ? { ...cat, sidebar: !category.sidebar } 
          : cat
      ));
    } catch (error) {
      setError('Failed to update sidebar status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalState({
      ...modalState,
      showAdd: true,
      selectedCategory: null,
    });
  };

  const openEditModal = (category) => {
    setModalState({
      ...modalState,
      showEdit: true,
      selectedCategory: category,
    });
  };

  const openDeleteModal = (category) => {
    setModalState({
      ...modalState,
      showDelete: true,
      selectedCategory: category,
    });
  };

  const closeModal = () => {
    setModalState({
      showAdd: false,
      showEdit: false,
      showDelete: false,
      selectedCategory: null,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && categories.length === 0 ? (
          <LoadingOverlay message="Loading categories..." />
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No categories found. Create your first category!</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Icon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  In Sidebar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={getCategoryId(category)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <IconRenderer iconName={category.icon} className="w-6 h-6 text-blue-600" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{category.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {category.description || 'No description'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={(e) => handleSidebarToggle(category, e)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${category.sidebar ? 'bg-blue-600' : 'bg-gray-200'}`}
                      role="switch"
                      aria-checked={category.sidebar}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${category.sidebar ? 'translate-x-6' : 'translate-x-1'}`}>
                        {category.sidebar ? (
                          <Check className="h-3 w-3 text-blue-600 mx-auto mt-0.5" />
                        ) : (
                          <X className="h-3 w-3 text-gray-400 mx-auto mt-0.5" />
                        )}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(category)}
                        className="text-indigo-600 hover:text-indigo-900"
                        aria-label={`Edit ${category.name}`}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(category)}
                        className="text-red-600 hover:text-red-900"
                        aria-label={`Delete ${category.name}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      <CategoryModal
        isOpen={modalState.showAdd}
        onClose={closeModal}
        onSubmit={handleCreateSubmit}
        mode="add"
      />

      <CategoryModal
        isOpen={modalState.showEdit}
        onClose={closeModal}
        onSubmit={handleUpdateSubmit}
        category={modalState.selectedCategory}
        mode="edit"
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={modalState.showDelete}
        onClose={closeModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete ${modalState.selectedCategory?.name}? This will affect all products in this category.`}
      />
    </div>
  );
};

export default CategoryManagement; 