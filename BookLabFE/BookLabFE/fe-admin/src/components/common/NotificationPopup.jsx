import React, { useEffect } from 'react';
import { 
  HiCheckCircle, 
  HiXCircle, 
  HiExclamationCircle, 
  HiInformationCircle, 
  HiX 
} from 'react-icons/hi';

const NotificationPopup = ({ type = 'success', message, title, onClose, isOpen }) => {
  useEffect(() => {
    if (isOpen) {
      // Auto-close the notification after 5 seconds for success/info notifications
      // but keep errors open until manually closed
      if (type === 'success' || type === 'info') {
        const timer = setTimeout(() => {
          onClose();
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, type, onClose]);
  
  if (!isOpen) return null;
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <HiCheckCircle className="h-6 w-6 text-emerald-500" />;
      case 'error':
        return <HiXCircle className="h-6 w-6 text-rose-500" />;
      case 'warning':
        return <HiExclamationCircle className="h-6 w-6 text-amber-500" />;
      case 'info':
        return <HiInformationCircle className="h-6 w-6 text-blue-500" />;
      default:
        return <HiInformationCircle className="h-6 w-6 text-blue-500" />;
    }
  };
  
  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-200';
      case 'error': return 'bg-rose-50 border-rose-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };
  
  const getTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'info': return 'Information';
      default: return 'Notification';
    }
  };
  
  const getTextColor = () => {
    switch (type) {
      case 'success': return 'text-emerald-800';
      case 'error': return 'text-rose-800';
      case 'warning': return 'text-amber-800';
      case 'info': return 'text-blue-800';
      default: return 'text-slate-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25">
      <div className={`max-w-md w-full rounded-xl shadow-lg border ${getBackgroundColor()} animate-fade-in`}>
        <div className="flex items-start p-4">
          <div className="flex-shrink-0 mr-3 pt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 pt-0.5">
            <h3 className={`text-lg font-medium ${getTextColor()}`}>
              {getTitle()}
            </h3>
            
            <div className="mt-1 text-sm text-slate-600">
              {typeof message === 'string' ? (
                <p>{message}</p>
              ) : (
                message
              )}
            </div>
            
            {type === 'error' && typeof message !== 'string' && (
              <div className="mt-3">
                <details className="text-xs">
                  <summary className="cursor-pointer text-slate-700 hover:text-slate-900">
                    View Error Details
                  </summary>
                  <pre className="mt-2 p-2 bg-slate-100 rounded-md overflow-auto max-h-40 text-slate-700">
                    {JSON.stringify(message, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
          
          <button 
            onClick={onClose}
            className="flex-shrink-0 ml-3 p-1.5 rounded-full hover:bg-white/50 transition-colors"
          >
            <HiX className="h-5 w-5 text-slate-500 hover:text-slate-700" />
          </button>
        </div>
        
        <div className="flex justify-end px-4 py-3 border-t border-slate-200">
          {type === 'error' && (
            <button
              onClick={() => window.location.reload()}
              className="mr-3 px-4 py-2 text-sm font-medium rounded-lg bg-slate-600 text-white hover:bg-slate-700 transition-colors"
            >
              Reload Page
            </button>
          )}
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              type === 'success' 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                : type === 'error'
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : type === 'warning'
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } transition-colors`}
          >
            {type === 'error' ? 'Acknowledge' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;