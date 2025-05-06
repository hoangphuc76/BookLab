// hooks/useApi.js
import { useState, useEffect } from 'react';
import ApiClient from '../services/ApiClient';

export const useApi = (endpoint) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await ApiClient.get(endpoint);
      setData(response.data);
      console.log(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (item) => {
    try {
      setLoading(true);
      await ApiClient.post(endpoint, item);
      await fetchData();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createItemWithFile = async (item, file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      // Thêm các trường của item vào FormData
      for (const key in item) {
        if (item[key] !== undefined && item[key] !== null) {
          formData.append(key, item[key]);
        }
      }
      // Thêm file nếu có
      if (file) {
        formData.append('file', file);
      }
      const response = await ApiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      await fetchData();
      return response.data; // Trả về response để xử lý thêm nếu cần
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id, item) => {
    try {
      setLoading(true);
      await ApiClient.put(`${endpoint}(${id})`, item);
      await fetchData();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateItemWithFile = async (id, item, file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      // Thêm các trường của item vào FormData
      for (const key in item) {
        if (item[key] !== undefined && item[key] !== null) {
          formData.append(key, item[key]);
        }
      }
      // Thêm file nếu có
      if (file) {
        formData.append('file', file);
      }
      const response = await ApiClient.put(`${endpoint}(${id})`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      await fetchData();
      return response.data; // Trả về response để xử lý thêm nếu cần
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const updateAccount = async (id, itemData, file) => {
    try {
      setLoading(true);
      const accountData = {
        gmail: itemData.gmail,
        qrCode: itemData.qrCode,
        accountName: itemData.accountName,
        status: itemData.status,
        roleId: itemData.roleId,
        campusId: itemData.campusId,
      };
      const accountDetailData = {
        fullName: itemData.fullName,
        telphone: itemData.telphone,
        studentId: itemData.studentId,
        avatar: itemData.avatar,
        dob: itemData.dob,
      };
      // Update Account
      await ApiClient.put(`${endpoint}(${id})`, accountData, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Update AccountDetail with file
      const formData = new FormData();
      Object.keys(accountDetailData).forEach(key => {
        formData.append(key, accountDetailData[key] || '');
      });
      if (file) formData.append('file', file);
      await ApiClient.put(`/AccountDetail(${id})`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const response = await ApiClient.get(endpoint);
      setData(response.data);
      console.log(response.data);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    try {
      setLoading(true);
      await ApiClient.delete(`${endpoint}(${id})`);
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadExcel = async (file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      await ApiClient.post(`${endpoint}(upload-excel)`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      await fetchData();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, loading, error, fetchData, createItem, createItemWithFile, updateItem, updateItemWithFile, deleteItem, uploadExcel,updateAccount };
};