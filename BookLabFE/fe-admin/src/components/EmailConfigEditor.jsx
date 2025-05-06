import { useState, useEffect } from 'react';
import apiClient from '../services/ApiClient';
import { getApiUrl } from '../services/ApiClient';
import { FaCog, FaServer, FaUser, FaLock, FaEnvelope, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const EmailConfigEditor = () => {
  const [config, setConfig] = useState({
    From: '',
    FromName: '',
    SmtpServer: '',
    Port: 587,
    UseSsl: true,
    Username: '',
    Password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchConfig = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get(getApiUrl('/api/GoogleCalendarAPI/get-config'));
      setConfig(response.data);
    } catch (err) {
      setError('Không thể lấy cấu hình: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await apiClient.post(
        getApiUrl('/api/GoogleCalendarAPI/update-config'),
        config
      );
      setSuccess('Cấu hình email đã được cập nhật thành công!');
    } catch (err) {
      setError('Không thể cập nhật cấu hình: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig((prevConfig) => ({
      ...prevConfig,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="bg-white rounded-2xl p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center">
        <FaCog className="mr-3 text-indigo-600" />
        Cấu hình Email SMTP
      </h2>

      {loading && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl text-rose-700 p-4 mb-6 flex items-start">
          <FaExclamationTriangle className="h-5 w-5 mr-2 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 p-4 mb-6 flex items-start">
          <FaCheckCircle className="h-5 w-5 mr-2 mt-0.5" />
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              <div className="flex items-center">
                <FaEnvelope className="mr-2 text-indigo-500" />
                Email gửi
              </div>
            </label>
            <input
              type="email"
              name="From"
              value={config.From}
              onChange={handleChange}
              className="w-full p-3 text-slate-700 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="example@domain.com"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              <div className="flex items-center">
                <FaUser className="mr-2 text-indigo-500" />
                Tên người gửi
              </div>
            </label>
            <input
              type="text"
              name="FromName"
              value={config.FromName}
              onChange={handleChange}
              className="w-full p-3 text-slate-700 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="BookLab System"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              <div className="flex items-center">
                <FaServer className="mr-2 text-indigo-500" />
                SMTP Server
              </div>
            </label>
            <input
              type="text"
              name="SmtpServer"
              value={config.SmtpServer}
              onChange={handleChange}
              className="w-full p-3 text-slate-700 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="smtp.gmail.com"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              <div className="flex items-center">
                <FaServer className="mr-2 text-indigo-500" />
                Port
              </div>
            </label>
            <input
              type="number"
              name="Port"
              value={config.Port}
              onChange={handleChange}
              className="w-full p-3 text-slate-700 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="587"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              <div className="flex items-center">
                <FaUser className="mr-2 text-indigo-500" />
                Username
              </div>
            </label>
            <input
              type="text"
              name="Username"
              value={config.Username}
              onChange={handleChange}
              className="w-full p-3 text-slate-700 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="youremail@gmail.com"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              <div className="flex items-center">
                <FaLock className="mr-2 text-indigo-500" />
                Password
              </div>
            </label>
            <input
              type="password"
              name="Password"
              onChange={handleChange}
              className="w-full p-3 text-slate-700 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-center mt-2">
          <label className="flex items-center text-sm font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              name="UseSsl"
              checked={config.UseSsl}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mr-2"
            />
            Sử dụng SSL/TLS
          </label>
          <div className="ml-2 bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full">Khuyên dùng</div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <FaCheckCircle className="mr-2" />
                  Lưu cấu hình
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmailConfigEditor;