
import { Product, AIChatResponse, Category } from '../types';

interface AIContext {
  lastProductId?: string;
  lastActionType?: string;
}

// Heuristic to detect Arabic input
const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

// Main AI Processing Function
export const processUserMessage = (
  message: string, 
  products: Product[], 
  context: AIContext
): AIChatResponse => {
  const lowerMsg = message.toLowerCase();
  const isAr = isArabic(message);
  
  // 1. Safety Lock: Check for destructive intent
  if (lowerMsg.match(/delete|remove|destroy|wipe|drop/) && (lowerMsg.includes('user') || lowerMsg.includes('all') || lowerMsg.includes('database') || lowerMsg.includes('product'))) {
     // Exception for "remove product 123" if specifically targeting one, usually implies deleting a product, which might be safe via UI but dangerous via bulk chat.
     // But requirements say "Remove product 123" should fail/notify admin.
     return {
       human_en: "I cannot perform destructive actions like deleting users or products via chat. Please use the Settings or Product panel for critical management.",
       human_ar: "لا يمكنني تنفيذ إجراءات حذف للمستخدمين أو المنتجات عبر المحادثة. يرجى استخدام لوحة الإعدادات.",
       action_payload: {
           action_type: 'notify_admin',
           params: {
               target_admin: 'System Admin',
               message: 'Attempted destructive action blocked.'
           }
       }, // Returning a harmless payload or null as per spec (null preferred for no-op)
       confidence: 1.0,
       explanation: "Safety Lock Triggered: Destructive keywords detected."
     };
  }

  // 2. Entity Extraction (Product Resolution)
  let targetProduct: Product | undefined;
  
  // Try to find product by name in message
  targetProduct = products.find(p => lowerMsg.includes(p.name.toLowerCase()));
  
  // If not found, check for ID directly
  if (!targetProduct) {
      const idMatch = lowerMsg.match(/\b(prod_\w+|[0-9]{1,5})\b/); // Matches "prod_123" or just "123"
      if (idMatch) {
          targetProduct = products.find(p => p.id === idMatch[0] || p.id.includes(idMatch[0]));
      }
  }

  // If still not found, check context (Anaphora Resolution: "it", "that product")
  if (!targetProduct && context.lastProductId) {
    if (lowerMsg.includes('it') || lowerMsg.includes('that') || lowerMsg.includes('this') || lowerMsg.includes('المنتج') || lowerMsg.includes('هذا')) {
      targetProduct = products.find(p => p.id === context.lastProductId);
    }
  }

  // Hallucination Check: If user is specifically asking about a product ID/Name that wasn't found
  const specificProductRequest = lowerMsg.includes('product') || lowerMsg.includes('item') || lowerMsg.match(/id \d+/);
  if (specificProductRequest && !targetProduct && !lowerMsg.includes('promotion') && !lowerMsg.includes('sale')) {
       return {
           human_en: "I couldn't find the product you are referring to. Could you check the ID or name?",
           human_ar: "لم أتمكن من العثور على المنتج الذي تشير إليه. هل يمكنك التحقق من المعرف أو الاسم؟",
           action_payload: null,
           confidence: 0.4,
           explanation: "Product entity not resolved."
       };
  }

  // 3. Intent Recognition & Response Generation

  // Intent: NOTIFY ADMIN (WhatsApp)
  if (lowerMsg.includes('notify') || lowerMsg.includes('message') || lowerMsg.includes('tell') || lowerMsg.includes('whatsapp') || lowerMsg.includes('رسالة') || lowerMsg.includes('تنبيه')) {
      const adminName = lowerMsg.includes('walid') || lowerMsg.includes('وليد') ? 'Walid El Sheikh' : 'Mahmoud Shehada';
      return {
        human_en: `I have prepared a WhatsApp alert for ${adminName} regarding the stock status.`,
        human_ar: `قمت بتجهيز رسالة واتساب لـ ${adminName} بخصوص حالة المخزون.`,
        action_payload: {
          action_type: 'notify_admin',
          params: {
             target_admin: adminName,
             channel: 'whatsapp',
             template_id: isAr ? 'stock_alert_ar' : 'stock_alert_en',
             message_preview: targetProduct 
                ? `Alert: ${targetProduct.name} is low on stock (${targetProduct.stock}).` 
                : "General Alert: Please check the dashboard."
          }
        },
        confidence: 0.95,
        explanation: "Detected notification intent. Mapped to closest admin."
      };
  }

  // Intent: CHANGE PRICE / DISCOUNT
  if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('discount') || lowerMsg.includes('sale') || lowerMsg.includes('سعر') || lowerMsg.includes('خصم')) {
    
    // Check if it's a query or an action
    const isAction = lowerMsg.includes('change') || lowerMsg.includes('update') || lowerMsg.includes('set') || lowerMsg.includes('make') || lowerMsg.includes('apply') || lowerMsg.includes('تغيير') || lowerMsg.includes('تحديث') || lowerMsg.includes('عمل') || lowerMsg.includes('تطبيق');
    
    if (isAction && targetProduct) {
       // Extract numbers
       const numbers = lowerMsg.match(/\d+/g);
       let value = numbers ? parseInt(numbers[0]) : 0;
       
       // Heuristic: If value is small (< 90) and keyword is 'discount'/'off', calculate new price
       let newPrice = value;
       if (lowerMsg.includes('discount') || lowerMsg.includes('off') || lowerMsg.includes('%') || lowerMsg.includes('خصم')) {
           if (value < 100) { // assume percentage
               newPrice = Math.round(targetProduct.price * (1 - (value / 100)));
           }
       }

       return {
         human_en: `I can update the price of '${targetProduct.name}' to ${newPrice} EGP. Shall I proceed?`,
         human_ar: `يمكنني تحديث سعر '${targetProduct.name}' إلى ${newPrice} جنيه. هل تريد المتابعة؟`,
         action_payload: {
           action_type: 'change_price',
           params: {
             product_id: targetProduct.id,
             product_name: targetProduct.name,
             old_price: targetProduct.price,
             new_price: newPrice,
             reason: "User requested via chat"
           }
         },
         confidence: 0.9,
         explanation: "Action intent 'Update Price' detected. Extracted value and target."
       };
    } else if (targetProduct) {
       // Just a query
       return {
         human_en: `'${targetProduct.name}' is currently priced at ${targetProduct.price} EGP. Cost: ${targetProduct.costPrice || 0} EGP.`,
         human_ar: `سعر '${targetProduct.name}' الحالي هو ${targetProduct.price} جنيه. التكلفة: ${targetProduct.costPrice || 0} جنيه.`,
         action_payload: null,
         confidence: 1.0,
         explanation: "Stock/Price query resolved from database."
       };
    }
  }

  // Intent: RESTOCK / PO
  if (lowerMsg.includes('order') || lowerMsg.includes('restock') || lowerMsg.includes('buy') || lowerMsg.includes('po') || lowerMsg.includes('طلب') || lowerMsg.includes('شراء')) {
     if (targetProduct) {
       return {
         human_en: `I've drafted a Purchase Order for '${targetProduct.name}'.`,
         human_ar: `قمت بتجهيز طلب شراء لـ '${targetProduct.name}'.`,
         action_payload: {
           action_type: 'create_po',
           params: {
             product_id: targetProduct.id,
             product_name: targetProduct.name,
             supplier_id: 'sup_default',
             quantity: 100, // Default
             estimated_cost: (targetProduct.costPrice || 0) * 100
           }
         },
         confidence: 0.85,
         explanation: "Restock intent detected."
       };
     }
  }

  // Intent: STOCK QUERY (How many?)
  if (lowerMsg.includes('how many') || lowerMsg.includes('stock') || lowerMsg.includes('left') || lowerMsg.includes('مخزون') || lowerMsg.includes('كم')) {
     if (targetProduct) {
       return {
         human_en: `We have ${targetProduct.stock} units of '${targetProduct.name}'.`,
         human_ar: `لدينا ${targetProduct.stock} قطعة من '${targetProduct.name}'.`,
         action_payload: null,
         confidence: 1.0,
         explanation: "Stock query resolved."
       };
     }
  }

  // Intent: PROMOTION (Category Wide)
  if (lowerMsg.includes('promotion') || lowerMsg.includes('flash sale') || lowerMsg.includes('weekend') || lowerMsg.includes('عرض')) {
      return {
        human_en: "I've drafted a 20% Flash Sale for Party Supplies.",
        human_ar: "قمت بتجهيز عرض خصم 20% على مستلزمات الحفلات.",
        action_payload: {
          action_type: 'create_promotion',
          params: {
            code: 'FLASH20',
            category: 'Party Supplies',
            discount_percent: 20,
            duration_hours: 48,
            expected_uplift_percent: 15
          }
        },
        confidence: 0.8,
        explanation: "Promotion intent detected."
      };
  }

  // Fallback / Unknown
  return {
    human_en: "I'm not sure which product or action you're referring to. Could you specify the product name?",
    human_ar: "لست متأكداً من المنتج أو الإجراء المطلوب. هل يمكنك تحديد اسم المنتج؟",
    action_payload: null,
    confidence: 0.4,
    explanation: "Low confidence. No entity or intent matched."
  };
};
