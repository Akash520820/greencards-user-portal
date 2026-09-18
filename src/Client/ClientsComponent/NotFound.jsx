import React from 'react';
import { Link } from 'react-router-dom';

// Shown for any path that doesn't match a route — including malformed
// URLs (e.g. an accidental double slash) that would otherwise fall
// through to React Router's raw developer-facing error screen.
const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1 style={{ color: '#198754', fontWeight: 800, fontSize: '4rem', marginBottom: 0 }}>
        404
      </h1>
      <h2 style={{ marginBottom: '0.75rem' }}>Page not found</h2>
      <p style={{ color: '#718096', marginBottom: '1.5rem', maxWidth: 420 }}>
        The page you're looking for doesn't exist or the link may be broken.
      </p>
      <Link
        to="/"
        style={{
          backgroundColor: '#198754',
          color: '#fff',
          padding: '0.65rem 1.5rem',
          borderRadius: '8px',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
