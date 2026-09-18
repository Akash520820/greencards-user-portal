import React from 'react';

const AuthToggleText = ({ isLogin, onToggle }) => {
  return (
    <div className="auth-form-toggle-text">
      {isLogin ? (
        <>
          Create an account?{' '}
          <button type="button" className="auth-form-toggle-link" onClick={onToggle}>
            click here
          </button>
        </>
      ) : (
        <>
          Already have account?{' '}
          <button type="button" className="auth-form-toggle-link" onClick={onToggle}>
            click here
          </button>
        </>
      )}
    </div>
  );
};

export default React.memo(AuthToggleText);