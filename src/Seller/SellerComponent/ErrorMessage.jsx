import React from 'react';

const ErrorMessage = ({ error }) => {
  if (!error) return null;

  return (
    <div className="seller-auth-error" role="alert">
      {error}
    </div>
  );
};

export default ErrorMessage;
