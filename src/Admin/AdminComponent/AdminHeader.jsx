import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiMagnifyingGlass, HiBell, HiShieldCheck, HiArrowRightOnRectangle, HiCommandLine } from 'react-icons/hi2';
import { useAdminAuth } from '../../context/AdminAuthContext';
import './AdminHeader.css';

const AdminHeader = () => {
  const { admin, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [query, setQuery] = useState('');

  const isSuperAdmin = admin?.role === 'superadmin';

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await adminLogout();
    navigate('/admin/auth');
  };

  const handleCommandNavigate = (path) => {
    setIsCommandOpen(false);
    setQuery('');
    navigate(path);
  };

  const commands = [
    { label: 'Manage Products & Inventory', path: '/admin/inventory', cat: 'Catalog' },
    { label: 'Add New Product', path: '/admin/add-product', cat: 'Catalog' },
    { label: 'View Customer Orders', path: '/admin/orders', cat: 'Sales' },
    { label: 'Review Seller Applications', path: '/admin/sellers', cat: 'Sellers' },
    { label: 'Platform Analytics', path: '/admin/analytics', cat: 'Reports' },
  ];

  const filteredCommands = query.trim()
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  return (
    <>
      <header className="admin-command-header">
        <div className="admin-header-left">
          <span className="admin-brand-badge">
            <HiShieldCheck size={18} /> Admin Center
          </span>

          <button
            type="button"
            className="admin-command-search-btn"
            onClick={() => setIsCommandOpen(true)}
          >
            <HiMagnifyingGlass size={16} />
            <span>Command Palette...</span>
            <kbd className="admin-kbd">Ctrl + K</kbd>
          </button>
        </div>

        <div className="admin-header-right">
          {isSuperAdmin && (
            <span className="superadmin-badge" title="Full System Privileges">
              👑 SuperAdmin
            </span>
          )}

          <button
            type="button"
            className="admin-notify-btn"
            title="Pending Seller Applications"
            onClick={() => navigate('/admin/sellers')}
          >
            <HiBell size={20} />
            <span className="admin-notify-badge">3</span>
          </button>

          <Link to="/" className="admin-switch-customer-btn">
            View Store
          </Link>

          <div className="admin-user-pill">
            <span className="admin-user-name">{admin?.fullName || admin?.userName || 'Admin'}</span>
            <button type="button" className="admin-logout-btn" onClick={handleLogout} title="Logout">
              <HiArrowRightOnRectangle size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Global Command Palette Modal */}
      {isCommandOpen && (
        <div className="admin-command-overlay" onClick={() => setIsCommandOpen(false)}>
          <div className="admin-command-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-command-modal-header">
              <HiCommandLine size={20} className="admin-cmd-icon" />
              <input
                type="text"
                className="admin-cmd-input"
                placeholder="Type a command or page name..."
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <kbd className="admin-esc-kbd">ESC</kbd>
            </div>

            <div className="admin-cmd-results">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd) => (
                  <div
                    key={cmd.path}
                    className="admin-cmd-item"
                    onClick={() => handleCommandNavigate(cmd.path)}
                  >
                    <span className="admin-cmd-label">{cmd.label}</span>
                    <span className="admin-cmd-category">{cmd.cat}</span>
                  </div>
                ))
              ) : (
                <div className="admin-cmd-empty">No matching commands found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHeader;
