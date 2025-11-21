
# Hamess Pack AI Assistant Blueprint

This document contains the complete implementation guide for the backend logic, WhatsApp integration, and database schema for the Hamess Pack Intelligent Assistant.

## 1. WhatsApp Alerts System (Twilio)

### Admin Configuration
```json
[
  { "name": "Walid El Sheikh", "phone": "whatsapp:+201066665153", "role": "SUPER_ADMIN", "lang": "ar" },
  { "name": "Mahmoud Shehada", "phone": "whatsapp:+201010340487", "role": "SUPER_ADMIN", "lang": "en" }
]
```

### Message Templates

#### Template A: Critical Stock Alert (Urgent)
**Trigger:** Stock ≤ 5 OR Days Remaining ≤ 2.
**English:**
> 🚨 *URGENT STOCK ALERT: Hamess Pack*
>
> Product: **{{product_name}}**
> Current Stock: {{current_stock}} units
> Sales Velocity: {{velocity}} units/day
>
> ⚠️ Estimated stockout in **{{hours_remaining}} hours**.
> 👉 Recommended Reorder: {{reorder_qty}} units immediately.

**Arabic:**
> 🚨 *تنبيه مخزون حرج: هاميس باك*
>
> المنتج: **{{product_name}}**
> المخزون الحالي: {{current_stock}} قطعة
> معدل البيع: {{velocity}} قطعة/يوم
>
> ⚠️ سينفذ المخزون خلال **{{hours_remaining}} ساعة**.
> 👉 الكمية المقترحة للطلب: {{reorder_qty}} قطعة فوراً.

#### Template B: Dead Stock Opportunity (Warning)
**Trigger:** Days Remaining > 90 AND Stock > 20.
**English:**
> 📉 *Optimization Opportunity*
>
> We noticed **{{product_name}}** is moving slowly.
> Current coverage: {{days_coverage}} days.
>
> 💡 **AI Suggestion:** Apply a **20% Discount** to improve cash flow.
> Projected Revenue unlock: {{projected_revenue}} EGP.

**Arabic:**
> 📉 *فرصة لتحسين المبيعات*
>
> لاحظنا أن حركة بيع **{{product_name}}** بطيئة جداً.
> المخزون يكفي لـ {{days_coverage}} يوم.
>
> 💡 **اقتراح الذكاء الاصطناعي:** تطبيق خصم **20%** لتسييل المخزون.
> العائد المتوقع: {{projected_revenue}} جنيه.

---

## 2. Database Schema (PostgreSQL)

```sql
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    stock INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE sales_velocity (
    product_id VARCHAR(50) PRIMARY KEY REFERENCES products(id),
    velocity_7d DECIMAL(10,2),
    velocity_30d DECIMAL(10,2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(id),
    type VARCHAR(20) CHECK (type IN ('URGENT', 'WARNING', 'OPPORTUNITY')),
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Node.js Logic (Backend Implementation)

### `monitorStock.js` (Cron Job)

```javascript
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const ADMINS = [
    { phone: 'whatsapp:+201066665153', lang: 'ar' },
    { phone: 'whatsapp:+201010340487', lang: 'en' }
];

async function checkStockLevels() {
    const products = await getProductsWithVelocity(); // Custom DB query

    for (const p of products) {
        const daysRemaining = p.stock / p.velocity_30d;
        
        if (p.stock <= 5 || daysRemaining < 2) {
            // URGENT ALERT
            await sendAlert(p, 'URGENT', daysRemaining);
        } else if (daysRemaining > 90 && p.stock > 20) {
            // OPPORTUNITY ALERT
            await sendAlert(p, 'OPPORTUNITY', daysRemaining);
        }
    }
}

async function sendAlert(product, type, days) {
    for (const admin of ADMINS) {
        let body = "";
        
        if (type === 'URGENT') {
             if (admin.lang === 'ar') {
                 body = `🚨 *تنبيه مخزون حرج*\nالمنتج: ${product.name}\nالمتبقي: ${product.stock}\nسينفذ خلال: ${(days*24).toFixed(0)} ساعة`;
             } else {
                 body = `🚨 *URGENT STOCK*\nProduct: ${product.name}\nLeft: ${product.stock}\nEmpty in: ${(days*24).toFixed(0)} hours`;
             }
        }
        
        await client.messages.create({
            from: 'whatsapp:+14155238886',
            to: admin.phone,
            body: body
        });
    }
}
```

---

## 4. Mobile Summary JSON

Compact JSON structure designed for mobile push notifications.

```json
{
  "summary": {
    "urgent_count": 3,
    "opportunity_count": 2,
    "top_urgent": [
      { "id": "p1", "name": "Blue Cups", "left": 4, "status": "CRITICAL" },
      { "id": "p5", "name": "Gold Candle", "left": 2, "status": "EMPTY_SOON" }
    ]
  }
}
```
