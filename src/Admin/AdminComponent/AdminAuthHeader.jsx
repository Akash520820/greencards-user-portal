import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAuthHeader = ({ isLogin }) => {
  const navigate = useNavigate();

  return (
    <div className="admin-auth-header">
      <h3 className="admin-auth-title">
        <span className="text-success">Admin</span>{' '}
        {isLogin ? 'Login' : 'Sign Up'}
      </h3>
      <button 
        className="admin-auth-back-btn" 
        onClick={() => navigate('/')}
        title="Back to Home"
        aria-label="Back to Home"
      >
        ×
      </button>
    </div>
  );
};

export default AdminAuthHeader;
