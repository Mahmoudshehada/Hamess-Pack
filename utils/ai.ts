
import { Product, AIChatResponse, UserRole } from '../types';

interface AIContext {
  lastProductId?: string;
  lastActionType?: string;
  userRole?: UserRole;
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
  const isStaff = context.userRole === 'staff';
  
  // 1. Safety Lock: Check for destructive intent
  if (lowerMsg.match(/delete|remove|destroy|wipe|drop/) && (lowerMsg.includes('user') || lowerMsg.includes('all') || lowerMsg.includes('database') || lowerMsg.includes('product'))) {
     return {
       human_en: "I cannot perform destructive actions like deleting users or products via chat. Please use the Settings or Product panel for critical management.",
       human_ar: "لا يمكنني تنفيذ إجراءات حذف للمستخدمين أو المنتجات عبر المحادثة. يرجى استخدام لوحة الإعدادات.",
       action_payload: {
           action_type: 'notify_admin',
           params: {
               target_admin: 'System Admin',
               message: 'Attempted destructive action blocked.'
           }
       }, 
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

  // 3. STAFF RESTRICTIONS
  // If staff tries to change price or delete
  if (isStaff && (lowerMsg.includes('change price') || lowerMsg.includes('update price') || lowerMsg.includes('promotion') || lowerMsg.includes('discount'))) {
      return {
          human_en: "As a staff member, you don't have permission to change prices directly. I can notify the admin if you see an issue.",
          human_ar: "بصفتك موظفاً، ليس لديك صلاحية تغيير الأسعار مباشرة. يمكنني إبلاغ المسؤول إذا لاحظت مشكلة.",
          action_payload: null,
          confidence: 1.0,
          explanation: "Staff restriction enforcement.",
          relatedProduct: targetProduct
      };
  }

  // 4. Intent Recognition & Response Generation

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
        explanation: "Detected notification intent. Mapped to closest admin.",
        relatedProduct: targetProduct
      };
  }

  // Intent: CHANGE PRICE / DISCOUNT
  if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('discount') || lowerMsg.includes('sale') || lowerMsg.includes('سعر') || lowerMsg.includes('خصم')) {
    
    // Action Logic
    const isAction = lowerMsg.includes('change') || lowerMsg.includes('update') || lowerMsg.includes('set') || lowerMsg.includes('make') || lowerMsg.includes('apply') || lowerMsg.includes('تغيير') || lowerMsg.includes('تحديث') || lowerMsg.includes('عمل') || lowerMsg.includes('تطبيق');
    
    if (isAction && targetProduct) {
       // Extract numbers
       const numbers = lowerMsg.match(/\d+/g);
       let value = numbers ? parseInt(numbers[0]) : 0;
       
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
         explanation: "Action intent 'Update Price' detected. Extracted value and target.",
         relatedProduct: targetProduct
       };
    } else if (targetProduct) {
       // Just a query
       return {
         human_en: `'${targetProduct.name}' is currently priced at ${targetProduct.price} EGP. Cost: ${targetProduct.costPrice || 0} EGP. Stock: ${targetProduct.stock}.`,
         human_ar: `سعر '${targetProduct.name}' الحالي هو ${targetProduct.price} جنيه. التكلفة: ${targetProduct.costPrice || 0} جنيه. المخزون: ${targetProduct.stock}.`,
         action_payload: null,
         confidence: 1.0,
         explanation: "Stock/Price query resolved from database.",
         relatedProduct: targetProduct
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
         explanation: "Restock intent detected.",
         relatedProduct: targetProduct
       };
     }
  }

  // Intent: REPLACEMENT (Staff Helper)
  if (lowerMsg.includes('replacement') || lowerMsg.includes('alternative') || lowerMsg.includes('بديل')) {
     if (targetProduct) {
         const alternatives = products.filter(p => p.category === targetProduct?.category && p.id !== targetProduct.id && p.stock > 0).slice(0, 2);
         const altNames = alternatives.map(p => p.name).join(', ');
         
         return {
            human_en: `If '${targetProduct.name}' is out, try offering: ${altNames || 'No similar items in stock'}.`,
            human_ar: `إذا كان '${targetProduct.name}' غير متوفر، جرب عرض: ${altNames || 'لا توجد بدائل متوفرة'}.`,
            action_payload: null,
            confidence: 0.9,
            explanation: "Replacement suggestions provided.",
            relatedProduct: targetProduct
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
         explanation: "Stock query resolved.",
         relatedProduct: targetProduct
       };
     }
  }

  // Intent: PROMOTION (Category Wide) - Admin Only
  if (!isStaff && (lowerMsg.includes('promotion') || lowerMsg.includes('flash sale') || lowerMsg.includes('weekend') || lowerMsg.includes('عرض'))) {
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
