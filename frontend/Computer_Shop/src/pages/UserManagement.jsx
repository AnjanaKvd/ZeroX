import React, { useState, useEffect } from 'react';
import { 
  User, 
  UserCheck, 
  Users,
  Shield,
  ShieldCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Lock, 
  Unlock, 
  Mail, 
  Filter, 
  Search 
} from 'lucide-react';
import { toast } from 'react-toastify';
import userService from '../services/userService';
import 'react-toastify/dist/ReactToastify.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminsCount: 0,
    techniciansCount: 0
  });
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 1
  });
  const [filters, setFilters] = useState({
    query: '',
    role: '',
    status: ''
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingField, setEditingField] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    role: 'CUSTOMER',
    email: '',
    password: ''
  });

  // Fetch users and stats on component mount and when filters/pagination change
  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, [pagination.page, pagination.size, filters]);
  
  // Debounce filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 0 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.query, filters.role, filters.status]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Prepare query parameters
      const params = new URLSearchParams();
      if (filters.query) params.append('query', filters.query);
      if (filters.role) params.append('role', filters.role);
      if (filters.status !== 'all') params.append('active', filters.status === 'active');
      
      const data = await userService.getUsers(pagination.page, pagination.size, params.toString());
      
      if (!data) {
        throw new Error('No data received from server');
      }
      
      setUsers(Array.isArray(data.content) ? data.content : []);
      setPagination(prev => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch users';
      toast.error(errorMessage);
      setUsers([]);
      setPagination(prev => ({
        ...prev,
        totalElements: 0,
        totalPages: 0
      }));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const data = await userService.getUserStats();
      if (data) {
        setStats({
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          adminsCount: data.adminsCount || 0,
          techniciansCount: data.techniciansCount || 0
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Don't show error toast for stats as it's not critical
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        adminsCount: 0,
        techniciansCount: 0
      });
    }
  };

  const handleUpdateStatus = async (userId, currentStatus) => {
    try {
      await userService.updateUserStatus(userId, !currentStatus);
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
      fetchUserStats();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      await userService.updateUserRole(userId, role);
      toast.success('User role updated successfully');
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleUpdateEmail = async (userId, email) => {
    try {
      await userService.updateUserEmail(userId, email);
      toast.success('Email updated successfully');
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating email:', error);
      toast.error('Failed to update email');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await userService.deleteUser(selectedUser.userId);
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      fetchUsers();
      fetchUserStats();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const openEditModal = (user, field) => {
    setSelectedUser(user);
    setEditingField(field);
    setFormData({
      role: user.role,
      email: user.email,
      password: ''
    });
    setShowEditModal(true);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: Math.max(0, Math.min(newPage, prev.totalPages - 1))
    }));
  };

  const renderRoleBadge = (role) => {
    const roleStyles = {
      ADMIN: 'bg-purple-100 text-purple-800',
      TECHNICIAN: 'bg-yellow-100 text-yellow-800',
      CUSTOMER: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleStyles[role] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  // Render loading state
  if (loading && !users.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex space-x-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full flex items-center">
            <Users className="h-4 w-4 mr-1" /> {stats?.totalUsers || 0} Users
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center">
            <UserCheck className="h-4 w-4 mr-1" /> {stats?.activeUsers || 0} Active
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <UserCheck className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-semibold">{stats?.activeUsers || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Shield className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Admins</p>
              <p className="text-2xl font-semibold">{stats?.adminsCount || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Technicians</p>
              <p className="text-2xl font-semibold">{stats?.techniciansCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Filters</h3>
          <Filter className="h-5 w-5 text-gray-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Users
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.query}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by name or email..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="TECHNICIAN">Technician</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {user.role === 'ADMIN' ? (
                              <Shield className="h-5 w-5 text-purple-600" />
                            ) : user.role === 'TECHNICIAN' ? (
                              <ShieldCheck className="h-5 w-5 text-yellow-600" />
                            ) : (
                              <User className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                          <div className="text-xs text-gray-500">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {renderRoleBadge(user.role)}
                        {user.loyaltyPoints > 0 && (
                          <span className="text-xs text-gray-500">
                            {user.loyaltyPoints} pts
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(user, 'role')}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit role"
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(user, 'email')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit email"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(user.userId, user.isActive)}
                          className={user.isActive 
                            ? "text-yellow-600 hover:text-yellow-900" 
                            : "text-green-600 hover:text-green-900"}
                          title={user.isActive ? "Deactivate user" : "Activate user"}
                        >
                          {user.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages - 1}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{users.length > 0 ? pagination.page * pagination.size + 1 : 0}</span> to{' '}
                  <span className="font-medium">
                    {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.totalElements}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(0)}
                    disabled={pagination.page === 0}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">First</span>
                    <ChevronsLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 0}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {pagination.page + 1} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages - 1}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.totalPages - 1)}
                    disabled={pagination.page >= pagination.totalPages - 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Last</span>
                    <ChevronsRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    {editingField === 'role' ? (
                      <Shield className="h-6 w-6 text-blue-600" />
                    ) : (
                      <Mail className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingField === 'role' ? 'Update User Role' : 'Update Email'}
                    </h3>
                    <div className="mt-4">
                      {editingField === 'role' ? (
                        <div>
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Select Role
                          </label>
                          <select
                            id="role"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="CUSTOMER">Customer</option>
                            <option value="TECHNICIAN">Technician</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            New Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Enter new email"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    if (editingField === 'role') {
                      handleUpdateRole(selectedUser.userId, formData.role);
                    } else {
                      handleUpdateEmail(selectedUser.userId, formData.email);
                    }
                  }}
                >
                  Update
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete User</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete {selectedUser.fullName}? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteUser}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 