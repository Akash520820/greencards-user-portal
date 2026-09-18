import React, { useEffect, useState } from "react";
import { getSiteContent } from "../../api/siteContent.api";
import "./StaticInfoPage.css";

const PaymentMethods = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getSiteContent();
        if (mounted) setMethods(data?.paymentMethods || []);
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
          <h1 className="static-info-title">Payment Methods</h1>
          <p className="static-info-subtitle">Ways you can pay at checkout</p>
        </div>

        {error && (
          <p className="static-info-error">Couldn't load this page right now — please try again later.</p>
        )}

        {!error && methods.length === 0 && (
          <p className="static-info-error">No payment methods have been added yet.</p>
        )}

        {!error && methods.length > 0 && (
          <div className="payment-methods-list">
            {methods.map((method, index) => (
              <div className="payment-methods-item" key={index}>
                <h4>{method.name}</h4>
                <p>{method.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethods;