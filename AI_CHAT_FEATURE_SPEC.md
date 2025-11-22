
# Hamess Pack Admin: Interactive AI Chat & Control Specification

**Version:** 1.0  
**Status:** In Development  
**Scope:** Admin UI (Web/PWA/Mobile)

---

## 1. UX Specification

### A. Floating AI Entry Point
*   **Position:** Fixed bottom-right (z-index: 50), 24px from edges.
*   **Visual:** Circular Floating Action Button (FAB), 56px diameter.
    *   **Icon:** Sparkles (`✨`) or Brain (`🧠`).
    *   **Color:** Brand Gradient (`bg-gradient-to-r from-brand-600 to-accent-500`).
*   **Behavior:**
    *   **Hover/Long Press:** Tooltip "Ask Hamess AI Assistant".
    *   **Click:** Expands into the **Chat Panel**.

### B. Chat Panel Layout
*   **Dimensions:** 
    *   *Desktop:* Sidebar drawer (width: 400px) sliding from right.
    *   *Mobile:* Full-screen modal overlay.
*   **Sections:**
    1.  **Header:** Title "Smart Assistant", Connection Status (Green Dot), "Clear Chat" option.
    2.  **Message Stream:** Scrollable area with User/AI bubbles.
    3.  **Action Cards:** Embedded widgets appearing after AI text bubbles.
    4.  **Quick Suggestions Bar:** Horizontal scrollable list of chips.
    5.  **Input Area:** Text Field, Send Button.

### C. Action Card Design
When `action_payload` is not null, render a card:
*   **Header:** Action Type Icon + Title (e.g., "🏷️ Price Change Proposal").
*   **Body:**
    *   **Summary:** Bilingual explanation.
    *   **Data Grid:** *Before* vs *After* values.
*   **Footer Controls:**
    *   `[Cancel]` (Gray): Dismisses card.
    *   `[Confirm]` (Green): Triggers execution.

---

## 2. Assistant Behavior & Logic

### Core Rules
1.  **ReadOnly by Default:** The AI never writes to the DB directly from the chat processing logic. It constructs a *Proposal Object*.
2.  **Language Agnostic:** Detects input language and replies in the same language.
3.  **Context Window:** Maintains simple context (last discussed product).

### JSON Response Schema
```json
{
  "human_en": "String. English conversational response.",
  "human_ar": "String. Arabic conversational response.",
  "action_payload": {
    "action_type": "create_promotion | change_price | create_po | notify_admin | update_product | none",
    "params": { ... }
  },
  "confidence": 0.95,
  "explanation": "Internal reasoning."
}
```

---

## 3. Quick Suggestions (Pre-defined Prompts)
1.  **"Clear Dead Stock"** -> `create_promotion`
2.  **"Restock Critical Items"** -> `create_po`
3.  **"Notify Walid"** -> `notify_admin`
4.  **"Competitor Match"** -> `change_price`

---

## 4. Data & Audit Safety
*   **Safety Lock:** Input containing "delete", "remove user", "destroy" must be blocked.
*   **Audit:** All confirmed actions should be logged (simulated via notifications for now).

---

## 5. Integration Details
*   **Frontend:** React + Context API.
*   **Logic:** `utils/ai.ts` handles parsing and intent mapping.
*   **State:** Local component state for messages, Context for Products/Actions.

---

## 6. Example Dialogues

### Scenario 1: Stock Check
**User:** "How many blue cups do we have?"
**AI:** "We have 120 units of 'Blue Party Cups'." (Payload: null)

### Scenario 2: Price Change
**User:** "Change the price of the luxury gift box to 150."
**AI:** "I have drafted a price update." 
**Payload:** `{ "action_type": "change_price", "params": { "product_id": "...", "new_price": 150 } }`

### Scenario 3: Destructive Attempt
**User:** "Delete all users."
**AI:** "I cannot perform destructive actions like deleting users." (Payload: null)
