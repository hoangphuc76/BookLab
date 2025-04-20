import React, { useState } from 'react';
import { useApi } from '../data/useApi';
import ReusableTable from './ReuseTable';
import ReusableForm from './ReusableForm';
import AccountData from "../fileData/AccountData.xlsx";
import { 
  HiUserAdd, 
  HiOutlineDownload, 
  HiOutlineUpload, 
  HiOutlineRefresh,
  // Add notification icons
  HiCheckCircle, 
  HiXCircle, 
  HiExclamationCircle, 
  HiInformationCircle, 
  HiX 
} from 'react-icons/hi';
import NotificationPopup from './common/NotificationPopup';
import { useNotification } from '../hooks/useNotification';

const AccountManager = () => {
  // Add notification hook
  const { notification, showNotification, closeNotification } = useNotification();
  
  const { data: accountData, loading: accountLoading, error: accountError, createItemWithFile, updateAccount, deleteItem, uploadExcel } = useApi('/Account');
  const { data: roleData, loading: roleLoading, error: roleError } = useApi('/Role');
  const { data: campusData, loading: campusLoading, error: campusError } = useApi('/Campus');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'gmail', label: 'Gmail' },
    { key: 'role', label: 'Role' },
    { key: 'campus', label: 'Campus' },
    { key: 'status', label: 'Status' },
    { key: 'accountName', label: 'Name' },
    { key: 'avatar', label: 'Avatar' },
  ];

  const formFields = [
    { name: 'id', label: 'ID' },
    { name: 'gmail', label: 'Gmail', type: 'email' },
    { name: 'qrCode', label: 'QR Code' },
    { name: 'status', label: 'Status' },
    { name: 'role', label: 'Role' },
    { name: 'campus', label: 'Campus' },
    { name: 'fullName', label: 'Full Name' },
    { name: 'accountName', label: 'AccountName' },
    { name: 'telphone', label: 'Telephone', type: 'tel' },
    { name: 'studentId', label: 'Student ID' },
    { name: 'avatar', label: 'Avatar' },
    { name: 'dob', label: 'Date of Birth', type: 'date' },
  ];

  const handleEdit = (item) => {
    const roleName = roleData.find(r => r.id === item.roleId)?.name || '';
    const campusName = campusData.find(c => c.id === item.campusId)?.name || '';
    const accountDetail = item.accountDetail || {};

    setEditingItem({
      ...item,
      role: roleName,
      campus: campusName,
      fullName: accountDetail.fullName || '',
      telphone: accountDetail.telphone || '',
      studentId: accountDetail.studentId || '',
      avatar: accountDetail.avatar || '',
      dob: accountDetail.dob ? new Date(accountDetail.dob).toISOString().split('T')[0] : '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    try {
      deleteItem(id);
      showNotification('success', 'Account deleted successfully', 'Delete Operation');
    } catch (error) {
      showNotification('error', error.message || 'An error occurred during deletion', 'Delete Failed');
    }
  };

  const handleSubmit = async (formData, imageFile) => {
    try {
      const accountDataToSend = {
        gmail: formData.gmail,
        accountName: formData.accountName,
        qrCode: formData.qrCode,
        status: formData.status,
        roleId: getRoleIdFromName(formData.role),
        campusId: getCampusIdFromName(formData.campus),
      };
      const accountDetailDataToSend = {
        fullName: formData.fullName,
        telphone: formData.telphone,
        studentId: formData.studentId,
        avatar: formData.avatar,
        dob: formData.dob,
      };

      if (editingItem && editingItem.id) {
        await updateAccount(editingItem.id, { ...accountDataToSend, ...accountDetailDataToSend }, imageFile);
        showNotification(
          'success', 
          'Account updated successfully',
          'Update Complete'
        );
      } else {
        await createItemWithFile({ ...accountDataToSend, ...accountDetailDataToSend }, imageFile);
        showNotification(
          'success', 
          'New account created successfully',
          'Creation Complete'
        );
      }
      setIsFormOpen(false);
    } catch (error) {
      showNotification(
        'error', 
        error.message || 'An error occurred while saving account data', 
        'Operation Failed'
      );
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleGetDataFile = () => {
    try {
      const link = document.createElement("a");
      link.href = AccountData;
      link.download = "AccountData.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('info', 'Template download started', 'Download Template');
    } catch (error) {
      showNotification('error', 'Could not download template file', 'Download Failed');
    }
  };

  const handleImportFile = async (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      try {
        setIsUploading(true);
        await uploadExcel(file);
        setTimeout(() => {
          setIsUploading(false);
        }, 1000);
        showNotification('success', 'File uploaded and processed successfully', 'Upload Complete');
      } catch (err) {
        setIsUploading(false);
        showNotification('error', err.message || 'An error occurred during file upload', 'Upload Failed');
      }
    } else {
      showNotification('warning', 'Please select a valid Excel file (.xlsx format)', 'Invalid File');
    }
    event.target.value = null;
  };

  const getRoleIdFromName = (name) => {
    if (!roleData) return null;
    const role = roleData.find(r => r.name === name);
    return role ? role.id : null;
  };

  const getCampusIdFromName = (name) => {
    if (!campusData) return null;
    const campus = campusData.find(c => c.name === name);
    return campus ? campus.id : null;
  };
  
  // Remove the old showNotification function since we're using the hook
  
  if (accountLoading || roleLoading || campusLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
          <p className="text-slate-600 font-medium">Loading account data...</p>
        </div>
      </div>
    );
  }
  
  if (accountError || roleError || campusError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 bg-rose-100 rounded-full mx-auto mb-4">
            <svg className="h-8 w-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Error Loading Data</h3>
          <p className="text-slate-600 text-center mb-6">
            {accountError || roleError || campusError}
          </p>
          <div className="flex justify-center">
            <button 
              onClick={() => window.location.reload()}
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
      {/* Add notification popup */}
      <NotificationPopup
        type={notification.type}
        message={notification.message}
        title={notification.title}
        isOpen={notification.isOpen}
        onClose={closeNotification}
      />
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Account Management</h2>
            <p className="text-slate-500 text-sm">
              Manage all user accounts, permissions and access
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddNew}
              className="inline-flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <HiUserAdd className="mr-2 h-5 w-5" />
              Add New Account
            </button>
            
            <button
              onClick={handleGetDataFile}
              className="inline-flex items-center justify-center py-2.5 px-4 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
            >
              <HiOutlineDownload className="mr-2 h-5 w-5 text-slate-500" />
              Download Template
            </button>
            
            <label className={`inline-flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-medium ${isUploading ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 cursor-pointer'} transition-colors shadow-sm`}>
              {isUploading ? (
                <>
                  <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <HiOutlineUpload className="mr-2 h-5 w-5" />
                  Import Excel
                </>
              )}
              <input
                type="file"
                accept=".xlsx"
                onChange={handleImportFile}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Table Component */}
      <ReusableTable
        data={accountData}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        roleData={roleData}
        campusData={campusData}
        isAccountModel={true}
      />

      {/* Form Component */}
      <ReusableForm
        fields={formFields}
        initialValues={editingItem}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        roleData={roleData}
        campusData={campusData}
      />
    </div>
  );
};

export default AccountManager;