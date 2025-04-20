import React, { useState, useEffect } from 'react';
import { useApi } from '../data/useApi';
import ReusableTable from './ReuseTable';
import ReusableForm from './ReusableForm';
import RoomData from "../fileData/RoomData.xlsx";
import { HiOutlinePlus, HiOutlineDownload, HiOutlineUpload, HiOutlineRefresh, HiOutlineOfficeBuilding, HiOutlineHome, HiOutlineStatusOnline, HiOutlineBadgeCheck, HiExclamation } from 'react-icons/hi';
import { 
  HiCheckCircle, 
  HiXCircle, 
  HiExclamationCircle, 
  HiInformationCircle, 
  HiX 
} from 'react-icons/hi';
import NotificationPopup from './common/NotificationPopup';
import { useNotification } from '../hooks/useNotification';

const RoomManager = () => {
  const { notification, showNotification, closeNotification } = useNotification();
  
  const { 
    data: roomData, 
    loading: roomLoading, 
    error: roomError, 
    createItemWithFile, 
    updateItemWithFile, 
    deleteItem, 
    uploadExcel,
    refetch: refetchRooms 
  } = useApi('/Room');
  
  const { 
    data: managerData, 
    loading: managerLoading, 
    error: managerError,
    refetch: refetchManagers
  } = useApi('/Account');
  
  const { 
    data: categoryRoomData, 
    loading: categoryRoomLoading, 
    error: categoryRoomError,
    refetch: refetchCategories
  } = useApi('/CategoryRoom');
  
  const { 
    data: buildingData, 
    loading: buildingLoading, 
    error: buildingError,
    refetch: refetchBuildings
  } = useApi('/Building');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [errorPopup, setErrorPopup] = useState({ show: false, error: null, title: '' });

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const allDataLoaded = !roomLoading && !managerLoading && !categoryRoomLoading && !buildingLoading;
  const anyDataLoading = roomLoading || managerLoading || categoryRoomLoading || buildingLoading;
  
  useEffect(() => {
    if (allDataLoaded && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [allDataLoaded, initialLoadComplete]);

  const showErrorForDataSource = (error, title) => {
    showNotification('error', error, title);
  };

  const handleCloseError = () => {
    setErrorPopup({ show: false, error: null, title: '' });
  };

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
    let managerName = '';
    let categoryName = '';
    let buildingName = '';

    if (managerData && item.managerId) {
      managerName = managerData.find(m => m.id === item.managerId)?.gmail || '';
    }
    
    if (categoryRoomData && item.categoryRoomId) {
      categoryName = categoryRoomData.find(c => c.id === item.categoryRoomId)?.name || '';
    }
    
    if (buildingData && item.buildingId) {
      buildingName = buildingData.find(b => b.id === item.buildingId)?.name || '';
    }

    setEditingItem({
      ...item,
      manager: managerName,
      categoryRoom: categoryName,
      building: buildingName,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    try {
      deleteItem(id);
    } catch (error) {
      showErrorForDataSource(error, "Error Deleting Room");
    }
  };

  const handleSubmit = async (formData, imageFile) => {
    try {
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
      showNotification(
        'success', 
        editingItem ? 'Room updated successfully' : 'Room created successfully',
        'Room Operation Successful'
      );
    } catch (error) {
      showErrorForDataSource(error, editingItem ? "Error Updating Room" : "Error Creating Room");
    }
  };

  const handleAddNew = () => {
    if (!managerData || !categoryRoomData || !buildingData) {
      showNotification('warning', 'Some required data is missing. The form may not work correctly.');
    }
    
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
        setIsUploading(true);
        await uploadExcel(file);
        setTimeout(() => {
          setIsUploading(false);
          showNotification('success', 'File uploaded successfully!');
        }, 1000);
      } catch (err) {
        setIsUploading(false);
        showErrorForDataSource(err, "Error Uploading File");
      }
    } else {
      showNotification('warning', 'Please select a valid .xlsx file');
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

  // These functions are now provided by useNotification hook

  const getRoomStatusStats = () => {
    if (!roomData) return { available: 0, occupied: 0, maintenance: 0, total: 0 };
    
    const total = roomData.length;
    const available = roomData.filter(room => room.roomStatus === 1).length;
    const occupied = roomData.filter(room => room.roomStatus === 0).length;
    const maintenance = roomData.filter(room => room.roomStatus === 2).length;
    
    return { available, occupied, maintenance, total };
  };

  const getRoomsByBuilding = () => {
    if (!roomData || !buildingData) return [];
    
    return buildingData.map(building => ({
      buildingId: building.id,
      buildingName: building.name,
      count: roomData.filter(room => room.buildingId === building.id).length
    })).sort((a, b) => b.count - a.count).slice(0, 3);
  };

  const roomStats = getRoomStatusStats();
  const buildingStats = getRoomsByBuilding();

  if (!initialLoadComplete && anyDataLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
          <p className="text-slate-600 font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorPopup.show && (
        <ErrorPopup 
          error={errorPopup.error} 
          onClose={handleCloseError} 
          title={errorPopup.title} 
        />
      )}
      
      {notification.isOpen && (
        <NotificationPopup
          type={notification.type}
          message={notification.message}
          title={notification.title}
          isOpen={notification.isOpen}
          onClose={closeNotification}
        />
      )}
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1 flex items-center">
              <HiOutlineHome className="mr-3 h-6 w-6 text-indigo-600" />
              Room Management
            </h2>
            <p className="text-slate-500 text-sm">
              Manage all rooms, capacities, and availability
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddNew}
              className="inline-flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
              disabled={roomLoading}
            >
              <HiOutlinePlus className="mr-2 h-5 w-5" />
              Add New Room
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Rooms</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {roomLoading ? (
                  <div className="w-6 h-4 bg-slate-200 rounded animate-pulse"></div>
                ) : (
                  roomStats.total
                )}
              </h3>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <HiOutlineHome className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Available</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {roomLoading ? (
                  <div className="w-6 h-4 bg-slate-200 rounded animate-pulse"></div>
                ) : (
                  roomStats.available
                )}
              </h3>
            </div>
            <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <HiOutlineStatusOnline className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Occupied</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {roomLoading ? (
                  <div className="w-6 h-4 bg-slate-200 rounded animate-pulse"></div>
                ) : (
                  roomStats.occupied
                )}
              </h3>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Maintenance</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {roomLoading ? (
                  <div className="w-6 h-4 bg-slate-200 rounded animate-pulse"></div>
                ) : (
                  roomStats.maintenance
                )}
              </h3>
            </div>
            <div className="h-12 w-12 bg-rose-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {(!buildingLoading && buildingData && roomData) ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <HiOutlineOfficeBuilding className="mr-2 h-5 w-5 text-indigo-600" />
            Rooms by Building
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {buildingStats.map(building => (
              <div 
                key={building.buildingId} 
                className="p-4 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors duration-200"
              >
                <h4 className="font-semibold text-slate-800">{building.buildingName}</h4>
                <div className="flex items-center justify-between mt-2">
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${Math.min(100, (building.count / roomStats.total) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-slate-600 font-medium">{building.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        buildingError ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
            <div className="p-4 text-center">
              <p className="text-slate-500">
                Building distribution data is currently unavailable.
                <button 
                  onClick={() => refetchBuildings()}
                  className="text-indigo-600 ml-2 hover:underline"
                >
                  Retry
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center space-x-2 justify-center">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-slate-500">Loading building statistics...</span>
            </div>
          </div>
        )
      )}

      {roomLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center space-x-2 justify-center p-8">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-500">Loading room data...</span>
          </div>
        </div>
      ) : roomError ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 rounded-full text-rose-600 mb-4">
              <HiExclamation className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Error Loading Room Data</h3>
            <p className="text-slate-500 mb-4">
              We encountered an error while loading the room data.
            </p>
            <button 
              onClick={() => refetchRooms()}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <HiOutlineRefresh className="mr-2" />
              Retry Loading
            </button>
          </div>
        </div>
      ) : roomData && roomData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full text-indigo-600 mb-4">
              <HiOutlineHome className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Rooms Found</h3>
            <p className="text-slate-500 mb-4">
              There are no rooms available in the system. Add a new room to get started.
            </p>
            <button 
              onClick={handleAddNew}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <HiOutlinePlus className="mr-2" />
              Add New Room
            </button>
          </div>
        </div>
      ) : (
        <ReusableTable
          data={roomData}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          managerData={managerData}
          categoryRoomData={categoryRoomData}
          buildingData={buildingData}
        />
      )}

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