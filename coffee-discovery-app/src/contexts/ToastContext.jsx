import { createContext, useContext, useState, useEffect } from 'react';

const ToastContext = createContext({});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  // Remove a toast
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Shorthand functions for different toast types
  const success = (message, duration = 3000) => addToast(message, 'success', duration);
  const error = (message, duration = 4000) => addToast(message, 'error', duration);
  const warning = (message, duration = 3000) => addToast(message, 'warning', duration);
  const info = (message, duration = 2000) => addToast(message, 'info', duration);

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container that will display the toasts */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((toast) => (
            <div 
              key={toast.id} 
              className={`toast toast-${toast.type}`}
              onClick={() => removeToast(toast.id)}
            >
              <div className="toast-content">
                <p>{toast.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
