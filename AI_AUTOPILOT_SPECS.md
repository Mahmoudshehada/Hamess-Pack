
# Hamess Pack AI Autopilot Specifications

This document outlines the implementation details for the **Auto-Reorder System**, **AI Demand Forecasting**, and **WhatsApp Actionable Commands**.

---

## A — Auto-Reorder System

### 1. JSON Rules Structure
Each product or category can have specific reorder rules stored in a `reorder_rules` table or JSONB column.

```json
{
  "product_id": "prod-cub-2025",
  "supplier_id": "sup-001",
  "rules": {
    "reorder_point": 15,           // Trigger when stock <= 15
    "safety_stock": 10,            // Buffer stock to keep
    "lead_time_days": 3,           // Days for supplier to deliver
    "min_order_qty": 100,          // MOQ from supplier
    "auto_approve": false          // If true, skip admin confirmation
  }
}
```

### 2. SQL Schema
```sql
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    whatsapp_number VARCHAR(20),
    email VARCHAR(100),
    default_lead_time INT DEFAULT 3
);

CREATE TABLE reorder_rules (
    product_id VARCHAR(50) PRIMARY KEY REFERENCES products(id),
    supplier_id INT REFERENCES suppliers(id),
    reorder_point INT NOT NULL,
    safety_stock INT DEFAULT 10,
    min_order_qty INT DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    supplier_id INT REFERENCES suppliers(id),
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, PENDING, APPROVED, SENT, RECEIVED
    total_cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_notes TEXT
);

CREATE TABLE purchase_order_lines (
    id SERIAL PRIMARY KEY,
    po_id INT REFERENCES purchase_orders(id),
    product_id VARCHAR(50) REFERENCES products(id),
    qty_requested INT NOT NULL,
    unit_cost DECIMAL(10,2)
);
```

### 3. Node.js Implementation Logic
```javascript
// autoReorder.js
const calculateReorder = async (product, rule, velocity) => {
  // 1. Check Triggers
  const dailyUsage = velocity || 0;
  const daysToStockout = product.stock / dailyUsage;
  
  const shouldReorder = 
    product.stock <= rule.reorder_point || 
    daysToStockout <= rule.lead_time_days;

  if (!shouldReorder) return null;

  // 2. Compute Quantity
  // Formula: (DailyUsage * LeadTime) + SafetyStock - CurrentStock
  const demandDuringLeadTime = dailyUsage * rule.lead_time_days;
  const targetStock = demandDuringLeadTime + rule.safety_stock;
  let needed = targetStock - product.stock;
  
  // Apply Constraints
  const finalQty = Math.max(needed, rule.min_order_qty);

  return {
    action: 'CREATE_PO',
    qty: Math.ceil(finalQty),
    reason: `Stock (${product.stock}) hit reorder point (${rule.reorder_point})`
  };
};
```

---

## B — AI Forecasting

### 1. Methodology
*   **Primary (Lightweight):** Single Exponential Smoothing (SES). Good for non-seasonal retail items.
    *   $F_{t+1} = \alpha \cdot A_t + (1-\alpha) \cdot F_t$
*   **Secondary (LLM):** Use Gemini/GPT when sales history is sparse but "context" (e.g., holiday season) is known.

### 2. Node.js Function
```javascript
const forecastDemand = (salesHistory, horizonDays = 7) => {
  const alpha = 0.2; // Smoothing factor
  let forecast = salesHistory[0] || 0; // Initialize
  
  // Train on history
  salesHistory.forEach(actual => {
    forecast = alpha * actual + (1 - alpha) * forecast;
  });

  // Project future
  const predictions = [];
  for (let i = 1; i <= horizonDays; i++) {
    predictions.push({
      day: i,
      value: Math.round(forecast)
    });
  }
  return predictions;
};
```

### 3. LLM Prompt Structure
> "Act as a retail demand planner. I have a product 'Blue Party Cups'.
> Sales last 30 days: [10, 12, 0, 5, ...].
> Context: Upcoming holiday 'Eid' in 5 days.
> Task: Predict sales for next 7 days.
> Output JSON: { 'forecast': [ { 'day': 1, 'qty': 15 }, ... ] }"

---

## C — WhatsApp Actionable Commands

### 1. Templates (Twilio)

**Template: Purchase Order Approval**
*   **English:**
    > 📦 **PO Approval Request**
    > PO #{{po_id}} for {{supplier_name}}
    > Items: {{item_count}} | Cost: {{total_cost}} EGP
    >
    > Reply with:
    > **APPROVE {{po_id}}** to confirm.
    > **CANCEL {{po_id}}** to discard.
    >
    > Or click: {{action_link}}
*   **Arabic:**
    > 📦 **طلب موافقة شراء**
    > طلب رقم #{{po_id}} للمورد {{supplier_name}}
    > عدد الأصناف: {{item_count}} | التكلفة: {{total_cost}} ج.م
    >
    > للرد:
    > أرسل **APPROVE {{po_id}}** للموافقة.
    > أرسل **CANCEL {{po_id}}** للإلغاء.
    >
    > أو اضغط: {{action_link}}

### 2. Security (HMAC Signing)
Links sent via WhatsApp must be signed to prevent unauthorized access.
```javascript
const crypto = require('crypto');
const signLink = (poId) => {
  const expires = Date.now() + (30 * 60 * 1000); // 30 mins
  const data = `${poId}:${expires}`;
  const signature = crypto.createHmac('sha256', process.env.SECRET).update(data).digest('hex');
  return `https://admin.hamesspack.com/approve/${poId}?expires=${expires}&sig=${signature}`;
};
```

### 3. Webhook Handler (Twilio Reply)
```javascript
// POST /webhooks/twilio
app.post('/webhooks/twilio', async (req, res) => {
  const { Body, From } = req.body;
  const message = Body.trim().toUpperCase();
  
  // Parse Command: "APPROVE 105"
  if (message.startsWith('APPROVE')) {
    const poId = message.split(' ')[1];
    
    // 1. Validate Admin
    if (!isAdminPhone(From)) return res.send("Unauthorized");

    // 2. Execute Action
    await db.query("UPDATE purchase_orders SET status='SENT' WHERE id=$1", [poId]);
    
    // 3. Reply
    const twiml = new MessagingResponse();
    twiml.message(`✅ PO #${poId} approved and sent to supplier.`);
    res.type('text/xml').send(twiml.toString());
  }
});
```

---

## E — Tests & Monitoring

### Test Cases (Jest)
1.  `should trigger reorder when stock (4) < reorder_point (10)` -> Expect: **True**
2.  `should NOT trigger reorder when stock (20) > reorder_point (10)` -> Expect: **False**
3.  `webhook should reject non-admin phone numbers` -> Expect: **403 Forbidden**
4.  `forecast should flatline if history is constant` -> Expect: **Variance ~0**

### Monitoring
1.  **Dead Letter Queue:** If Twilio fails to send alert, push to Redis queue for retry.
2.  **Audit Log:** Table `admin_actions` tracks who approved POs (WhatsApp vs Dashboard).
