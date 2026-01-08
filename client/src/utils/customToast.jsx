import toast from 'react-hot-toast';

export const showToast = (type, message, timeout = 1000) => {
  switch (type) {
    case 'success':
      toast.success(message, {
        duration: timeout,
      });
      break;

    case 'error':
      toast.error(message, {
        duration: timeout,
      });
      break;

    default:
      toast(message, {
        duration: timeout,
      });
  }
};
