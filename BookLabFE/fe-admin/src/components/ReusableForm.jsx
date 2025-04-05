import React, { useState, useEffect } from 'react';

const ReusableForm = ({ fields, initialValues, onSubmit, onCancel, isOpen, setIsOpen, campusData, roleData, categoryRoomData, buildingData }) => {
  const [formData, setFormData] = useState(initialValues || {});
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    setFormData(initialValues || {});
    setImageFile(null);
  }, [initialValues]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleStatus = (fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: !formData[fieldName],
    });
  };

  const handleImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, [fieldName]: imageUrl });
      setImageFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, imageFile);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
    onCancel();
  };

  if (!isOpen) return null;

  const isGuidOrId = (name) => {
    return name.toLowerCase() === 'id' || name.toLowerCase() === 'guid' || name.includes('Id');
  };

  const getCampusIdFromName = (name) => {
    if (!campusData) return null;
    const campus = campusData.find(c => c.name === name);
    return campus ? campus.id : null;
  };

  const getRoleIdFromName = (name) => {
    if (!roleData) return null;
    const role = roleData.find(r => r.name === name);
    return role ? role.id : null;
  };

  const getCategoryRoomName = (categoryRoomId) => {
    if (!categoryRoomData || !categoryRoomId) return 'N/A';
    const category = categoryRoomData.find(c => c.id === categoryRoomId);
    return category ? category.name : 'N/A';
  };

  const getBuildingName = (buildingId) => {
    if (!buildingData || !buildingId) return 'N/A';
    const building = buildingData.find(b => b.id === buildingId);
    return building ? building.name : 'N/A';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-5xl p-10 mx-4 max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(145deg, #f9fafb 0%, #e5e7eb 100%)',
        }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <svg
            className="w-7 h-7 mr-3 text-indigo-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          {initialValues && initialValues.id ? 'Edit Room' : 'Add New Room'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields
            .filter(field => !isGuidOrId(field.name) && field.name.toLowerCase() !== 'rating')
            .map(field => (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 capitalize">
                  {field.label}
                </label>
                {field.label === 'Status' ? (
                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${
                        formData[field.name] === true || formData[field.name] === 'true'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {(formData[field.name] === true || formData[field.name] === 'true') ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleStatus(field.name)}
                      className="inline-flex justify-center py-1.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                    >
                      Toggle
                    </button>
                  </div>
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-center space-x-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name={field.name}
                        checked={formData[field.name] || false}
                        onChange={() => toggleStatus(field.name)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-300 transition-all duration-300 ease-in-out peer-checked:bg-indigo-600">
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-300 ease-in-out ${
                            formData[field.name] ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        ></div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        {formData[field.name] ? 'Yes' : 'No'}
                      </span>
                    </label>
                  </div>
                ) : field.name.toLowerCase().includes('avatar') ? (
                  <div className="space-y-3">
                    {formData[field.name] && (
                      <img
                        src={formData[field.name]}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, field.name)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ease-in-out"
                    />
                  </div>
                ) : field.name.toLowerCase().includes('campus') ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => {
                      const campusId = getCampusIdFromName(e.target.value);
                      setFormData({ ...formData, [field.name]: e.target.value, campusId: campusId });
                    }}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm py-3 px-4 bg-white hover:bg-gray-50 transition duration-200 ease-in-out"
                  >
                    <option value="">Select Campus</option>
                    {campusData &&
                      campusData.map(campus => (
                        <option key={campus.id} value={campus.name}>
                          {campus.name}
                        </option>
                      ))}
                  </select>
                ) : field.name.toLowerCase().includes('role') ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => {
                      const roleId = getRoleIdFromName(e.target.value);
                      setFormData({ ...formData, [field.name]: e.target.value, roleId: roleId });
                    }}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm py-3 px-4 bg-white hover:bg-gray-50 transition duration-200 ease-in-out"
                  >
                    <option value="">Select Role</option>
                    {roleData &&
                      roleData.map(role => (
                        <option key={role.id} value={role.name}>
                          {role.name}
                        </option>
                      ))}
                  </select>
                ) : field.name.toLowerCase().includes('building') ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => {
                      const buildingId = getBuildingName(e.target.value);
                      setFormData({ ...formData, [field.name]: e.target.value, buildingId: buildingId });
                    }}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm py-3 px-4 bg-white hover:bg-gray-50 transition duration-200 ease-in-out"
                  >
                    <option value="">Select Building</option>
                    {buildingData &&
                      buildingData.map(building => (
                        <option key={building.id} value={building.name}>
                          {building.name}
                        </option>
                      ))}
                  </select>
                ) : field.name.toLowerCase().includes('category') ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => {
                      const categoryRoom = getCategoryRoomName(e.target.value);
                      setFormData({ ...formData, [field.name]: e.target.value, categoryRoomId: categoryRoom });
                    }}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm py-3 px-4 bg-white hover:bg-gray-50 transition duration-200 ease-in-out"
                  >
                    <option value="">Select Category</option>
                    {categoryRoomData &&
                      categoryRoomData.map(category => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                ) : field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm py-3 px-4 bg-white hover:bg-gray-50 transition duration-200 ease-in-out"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm py-3 px-4 bg-white hover:bg-gray-50 transition duration-200 ease-in-out"
                  />
                )}
              </div>
            ))}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end space-x-6 mt-10">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center justify-center py-3 px-6 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 ease-in-out transform hover:scale-105"
            >
              <svg
                className="w-5 h-5 mr-2 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:scale-105"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReusableForm;