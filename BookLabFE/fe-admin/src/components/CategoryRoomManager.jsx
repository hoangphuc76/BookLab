import React, { useState } from 'react';
import { useApi } from '../data/useApi';
import ReusableTable from './ReuseTable';
import ReusableForm from './ReusableForm';
import { 
  HiOutlinePlus, 
  HiOutlineRefresh, 
  HiOutlineTag, 
  HiOutlineTemplate,
  HiCheckCircle, 
  HiXCircle, 
  HiExclamationCircle, 
  HiInformationCircle, 
  HiX 
} from 'react-icons/hi';
import NotificationPopup from './common/NotificationPopup';
import { useNotification } from '../hooks/useNotification';

const CategoryRoomManager = () => {
  const { notification, showNotification, closeNotification } = useNotification();
  
  const { data, loading, error, createItem, updateItem, deleteItem } = useApi('/CategoryRoom');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
    { key: 'status', label: 'Status' },
  ];

  const formFields = [
    { name: 'id', label: 'ID' },
    { name: 'name', label: 'Name' },
    { name: 'code', label: 'Code' },
    { name: 'status', label: 'Status' },
  ];

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    try {
      deleteItem(id);
      showNotification('success', 'Category deleted successfully', 'Delete Operation');
    } catch (error) {
      showNotification('error', error.message || 'An error occurred while deleting category', 'Delete Failed');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingItem && editingItem.id) {
        await updateItem(editingItem.id, formData);
        showNotification(
          'success', 
          'Category updated successfully', 
          'Update Complete'
        );
      } else {
        await createItem(formData);
        showNotification(
          'success', 
          'New category created successfully', 
          'Creation Complete'
        );
      }
      setEditingItem(null);
      setIsFormOpen(false);
    } catch (error) {
      showNotification(
        'error', 
        error.message || 'An error occurred while saving category data', 
        'Operation Failed'
      );
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsFormOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
          <p className="text-slate-600 font-medium">Loading category data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 bg-rose-100 rounded-full mx-auto mb-4">
            <svg className="h-8 w-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Error Loading Data</h3>
          <p className="text-slate-600 text-center mb-6">{error}</p>
          <div className="flex justify-center">
            <button 
              onClick={() => {
                window.location.reload();
                showNotification('info', 'Refreshing data...', 'Reload Page');
              }}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <HiOutlineRefresh className="mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NotificationPopup
        type={notification.type}
        message={notification.message}
        title={notification.title}
        isOpen={notification.isOpen}
        onClose={closeNotification}
      />
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1 flex items-center">
              <HiOutlineTag className="mr-3 h-6 w-6 text-indigo-600" />
              Room Category Management
            </h2>
            <p className="text-slate-500 text-sm">
              Manage room categories and classification
            </p>
          </div>
          <div>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <HiOutlinePlus className="mr-2 h-5 w-5" />
              Add New Category
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Categories</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{data.length}</h3>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <HiOutlineTemplate className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Categories</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {data.filter(category => category.status === true || category.status === "true" || category.status === 1).length}
              </h3>
            </div>
            <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Inactive Categories</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {data.filter(category => category.status === false || category.status === "false" || category.status === 0).length}
              </h3>
            </div>
            <div className="h-12 w-12 bg-rose-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <ReusableTable
        data={data}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ReusableForm
        fields={formFields}
        initialValues={editingItem}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
      />
    </div>
  );
};

export default CategoryRoomManager;