# Hamess Pack AI Chat Feature Specification

**Version:** 1.0  
**Status:** Ready for Implementation  
**Type:** Product Requirement Document (PRD)

---

## 1. Overview
The goal is to upgrade the "Smart Assistant" from a static insights dashboard to a fully interactive, conversational chat interface (similar to ChatGPT). The Admin should be able to type natural language queries in English or Arabic and receive instant answers, data analysis, and actionable proposals regarding inventory, sales, and pricing.

---

## 2. User Experience (UX)

### 2.1. Conversational Interface
*   **Location:** The "Smart Assistant" tab in the Admin Panel will be transformed into a full-height chat window.
*   **Interaction:**
    *   **Free Text:** Admin can type "How is stock for blue cups?" or "كم متبقي من الشموع؟".
    *   **Context Awareness:** The AI remembers previous messages. (e.g., Admin asks "How many cups?", AI answers "100". Admin asks "Order more", AI knows "more" refers to cups).
    *   **Bilingual Support:** The AI detects the language of the input and responds in the same language (English or Arabic).

### 2.2. Action Execution Flow (Safety First)
The AI **NEVER** modifies the database directly based on a chat message. It follows a strict 3-step flow:

1.  **Request:** Admin asks "Discount the Luxury Box by 20%".
2.  **Proposal (The "Action Card"):**
    *   The AI replies with text: "I have prepared a 20% discount for 'Luxury Gift Box'. Current Price: 120, New Price: 96."
    *   A visible **Action Card** appears in the chat stream with specific details.
    *   Two buttons appear on the card: `[CONFIRM]` and `[CANCEL]`.
3.  **Execution:**
    *   Only when the Admin clicks `[CONFIRM]`, the system updates the database.
    *   The card updates to show a "Success" state (e.g., green checkmark).

---

## 3. Interface Design Specifications

### 3.1. Layout Components
*   **Chat Container:**
    *   Takes up the full available height of the main content area.
    *   Background: Clean, neutral (e.g., `bg-gray-50`).
*   **Message List (Scrollable Area):**
    *   **Admin Bubbles:** Aligned Right. Color: Brand Purple (`bg-brand-600`), Text: White.
    *   **AI Bubbles:** Aligned Left. Color: White (`bg-white`), Text: Dark Gray, Border: Light Gray. Icon: AI Brain/Sparkles.
    *   **Action Cards:** Embedded within or immediately following an AI bubble. Distinct border/shadow.
*   **Input Area (Fixed Bottom):**
    *   Text input field with placeholder "Ask about stock, sales, or pricing...".
    *   **Send Button:** Icon (Paper plane).
    *   **Mic Button (Optional):** For future speech-to-text integration.
    *   **Typing Indicator:** "Hamess AI is thinking..." animation when processing.

### 3.2. Visual Elements
*   **Timestamps:** Small text below messages (e.g., "10:42 AM").
*   **Quick Actions (Chips):** Suggested queries above the input bar (e.g., "Check Low Stock", "Sales Summary", "Create Coupon").
*   **Markdown Support:** AI responses should support bold text, bullet points, and simple lists for readability.

---

## 4. AI Capabilities & Logic

### 4.1. Knowledge Base
The AI must be "grounded" in Hamess Pack's specific data:
1.  **Live Inventory:** It must have access to read the current `products` array.
2.  **Business Profile:** It must utilize the `Profile (1).pdf` logic (e.g., understanding that "Party Supplies" is a key category, knowing the brand tone).
3.  **Sales History:** It needs access to `orders` to calculate velocity and trends.

### 4.2. Required Behaviors
*   **Stock Queries:**
    *   *Input:* "What is running out?"
    *   *Output:* List items with `stock <= 5`.
*   **Pricing Analysis:**
    *   *Input:* "Is the candle price good?"
    *   *Output:* Compare cost price vs. sell price and sales velocity.
*   **WhatsApp Generation:**
    *   *Input:* "Write a message for Mahmoud about the low stock."
    *   *Output:* Generate the specific WhatsApp template defined in previous specs.
*   **General Assistance:**
    *   Explain how to use the app features (e.g., "How do I add a user?").

---

## 5. Developer Implementation Guide

### 5.1. Frontend Structure (React)

**Components:**
*   `ChatInterface`: Main wrapper, manages connection state.
*   `MessageList`: Renders the list of `messages`. Auto-scrolls to bottom.
*   `MessageBubble`:
    *   Props: `role` ('user' | 'assistant'), `content` (string), `timestamp`.
    *   Logic: Renders markdown text.
*   `ActionCard`:
    *   Props: `actionType`, `payload`, `status` ('pending' | 'confirmed' | 'rejected').
    *   UI: Shows details (Old Price -> New Price). Handles "Confirm" click.
*   `ChatInput`: Controlled input form.

**State Management:**
*   `messages`: Array of objects `{ id, role, content, actionPayload?, timestamp }`.
*   `isTyping`: Boolean.

### 5.2. Backend / API Layer

**Endpoint: `POST /api/chat`**
*   **Headers:** `Authorization: Bearer <admin_token>`
*   **Body:**
    ```json
    {
      "message": "Update the price of the blue cup to 50",
      "history": [...] // Previous few messages for context
    }
    ```
*   **Response:**
    ```json
    {
      "text_en": "I can update the price for 'Cub 2025 (Blue Party Cups)'. Please confirm.",
      "text_ar": "يمكنني تحديث سعر 'أكواب الحفلات الزرقاء'. يرجى التأكيد.",
      "action_payload": {
        "type": "UPDATE_PRODUCT",
        "targetId": "prod-cub-2025",
        "data": { "price": 50 }
      },
      "confidence": 0.98
    }
    ```

**Endpoint: `POST /api/chat/execute`**
*   **Body:** `{ "actionPayload": { ... } }`
*   **Logic:** Actual DB write operation happens here.

### 5.3. System Prompt (LLM Instruction)
*   "You are the Hamess Pack Intelligent Admin Assistant."
*   "You have read-access to the product catalog."
*   "If the user asks to change data, DO NOT change it. Instead, generate an `action_payload` JSON describing the change."
*   "Always reply in the language the user started with, but provide the JSON payload in English."

### 5.4. Security Rules
1.  **Authentication:** Only users with `isAdmin: true` can access the chat endpoint.
2.  **Validation:** The backend must validate the `action_payload` before execution (e.g., ensuring price is not negative).

---

## 6. Action Payload Types
The AI can propose the following actions:

1.  **UPDATE_PRICE**
    *   `targetId`: Product ID
    *   `newPrice`: Number
2.  **UPDATE_STOCK**
    *   `targetId`: Product ID
    *   `addStock`: Number (for restock)
3.  **CREATE_COUPON**
    *   `code`: String
    *   `discount`: Number
4.  **SEND_WHATSAPP**
    *   `phone`: String
    *   `messageBody`: String

---

**End of Specification**
