// pages/BuildingManager.js
import React, { useState, useEffect } from 'react';
import { useApi } from '../data/useApi';
import ReusableTable from './ReuseTable';
import ReusableForm from './ReusableForm';
import BuildingData from "../fileData/BuildingData.xlsx";

const BuildingManager = () => {
  const { data: buildingData, loading: buildingLoading, error: buildingError, createItemWithFile, updateItemWithFile, deleteItem, uploadExcel } = useApi('/Building');
  const { data: campusData, loading: campusLoading, error: campusError } = useApi('/Campus');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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
    deleteItem(id);
  };

  const handleSubmit = async (formData, imageFile) => {
    const dataToSend = {
      name: formData.name,
      status: formData.status,
      campusId: getCampusIdFromName(formData.campus),
      avatar: formData.avatar,
    };

    if (editingItem && editingItem.id) {
      await updateItemWithFile(editingItem.id, dataToSend, imageFile);
    } else {
      await createItemWithFile(dataToSend, imageFile);
    }
    setEditingItem(null);
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
        await uploadExcel(file);
        alert('File uploaded successfully!');
      } catch (err) {
        alert('Error uploading file: ' + err.message);
      }
    } else {
      alert('Please select a valid .xlsx file');
    }
    event.target.value = null;
  };

  const getCampusIdFromName = (name) => {
    if (!campusData) return null;
    const campus = campusData.find(c => c.name === name);
    return campus ? campus.id : null;
  };

  if (buildingLoading || campusLoading) return <div className="text-center py-10">Loading...</div>;
  if (buildingError) return <div className="text-center py-10 text-red-500">Error: {buildingError}</div>;
  if (campusError) return <div className="text-center py-10 text-red-500">Error: {campusError}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Building Management</h2>
      <div className="flex justify-end mb-6 space-x-4">
        <button
          onClick={handleAddNew}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Add New
        </button>
        <button
          onClick={handleGetDataFile}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
        >
          Get Data File
        </button>
        <label className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
          Import File
          <input
            type="file"
            accept=".xlsx"
            onChange={handleImportFile}
            className="hidden"
          />
        </label>
      </div>
      <ReusableTable
        data={buildingData}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        campusData={campusData}
      />
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