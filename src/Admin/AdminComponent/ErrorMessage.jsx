import React from 'react';

const ErrorMessage = ({ error }) => {
  if (!error) return null;

  return (
    <div className="admin-auth-error" role="alert">
      {error}
    </div>
  );
};

export default ErrorMessage;