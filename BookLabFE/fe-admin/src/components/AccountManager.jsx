// pages/AccountManager.js
import React, { useState } from 'react';
import { useApi } from '../data/useApi';
import ReusableTable from './ReuseTable';
import ReusableForm from './ReusableForm';
import AccountData from "../fileData/AccountData.xlsx";

const AccountManager = () => {
  const { data: accountData, loading: accountLoading, error: accountError, createItemWithFile, updateAccount, deleteItem, uploadExcel } = useApi('/Account');
  const { data: roleData, loading: roleLoading, error: roleError } = useApi('/Role');
  const { data: campusData, loading: campusLoading, error: campusError } = useApi('/Campus');
  const [isFormOpen, setIsFormOpen] = useState(false); // State để mở/đóng form
  const [editingItem, setEditingItem] = useState(null);

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
    deleteItem(id);
  };

  const handleSubmit = async (formData, imageFile) => {
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
    } else {
      await createItemWithFile({ ...accountDataToSend, ...accountDetailDataToSend }, imageFile);
    }
    setIsFormOpen(false); // Đóng form sau khi submit
  };

  const handleCancel = () => {
    setIsFormOpen(false); // Đóng form khi cancel
    setEditingItem(null);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleGetDataFile = () => {
    const link = document.createElement("a");
      link.href = AccountData;
      link.download = "AccountData.xlsx";
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

  if (accountLoading || roleLoading || campusLoading) return <div className="text-center py-10">Loading...</div>;
  if (accountError) return <div className="text-center py-10 text-red-500">Error: {accountError}</div>;
  if (roleError) return <div className="text-center py-10 text-red-500">Error: {roleError}</div>;
  if (campusError) return <div className="text-center py-10 text-red-500">Error: {campusError}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Account Management</h2>
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
        data={accountData}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        roleData={roleData}
        campusData={campusData}
        isAccountModel={true}
      />
      <ReusableForm
        fields={formFields}
        initialValues={editingItem}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen} // Truyền setIsFormOpen vào setIsOpen
        roleData={roleData}
        campusData={campusData}
      />
    </div>
  );
};

export default AccountManager;