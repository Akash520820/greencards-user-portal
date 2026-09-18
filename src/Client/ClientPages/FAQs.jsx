import React, { useEffect, useState } from "react";
import { HiChevronDown } from "react-icons/hi2";
import { getSiteContent } from "../../api/siteContent.api";
import "./StaticInfoPage.css";

const FAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getSiteContent();
        if (mounted) setFaqs(data?.faqs || []);
      } catch {
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="static-info-page">
        <div className="static-info-loading">
          <div className="spinner"></div>
          <p>Loading FAQs…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="static-info-page">
      <div className="container">
        <div className="static-info-header">
          <h1 className="static-info-title">Frequently Asked Questions</h1>
          <p className="static-info-subtitle">Answers to the things people ask us most</p>
        </div>

        {error && (
          <p className="static-info-error">Couldn't load FAQs right now — please try again later.</p>
        )}

        {!error && faqs.length === 0 && (
          <p className="static-info-error">No FAQs have been added yet.</p>
        )}

        {!error && faqs.length > 0 && (
          <div className="faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div className="faq-item" key={index}>
                  <button
                    type="button"
                    className="faq-question"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <HiChevronDown className={`faq-icon ${isOpen ? "open" : ""}`} size={20} />
                  </button>
                  {isOpen && <div className="faq-answer">{faq.answer}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQs;