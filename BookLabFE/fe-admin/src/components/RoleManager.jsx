import React, { useState } from 'react';
import { useApi } from '../data/useApi';
import ReusableTable from './ReuseTable';
import ReusableForm from './ReusableForm';
import { 
  HiOutlinePlus, 
  HiOutlineRefresh, 
  HiOutlineUserGroup, 
  HiShieldCheck, 
  HiShieldExclamation,
  HiCheckCircle, 
  HiXCircle, 
  HiExclamationCircle, 
  HiInformationCircle, 
  HiX 
} from 'react-icons/hi';
import NotificationPopup from './common/NotificationPopup';
import { useNotification } from '../hooks/useNotification';

const RoleManager = () => {
  const { notification, showNotification, closeNotification } = useNotification();
  
  const { data, loading, error, createItem, updateItem, deleteItem } = useApi('/Role');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
  ];

  const formFields = [
    { name: 'id', label: 'ID' },
    { name: 'name', label: 'Name' },
    { name: 'status', label: 'Status' },
  ];

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    try {
      deleteItem(id);
      showNotification('success', 'Role deleted successfully', 'Delete Operation');
    } catch (error) {
      showNotification('error', error.message || 'An error occurred while deleting role', 'Delete Failed');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingItem && editingItem.id) {
        await updateItem(editingItem.id, formData);
        showNotification('success', 'Role updated successfully', 'Update Complete');
      } else {
        await createItem(formData);
        showNotification('success', 'New role created successfully', 'Creation Complete');
      }
      setEditingItem(null);
      setIsFormOpen(false);
    } catch (error) {
      showNotification('error', error.message || 'An error occurred while saving role data', 'Operation Failed');
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
          <p className="text-slate-600 font-medium">Loading role data...</p>
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
              <HiOutlineUserGroup className="mr-3 h-6 w-6 text-indigo-600" />
              Role Management
            </h2>
            <p className="text-slate-500 text-sm">
              Manage user roles and permissions in the system
            </p>
          </div>
          <div>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <HiOutlinePlus className="mr-2 h-5 w-5" />
              Add New Role
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Roles</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{data.length}</h3>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <HiOutlineUserGroup className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Roles</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {data.filter(role => role.status === true || role.status === "true" || role.status === 1).length}
              </h3>
            </div>
            <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <HiShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Inactive Roles</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {data.filter(role => role.status === false || role.status === "false" || role.status === 0).length}
              </h3>
            </div>
            <div className="h-12 w-12 bg-rose-100 rounded-lg flex items-center justify-center">
              <HiShieldExclamation className="h-6 w-6 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Role Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {data.map(role => (
            <div 
              key={role.id} 
              className="p-4 border border-slate-200 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors duration-200"
              onClick={() => {
                handleEdit(role);
                showNotification('info', `Editing ${role.name} role`, 'Edit Role');
              }}
            >
              <div className="flex items-start">
                <div className={`h-8 w-8 rounded-md flex items-center justify-center mr-3 ${role.status ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                  {role.name && role.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">{role.name}</h4>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${role.status ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${role.status ? 'bg-emerald-600' : 'bg-rose-600'} mr-1.5`}></span>
                    {role.status ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
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

export default RoleManager;