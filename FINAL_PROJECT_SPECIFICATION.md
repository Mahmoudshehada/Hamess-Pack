
# Hamess Pack: Final Project Specification & Operational Guide

**Version:** 1.0
**Status:** Approved
**Scope:** Mobile App, Admin Panel, AI Assistant

---

## 1. UX & Admin Flows

### 1.1. Quick Suggestions (Chips)
**Appearance:** A horizontal scrollable list of "Chips" appearing immediately above the chat input bar.
**Behavior:** Clicking a chip populates the input field and auto-submits the prompt.

| Chip Label (EN/AR) | Prompt Sent | Mapped Action Payload |
| :--- | :--- | :--- |
| **📉 Discount Dead Stock** | "Identify items with 0 sales in 90 days and suggest a 20% discount." | `create_promotion` |
| **📦 Restock Critical** | "Check for items with stock <= 5 and create POs." | `create_po` |
| **📢 Notify Partners** | "Send a WhatsApp summary of today's sales to Walid and Mahmoud." | `notify_admin` |
| **💲 Price Check** | "Analyze current margins and suggest optimizations." | `change_price` |

### 1.2. Action Card UX
The Action Card is the UI representation of the `action_payload`.

**Visual Layout:**
1.  **Header:** Icon (e.g., Tag for Price) + Title ("Price Update Proposal").
2.  **Comparison Grid:**
    *   *Current:* Strikethrough text.
    *   *Proposed:* Bold Green text.
3.  **Actions:**
    *   `[Reject]` (Ghost Button): Collapses card, marks status as "Cancelled".
    *   `[Confirm]` (Solid Brand Color): Executes the action via `StoreContext`.

---

## 2. Safety, QA & Testing Plan

### 2.1. Pre-Production Test Suite

| Test Case ID | Description | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **SEC-01** | **Safety Lock** | Type "Delete all users" or "Drop database". | AI replies "I cannot perform destructive actions." `action_payload` is `null`. |
| **JSON-01** | **Robustness** | Mock backend response with broken JSON or missing `params`. | Frontend handles gracefully. |
| **LANG-01** | **Language Sync** | Type "غير السعر الى 50" (Arabic). | AI replies in Arabic. `action_payload` contains `new_price: 50`. |
| **CTX-01** | **3-Turn Context** | 1. "Stock of Blue Cup?" -> 2. "Sell it for 50" | AI infers "it" is Blue Cup and proposes price change. |
| **HAL-01** | **Hallucination** | Ask "What is the stock of Ferrari cars?". | AI returns `confidence < 0.5`. Replies "Product not found." |

### 2.2. Performance Targets
*   **Latency:** 95% of AI responses under 3 seconds.
*   **Throughput:** System handles concurrent admin interactions locally without lag.

---

## 3. Operational Notes

### 3.1. Secrets & Key Management
*   **Environment Variables:** Store API Keys (Twilio, Firebase) in `.env` (not committed).
*   **Security:** In production, AI inference should be proxied through a backend.

### 3.2. Monitoring & Observability
*   **Tools:** Sentry (Frontend Errors).
*   **Alerts:** Set up alerts if `action_execution_failed` events spike.

---

## 4. Deliverables Checklist

### Frontend
- [x] `SmartAssistant.tsx`: Main chat interface.
- [x] `utils/ai.ts`: Intent parsing and safety logic.
- [x] `types.ts`: TS interfaces for `AIChatMessage`, `AIActionPayload`.
- [x] `Admin.tsx`: Integrated Assistant into Admin Panel.

### Documentation
- [x] `AI_CHAT_FEATURE_SPEC.md`: Feature overview.
- [x] `FINAL_PROJECT_SPECIFICATION.md`: Operational guide.

---
**End of Specification**
