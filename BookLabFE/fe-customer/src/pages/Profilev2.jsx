import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { CameraIcon, TrashIcon } from "../icons";
import apiClient from "../services/ApiClient";
import fptLogo from '../assets/LogoFpt.svg';
import { swtoast } from "../utils/swal";
import { useSelector } from "react-redux";

// Extracted InputField component
const InputField = ({ label, value, onChange, error, placeholder, disabled, type = "text" }) => (
  <div className="relative">
    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`field-${label.replace(/\s+/g, '-').toLowerCase()}`}>
      {label}
    </label>
    <input
      id={`field-${label.replace(/\s+/g, '-').toLowerCase()}`}
      type={type}
      className={`block w-full px-4 py-3 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        disabled ? "bg-gray-100" : "bg-white"
      } ${error ? "border-red-300" : "border-gray-300"} transition duration-300`}
      placeholder={placeholder}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      aria-invalid={error ? "true" : "false"}
      aria-describedby={error ? `error-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined}
    />
    {error && (
      <p 
        id={`error-${label.replace(/\s+/g, '-').toLowerCase()}`} 
        className="absolute left-2 mt-1 text-sm text-red-600"
      >
        {error}
      </p>
    )}
  </div>
);

function Profile() {
  const { accountId } = useParams();
  const { accountDetail, gmail, userCode } = useSelector(state => state.profile);
  
  // Consolidated form state
  const [formData, setFormData] = useState({
    id: "",
    email: "",
    fullName: "",
    telphone: "",
    avatar: "",
    dob: ""
  });
  
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Consolidated error state
  const [errors, setErrors] = useState({
    fullName: "",
    telphone: "",
    dob: ""
  });
  
  // Populate form data from account details
  useEffect(() => {
    if (accountDetail) {
      setFormData({
        id: accountDetail.studentId || "",
        email: gmail || "",
        fullName: accountDetail.fullName || "",
        telphone: accountDetail.telphone || "",
        avatar: accountDetail.avatar || "",
        dob: accountDetail.dob ? accountDetail.dob.split('T')[0] : "" // Format date
      });
    }
  }, [accountDetail]);

  // Field change handlers with validation
  const handleFieldChange = useCallback((field, value, validator) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (validator) {
      const errorMessage = validator(value);
      setErrors(prev => ({
        ...prev,
        [field]: errorMessage
      }));
    }
  }, []);
  
  // Validators
  const validators = {
    fullName: (value) => !value ? "Full Name is required." : "",
    telphone: (value) => {
      if (!value) return "Telephone is required.";
      if (value.length !== 10) return "Please enter a valid 10-digit phone number.";
      return "";
    },
    dob: (value) => !value ? "Date of Birth is required." : ""
  };
  
  // Handle avatar change
  const handleChangeAvatar = useCallback(() => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        // Validate file size (max 5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
          swtoast.error({ text: "Image size should not exceed 5MB", position: "top-end" });
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData(prev => ({
            ...prev,
            avatar: event.target.result
          }));
        };
        reader.readAsDataURL(selectedFile);
        setFile(selectedFile);
      }
    };
    fileInput.click();
  }, []);
  
  // Handle form submission
  const handleSave = async (event) => {
    event.preventDefault();
    
    // Validate all fields first
    const newErrors = {
      fullName: validators.fullName(formData.fullName),
      telphone: validators.telphone(formData.telphone),
      dob: validators.dob(formData.dob)
    };
    
    setErrors(newErrors);
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error)) {
      return;
    }
    
    setIsSubmitting(true);
    
    const formDataToSend = new FormData();
    formDataToSend.append("id", accountId);
    formDataToSend.append("fullName", formData.fullName);
    formDataToSend.append("telphone", formData.telphone);
    formDataToSend.append("studentId", formData.id);
    formDataToSend.append("dob", formData.dob);
    formDataToSend.append("avatar", formData.avatar);
    
    if (file) {
      formDataToSend.append("file", file);
    }

    try {
      const response = await apiClient.put(
        `/AccountDetail(${accountId})`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      if (response.status === 200) {
        swtoast.success({ text: "Profile updated successfully", position: "top-end" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      swtoast.error({ 
        text: error.response?.data?.message || "Failed to update profile", 
        position: "top-end" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form has any errors
  const hasErrors = Object.values(errors).some(error => error);
  
  // Handle avatar removal
  const handleRemoveAvatar = useCallback(() => {
    setFormData(prev => ({ ...prev, avatar: "" }));
    setFile(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 py-12 px-4 -mt-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8">
          <h1 className="text-4xl font-bold text-white text-center">Account Settings</h1>
        </div>

        <div className="p-8">
          {/* Avatar section */}
          <div className="flex flex-col md:flex-row items-center mb-8 space-y-4 md:space-y-0 md:space-x-8">
            <div className="relative group">
              <img
                src={formData.avatar || fptLogo}
                alt="Avatar"
                className="rounded-full w-40 h-40 object-cover border-4 border-white shadow-lg transition duration-300 group-hover:opacity-75"
              />
              <button
                type="button"
                onClick={handleChangeAvatar}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition duration-300 rounded-full"
                aria-label="Change avatar"
              >
                <CameraIcon className="w-10 h-10" />
              </button>
            </div>
            <div className="flex flex-col space-y-4">
              <button
                type="button"
                onClick={handleChangeAvatar}
                className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Upload New Avatar
              </button>
              <button
                type="button"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-100 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                onClick={handleRemoveAvatar}
              >
                <TrashIcon className="w-5 h-5 inline-block mr-2" />
                Remove Avatar
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6">
            <div className="h-[85px]">
              <InputField
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => handleFieldChange("fullName", e.target.value, validators.fullName)}
                error={errors.fullName}
                placeholder="Enter your full name"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-[85px]">
                <InputField 
                  label="Email" 
                  value={formData.email} 
                  disabled 
                  placeholder="Email" 
                />
              </div>
              <div className="h-[85px]">
                <InputField
                  label="Telephone"
                  value={formData.telphone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                    handleFieldChange("telphone", value, validators.telphone);
                  }}
                  error={errors.telphone}
                  placeholder="Mobile number"
                />
              </div>
              <div className="h-[85px]">
                <InputField 
                  label="Account Name" 
                  value={userCode} 
                  disabled 
                  placeholder="Code" 
                />
              </div>
              <div className="h-[85px]">
                <InputField 
                  label="Date of Birth" 
                  type="date" 
                  value={formData.dob} 
                  onChange={(e) => handleFieldChange("dob", e.target.value, validators.dob)}
                  error={errors.dob} 
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-500 text-white px-8 py-3 rounded-md hover:bg-green-600 transition duration-300 transform hover:scale-105 
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={hasErrors || isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;