// pages/RoomManager.js
import React, { useState } from 'react';
import { useApi } from '../data/useApi';
import ReusableTable from './ReuseTable';
import ReusableForm from './ReusableForm';

import RoomData from "../fileData/RoomData.xlsx";

const RoomManager = () => {
  const { data: roomData, loading: roomLoading, error: roomError, createItemWithFile, updateItemWithFile, deleteItem, uploadExcel } = useApi('/Room');
  const { data: managerData, loading: managerLoading, error: managerError } = useApi('/Account');
  const { data: categoryRoomData, loading: categoryRoomLoading, error: categoryRoomError } = useApi('/CategoryRoom');
  const { data: buildingData, loading: buildingLoading, error: buildingError } = useApi('/Building');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'roomNumber', label: 'Room Number' },
    { key: 'avatar', label: 'Avatar' },
    { key: 'rating', label: 'Rating' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'roomStatus', label: 'Status' },
    { key: 'managerId', label: 'Manager' },
    { key: 'categoryRoomId', label: 'Category' },
    { key: 'buildingId', label: 'Building' },
  ];

  const formFields = [
    { name: 'id', label: 'ID' },
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'roomNumber', label: 'Room Number', type: 'text' },
    { name: 'avatar', label: 'Avatar' },
    { name: 'rating', label: 'Rating', type: 'number', step: '0.01' },
    { name: 'capacity', label: 'Capacity', type: 'number' },
    { name: 'groupSize', label: 'Group Size', type: 'number' },
    { name: 'typeSlot', label: 'Type Slot', type: 'text' },
    { name: 'onlyGroupStatus', label: 'Only Group', type: 'checkbox' },
    { name: 'roomStatus', label: 'Room Status', type: 'number' },
    { name: 'manager', label: 'Manager' },
    { name: 'categoryRoom', label: 'Category' },
    { name: 'building', label: 'Building' },
  ];

  const handleEdit = (item) => {
    const managerName = managerData.find(m => m.id === item.managerId)?.gmail || '';
    const categoryName = categoryRoomData.find(c => c.id === item.categoryRoomId)?.name || '';
    const buildingName = buildingData.find(b => b.id === item.buildingId)?.name || '';

    setEditingItem({
      ...item,
      manager: managerName,
      categoryRoom: categoryName,
      building: buildingName,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    deleteItem(id);
  };

  const handleSubmit = async (formData, imageFile) => {
    const roomDataToSend = {
      name: formData.name,
      roomNumber: formData.roomNumber,
      avatar: formData.avatar,
      rating: formData.rating,
      capacity: parseInt(formData.capacity),
      groupSize: parseInt(formData.groupSize),
      typeSlot: formData.typeSlot,
      onlyGroupStatus: formData.onlyGroupStatus,
      roomStatus: parseInt(formData.roomStatus),
      managerId: getManagerIdFromName(formData.manager),
      categoryRoomId: getCategoryRoomIdFromName(formData.categoryRoom),
      buildingId: getBuildingIdFromName(formData.building),
    };

    if (editingItem && editingItem.id) {
      await updateItemWithFile(editingItem.id, roomDataToSend, imageFile);
    } else {
      await createItemWithFile(roomDataToSend, imageFile);
    }
    setIsFormOpen(false);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleGetDataFile = () => {
    const link = document.createElement("a");
          link.href = RoomData;
          link.download = "RoomData.xlsx";
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

  const getManagerIdFromName = (gmail) => {
    if (!managerData) return null;
    const manager = managerData.find(m => m.gmail === gmail);
    return manager ? manager.id : null;
  };

  const getCategoryRoomIdFromName = (name) => {
    if (!categoryRoomData) return null;
    const category = categoryRoomData.find(c => c.name === name);
    return category ? category.id : null;
  };

  const getBuildingIdFromName = (name) => {
    if (!buildingData) return null;
    const building = buildingData.find(b => b.name === name);
    return building ? building.id : null;
  };

  if (roomLoading || managerLoading || categoryRoomLoading || buildingLoading) return <div className="text-center py-10">Loading...</div>;
  if (roomError) return <div className="text-center py-10 text-red-500">Error: {roomError}</div>;
  if (managerError) return <div className="text-center py-10 text-red-500">Error: {managerError}</div>;
  if (categoryRoomError) return <div className="text-center py-10 text-red-500">Error: {categoryRoomError}</div>;
  if (buildingError) return <div className="text-center py-10 text-red-500">Error: {buildingError}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Room Management</h2>
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
        data={roomData}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        managerData={managerData}
        categoryRoomData={categoryRoomData}
        buildingData={buildingData}
      />
      <ReusableForm
        fields={formFields}
        initialValues={editingItem}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        managerData={managerData}
        categoryRoomData={categoryRoomData}
        buildingData={buildingData}
      />
    </div>
  );
};

export default RoomManager;