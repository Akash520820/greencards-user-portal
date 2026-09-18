import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from "react-icons/fi";
import { FaInstagram, FaTwitter, FaFacebookF, FaYoutube } from "react-icons/fa";
import { submitContactMessage } from "../../api/contact.api";
import { getSiteContent } from "../../api/siteContent.api";
import "./Contact.css";

const INITIAL_FORM = { name: "", email: "", subject: "", message: "" };

// Truly empty until an admin sets real values via
// Admin → Site Content → Contact Info — same "nothing yet" behavior as
// the FAQs page, rather than showing placeholder text.
const EMPTY_INFO = {
  email: "",
  phone: "",
  address: "",
  supportHours: "",
  socialLinks: { instagram: "", twitter: "", facebook: "", youtube: "" },
};

const Contact = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState(EMPTY_INFO);
  const [infoLoading, setInfoLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getSiteContent();
        if (isMounted) {
          setContactInfo({
            ...EMPTY_INFO,
            ...(data?.contactInfo || {}),
            socialLinks: { ...EMPTY_INFO.socialLinks, ...(data?.contactInfo?.socialLinks || {}) },
          });
        }
      } catch {
        // Keep the empty state — a failed fetch shouldn't block the page.
      } finally {
        if (isMounted) setInfoLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your name";
    if (!form.email.trim()) next.email = "Please enter your email";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Please enter a valid email";
    if (!form.subject.trim()) next.subject = "Please enter a subject";
    if (!form.message.trim()) next.message = "Please enter a message";
    else if (form.message.trim().length < 10) next.message = "Message should be at least 10 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await submitContactMessage(form);
      toast.success("Message sent! We'll get back to you soon.");
      setForm(INITIAL_FORM);
    } catch (err) {
      toast.error(err.message || "Failed to send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <Toaster position="top-center" />
      <div className="container">
        <div className="contact-header">
          <h1 className="contact-title">Contact</h1>
          <p className="contact-subtitle">We'd love to hear from you — reach out anytime</p>
        </div>

        <div className="contact-grid">
          {/* Info panel */}
          <div className="contact-info-panel">
            <h2 className="contact-info-heading">Get in touch</h2>
            <p className="contact-info-text">
              Have a question about an order, a product, or becoming a seller? Send us a message
              and our team will get back to you as soon as possible.
            </p>

            {infoLoading ? (
              <div className="contact-info-loading">
                <div className="spinner"></div>
              </div>
            ) : !contactInfo.email &&
              !contactInfo.phone &&
              !contactInfo.address &&
              !contactInfo.supportHours &&
              !contactInfo.socialLinks?.instagram &&
              !contactInfo.socialLinks?.twitter &&
              !contactInfo.socialLinks?.facebook &&
              !contactInfo.socialLinks?.youtube ? (
              <p className="contact-info-empty">
                Contact details haven't been added yet — use the form and we'll get back to you.
              </p>
            ) : (
              <>
                <div className="contact-info-list">
                  {contactInfo.email && (
                    <div className="contact-info-item">
                      <span className="contact-info-icon">
                        <FiMail />
                      </span>
                      <div>
                        <h4>Email</h4>
                        <p>{contactInfo.email}</p>
                      </div>
                    </div>
                  )}

                  {contactInfo.phone && (
                    <div className="contact-info-item">
                      <span className="contact-info-icon">
                        <FiPhone />
                      </span>
                      <div>
                        <h4>Phone</h4>
                        <p>{contactInfo.phone}</p>
                      </div>
                    </div>
                  )}

                  {contactInfo.address && (
                    <div className="contact-info-item">
                      <span className="contact-info-icon">
                        <FiMapPin />
                      </span>
                      <div>
                        <h4>Address</h4>
                        <p>{contactInfo.address}</p>
                      </div>
                    </div>
                  )}

                  {contactInfo.supportHours && (
                    <div className="contact-info-item">
                      <span className="contact-info-icon">
                        <FiClock />
                      </span>
                      <div>
                        <h4>Support Hours</h4>
                        <p>{contactInfo.supportHours}</p>
                      </div>
                    </div>
                  )}
                </div>

                {(contactInfo.socialLinks?.instagram ||
                  contactInfo.socialLinks?.twitter ||
                  contactInfo.socialLinks?.facebook ||
                  contactInfo.socialLinks?.youtube) && (
                  <div className="contact-social">
                    <h4>Follow Us</h4>
                    <div className="contact-social-icons">
                      {contactInfo.socialLinks?.instagram && (
                        <a href={contactInfo.socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                          <FaInstagram />
                        </a>
                      )}
                      {contactInfo.socialLinks?.twitter && (
                        <a href={contactInfo.socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                          <FaTwitter />
                        </a>
                      )}
                      {contactInfo.socialLinks?.facebook && (
                        <a href={contactInfo.socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                          <FaFacebookF />
                        </a>
                      )}
                      {contactInfo.socialLinks?.youtube && (
                        <a href={contactInfo.socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                          <FaYoutube />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Form panel */}
          <div className="contact-form-panel">
            <h2 className="contact-info-heading">Send us a message</h2>
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-form-row">
                <div className="contact-form-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={handleChange}
                    className={errors.name ? "has-error" : ""}
                  />
                  {errors.name && <span className="contact-form-error">{errors.name}</span>}
                </div>

                <div className="contact-form-group">
                  <label htmlFor="email">Your Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className={errors.email ? "has-error" : ""}
                  />
                  {errors.email && <span className="contact-form-error">{errors.email}</span>}
                </div>
              </div>

              <div className="contact-form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="How can we help?"
                  value={form.subject}
                  onChange={handleChange}
                  className={errors.subject ? "has-error" : ""}
                />
                {errors.subject && <span className="contact-form-error">{errors.subject}</span>}
              </div>

              <div className="contact-form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  placeholder="Write your message here..."
                  value={form.message}
                  onChange={handleChange}
                  className={errors.message ? "has-error" : ""}
                />
                {errors.message && <span className="contact-form-error">{errors.message}</span>}
              </div>

              <button type="submit" className="contact-submit-btn" disabled={submitting}>
                {submitting ? "Sending..." : (
                  <>
                    <FiSend /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
