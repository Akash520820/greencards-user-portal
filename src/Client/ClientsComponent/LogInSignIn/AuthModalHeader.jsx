import React from 'react';

const AuthModalHeader = ({ isLogin, onClose }) => {
  return (
    <div className="auth-modal-header">
      <h3 className="auth-modal-header-title">
        <span className="text-success">User</span>{' '}
        {isLogin ? 'Login' : 'Sign Up'}
      </h3>
      <button className="auth-modal-header-close-btn" onClick={onClose} aria-label="Close login form">
        ×
      </button>
    </div>
  );
};

export default React.memo(AuthModalHeader);