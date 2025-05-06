import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { 
  FaCamera, 
  FaTrash, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaIdCard, 
  FaBirthdayCake,
  FaCheckCircle,
  FaArrowLeft
} from "react-icons/fa";
import apiClient from "../services/ApiClient";
import fptLogo from '../assets/LogoFpt.svg';
import { swtoast } from "../utils/swal";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

// Extracted InputField component
const InputField = ({ label, value, onChange, error, placeholder, disabled, type = "text", icon }) => (
  <div className="relative">
    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center" 
      htmlFor={`field-${label.replace(/\s+/g, '-').toLowerCase()}`}>
      {icon && <span className="mr-2 text-indigo-600">{icon}</span>}
      {label}
    </label>
    <div className="relative">
      <input
        id={`field-${label.replace(/\s+/g, '-').toLowerCase()}`}
        type={type}
        className={`block w-full px-4 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
          disabled ? "bg-slate-50" : "bg-white"
        } ${error ? "border-rose-300" : "border-slate-300"} transition duration-300`}
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `error-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined}
      />
      {disabled && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="text-slate-400 text-xs italic">Cannot edit</span>
        </div>
      )}
    </div>
    {error && (
      <p 
        id={`error-${label.replace(/\s+/g, '-').toLowerCase()}`} 
        className="mt-1 text-sm text-rose-600 flex items-center"
      >
        <span className="mr-1">⚠</span> {error}
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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
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
    fullName: (value) => !value ? "Full name cannot be empty" : "",
    telphone: (value) => {
      if (!value) return "Phone number cannot be empty";
      if (value.length !== 10) return "Please enter a 10-digit phone number";
      return "";
    },
    dob: (value) => !value ? "Date of birth cannot be empty" : ""
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
          swtoast.error({ text: "Image size cannot exceed 5MB", position: "top-end" });
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
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 5000);
        swtoast.success({ text: "Information updated successfully", position: "top-end" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      swtoast.error({ 
        text: error.response?.data?.message || "Failed to update information", 
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
    <div className="min-h-screen bg-indigo-50/50 py-12 px-4 -mt-8 sm:px-6 lg:px-8">
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-indigo-100 hover:shadow-md transition-all">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8">
            <h1 className="text-3xl font-bold text-white text-center flex items-center justify-center">
              <FaUser className="mr-3" />
              Account Settings
            </h1>
          </div>

          <div className="p-8">
            {/* Success message */}
            {showSuccessMessage && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center">
                <FaCheckCircle className="h-5 w-5 mr-2" />
                <p>Your information has been updated successfully!</p>
              </div>
            )}

            {/* Avatar section */}
            <div className="flex flex-col md:flex-row items-center mb-8 space-y-4 md:space-y-0 md:space-x-8">
              <div className="relative group">
                <div className="rounded-full w-40 h-40 overflow-hidden border-4 border-white shadow-md">
                  <img
                    src={formData.avatar || fptLogo}
                    alt="Avatar"
                    className="w-full h-full object-cover transition duration-300 group-hover:opacity-75"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleChangeAvatar}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition duration-300 rounded-full"
                  aria-label="Change avatar"
                >
                  <FaCamera className="w-10 h-10" />
                </button>
              </div>
              <div className="flex flex-col space-y-4">
                <button
                  type="button"
                  onClick={handleChangeAvatar}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-xl hover:shadow-md transition duration-300 flex items-center justify-center"
                >
                  <FaCamera className="mr-2" />
                  Upload New Avatar
                </button>
                <button
                  type="button"
                  className="border border-slate-300 text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-50 transition duration-300 flex items-center justify-center"
                  onClick={handleRemoveAvatar}
                >
                  <FaTrash className="mr-2" />
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
                  icon={<FaUser />}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[85px]">
                  <InputField 
                    label="Email" 
                    value={formData.email} 
                    disabled 
                    placeholder="Email" 
                    icon={<FaEnvelope />}
                  />
                </div>
                <div className="h-[85px]">
                  <InputField
                    label="Phone Number"
                    value={formData.telphone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                      handleFieldChange("telphone", value, validators.telphone);
                    }}
                    error={errors.telphone}
                    placeholder="Mobile phone number"
                    icon={<FaPhone />}
                  />
                </div>
                <div className="h-[85px]">
                  <InputField 
                    label="Username" 
                    value={userCode} 
                    disabled 
                    placeholder="Code" 
                    icon={<FaIdCard />}
                  />
                </div>
                <div className="h-[85px]">
                  <InputField 
                    label="Date of Birth" 
                    type="date" 
                    value={formData.dob} 
                    onChange={(e) => handleFieldChange("dob", e.target.value, validators.dob)}
                    error={errors.dob}
                    icon={<FaBirthdayCake />}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 mt-8">
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-3 rounded-xl hover:shadow-md transition duration-300 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    disabled={hasErrors || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
             
        {/* Terms section */}
        <div className="mt-8 bg-indigo-50 rounded-xl p-6 text-center text-sm text-indigo-700 border border-indigo-100">
          <p>
            By updating this information, you agree to our{' '}
            <a href="#" className="underline hover:text-indigo-800">Terms of Use</a> and{' '}
            <a href="#" className="underline hover:text-indigo-800">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;