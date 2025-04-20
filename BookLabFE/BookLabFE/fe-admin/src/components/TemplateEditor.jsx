import { useState, useEffect, useMemo } from 'react';
import apiClient from '../services/ApiClient';
import { getApiUrl } from '../services/ApiClient';
import parse from 'html-react-parser';
import EmailConfigEditor from './EmailConfigEditor';
import { FaEnvelope, FaCog, FaCheck, FaTimes } from 'react-icons/fa';

const TemplateSelector = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmailConfigOpen, setIsEmailConfigOpen] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get(getApiUrl('/api/GoogleCalendarAPI/get-templates'));
      setTemplates(response.data.templates);
      setSelectedTemplateId(response.data.selectedTemplateId);
    } catch (err) {
      setError('Không thể lấy danh sách template: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSelectedTemplate = async (templateId) => {
    setLoading(true);
    setError('');
    try {
      await apiClient.post(
        getApiUrl('/api/GoogleCalendarAPI/select-template'), { templateId });
      setSelectedTemplateId(templateId);
    } catch (err) {
      setError('Không thể cập nhật template: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const getPreviewTemplate = (templateContent) => {
    let previewTemplate = templateContent;
    previewTemplate = previewTemplate.replace('{0}', 'John Doe');
    previewTemplate = previewTemplate.replace('{1}', 'Room Booking Confirmation');
    previewTemplate = previewTemplate.replace('{2}', 'Team meeting');
    previewTemplate = previewTemplate.replace('{3}', '101');
    previewTemplate = previewTemplate.replace('{4}', 'Main Building');
    previewTemplate = previewTemplate.replace(
      '{5}',
      'Your room booking has been confirmed.'
    );
    previewTemplate = previewTemplate.replace('{6}', '2025-04-07');
    previewTemplate = previewTemplate.replace('{7}', '09:00');
    previewTemplate = previewTemplate.replace('{8}', '11:00');
    previewTemplate = previewTemplate.replace('{9}', '');

    return previewTemplate;
  };

  const handleClickOutside = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      setIsEmailConfigOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 relative">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6 flex items-center">
          <FaEnvelope className="mr-3 text-indigo-600" />
          Quản lý Template Email
        </h1>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 transition-all hover:shadow-md">
          <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center">
            <FaEnvelope className="mr-3 text-indigo-600" />
            Chọn Template Email
          </h2>

          {loading && (
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 mb-6 rounded-lg">
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`bg-white rounded-xl border-2 p-4 shadow-sm hover:shadow-md transition-all duration-300 ${
                  selectedTemplateId === template.id 
                    ? 'border-indigo-500 ring-2 ring-indigo-100' 
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="relative aspect-[4/3] mb-4 overflow-hidden border rounded-lg bg-slate-50">
                  <div className="absolute inset-0 p-2 overflow-auto">
                    <div className="transform scale-[0.4] origin-top-left min-w-[250%]">
                      {parse(getPreviewTemplate(template.content))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div 
                      className={`w-5 h-5 flex items-center justify-center rounded border ${
                        selectedTemplateId === template.id 
                          ? 'bg-indigo-600 border-indigo-600' 
                          : 'border-slate-300 bg-white'
                      }`}
                      onClick={() => updateSelectedTemplate(template.id)}
                    >
                      {selectedTemplateId === template.id && (
                        <FaCheck className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className={`font-medium ${
                      selectedTemplateId === template.id ? 'text-indigo-700' : 'text-slate-700'
                    }`}>
                      {template.name}
                    </span>
                  </label>

                  <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                    selectedTemplateId === template.id 
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedTemplateId === template.id ? 'Đang sử dụng' : 'Có sẵn'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsEmailConfigOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center"
      >
        <FaCog className="h-5 w-5 mr-2" />
        <span className="font-medium">Cấu hình SMTP</span>
      </button>

      {isEmailConfigOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay"
          onClick={handleClickOutside}
        >
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl relative transform transition-all duration-300 scale-100">
            <EmailConfigEditor />
            <button
              onClick={() => setIsEmailConfigOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 focus:outline-none bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;