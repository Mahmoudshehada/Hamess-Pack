# Complete Smart Assistant System Specification
# مواصفات نظام المساعد الذكي الشامل - هاميس باك

**Version:** 1.0
**Status:** Production Ready Specification
**Target Audience:** Backend Developers, Frontend Engineers, System Architects

---

## 1. Executive Overview

The Hamess Pack Smart Assistant is not just a chatbot; it is an integrated intelligence layer that sits on top of the retail inventory. Its primary mandate is to **prevent stockouts**, **optimize pricing**, and **ensure data integrity** for a catalog exceeding 3,000 products.

The system operates on two loops:
1.  **Reactive Loop:** Responds to admin queries (e.g., "Check stock for Blue Cups").
2.  **Proactive Loop:** Monitors data in the background and pushes alerts via WhatsApp without human intervention.

---

## 2. Data Persistence & Scalability Architecture (The Fix)

### 2.1. The Problem: LocalStorage Limitations
The current system relies on `localStorage`, which has a hard limit of **5-10MB** per domain.
*   **Symptoms:** Products disappearing after refresh, images failing to save, partial data writes.
*   **Root Cause:** Storing 3,000 products + Base64 images as a single JSON string exceeds the browser's quota immediately.

### 2.2. The Solution: IndexedDB & Binary Blobs
To support 3,000+ products and high-quality images, the application **MUST** migrate to **IndexedDB**.

#### Architecture:
1.  **Database Name:** `HamessPackDB_v1`
2.  **Object Store 1: `products`**
    *   **Key Path:** `id`
    *   **Content:** JSON Metadata only (Name, Price, Category, Stock).
    *   **Image Handling:** Does NOT store the image data. Stores a reference ID: `imageId`.
3.  **Object Store 2: `images`**
    *   **Key Path:** `id`
    *   **Content:** Binary Blob (File) or highly compressed Base64.
    *   **Indexing:** Indexed by `productId` for fast retrieval.

#### 2.3. Image Optimization Pipeline
To prevent database bloat, all images must pass through a client-side compression pipeline *before* storage:
1.  **Resize:** Max width/height 800px.
2.  **Format:** Convert PNG/WebP to JPEG.
3.  **Quality:** 0.7 (70%).
4.  **Result:** File size should be < 150KB per image.

---

## 3. The Conversational Brain (Logic & Behavior)

The AI Assistant functions as a "Business Analyst." It does not have direct write access to the database. Instead, it follows a strictly defined **Action Proposal Protocol**.

### 3.1. Intent Recognition
The AI must parse natural language inputs into structured intents.

| User Input (Example) | Detected Intent | Required Data Context |
| :--- | :--- | :--- |
| "How many gold candles do we have?" | `QUERY_STOCK` | Search Product(name="gold candle") |
| "Make a discount on the gift boxes." | `PROPOSE_ACTION` | Product("gift box"), SalesHistory |
| "Why are sales down today?" | `ANALYZE_TREND` | OrderHistory(Range="Today" vs "Yesterday") |
| "Create a PO for the missing items." | `DRAFT_PO` | Stock(Level < ReorderPoint) |

### 3.2. Personality & Safety
*   **Tone:** Professional, concise, proactive.
*   **Bilingual:** Must detect input language (Arabic/English) and reply in the same language.
*   **Safety Rule 1:** Never delete data based on a chat command.
*   **Safety Rule 2:** Never execute a financial transaction (PO or Price Change) without an explicit "CONFIRM" click from the admin.

---

## 4. Action Proposal Protocol (JSON API)

When the AI suggests an action (e.g., "Restock" or "Discount"), it must return a structured JSON object. The Frontend renders this object as a UI Card with "Approve" and "Reject" buttons.

### JSON Structure
```json
{
  "proposal_id": "uuid_12345",
  "type": "UPDATE_PRICE",
  "confidence_score": 0.95,
  "display_message": {
    "en": "I recommend lowering the price of 'Luxury Gift Box' by 10% due to slow sales.",
    "ar": "أقترح تخفيض سعر 'صندوق الهدايا الفاخر' بنسبة 10% بسبب ضعف المبيعات."
  },
  "action_payload": {
    "target_resource": "product",
    "resource_id": "prod_999",
    "operation": "update",
    "fields": {
      "price": 108,
      "old_price": 120
    }
  },
  "risk_assessment": "Low risk. Margin remains above 15%."
}
```

---

## 5. Smart Stock Intelligence & WhatsApp Alerts

### 5.1. Monitoring Logic (The Watchdog)
A background process runs every hour to check inventory health.

*   **Velocity Calculation:** $V = \frac{\text{Units Sold (Last 30 Days)}}{30}$
*   **Days of Coverage:** $DOC = \frac{\text{Current Stock}}{V}$

### 5.2. Alert Thresholds

**Level 1: URGENT (Red Alert)**
*   **Trigger:** `Stock <= 5` OR `DOC <= 2 days`.
*   **Action:** Instant WhatsApp Message + Push Notification.

**Level 2: WARNING (Yellow Alert)**
*   **Trigger:** `DOC <= 7 days`.
*   **Action:** Add to "Reorder List" on Dashboard (No WhatsApp interruption).

**Level 3: DEAD STOCK (Blue Alert)**
*   **Trigger:** `Last Sale > 90 days ago` AND `Stock > 20`.
*   **Action:** Suggest Promotion/Discount in Weekly Summary.

### 5.3. WhatsApp Templates

**Template: URGENT STOCK (English)**
> 🚨 **URGENT: Stock Critical**
>
> **Item:** {{product_name}}
> **Left:** {{current_stock}} units
> **Runout:** ~{{hours_remaining}} hours
>
> 👉 **Reply 'ORDER {{reorder_qty}}' to restock now.**

**Template: URGENT STOCK (Arabic)**
> 🚨 **تنبيه عاجل: مخزون حرج**
>
> **المنتج:** {{product_name}}
> **المتبقي:** {{current_stock}} قطعة
> **النفاد المتوقع:** خلال {{hours_remaining}} ساعة
>
> 👉 **رد بكلمة 'طلب {{reorder_qty}}' لإعادة التوريد فوراً.**

---

## 6. Smart Recommendations Logic

### 6.1. Dynamic Pricing Engine
The AI analyzes three factors to suggest prices:
1.  **Velocity:** Is it selling too fast? (Suggest Price Increase +5%)
2.  **Stagnation:** Is it not selling? (Suggest Price Decrease -10% to -20%)
3.  **Competitor/Cost:** Never suggest a price lower than `Cost Price * 1.1` (10% Margin Floor).

### 6.2. Promotion Bundling
If Product A (Cups) sells well, but Product B (Napkins) does not, and they share a category (Party Supplies):
*   **Recommendation:** "Bundle Offer: Buy Cups, Get Napkins 50% Off."
*   **Goal:** Use high-velocity items to drag low-velocity inventory.

---

## 7. Integration Guide for Developers

1.  **Frontend:** Implement `idb-keyval` or raw `IndexedDB` API. Deprecate `localStorage` for product data immediately.
2.  **Backend/Edge:** Set up a cron job (Scheduled Task) for the Stock Watchdog.
3.  **Messaging:** Register Twilio WhatsApp Sandbox for testing.
4.  **AI Model:** Use a structured prompt with "System Instructions" enforcing the *Action Proposal Protocol* JSON format.

---
**End of Specification**
