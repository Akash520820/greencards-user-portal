import React from 'react';

const AuthModalBackdrop = ({ onClick }) => {
  return <div className="auth-modal-backdrop" onClick={onClick}></div>;
};

export default React.memo(AuthModalBackdrop);