import React, { useState, useEffect } from 'react';
import { HiX, HiCheck, HiPencil, HiPlus, HiOutlinePhotograph } from 'react-icons/hi';

const ReusableForm = ({ fields, initialValues, onSubmit, onCancel, isOpen, setIsOpen, campusData, roleData, categoryRoomData, buildingData }) => {
  const [formData, setFormData] = useState(initialValues || {});
  const [imageFile, setImageFile] = useState(null);
  const [activeTab, setActiveTab] = useState('general'); // Thêm state cho tabs nếu có nhiều fields

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
    
    // Create a copy of the form data to modify
    let finalFormData = { ...formData };
    
    // Check if it's an "Add New Account" form
    const isAddForm = !initialValues?.id;
    const isAccountForm = fields.some(f => f.name === 'gmail');
    
    if (isAddForm && isAccountForm) {
      // Auto-fill telephone field if empty
      const phoneField = fields.find(f => 
        f.name.toLowerCase().includes('phone') || 
        f.name.toLowerCase() === 'telphone' || 
        f.name.toLowerCase() === 'telephone'
      );
      
      if (phoneField && (!finalFormData[phoneField.name] || String(finalFormData[phoneField.name]).trim() === '')) {
        finalFormData[phoneField.name] = '123456789';
      }
      
      // Auto-fill DOB field with current date
      const dobField = fields.find(f => 
        f.name.toLowerCase() === 'dob' || 
        f.name.toLowerCase() === 'dateofbirth' || 
        f.name.toLowerCase() === 'birthdate'
      );
      
      if (dobField) {
        finalFormData[dobField.name] = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      }
    }
    
    onSubmit(finalFormData, imageFile);
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

  // Nhóm các trường theo loại để tạo layout có tổ chức hơn
  const generalFields = fields.filter(field => 
    !isGuidOrId(field.name) && 
    field.name.toLowerCase() !== 'rating' &&
    !field.name.toLowerCase().includes('avatar') &&
    !field.name.toLowerCase().includes('image') &&
    !field.name.toLowerCase().includes('photo')
  );

  const mediaFields = fields.filter(field => 
    !isGuidOrId(field.name) && 
    (field.name.toLowerCase().includes('avatar') || 
     field.name.toLowerCase().includes('image') ||
     field.name.toLowerCase().includes('photo'))
  );

  // Xác định tiêu đề form dựa trên loại dữ liệu
  const getFormTitle = () => {
    if (initialValues && initialValues.id) {
      if (fields.some(f => f.name === 'roomNo')) return 'Edit Room';
      if (fields.some(f => f.name === 'email')) return 'Edit User';
      if (fields.some(f => f.name === 'buildingName')) return 'Edit Building';
      if (fields.some(f => f.name === 'categoryName')) return 'Edit Category';
      return 'Edit Item';
    } else {
      if (fields.some(f => f.name === 'roomNo')) return 'Add New Room';
      if (fields.some(f => f.name === 'email')) return 'Add New User';
      if (fields.some(f => f.name === 'buildingName')) return 'Add New Building';
      if (fields.some(f => f.name === 'categoryName')) return 'Add New Category';
      return 'Add New Item';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm overflow-y-auto p-4 md:p-0">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-5xl mx-4 my-8 md:my-10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Form Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
              {initialValues && initialValues.id ? (
                <HiPencil className="h-6 w-6 mr-3 text-indigo-600" />
              ) : (
                <HiPlus className="h-6 w-6 mr-3 text-indigo-600" />
              )}
              {getFormTitle()}
            </h2>
            <button 
              onClick={handleCancel}
              className="p-2 rounded-full hover:bg-slate-200 transition-colors"
              aria-label="Close"
            >
              <HiX className="h-5 w-5 text-slate-500" />
            </button>
          </div>
          
          {mediaFields.length > 0 && generalFields.length > 0 && (
            <div className="mt-5 border-b border-slate-200 -mb-6">
              <div className="flex space-x-6">
                <button 
                  className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'general' 
                      ? 'border-indigo-600 text-indigo-700' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                  onClick={() => setActiveTab('general')}
                >
                  General Information
                </button>
                <button 
                  className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'media' 
                      ? 'border-indigo-600 text-indigo-700' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                  onClick={() => setActiveTab('media')}
                >
                  Media & Images
                </button>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {(activeTab === 'general' || mediaFields.length === 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generalFields.map(field => (
                <div key={field.name} className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    {field.label}
                  </label>
                  {field.label === 'Status' ? (
                    <div className="flex items-center space-x-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          formData[field.name] === true || formData[field.name] === 'true'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${formData[field.name] === true || formData[field.name] === 'true' ? 'bg-emerald-600' : 'bg-rose-600'} mr-1.5`}></span>
                        {(formData[field.name] === true || formData[field.name] === 'true') ? 'Active' : 'Inactive'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name={field.name}
                          checked={formData[field.name] || false}
                          onChange={() => toggleStatus(field.name)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
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
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        <span className="ml-3 text-sm font-medium text-slate-700">
                          {formData[field.name] ? 'Yes' : 'No'}
                        </span>
                      </label>
                    </div>
                  ) : field.name.toLowerCase().includes('campus') ? (
                    <div className="relative">
                      <select
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => {
                          const campusId = getCampusIdFromName(e.target.value);
                          setFormData({ ...formData, [field.name]: e.target.value, campusId: campusId });
                        }}
                        className="block w-full rounded-xl border border-slate-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 text-sm py-2.5 px-4 bg-white appearance-none"
                      >
                        <option value="">Select Campus</option>
                        {campusData &&
                          campusData.map(campus => (
                            <option key={campus.id} value={campus.name}>
                              {campus.name}
                            </option>
                          ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  ) : field.name.toLowerCase().includes('role') ? (
                    <div className="relative">
                      <select
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => {
                          const roleId = getRoleIdFromName(e.target.value);
                          setFormData({ ...formData, [field.name]: e.target.value, roleId: roleId });
                        }}
                        className="block w-full rounded-xl border border-slate-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 text-sm py-2.5 px-4 bg-white appearance-none"
                      >
                        <option value="">Select Role</option>
                        {roleData &&
                          roleData.map(role => (
                            <option key={role.id} value={role.name}>
                              {role.name}
                            </option>
                          ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  ) : field.name.toLowerCase().includes('building') ? (
                    <div className="relative">
                      <select
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => {
                          // Chú ý: Có vẻ như lỗi logic ở đây, cần sửa lại hàm getBuildingName
                          const buildingId = getBuildingName(e.target.value);
                          setFormData({ ...formData, [field.name]: e.target.value, buildingId: buildingId });
                        }}
                        className="block w-full rounded-xl border border-slate-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 text-sm py-2.5 px-4 bg-white appearance-none"
                      >
                        <option value="">Select Building</option>
                        {buildingData &&
                          buildingData.map(building => (
                            <option key={building.id} value={building.name}>
                              {building.name}
                            </option>
                          ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  ) : field.name.toLowerCase().includes('category') ? (
                    <div className="relative">
                      <select
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => {
                          // Chú ý: Có vẻ như lỗi logic ở đây, cần sửa lại hàm getCategoryRoomName
                          const categoryRoom = getCategoryRoomName(e.target.value);
                          setFormData({ ...formData, [field.name]: e.target.value, categoryRoomId: categoryRoom });
                        }}
                        className="block w-full rounded-xl border border-slate-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 text-sm py-2.5 px-4 bg-white appearance-none"
                      >
                        <option value="">Select Category</option>
                        {categoryRoomData &&
                          categoryRoomData.map(category => (
                            <option key={category.id} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  ) : field.type === 'select' ? (
                    <div className="relative">
                      <select
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                        className="block w-full rounded-xl border border-slate-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 text-sm py-2.5 px-4 bg-white appearance-none"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      rows="3"
                      className="block w-full rounded-xl border border-slate-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 text-sm py-2.5 px-4 bg-white resize-none"
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-slate-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 text-sm py-2.5 px-4 bg-white"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'media' && mediaFields.length > 0 && (
            <div className="space-y-6">
              {mediaFields.map(field => (
                <div key={field.name} className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700">
                    {field.label}
                  </label>
                  <div className="flex flex-col items-center sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                    {formData[field.name] ? (
                      <div className="relative group">
                        <img
                          src={formData[field.name]}
                          alt={field.label || "Preview"}
                          className="h-36 w-36 object-cover rounded-xl border-2 border-slate-200 shadow-sm group-hover:border-indigo-300 transition-all"
                        />
                        <div className="absolute inset-0 bg-slate-800 bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all rounded-xl">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, [field.name]: null })}
                            className="bg-white text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <HiX className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-36 w-36 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                        <HiOutlinePhotograph className="h-12 w-12 text-slate-300" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          id={`upload-${field.name}`}
                          onChange={(e) => handleImageUpload(e, field.name)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col space-y-2">
                          <label 
                            htmlFor={`upload-${field.name}`}
                            className="py-2.5 px-4 border border-slate-300 rounded-xl flex items-center justify-center text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                          >
                            <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                            </svg>
                            Choose file
                          </label>
                          <p className="text-xs text-slate-500">
                            PNG, JPG or GIF up to 2MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Form Footer */}
          <div className="pt-6 mt-6 border-t border-slate-200 flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm inline-flex items-center"
            >
              <HiCheck className="h-4 w-4 mr-2" />
              {initialValues && initialValues.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReusableForm;