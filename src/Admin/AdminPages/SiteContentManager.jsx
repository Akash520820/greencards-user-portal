// SiteContentManager.jsx
// Admin screen for the singleton SiteContent document that backs the
// footer's static pages (FAQs, Delivery Information, Return & Refund
// Policy, Payment Methods) plus a read-only inbox for messages submitted
// through the public Contact page. Without this screen there was no way
// to populate that content — the client pages and backend endpoints
// already existed, but nothing in the admin UI called PATCH /site-content.
import React, { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSave, FiMail, FiCheckCircle } from 'react-icons/fi';
import { getSiteContent, updateSiteContent } from '../../api/siteContent.api';
import * as contactApi from '../../api/contact.api';
import './SiteContentManager.css';

const TABS = [
  { key: 'contactInfo', label: 'Contact Info' },
  { key: 'faqs', label: 'FAQs' },
  { key: 'deliveryInformation', label: 'Delivery Information' },
  { key: 'returnRefundPolicy', label: 'Return & Refund Policy' },
  { key: 'paymentMethods', label: 'Payment Methods' },
  { key: 'messages', label: 'Contact Messages' },
];

const EMPTY_CONTACT_INFO = {
  email: '',
  phone: '',
  address: '',
  supportHours: '',
  socialLinks: { instagram: '', twitter: '', facebook: '', youtube: '' },
};

const SiteContentManager = () => {
  const [tab, setTab] = useState('contactInfo');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [contactInfo, setContactInfo] = useState(EMPTY_CONTACT_INFO);
  const [faqs, setFaqs] = useState([]);
  const [deliveryInformation, setDeliveryInformation] = useState('');
  const [returnRefundPolicy, setReturnRefundPolicy] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newCount, setNewCount] = useState(0);

  const loadContent = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getSiteContent();
      setContactInfo({
        ...EMPTY_CONTACT_INFO,
        ...(data?.contactInfo || {}),
        socialLinks: { ...EMPTY_CONTACT_INFO.socialLinks, ...(data?.contactInfo?.socialLinks || {}) },
      });
      setFaqs(data?.faqs || []);
      setDeliveryInformation(data?.deliveryInformation || '');
      setReturnRefundPolicy(data?.returnRefundPolicy || '');
      setPaymentMethods(data?.paymentMethods || []);
    } catch (err) {
      setError(err.message || 'Failed to load site content.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    setMessagesLoading(true);
    try {
      const res = await contactApi.getContactMessages();
      setMessages(res.data.messages || []);
      setNewCount(res.data.newCount || 0);
    } catch (err) {
      toast.error(err.message || 'Failed to load contact messages.');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  useEffect(() => {
    if (tab === 'messages') loadMessages();
  }, [tab, loadMessages]);

  const handleSave = async (payload, successMsg) => {
    setSaving(true);
    try {
      await updateSiteContent(payload);
      toast.success(successMsg);
    } catch (err) {
      toast.error(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // ---- Contact Info ----
  const updateContactField = (field, value) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
  };
  const updateSocialLink = (platform, value) => {
    setContactInfo((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [platform]: value } }));
  };
  const saveContactInfo = () => {
    handleSave({ contactInfo }, 'Contact info saved');
  };

  // ---- FAQs ----
  const updateFaq = (index, field, value) => {
    setFaqs((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  };
  const addFaq = () => setFaqs((prev) => [...prev, { question: '', answer: '' }]);
  const removeFaq = (index) => setFaqs((prev) => prev.filter((_, i) => i !== index));
  const saveFaqs = () => {
    const cleaned = faqs.filter((f) => f.question.trim() && f.answer.trim());
    handleSave({ faqs: cleaned }, 'FAQs saved');
  };

  // ---- Payment Methods ----
  const updatePaymentMethod = (index, field, value) => {
    setPaymentMethods((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };
  const addPaymentMethod = () => setPaymentMethods((prev) => [...prev, { name: '', description: '' }]);
  const removePaymentMethod = (index) => setPaymentMethods((prev) => prev.filter((_, i) => i !== index));
  const savePaymentMethods = () => {
    const cleaned = paymentMethods.filter((p) => p.name.trim() && p.description.trim());
    handleSave({ paymentMethods: cleaned }, 'Payment methods saved');
  };

  const markRead = async (messageId) => {
    try {
      await contactApi.markContactMessageRead(messageId);
      setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, status: 'read' } : m)));
      setNewCount((c) => Math.max(0, c - 1));
    } catch (err) {
      toast.error(err.message || 'Failed to update message');
    }
  };

  if (loading) {
    return <div className="scm-loading">Loading site content…</div>;
  }

  return (
    <div className="scm-page">
      <Toaster position="top-center" />
      <div className="scm-header">
        <h1>Site Content</h1>
        <p className="scm-subtitle">
          Manage the footer's static pages and review messages from the Contact page.
        </p>
        <div className="scm-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`scm-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.key === 'messages' && newCount > 0 && <span className="scm-badge">{newCount}</span>}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="scm-error">{error}</p>}

      {/* Contact Info */}
      {tab === 'contactInfo' && (
        <div className="scm-panel">
          <p className="scm-hint">
            This powers the "Get in touch" panel on the public Contact page.
          </p>
          <div className="scm-form-grid">
            <div className="scm-form-field">
              <label className="scm-label">Email</label>
              <input
                type="email"
                placeholder="support@greencards.com"
                value={contactInfo.email}
                onChange={(e) => updateContactField('email', e.target.value)}
              />
            </div>
            <div className="scm-form-field">
              <label className="scm-label">Phone</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={contactInfo.phone}
                onChange={(e) => updateContactField('phone', e.target.value)}
              />
            </div>
          </div>

          <div className="scm-form-field">
            <label className="scm-label">Address</label>
            <input
              type="text"
              placeholder="GreenCards HQ, Sector 21, Gurugram, Haryana, India"
              value={contactInfo.address}
              onChange={(e) => updateContactField('address', e.target.value)}
            />
          </div>

          <div className="scm-form-field">
            <label className="scm-label">Support Hours</label>
            <input
              type="text"
              placeholder="Mon – Sat, 9:00 AM – 8:00 PM"
              value={contactInfo.supportHours}
              onChange={(e) => updateContactField('supportHours', e.target.value)}
            />
          </div>

          <label className="scm-label" style={{ marginTop: 8 }}>
            Social Links (leave blank to hide that icon)
          </label>
          <div className="scm-form-grid">
            <div className="scm-form-field">
              <label className="scm-label scm-label-sub">Instagram URL</label>
              <input
                type="text"
                placeholder="https://instagram.com/yourhandle"
                value={contactInfo.socialLinks.instagram}
                onChange={(e) => updateSocialLink('instagram', e.target.value)}
              />
            </div>
            <div className="scm-form-field">
              <label className="scm-label scm-label-sub">Twitter / X URL</label>
              <input
                type="text"
                placeholder="https://twitter.com/yourhandle"
                value={contactInfo.socialLinks.twitter}
                onChange={(e) => updateSocialLink('twitter', e.target.value)}
              />
            </div>
            <div className="scm-form-field">
              <label className="scm-label scm-label-sub">Facebook URL</label>
              <input
                type="text"
                placeholder="https://facebook.com/yourpage"
                value={contactInfo.socialLinks.facebook}
                onChange={(e) => updateSocialLink('facebook', e.target.value)}
              />
            </div>
            <div className="scm-form-field">
              <label className="scm-label scm-label-sub">YouTube URL</label>
              <input
                type="text"
                placeholder="https://youtube.com/@yourchannel"
                value={contactInfo.socialLinks.youtube}
                onChange={(e) => updateSocialLink('youtube', e.target.value)}
              />
            </div>
          </div>

          <div className="scm-actions">
            <button className="scm-btn scm-btn-primary" onClick={saveContactInfo} disabled={saving}>
              <FiSave /> {saving ? 'Saving…' : 'Save Contact Info'}
            </button>
          </div>
        </div>
      )}

      {/* FAQs */}
      {tab === 'faqs' && (
        <div className="scm-panel">
          {faqs.length === 0 && <p className="scm-empty">No FAQs yet — add one below.</p>}
          {faqs.map((faq, index) => (
            <div className="scm-card" key={index}>
              <div className="scm-card-row">
                <input
                  type="text"
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) => updateFaq(index, 'question', e.target.value)}
                />
                <button className="scm-icon-btn scm-icon-btn-danger" onClick={() => removeFaq(index)} title="Remove">
                  <FiTrash2 />
                </button>
              </div>
              <textarea
                placeholder="Answer"
                rows={3}
                value={faq.answer}
                onChange={(e) => updateFaq(index, 'answer', e.target.value)}
              />
            </div>
          ))}
          <div className="scm-actions">
            <button className="scm-btn scm-btn-secondary" onClick={addFaq}>
              <FiPlus /> Add FAQ
            </button>
            <button className="scm-btn scm-btn-primary" onClick={saveFaqs} disabled={saving}>
              <FiSave /> {saving ? 'Saving…' : 'Save FAQs'}
            </button>
          </div>
        </div>
      )}

      {/* Delivery Information */}
      {tab === 'deliveryInformation' && (
        <div className="scm-panel">
          <label className="scm-label">Delivery Information page content</label>
          <textarea
            className="scm-textarea-lg"
            rows={10}
            value={deliveryInformation}
            onChange={(e) => setDeliveryInformation(e.target.value)}
            placeholder="Describe delivery timelines, charges, coverage areas…"
          />
          <div className="scm-actions">
            <button
              className="scm-btn scm-btn-primary"
              disabled={saving}
              onClick={() => handleSave({ deliveryInformation }, 'Delivery information saved')}
            >
              <FiSave /> {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Return & Refund Policy */}
      {tab === 'returnRefundPolicy' && (
        <div className="scm-panel">
          <label className="scm-label">Return & Refund Policy page content</label>
          <textarea
            className="scm-textarea-lg"
            rows={10}
            value={returnRefundPolicy}
            onChange={(e) => setReturnRefundPolicy(e.target.value)}
            placeholder="Describe your return window, refund process, timelines…"
          />
          <div className="scm-actions">
            <button
              className="scm-btn scm-btn-primary"
              disabled={saving}
              onClick={() => handleSave({ returnRefundPolicy }, 'Return & refund policy saved')}
            >
              <FiSave /> {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {tab === 'paymentMethods' && (
        <div className="scm-panel">
          {paymentMethods.length === 0 && <p className="scm-empty">No payment methods yet — add one below.</p>}
          {paymentMethods.map((pm, index) => (
            <div className="scm-card" key={index}>
              <div className="scm-card-row">
                <input
                  type="text"
                  placeholder="Name (e.g. UPI)"
                  value={pm.name}
                  onChange={(e) => updatePaymentMethod(index, 'name', e.target.value)}
                />
                <button
                  className="scm-icon-btn scm-icon-btn-danger"
                  onClick={() => removePaymentMethod(index)}
                  title="Remove"
                >
                  <FiTrash2 />
                </button>
              </div>
              <textarea
                placeholder="Description"
                rows={2}
                value={pm.description}
                onChange={(e) => updatePaymentMethod(index, 'description', e.target.value)}
              />
            </div>
          ))}
          <div className="scm-actions">
            <button className="scm-btn scm-btn-secondary" onClick={addPaymentMethod}>
              <FiPlus /> Add Payment Method
            </button>
            <button className="scm-btn scm-btn-primary" onClick={savePaymentMethods} disabled={saving}>
              <FiSave /> {saving ? 'Saving…' : 'Save Payment Methods'}
            </button>
          </div>
        </div>
      )}

      {/* Contact Messages */}
      {tab === 'messages' && (
        <div className="scm-panel">
          {messagesLoading ? (
            <p className="scm-empty">Loading messages…</p>
          ) : messages.length === 0 ? (
            <p className="scm-empty">No messages yet.</p>
          ) : (
            <div className="scm-messages">
              {messages.map((msg) => (
                <div key={msg._id} className={`scm-message-card ${msg.status === 'new' ? 'unread' : ''}`}>
                  <div className="scm-message-top">
                    <div>
                      <span className="scm-message-subject">{msg.subject}</span>
                      <span className="scm-message-meta">
                        from {msg.name} ({msg.email}) · {new Date(msg.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    {msg.status === 'new' ? (
                      <button className="scm-btn scm-btn-secondary" onClick={() => markRead(msg._id)}>
                        <FiCheckCircle /> Mark read
                      </button>
                    ) : (
                      <span className="scm-read-badge">
                        <FiMail /> Read
                      </span>
                    )}
                  </div>
                  <p className="scm-message-body">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SiteContentManager;
