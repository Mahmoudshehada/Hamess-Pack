
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, X, Trash2, MessageCircle, User, CheckCircle, XCircle, Loader, Box, AlertTriangle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AIChatMessage, AIActionPayload } from '../types';
import { processUserMessage } from '../utils/ai';

export const FloatingAssistant: React.FC = () => {
  const { products, updateProduct, addNotification, user } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message based on role
  useEffect(() => {
    if (messages.length === 0 && user) {
        const welcomeEn = user.role === 'admin' 
            ? "Hello Admin! I'm ready to help with pricing, stock forecasting, and alerts."
            : "Hi! I'm here to help you find products, check stock, or suggest replacements.";
        const welcomeAr = user.role === 'admin'
            ? "مرحباً أيها المدير! أنا جاهز للمساعدة في التسعير وتوقعات المخزون والتنبيهات."
            : "مرحباً! أنا هنا لمساعدتك في العثور على المنتجات أو التحقق من المخزون أو اقتراح البدائل.";
            
        setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: user.language === 'ar' ? welcomeAr : welcomeEn,
            timestamp: Date.now(),
            payload: null
        }]);
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isThinking, isOpen]);

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
      const lastPayloadMsg = [...messages].reverse().find(m => m.payload && m.payload.params && m.payload.params.product_id);
      const context = {
        lastProductId: lastPayloadMsg?.payload?.params.product_id,
        userRole: user?.role || 'staff'
      };

      const response = processUserMessage(userMsg.content, products, context);
      
      const isArabicInput = /[\u0600-\u06FF]/.test(userMsg.content);
      const content = isArabicInput ? response.human_ar : response.human_en;

      const aiMsg: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: content,
        payload: response.action_payload,
        timestamp: Date.now(),
        status: response.action_payload ? 'pending_action' : undefined,
        relatedProduct: response.relatedProduct
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
    }, 1000);
  };

  const handleExecuteAction = async (messageId: string, payload: AIActionPayload) => {
    if (!payload) return;
    
    if (user?.role === 'staff') {
       addNotification('Staff cannot execute system changes.', 'error');
       setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'cancelled' } : m));
       return;
    }

    try {
      switch (payload.action_type) {
        case 'change_price':
          const p = products.find(prod => prod.id === payload.params.product_id);
          if (p) {
            await updateProduct({ ...p, price: payload.params.new_price });
            addNotification(`Price updated for ${p.name}`, 'success');
          }
          break;
        case 'notify_admin':
          addNotification(`WhatsApp sent to ${payload.params.target_admin}`, 'success');
          break;
        case 'create_po':
           addNotification(`PO Created for ${payload.params.product_name}`, 'success');
           break;
        case 'create_promotion':
           addNotification(`Promotion ${payload.params.code} created`, 'success');
           break;
      }

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

  // Role-based quick actions
  const adminChips = [
       { label: '📉 Dead Stock', prompt: 'Identify items with 0 sales in 90 days.' },
       { label: '📦 Restock', prompt: 'Check items with stock <= 5.' },
       { label: '📢 Notify', prompt: 'Send a WhatsApp summary to Walid.' },
       { label: '💲 Pricing', prompt: 'Analyze margins.' }
  ];
  
  const staffChips = [
       { label: '🔍 Find Product', prompt: 'Where is the...' },
       { label: '📦 Check Stock', prompt: 'How many left of...' },
       { label: '🔄 Alternatives', prompt: 'Suggest replacements for...' },
       { label: '❓ Workflow', prompt: 'How do I prepare an order?' }
  ];

  const activeChips = user?.role === 'admin' ? adminChips : staffChips;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 ${
            isOpen ? 'opacity-0 pointer-events-none scale-0' : 'opacity-100 scale-100 bg-gradient-to-tr from-brand-600 to-accent-500 text-white'
        }`}
      >
        <Sparkles size={28} fill="white" className="animate-pulse" />
      </button>

      {/* Slide-over Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[450px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-16 bg-gradient-to-r from-brand-600 to-accent-500 flex items-center justify-between px-4 shadow-md shrink-0">
            <div className="flex items-center gap-3 text-white">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Bot size={20} />
                </div>
                <div>
                    <h3 className="font-bold leading-none">Hamess AI</h3>
                    <p className="text-[10px] text-brand-100 opacity-90">{user?.role === 'admin' ? 'Admin Mode' : 'Staff Assistant'}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => setMessages([])} 
                    className="p-2 hover:bg-white/10 rounded-full text-white/80 transition"
                    title="Clear Chat"
                >
                    <Trash2 size={18} />
                </button>
                <button 
                    onClick={() => setIsOpen(false)} 
                    className="p-2 hover:bg-white/10 rounded-full text-white transition"
                >
                    <X size={20} />
                </button>
            </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        
                        {/* Message Bubble */}
                        <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm relative ${
                            msg.role === 'user' 
                                ? 'bg-brand-600 text-white rounded-tr-sm' 
                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                        }`}>
                            {msg.content}
                        </div>

                        {/* Product Thumbnail (Context) */}
                        {msg.relatedProduct && (
                            <div className="mt-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 w-full">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                    <img src={msg.relatedProduct.image} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-900 truncate">{msg.relatedProduct.name}</p>
                                    <p className="text-xs text-gray-500">{msg.relatedProduct.stock} in stock • {msg.relatedProduct.price} EGP</p>
                                </div>
                            </div>
                        )}

                        {/* Action Card (Admin Only usually, or read-only for staff) */}
                        {msg.payload && (
                            <div className={`mt-2 w-full bg-white rounded-xl border shadow-md overflow-hidden transition-all ${
                                msg.status === 'executed' ? 'border-green-200' : 
                                msg.status === 'cancelled' ? 'border-gray-200 opacity-60' : 'border-brand-100'
                            }`}>
                                <div className={`px-3 py-2 border-b flex justify-between items-center ${
                                    msg.status === 'executed' ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'
                                }`}>
                                    <span className="text-[10px] font-bold text-gray-600 uppercase">
                                        {msg.payload.action_type.replace('_', ' ')}
                                    </span>
                                    {msg.status === 'executed' && <CheckCircle size={12} className="text-green-600" />}
                                    {msg.status === 'cancelled' && <XCircle size={12} className="text-gray-400" />}
                                </div>
                                <div className="p-3">
                                    {msg.payload.action_type === 'change_price' && (
                                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mb-2">
                                            <div className="text-center">
                                                <div className="text-[10px] text-gray-400">OLD</div>
                                                <div className="text-sm text-gray-500 line-through">{msg.payload.params.old_price}</div>
                                            </div>
                                            <div className="text-gray-300">→</div>
                                            <div className="text-center">
                                                <div className="text-[10px] text-gray-400">NEW</div>
                                                <div className="font-bold text-brand-600">{msg.payload.params.new_price}</div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Staff cannot confirm */}
                                    {msg.status === 'pending_action' && user?.role !== 'staff' ? (
                                        <div className="flex gap-2 mt-2">
                                            <button 
                                                onClick={() => handleExecuteAction(msg.id, msg.payload!)}
                                                className="flex-1 bg-brand-600 text-white py-1.5 rounded text-xs font-bold hover:bg-brand-700"
                                            >
                                                Confirm
                                            </button>
                                            <button 
                                                onClick={() => handleCancelAction(msg.id)}
                                                className="px-3 bg-gray-100 text-gray-600 py-1.5 rounded text-xs font-bold hover:bg-gray-200"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : msg.status === 'pending_action' ? (
                                         <div className="mt-2 text-[10px] text-orange-600 flex items-center gap-1 bg-orange-50 p-1 rounded">
                                             <AlertTriangle size={10} /> Admin permission required.
                                         </div>
                                    ) : null}
                                </div>
                            </div>
                        )}
                        
                        <span className="text-[9px] text-gray-400 mt-1 self-end">
                            {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                </div>
            ))}
            
            {isThinking && (
                <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 px-3 py-2 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
                        <Loader size={14} className="animate-spin text-brand-600" />
                        <span className="text-xs text-gray-500">Thinking...</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Footer / Input */}
        <div className="bg-white border-t border-gray-100 p-3 shrink-0">
            {/* Chips */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
                {activeChips.map((chip, i) => (
                    <button 
                        key={i}
                        onClick={() => handleSendMessage(undefined, chip.prompt)}
                        className="text-[10px] bg-brand-50 text-brand-700 border border-brand-100 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-brand-100 transition"
                    >
                        {chip.label}
                    </button>
                ))}
            </div>

            <form onSubmit={(e) => handleSendMessage(e)} className="relative">
                <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask something..."
                    className="w-full pl-4 pr-12 py-3 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
                <button 
                    type="submit"
                    disabled={!inputText.trim() || isThinking}
                    className="absolute right-2 top-1.5 p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
      </div>
    </>
  );
};
