import api from './api';
import { getRepairRequestsByStatus } from '../services/repairService';

export const createRepairRequest = async (repairData) => {
  const response = await api.post('/repairs', repairData);
  return response.data;
};

export const getRepairRequest = async (repairId) => {
  const response = await api.get(`/repairs/${repairId}`);
  return response.data;
};

export const getUserRepairRequests = async (userId) => {
  const response = await api.get(`/repairs/user/${userId}`);
  return response.data;
};

export const getRepairRequestsByStatus = async (status, page = 0, size = 10) => {
  const params = { status, page, size };
  const response = await api.get('/repairs', { params });
  console.log('API Request Params:', params); // Debug the request params
  return response.data;
};

export const updateRepairRequest = async (repairId, updateData) => {
  const response = await api.put(`/repairs/${repairId}`, updateData);
  return response.data;
};

const testAPI = async () => {
  try {
    const data = await getRepairRequestsByStatus('PENDING', 0, 10);
    console.log('Test API Response:', data);
  } catch (error) {
    console.error('Test API Error:', error);
  }
};

testAPI();