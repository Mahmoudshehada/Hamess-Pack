# Hamess Pack System Architecture & Intelligent Assistant Design
# تصميم بنية النظام والمساعد الذكي لـ هاميس باك

---

## 1. Executive Summary / ملخص تنفيذي

**English:**
This document serves as the architectural blueprint for the Hamess Pack "Smart Admin" system. It addresses critical infrastructure limitations (data loss, image storage) and defines the logic for an AI-driven assistant that manages stock, pricing, and alerts.

**Arabic:**
تعد هذه الوثيقة المخطط الهندسي لنظام "الإدارة الذكية" في هاميس باك. وهي تعالج مشاكل البنية التحتية الحرجة (فقدان البيانات، تخزين الصور) وتحدد منطق عمل المساعد الذكي الذي يدير المخزون، التسعير، والتنبيهات.

---

## 2. Data Persistence & Storage Solution (The Fix)
## حل مشاكل حفظ البيانات وتخزين الصور

### The Problem / المشكلة
Currently, the application likely uses **LocalStorage** for saving data.
*   **Limitation:** LocalStorage is limited to ~5MB per browser.
*   **Symptom 1:** "Newly added products disappear" → The quota is full; the browser rejects new data.
*   **Symptom 2:** "Images do not show" → Converting images to Base64 strings increases their size by 33%. A few high-quality images fill the storage immediately.
*   **Symptom 3:** "Large product lists overwrite" → When the limit is reached, writes become unstable or fail silently.

### The Solution / الحل المقترح

#### A. Move to IndexedDB (Frontend Solution)
For a robust offline-capable web app that holds 3000+ products, we must migrate from LocalStorage to **IndexedDB**.
*   **Capacity:** Supports up to 80% of disk space (Gigabytes, not Megabytes).
*   **Performance:** Asynchronous reading/writing (doesn't freeze the app).
*   **Structure:** Can store distinct "Tables" (Stores) for Products, Images, and Orders.

#### B. Image Storage Strategy / استراتيجية تخزين الصور
Storing images as "Text" (Base64) inside the database is the root cause of slowness and crashes.
1.  **Method:** Images must be stored as **Blobs** (Binary Large Objects) directly in IndexedDB (Separate 'Images' Store).
2.  **Optimization:** Images must be compressed *before* saving (Max 800x800px, JPEG format, 70% quality).
3.  **Reference:** The Product database entry should only contain an `imageId` string, not the image data itself. The app will load the image only when needed.

---

## 3. Intelligent Conversational Assistant
## المساعد الذكي للمحادثة

### Core Capabilities / القدرات الأساسية
The assistant acts as a specialized chatbot embedded in the Admin Dashboard.

**1. Data Retrieval / استرجاع البيانات**
*   **Admin:** "How much stock of Blue Cups do we have?"
*   **AI:** "We have 120 units. Based on sales, this will last 14 days."

**2. Decision Support / دعم القرار**
*   **Admin:** "Should I do a discount on Candles?"
*   **AI:** "Yes. 'Gold Candle' has not sold in 45 days. I recommend a 15% discount bundle to clear stock."

### Interaction Logic / منطق التفاعل
1.  **Input Processing:** The AI detects keywords (Stock, Price, Offer, Product Name).
2.  **Context Lookup:** It queries the internal database for current stats (Velocity, Qty).
3.  **Reasoning:** It applies the "Business Rules" (defined below).
4.  **Response:** Generates a bilingual response with an actionable suggestion.

---

## 4. Smart Stock Monitoring & Alerts
## مراقبة المخزون الذكية والتنبيهات

The system runs a background check every time the dashboard loads or an order is placed.

### Logic & Thresholds / المنطق والحدود

| Status | Criteria (English) | Criteria (Arabic) | Action |
| :--- | :--- | :--- | :--- |
| **Critical / حرج** | Stock ≤ 5 units OR Time Left < 2 days | المخزون ≤ 5 أو يكفي أقل من يومين | **Immediate WhatsApp Alert** |
| **Low / منخفض** | Stock ≤ 20 units OR Time Left < 7 days | المخزون ≤ 20 أو يكفي أقل من أسبوع | Dashboard Warning (Yellow) |
| **Dead / راكد** | No sales in 90 days AND Stock > 50 | لا مبيعات منذ 90 يوم والمخزون > 50 | Suggest Promotion |

### Alert Calculation Formula / معادلة حساب التنبيه
$$ \text{Days Left} = \frac{\text{Current Stock}}{\text{Avg Daily Sales (Last 30 Days)}} $$

---

## 5. WhatsApp Notification System
## نظام إشعارات واتساب

The system sends alerts to **Walid El Sheikh** and **Mahmoud Shehada**.

### Rules / القواعد
1.  **Frequency:** Max 1 alert per product per 24 hours (to avoid spam).
2.  **Timing:** Send alerts at 10:00 AM and 6:00 PM (Batching), unless "Critical" (Instant).
3.  **Language:** Send in English to Mahmoud, Arabic to Walid.

### Templates / النماذج

#### A. Critical Stock Alert (Arabic)
```text
🔴 *تنبيه هام: هاميس باك*
المنتج: {{product_name}}
المتبقي: {{qty}} قطعة فقط!
الاستهلاك المتوقع: سينفذ خلال {{hours}} ساعة.
👉 *الإجراء المطلوب:* إعادة الطلب فوراً (الكمية المقترحة: {{reorder_qty}}).
```

#### B. Critical Stock Alert (English)
```text
🔴 *URGENT: Hamess Pack*
Item: {{product_name}}
Stock: {{qty}} units left!
Forecast: Out of stock in {{hours}} hours.
👉 *Action:* Reorder immediately (Rec. Qty: {{reorder_qty}}).
```

#### C. Dead Stock Opportunity (Arabic)
```text
💡 *اقتراح ذكي*
المنتج: {{product_name}}
المخزون راكد منذ 90 يوم.
💰 *اقتراح:* عمل خصم 20% لتحرير رأس المال (بقيمة {{value}} جنيه).
```

---

## 6. Implementation Roadmap (For Developers)
## خارطة الطريق للتنفيذ

**Phase 1: Infrastructure Fix (Priority High)**
1.  Replace `localStorage` methods with `idb` (IndexedDB wrapper).
2.  Create separate Object Stores: `products`, `images`, `orders`.
3.  Implement image compression service before storage.
4.  Migration script to move existing data to new DB.

**Phase 2: Monitoring Engine**
1.  Create `StockMonitor` service.
2.  Implement `calculateVelocity()` function.
3.  Set up the Rules Engine for status classification (Critical/Low/Dead).

**Phase 3: AI & Alerts**
1.  Integrate Twilio API for WhatsApp.
2.  Build the "Assistant Chat Interface" in the Admin Panel.
3.  Connect Assistant to `StockMonitor` to answer queries.

---

**End of Design Document**
