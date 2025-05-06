import React, { useState, useEffect } from 'react';
import { useApi } from '../data/useApi';
import ReusableTable from './ReuseTable';
import ReusableForm from './ReusableForm';
import BuildingData from "../fileData/BuildingData.xlsx";
import { HiOutlinePlus, HiOutlineDownload, HiOutlineUpload, HiOutlineRefresh, HiOutlineOfficeBuilding } from 'react-icons/hi';
import { 
  HiCheckCircle, 
  HiXCircle, 
  HiExclamationCircle, 
  HiInformationCircle, 
  HiX 
} from 'react-icons/hi';
import NotificationPopup from './common/NotificationPopup';
import { useNotification } from '../hooks/useNotification';

const BuildingManager = () => {
  // Add notification hook
  const { notification, showNotification, closeNotification } = useNotification();
  
  const { data: buildingData, loading: buildingLoading, error: buildingError, createItemWithFile, updateItemWithFile, deleteItem, uploadExcel } = useApi('/Building');
  const { data: campusData, loading: campusLoading, error: campusError } = useApi('/Campus');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'avatar', label: 'Avatar' },
    { key: 'status', label: 'Status' },
    { key: 'campus', label: 'Campus' },
  ];

  const formFields = [
    { name: 'id', label: 'ID' },
    { name: 'name', label: 'Name' },
    { name: 'avatar', label: 'Avatar' },
    { name: 'status', label: 'Status' },
    { name: 'campus', label: 'Campus' },
  ];

  const handleEdit = (item) => {
    // Ánh xạ CampusId thành Campus.Name cho initialValues
    const campusName = campusData.find(c => c.id === item.campusId)?.name || '';
    setEditingItem({
      ...item,
      campus: campusName, // Thêm campus vào initialValues
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    try {
      deleteItem(id);
      showNotification('success', 'Building deleted successfully', 'Delete Operation');
    } catch (error) {
      showNotification('error', error.message || 'An error occurred while deleting', 'Delete Failed');
    }
  };

  const handleSubmit = async (formData, imageFile) => {
    try {
      const dataToSend = {
        name: formData.name,
        status: formData.status,
        campusId: getCampusIdFromName(formData.campus),
        avatar: formData.avatar,
      };

      if (editingItem && editingItem.id) {
        await updateItemWithFile(editingItem.id, dataToSend, imageFile);
        showNotification('success', 'Building updated successfully', 'Update Complete');
      } else {
        await createItemWithFile(dataToSend, imageFile);
        showNotification('success', 'Building created successfully', 'Creation Complete');
      }
      setEditingItem(null);
      setIsFormOpen(false);
    } catch (error) {
      showNotification('error', error.message || 'Failed to save building data', 'Operation Failed');
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

  const handleGetDataFile = () => {
    const link = document.createElement("a");
    link.href = BuildingData;
    link.download = "BuildingData.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFile = async (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      try {
        setIsUploading(true);
        await uploadExcel(file);
        setTimeout(() => {
          setIsUploading(false);
          showNotification('success', 'File uploaded and processed successfully', 'Upload Complete');
        }, 1000);
      } catch (err) {
        setIsUploading(false);
        showNotification('error', err.message || 'Failed to process the uploaded file', 'Upload Failed');
      }
    } else {
      showNotification('warning', 'Please select a valid Excel file (.xlsx format)', 'Invalid File');
    }
    event.target.value = null;
  };

  const getCampusIdFromName = (name) => {
    if (!campusData) return null;
    const campus = campusData.find(c => c.name === name);
    return campus ? campus.id : null;
  };

  if (buildingLoading || campusLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
          <p className="text-slate-600 font-medium">Loading building data...</p>
        </div>
      </div>
    );
  }
  
  if (buildingError || campusError) {
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
            {buildingError || campusError}
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

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1 flex items-center">
              <HiOutlineOfficeBuilding className="mr-3 h-6 w-6 text-indigo-600" />
              Building Management
            </h2>
            <p className="text-slate-500 text-sm">
              Manage all buildings and their information
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddNew}
              className="inline-flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <HiOutlinePlus className="mr-2 h-5 w-5" />
              Add New Building
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
        data={buildingData}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        campusData={campusData}
      />

      {/* Form Component */}
      <ReusableForm
        fields={formFields}
        initialValues={editingItem}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        campusData={campusData}
      />
    </div>
  );
};

export default BuildingManager;