
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, CheckCircle, XCircle, AlertTriangle, Loader, Sparkles, Edit2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AIChatMessage, AIActionPayload } from '../types';
import { processUserMessage } from '../utils/ai';

export const SmartAssistant: React.FC = () => {
  const { products, updateProduct, addNotification, user } = useStore();
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: user?.language === 'ar' 
        ? "مرحباً بك. أنا مساعد هاميس الذكي. كيف يمكنني مساعدتك في المخزون أو الأسعار اليوم؟"
        : "Hello. I am the Hamess Smart Assistant. How can I help you with stock or pricing today?",
      timestamp: Date.now(),
      payload: null
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSendMessage = async (e?: React.FormEvent, textOverride?: string) => {
    e?.preventDefault();
    const text = textOverride || inputText;
    if (!text.trim()) return;

    const userMsg: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    // Simulate AI Processing
    setTimeout(() => {
      // Find context from previous messages (find the last product discussed)
      const lastPayloadMsg = [...messages].reverse().find(m => m.payload && m.payload.params && m.payload.params.product_id);
      const context = {
        lastProductId: lastPayloadMsg?.payload?.params.product_id
      };

      const response = processUserMessage(userMsg.content, products, context);
      
      // Determine language for display based on input
      const isArabicInput = /[\u0600-\u06FF]/.test(userMsg.content);
      const content = isArabicInput ? response.human_ar : response.human_en;

      const aiMsg: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: content,
        payload: response.action_payload,
        timestamp: Date.now(),
        status: response.action_payload ? 'pending_action' : undefined
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
    }, 1200);
  };

  const handleExecuteAction = async (messageId: string, payload: AIActionPayload) => {
    if (!payload) return;

    try {
      switch (payload.action_type) {
        case 'change_price':
          const p = products.find(prod => prod.id === payload.params.product_id);
          if (p) {
            await updateProduct({ ...p, price: payload.params.new_price });
            addNotification(`Price updated for ${p.name}`, 'success');
          } else {
              addNotification('Product not found for update', 'error');
          }
          break;
        case 'notify_admin':
          // Simulation
          addNotification(`WhatsApp sent to ${payload.params.target_admin}`, 'success');
          break;
        case 'create_po':
           addNotification(`PO Created for ${payload.params.product_name}`, 'success');
           break;
        case 'create_promotion':
           addNotification(`Promotion ${payload.params.code} created`, 'success');
           break;
        default:
          break;
      }

      // Update message status
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, status: 'executed' } : m
      ));

    } catch (e) {
      addNotification('Failed to execute action', 'error');
    }
  };

  const handleCancelAction = (messageId: string) => {
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, status: 'cancelled' } : m
      ));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-150px)] md:h-[650px] bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-accent-500 p-4 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-inner">
            <Sparkles size={20} />
            </div>
            <div>
            <h3 className="font-bold text-white text-lg leading-none">Hamess AI</h3>
            <p className="text-[10px] text-brand-100 font-medium flex items-center gap-1 mt-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(74,222,128,0.8)]"></span> Online & Ready
            </p>
            </div>
        </div>
        <button 
            onClick={() => setMessages([])} // Simplified clear
            className="text-white/70 hover:text-white text-xs font-bold hover:underline"
        >
            Clear Chat
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] md:max-w-[75%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Bubble */}
              <div 
                className={`px-5 py-3.5 rounded-2xl text-sm shadow-sm leading-relaxed relative ${
                  msg.role === 'user' 
                    ? 'bg-brand-600 text-white rounded-tr-sm' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>

              {/* Action Card */}
              {msg.payload && msg.role === 'assistant' && (
                <div className={`mt-3 w-full md:w-80 bg-white rounded-xl border shadow-lg overflow-hidden animate-slide-in transition-all ${
                    msg.status === 'executed' ? 'border-green-200 ring-1 ring-green-100' : 
                    msg.status === 'cancelled' ? 'border-gray-200 opacity-70 grayscale' : 'border-brand-100 ring-1 ring-brand-50'
                }`}>
                   {/* Card Header */}
                   <div className={`px-4 py-3 border-b flex justify-between items-center ${
                       msg.status === 'executed' ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'
                   }`}>
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                          {msg.payload.action_type === 'change_price' && '🏷️ Price Update'}
                          {msg.payload.action_type === 'create_po' && '📦 Restock Order'}
                          {msg.payload.action_type === 'notify_admin' && '📢 Notify Admin'}
                          {msg.payload.action_type === 'create_promotion' && '📉 New Promotion'}
                      </span>
                      {msg.status === 'executed' && <span className="text-[10px] font-bold text-green-600 flex items-center gap-1 bg-green-100 px-2 py-0.5 rounded-full"><CheckCircle size={10} /> Done</span>}
                      {msg.status === 'cancelled' && <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1 bg-gray-200 px-2 py-0.5 rounded-full"><XCircle size={10} /> Cancelled</span>}
                   </div>
                   
                   {/* Card Body */}
                   <div className="p-4">
                      {msg.payload.action_type === 'change_price' && (
                        <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg">
                           <div className="text-center">
                               <p className="text-[10px] text-gray-400 uppercase font-bold">Current</p>
                               <p className="text-gray-500 line-through text-sm font-medium">{msg.payload.params.old_price} EGP</p>
                           </div>
                           <div className="text-gray-300 font-light text-2xl">→</div>
                           <div className="text-center">
                               <p className="text-[10px] text-gray-400 uppercase font-bold">Proposed</p>
                               <p className="text-brand-600 font-bold text-xl">{msg.payload.params.new_price} EGP</p>
                           </div>
                        </div>
                      )}
                      
                      <div className="bg-gray-50 rounded-lg p-3 text-[10px] font-mono text-gray-500 mb-4 overflow-x-auto border border-gray-100">
                        {Object.entries(msg.payload.params).map(([key, val]) => (
                            <div key={key} className="flex gap-2">
                                <span className="font-bold text-gray-700">{key}:</span>
                                <span>{String(val)}</span>
                            </div>
                        ))}
                      </div>

                      {/* Actions */}
                      {msg.status === 'pending_action' && (
                        <div className="flex gap-3">
                           <button 
                             onClick={() => handleExecuteAction(msg.id, msg.payload!)}
                             className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg text-xs font-bold transition shadow-md shadow-brand-100 flex items-center justify-center gap-1"
                           >
                             <CheckCircle size={14}/> Confirm
                           </button>
                           <button 
                             onClick={() => handleCancelAction(msg.id)}
                             className="px-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center"
                           >
                             Cancel
                           </button>
                        </div>
                      )}
                   </div>
                </div>
              )}
              
              <span className="text-[10px] text-gray-400 mt-1.5 px-1 opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>
        ))}
        
        {isThinking && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-3 shadow-sm">
               <Loader size={16} className="animate-spin text-brand-600" />
               <span className="text-xs font-medium text-gray-500">Hamess AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      <div className="bg-white border-t border-gray-100 p-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-2">
           {[
               { label: '📉 Discount Dead Stock', prompt: 'Identify items with 0 sales in 90 days and suggest a 20% discount.' },
               { label: '📦 Restock Critical', prompt: 'Check for items with stock <= 5 and create POs.' },
               { label: '📢 Notify Partners', prompt: 'Send a WhatsApp summary to Walid and Mahmoud.' },
               { label: '💲 Price Check', prompt: 'Analyze current margins and suggest optimizations.' }
           ].map((chip, i) => (
             <button 
               key={i}
               type="button"
               onClick={() => handleSendMessage(undefined, chip.prompt)}
               className="text-[10px] bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-100 px-3 py-1.5 rounded-full whitespace-nowrap transition font-medium"
             >
               {chip.label}
             </button>
           ))}
        </div>
      
        {/* Input Area */}
        <form onSubmit={(e) => handleSendMessage(e)} className="p-2 pt-0">
            <div className="relative flex items-center">
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={user?.language === 'ar' ? "اكتب رسالتك هنا..." : "Ask about stock, prices, or sales..."}
                className="w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition shadow-inner text-sm"
            />
            <button 
                type="submit"
                disabled={!inputText.trim() || isThinking}
                className="absolute right-2 top-1.5 bg-brand-600 text-white p-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
            >
                <Send size={18} />
            </button>
            </div>
        </form>
      </div>
    </div>
  );
};
