import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DatePicker, Button, Input, Form, Upload, message } from 'antd';
import {
  HiOutlineUserCircle,
  HiOutlinePhone,
  HiOutlineIdentification,
  HiOutlineCalendar
} from 'react-icons/hi';
import ApiClient from '../services/ApiClient';
import { swtoast } from '../utils/swal';
import ImgCrop from 'antd-img-crop';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../features/Auth/profileSlice";

const AccountDetailPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.profile);
  const { userId } = profile;

  useEffect(() => {
    const loadProfile = async () => {
      dispatch(fetchProfile());
      setProfileLoaded(true);
    };
    loadProfile();
  }, [dispatch]);

  // Debug profile state
  useEffect(() => {
    console.log("Profile state:", profile);
    console.log("UserId:", userId);
  }, [profile, userId]);

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      // Prepare form data
      const formData = new FormData();
      formData.append('fullName', values.fullName);
      formData.append('telphone', values.telphone || '');
      formData.append('studentId', values.studentId || '');
      formData.append('dob', values.dob ? values.dob.format('YYYY-MM-DD') : '');

      // If avatar was uploaded, append it
      if (imageUrl && typeof imageUrl !== 'string') {
        formData.append('file', imageUrl);
      }

      // Submit user information to the correct endpoint with userId
      await ApiClient.post(`/AccountDetail/CreateAccount/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update role to 4 after creating account details
      await ApiClient.put(`/Account/${userId}/Role`, 4, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      localStorage.setItem('roleId', 4);

      swtoast.success({
        title: 'Success',
        text: 'Account details saved successfully'
      });

      // Navigate to home after submission
      navigate('/home');
    } catch (error) {
      console.error('Failed to save account details:', error);
      swtoast.error({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save account details'
      });
    } finally {
      setSubmitting(false);
    }
  };
  // Handle avatar upload
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const handleUploadChange = (info) => {
    if (info.file.status === 'uploading') {
      setUploadLoading(true);
      return;
    }

    if (info.file.status === 'done') {
      setUploadLoading(false);
      setImageUrl(info.file.originFileObj);
    }
  };

  const uploadButton = (
    <div>
      {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6 hover:shadow-md transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Complete Your Profile</h2>
            <p className="text-slate-500 text-sm">
              Please provide your personal information
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Avatar Upload */}
            <div className="md:col-span-2 flex justify-center mb-6">
              <ImgCrop rotate>
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  onChange={handleUploadChange}
                  customRequest={({ onSuccess }) => setTimeout(() => onSuccess("ok"), 0)}
                >
                  {imageUrl ? (
                    <img
                      src={typeof imageUrl === 'string' ? imageUrl : URL.createObjectURL(imageUrl)}
                      alt="avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : uploadButton}
                </Upload>
              </ImgCrop>
            </div>

            {/* Full Name */}
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter your full name' }]}
            >
              <Input
                prefix={<HiOutlineUserCircle className="text-slate-400 mr-2" />}
                placeholder="Enter your full name"
                className="rounded-xl py-3 px-4"
              />
            </Form.Item>

            {/* Phone Number */}
            <Form.Item
              name="telphone"
              label="Phone Number"
              rules={[
                { max: 20, message: 'Phone number cannot exceed 20 characters' },
                { pattern: /^[0-9+-\s]+$/, message: 'Please enter a valid phone number' }
              ]}
            >
              <Input
                prefix={<HiOutlinePhone className="text-slate-400 mr-2" />}
                placeholder="Enter your phone number"
                className="rounded-xl py-3 px-4"
              />
            </Form.Item>

            {/* Student ID */}
            <Form.Item
              name="studentId"
              label={<span>Student ID <span className="text-gray-400 text-xs">(e.g., DE180493)</span></span>}
              rules={[
                { max: 20, message: 'Student ID cannot exceed 20 characters' }
              ]}
            >
              <Input
                prefix={<HiOutlineIdentification className="text-slate-400 mr-2" />}
                placeholder="Enter your student ID (if applicable)"
                className="rounded-xl py-3 px-4"
              />
            </Form.Item>

            {/* Date of Birth */}
            <Form.Item
              name="dob"
              label="Date of Birth"
              rules={[{ required: true, message: 'Please select your date of birth' }]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                className="w-full rounded-xl py-3 px-4"
                suffixIcon={<HiOutlineCalendar className="text-slate-400" />}
              />
            </Form.Item>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end mt-8 pt-4 border-t border-slate-200">
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="inline-flex items-center justify-center py-2.5 px-5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600"
            >
              Save Information
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default AccountDetailPage;