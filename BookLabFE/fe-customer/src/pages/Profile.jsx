import { data, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from 'react';

// fake Header
import {
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  LinkIcon,
  MapPinIcon,
  PencilIcon,
} from '@heroicons/react/20/solid';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

import { UserIcon } from '../icons'
import apiClient from '../services/ApiClient'

function Profile() {
  const { accountId } = useParams()
  const [id, setId] = useState('')
  const [email, setEmail] = useState('')
  const [roleName, setRoleName] = useState('')
  const [fullName, setFullName] = useState('')
  const [telphone, setTelphone] = useState('')
  const [avatar, setAvatar] = useState('')
  const [dob, setDob] = useState('')
  const [edit, setEdit] = useState(false)
  const [errors, setErrors] = useState({
    fullName: '',
    telphone: '',
    dob: '',
  })


  useEffect(() => {
    const fetchApi = async (accountId) => {
      await apiClient.get("/AccountDetail(" + accountId + ")")
        .then(response => response.data)
        .then(json => {
          setId(json.studentId)
          setEmail(json.account.gmail)
          setRoleName('Student')
          setFullName(json.fullName)
          setTelphone(json.telphone)
          setAvatar(json.avatar)
          setDob(json.dob.split('T')[0])
        })
    }

    fetchApi(accountId)
  }, [])

  const formRef = useRef()

  const handleSave = async (event) => {
    event.preventDefault()
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('telphone', telphone);
    formData.append('dob', dob);
    formData.append('studentId', id);
    if (avatar) {
      formData.append('file', avatar);
    }

    try {
      const response = await apiClient.put(`/AccountDetail(${accountId})`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200) {
        setEdit(false);
        message.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    }


    // try {
    //   const response = await fetch(`/${accountId}`, {
    //     method: 'POST',
    //     body: formData,
    //   });

    //   if (response.ok) {
    //     setEdit(false)
    //   } else {
    //     console.error('Error:', response.statusText)
    //   }
    // } catch (error) {
    //   console.error('Error:', error)
    // }
  }

  const handleChangeAvatar = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setAvatar(event.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  const handleChangeName = (e) => {
    const value = e.target.value
    setFullName(value)
    if (!value) {
      setErrors((prev) => ({ ...prev, fullName: 'Full Name is required.' }));
    } else {
      setErrors((prev) => ({ ...prev, fullName: '' }));
    }
  }

  const handleChangeTelphone = (e) => {
    const value = e.target.value
    if (Number(value) == value) {
      setTelphone(value)
    }
    if (!value) {
      setErrors((prev) => ({ ...prev, telphone: 'Telephone is required.' }));
    } else {
      setErrors((prev) => ({ ...prev, telphone: '' }));
    }
  }

  const handleChangeDOB = (e) => {
    const value = e.target.value
    setDob(value)
    if (!value) {
      setErrors((prev) => ({ ...prev, dob: 'Date of Birth is required.' }));
    } else {
      setErrors((prev) => ({ ...prev, dob: '' }));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="relative py-6 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold text-gray-800">
                Profile Settings
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your account information and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Profile Header */}
          <div className="relative h-40 bg-gray-100">
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-24">
              <div className="flex items-end">
                <div className="relative flex">
                  <img
                    src={avatar || 'default-avatar.png'}
                    alt={fullName}
                    className="h-20 w-20 rounded-full ring-4 ring-white object-cover bg-white"
                    onClick={edit ? handleChangeAvatar : undefined}
                  />
                  {edit && (
                    <button 
                      onClick={handleChangeAvatar}
                      className="absolute bottom-0 right-0 p-1.5 rounded-full bg-gray-700 text-white hover:bg-gray-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="ml-5">
                  <h2 className="text-xl font-medium text-gray-800">{fullName}</h2>
                  <p className="text-sm text-gray-500">{email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-6 py-6 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-800">Personal Information</h3>
              <div>
                {!edit ? (
                  <button
                    onClick={() => setEdit(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-600 bg-white hover:bg-gray-50"
                  >
                    <PencilIcon className="h-4 w-4 mr-1.5" />
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-gray-700 hover:bg-gray-600"
                  >
                    <CheckIcon className="h-4 w-4 mr-1.5" />
                    Save
                  </button>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <form className="space-y-6" onSubmit={handleSave}>
              <div className="grid grid-cols-1 gap-y-5 gap-x-6 sm:grid-cols-2">
                {/* Student ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                  <input
                    type="text"
                    value={id}
                    disabled
                    className="block w-full rounded-md border-gray-200 bg-gray-50 text-sm"
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={handleChangeName}
                    disabled={!edit}
                    className={`block w-full rounded-md text-sm ${
                      edit 
                        ? 'border-gray-300 focus:border-gray-400 focus:ring-gray-400' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={telphone}
                    onChange={handleChangeTelphone}
                    disabled={!edit}
                    className={`block w-full rounded-md text-sm ${
                      edit 
                        ? 'border-gray-300 focus:border-gray-400 focus:ring-gray-400' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  {errors.telphone && (
                    <p className="mt-1 text-sm text-red-500">{errors.telphone}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={handleChangeDOB}
                    disabled={!edit}
                    className={`block w-full rounded-md text-sm ${
                      edit 
                        ? 'border-gray-300 focus:border-gray-400 focus:ring-gray-400' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  {errors.dob && (
                    <p className="mt-1 text-sm text-red-500">{errors.dob}</p>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
