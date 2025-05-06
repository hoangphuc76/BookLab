import { useState } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success',
    message: '',
    title: ''
  });

  const showNotification = (type, message, title = '') => {
    setNotification({
      isOpen: true,
      type,
      message,
      title
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  return {
    notification,
    showNotification,
    closeNotification
  };
};