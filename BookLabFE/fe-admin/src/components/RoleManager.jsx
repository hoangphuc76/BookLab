import React, { useState } from 'react';
import { useApi } from '../data/useApi';
import ReusableTable from './ReuseTable';
import ReusableForm from './ReusableForm';

const RoleManager = () => {
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
    deleteItem(id);
  };

  const handleSubmit = async (formData) => {
    if (editingItem && editingItem.id) {
      await updateItem(editingItem.id, formData);
    } else {
      await createItem(formData);
    }
    setEditingItem(null);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };
console.log(data);
  const handleCancel = () => {
    setEditingItem(null);
    setIsFormOpen(false);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <section className="bg-white p-6 rounded-lg shadow-md">
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Role Management</h2>
      <div className="flex justify-end mb-6 space-x-4">
  <button
    onClick={handleAddNew}
    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
  >
    Add New
  </button>
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
    </section>
  );
};

export default RoleManager;