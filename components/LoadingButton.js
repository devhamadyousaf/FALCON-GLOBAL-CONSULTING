import React, { useState } from 'react';
import Spinner from './Spinner';

export default function LoadingButton({ children, onClick, className = '', type = 'button', disabled = false, ...props }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    if (disabled || loading) return;
    if (onClick) {
      try {
        const result = onClick(e);
        // If onClick returns a promise, show loading until it resolves
        if (result && typeof result.then === 'function') {
          setLoading(true);
          await result;
        }
      } catch (err) {
        // swallow here; caller can handle errors
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`${className} ${loading ? 'opacity-80 cursor-wait' : ''}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center space-x-2">
          <Spinner size="sm" color="white" />
          <span className="select-none">{typeof children === 'string' ? children : 'Processing...'}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
