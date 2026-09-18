import React, { useEffect, useState } from "react";
import { getSiteContent } from "../../api/siteContent.api";
import "./StaticInfoPage.css";

const ReturnRefundPolicy = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getSiteContent();
        if (mounted) setContent(data?.returnRefundPolicy || "");
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
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="static-info-page">
      <div className="container">
        <div className="static-info-header">
          <h1 className="static-info-title">Return & Refund Policy</h1>
          <p className="static-info-subtitle">How returns and refunds work at GreenCards</p>
        </div>

        {error ? (
          <p className="static-info-error">Couldn't load this page right now — please try again later.</p>
        ) : (
          <div className="static-info-content">
            <p>{content}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnRefundPolicy;