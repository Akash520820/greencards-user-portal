import { API_BASE_URL } from "./client";

/**
 * Real-time stock subscription via Server-Sent Events (SSE).
 *
 * Flow:
 *   User Portal opens ProductDetails page
 *     → calls subscribeToStock(["prd_abc123"])
 *       → connects to: GET /api/v1/stock/stream?productIds=prd_abc123
 *         → API Gateway forwards to Seller Backend (greencard-seller cluster)
 *           → Seller Backend pushes stock_update events whenever stock changes
 *
 * The EventSource auto-reconnects on drop — no manual retry logic needed.
 *
 * @param {string[]} productIds  - Array of product publicIds (prd_xxx format)
 * @param {function} onUpdate    - Called with { productId, stock, colorVariants, isActive }
 * @param {function} onInitial   - Called with the initial stock snapshot array
 * @returns {EventSource}        - Call .close() to unsubscribe (do this in useEffect cleanup)
 */
export const subscribeToStock = (productIds, onUpdate, onInitial) => {
  if (!productIds || productIds.length === 0) return null;

  // Strip /api/v1 suffix — SSE URL is built from the base gateway URL
  const gatewayBase = API_BASE_URL.replace("/api/v1", "");
  const ids = productIds.filter(Boolean).join(",");
  const url = `${gatewayBase}/api/v1/stock/stream?productIds=${encodeURIComponent(ids)}`;

  const es = new EventSource(url, { withCredentials: true });

  es.addEventListener("initial", (e) => {
    try {
      const data = JSON.parse(e.data);
      if (onInitial) onInitial(data);
    } catch {
      console.warn("[StockSSE] Failed to parse initial event");
    }
  });

  es.addEventListener("stock_update", (e) => {
    try {
      const data = JSON.parse(e.data);
      if (onUpdate) onUpdate(data);
    } catch {
      console.warn("[StockSSE] Failed to parse stock_update event");
    }
  });

  es.onerror = (err) => {
    console.warn("[StockSSE] Connection error — EventSource will auto-reconnect", err);
  };

  return es;
};
