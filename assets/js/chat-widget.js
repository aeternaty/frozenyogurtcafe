class GetYoChatWidget {
    constructor() {
        this.isOpen = false;
        this.userId = this.getOrCreateUserId();
        this.apiEndpoint = 'https://getyocafe.com/api/chat';
        this.messageHistory = [];
        this.init();
    }

    init() {
        this.injectStyles();
        this.createWidget();
        this.attachEventListeners();
    }

    getOrCreateUserId() {
        let userId = localStorage.getItem('getyo_chat_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('getyo_chat_user_id', userId);
        }
        return userId;
    }

    injectStyles() {
        if (document.getElementById('getyo-chat-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'getyo-chat-styles';
        style.textContent = `
            * { box-sizing: border-box; }
            .getyo-chat-widget { position: fixed !important; bottom: 24px !important; right: 24px !important; z-index: 99999 !important; font-family: 'Poppins', -apple-system, sans-serif; }
            .getyo-chat-button { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #FF8A3D 0%, #FF6B1A 100%); color: white; border: none; cursor: pointer; box-shadow: 0 4px 16px rgba(255, 106, 26, 0.4); display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
            .getyo-chat-button:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(255, 106, 26, 0.5); }
            .getyo-chat-button:active { transform: scale(0.95); }
            .getyo-chat-button svg { width: 28px; height: 28px; transition: transform 0.3s; fill: white; }
            .getyo-chat-icon { display: block; }
            .getyo-chat-close-icon { display: none; }
            .getyo-chat-button.active .getyo-chat-icon { display: none; }
            .getyo-chat-button.active .getyo-chat-close-icon { display: block; }
            
            .getyo-chat-window { position: absolute; bottom: 70px; right: 0; width: 380px; max-width: calc(100vw - 32px); height: 550px; max-height: calc(100vh - 120px); background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); display: none; flex-direction: column; overflow: hidden; animation: slideUp 0.3s ease; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            
            .getyo-chat-header { background: linear-gradient(135deg, #FF8A3D 0%, #FF6B1A 100%); color: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
            .getyo-chat-header-content { display: flex; align-items: center; gap: 12px; }
            .getyo-chat-avatar { width: 42px; height: 42px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); }
            .getyo-chat-avatar svg { width: 24px; height: 24px; fill: white; }
            .getyo-chat-header-info { flex: 1; }
            .getyo-chat-title { font-weight: 600; font-size: 16px; margin-bottom: 2px; }
            .getyo-chat-status { font-size: 12px; display: flex; align-items: center; gap: 6px; opacity: 0.95; }
            .getyo-status-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; animation: pulse 2s infinite; }
            @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.1); } }
            
            .getyo-chat-minimize { background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
            .getyo-chat-minimize:hover { background: rgba(255,255,255,0.3); }
            .getyo-chat-minimize svg { width: 18px; height: 18px; }
            
            .getyo-chat-messages { flex: 1; padding: 20px; overflow-y: auto; background: #f9fafb; }
            .getyo-chat-messages::-webkit-scrollbar { width: 6px; }
            .getyo-chat-messages::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
            
            .getyo-message { margin-bottom: 16px; animation: fadeIn 0.3s ease; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            
            .getyo-message-bot { display: flex; gap: 10px; }
            .getyo-message-bot-avatar { width: 32px; height: 32px; background: linear-gradient(135deg, #FF8A3D, #FF6B1A); border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
            .getyo-message-bot-avatar svg { width: 18px; height: 18px; fill: white; }
            .getyo-message-content { background: white; padding: 12px 16px; border-radius: 12px 12px 12px 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); max-width: 85%; font-size: 14px; line-height: 1.5; color: #374151; }
            .getyo-message-content p { margin: 0 0 8px 0; }
            .getyo-message-content p:last-child { margin-bottom: 0; }
            .getyo-message-content ul { margin: 8px 0; padding-left: 20px; }
            .getyo-message-content li { margin: 4px 0; }
            
            .getyo-message-user { text-align: right; }
            .getyo-message-user-content { display: inline-block; background: linear-gradient(135deg, #FF8A3D, #FF6B1A); color: white; padding: 10px 16px; border-radius: 12px 12px 4px 12px; max-width: 80%; font-size: 14px; line-height: 1.4; box-shadow: 0 2px 8px rgba(255, 106, 26, 0.3); }
            
            .getyo-quick-replies { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
            .getyo-quick-reply { background: white; border: 1.5px solid #e5e7eb; padding: 8px 14px; border-radius: 20px; font-size: 13px; cursor: pointer; transition: all 0.2s; color: #4b5563; font-weight: 500; }
            .getyo-quick-reply:hover { border-color: #FF8A3D; color: #FF8A3D; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(255, 138, 61, 0.2); }
            
            .getyo-typing { display: flex; gap: 4px; padding: 12px 16px; }
            .getyo-typing-dot { width: 8px; height: 8px; background: #9ca3af; border-radius: 50%; animation: typingBounce 1.4s infinite; }
            .getyo-typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .getyo-typing-dot:nth-child(3) { animation-delay: 0.4s; }
            @keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-10px); } }
            
            .getyo-chat-input-wrapper { padding: 16px 20px; background: white; border-top: 1px solid #e5e7eb; }
            .getyo-chat-input-container { display: flex; gap: 10px; align-items: center; }
            .getyo-chat-input { flex: 1; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 24px; font-size: 14px; font-family: inherit; min-width: 0; transition: all 0.2s; }
            .getyo-chat-input:focus { outline: none; border-color: #FF8A3D; box-shadow: 0 0 0 3px rgba(255, 138, 61, 0.1); }
            .getyo-chat-input::placeholder { color: #9ca3af; }
            
            .getyo-chat-send { background: linear-gradient(135deg, #FF8A3D, #FF6B1A); color: white; border: none; width: 44px; height: 44px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; box-shadow: 0 2px 8px rgba(255, 106, 26, 0.3); }
            .getyo-chat-send:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 4px 12px rgba(255, 106, 26, 0.4); }
            .getyo-chat-send:disabled { opacity: 0.5; cursor: not-allowed; }
            .getyo-chat-send svg { width: 20px; height: 20px; }
            
            @media (max-width: 480px) {
                .getyo-chat-widget { bottom: 16px !important; right: 16px !important; }
                .getyo-chat-window { width: calc(100vw - 32px); height: calc(100vh - 100px); bottom: 66px; }
                .getyo-chat-button { width: 52px; height: 52px; }
            }
        `;
        document.head.appendChild(style);
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'getyo-chat-widget';
        widget.innerHTML = `
            <button class="getyo-chat-button" id="getyo-chat-toggle" aria-label="Chat with Get Yo Assistant">
                <svg class="getyo-chat-icon" viewBox="0 0 122.88 119.35">
                    <path d="M57.49,29.2V23.53a14.41,14.41,0,0,1-2-.93A12.18,12.18,0,0,1,50.44,7.5a12.39,12.39,0,0,1,2.64-3.95A12.21,12.21,0,0,1,57,.92,12,12,0,0,1,61.66,0,12.14,12.14,0,0,1,72.88,7.5a12.14,12.14,0,0,1,0,9.27,12.08,12.08,0,0,1-2.64,3.94l-.06.06a12.74,12.74,0,0,1-2.36,1.83,11.26,11.26,0,0,1-2,.93V29.2H94.3a15.47,15.47,0,0,1,15.42,15.43v2.29H115a7.93,7.93,0,0,1,7.9,7.91V73.2A7.93,7.93,0,0,1,115,81.11h-5.25v2.07A15.48,15.48,0,0,1,94.3,98.61H55.23L31.81,118.72a2.58,2.58,0,0,1-3.65-.29,2.63,2.63,0,0,1-.63-1.85l1.25-18h-.21A15.45,15.45,0,0,1,13.16,83.18V81.11H7.91A7.93,7.93,0,0,1,0,73.2V54.83a7.93,7.93,0,0,1,7.9-7.91h5.26v-2.3A15.45,15.45,0,0,1,28.57,29.2H57.49ZM82.74,47.32a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm-42.58,0a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm6.38,31.36a2.28,2.28,0,0,1-.38-.38,2.18,2.18,0,0,1-.52-1.36,2.21,2.21,0,0,1,.46-1.39,2.4,2.4,0,0,1,.39-.39,3.22,3.22,0,0,1,3.88-.08A22.36,22.36,0,0,0,56,78.32a14.86,14.86,0,0,0,5.47,1A16.18,16.18,0,0,0,67,78.22,25.39,25.39,0,0,0,72.75,75a3.24,3.24,0,0,1,3.89.18,3,3,0,0,1,.37.41,2.22,2.22,0,0,1,.42,1.4,2.33,2.33,0,0,1-.58,1.35,2.29,2.29,0,0,1-.43.38,30.59,30.59,0,0,1-7.33,4,22.28,22.28,0,0,1-7.53,1.43A21.22,21.22,0,0,1,54,82.87a27.78,27.78,0,0,1-7.41-4.16l0,0ZM94.29,34.4H28.57A10.26,10.26,0,0,0,18.35,44.63V83.18A10.26,10.26,0,0,0,28.57,93.41h3.17a2.61,2.61,0,0,1,2.41,2.77l-1,14.58L52.45,94.15a2.56,2.56,0,0,1,1.83-.75h40a10.26,10.26,0,0,0,10.22-10.23V44.62A10.24,10.24,0,0,0,94.29,34.4Z"/>
                </svg>
                <svg class="getyo-chat-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            
            <div class="getyo-chat-window" id="getyo-chat-window">
                <div class="getyo-chat-header">
                    <div class="getyo-chat-header-content">
                        <div class="getyo-chat-avatar">
                            <svg viewBox="0 0 122.88 119.35">
                                <path d="M57.49,29.2V23.53a14.41,14.41,0,0,1-2-.93A12.18,12.18,0,0,1,50.44,7.5a12.39,12.39,0,0,1,2.64-3.95A12.21,12.21,0,0,1,57,.92,12,12,0,0,1,61.66,0,12.14,12.14,0,0,1,72.88,7.5a12.14,12.14,0,0,1,0,9.27,12.08,12.08,0,0,1-2.64,3.94l-.06.06a12.74,12.74,0,0,1-2.36,1.83,11.26,11.26,0,0,1-2,.93V29.2H94.3a15.47,15.47,0,0,1,15.42,15.43v2.29H115a7.93,7.93,0,0,1,7.9,7.91V73.2A7.93,7.93,0,0,1,115,81.11h-5.25v2.07A15.48,15.48,0,0,1,94.3,98.61H55.23L31.81,118.72a2.58,2.58,0,0,1-3.65-.29,2.63,2.63,0,0,1-.63-1.85l1.25-18h-.21A15.45,15.45,0,0,1,13.16,83.18V81.11H7.91A7.93,7.93,0,0,1,0,73.2V54.83a7.93,7.93,0,0,1,7.9-7.91h5.26v-2.3A15.45,15.45,0,0,1,28.57,29.2H57.49ZM82.74,47.32a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm-42.58,0a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm6.38,31.36a2.28,2.28,0,0,1-.38-.38,2.18,2.18,0,0,1-.52-1.36,2.21,2.21,0,0,1,.46-1.39,2.4,2.4,0,0,1,.39-.39,3.22,3.22,0,0,1,3.88-.08A22.36,22.36,0,0,0,56,78.32a14.86,14.86,0,0,0,5.47,1A16.18,16.18,0,0,0,67,78.22,25.39,25.39,0,0,0,72.75,75a3.24,3.24,0,0,1,3.89.18,3,3,0,0,1,.37.41,2.22,2.22,0,0,1,.42,1.4,2.33,2.33,0,0,1-.58,1.35,2.29,2.29,0,0,1-.43.38,30.59,30.59,0,0,1-7.33,4,22.28,22.28,0,0,1-7.53,1.43A21.22,21.22,0,0,1,54,82.87a27.78,27.78,0,0,1-7.41-4.16l0,0ZM94.29,34.4H28.57A10.26,10.26,0,0,0,18.35,44.63V83.18A10.26,10.26,0,0,0,28.57,93.41h3.17a2.61,2.61,0,0,1,2.41,2.77l-1,14.58L52.45,94.15a2.56,2.56,0,0,1,1.83-.75h40a10.26,10.26,0,0,0,10.22-10.23V44.62A10.24,10.24,0,0,0,94.29,34.4Z"/>
                            </svg>
                        </div>
                        <div class="getyo-chat-header-info">
                            <div class="getyo-chat-title">Get Yo Assistant</div>
                            <div class="getyo-chat-status">
                                <span class="getyo-status-dot"></span>
                                Online
                            </div>
                        </div>
                    </div>
                    <button class="getyo-chat-minimize" id="getyo-chat-minimize" aria-label="Minimize">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
                
                <div class="getyo-chat-messages" id="getyo-chat-messages">
                    <div class="getyo-message getyo-message-bot">
                        <div class="getyo-message-bot-avatar">
                            <svg viewBox="0 0 122.88 119.35">
                                <path d="M57.49,29.2V23.53a14.41,14.41,0,0,1-2-.93A12.18,12.18,0,0,1,50.44,7.5a12.39,12.39,0,0,1,2.64-3.95A12.21,12.21,0,0,1,57,.92,12,12,0,0,1,61.66,0,12.14,12.14,0,0,1,72.88,7.5a12.14,12.14,0,0,1,0,9.27,12.08,12.08,0,0,1-2.64,3.94l-.06.06a12.74,12.74,0,0,1-2.36,1.83,11.26,11.26,0,0,1-2,.93V29.2H94.3a15.47,15.47,0,0,1,15.42,15.43v2.29H115a7.93,7.93,0,0,1,7.9,7.91V73.2A7.93,7.93,0,0,1,115,81.11h-5.25v2.07A15.48,15.48,0,0,1,94.3,98.61H55.23L31.81,118.72a2.58,2.58,0,0,1-3.65-.29,2.63,2.63,0,0,1-.63-1.85l1.25-18h-.21A15.45,15.45,0,0,1,13.16,83.18V81.11H7.91A7.93,7.93,0,0,1,0,73.2V54.83a7.93,7.93,0,0,1,7.9-7.91h5.26v-2.3A15.45,15.45,0,0,1,28.57,29.2H57.49ZM82.74,47.32a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm-42.58,0a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm6.38,31.36a2.28,2.28,0,0,1-.38-.38,2.18,2.18,0,0,1-.52-1.36,2.21,2.21,0,0,1,.46-1.39,2.4,2.4,0,0,1,.39-.39,3.22,3.22,0,0,1,3.88-.08A22.36,22.36,0,0,0,56,78.32a14.86,14.86,0,0,0,5.47,1A16.18,16.18,0,0,0,67,78.22,25.39,25.39,0,0,0,72.75,75a3.24,3.24,0,0,1,3.89.18,3,3,0,0,1,.37.41,2.22,2.22,0,0,1,.42,1.4,2.33,2.33,0,0,1-.58,1.35,2.29,2.29,0,0,1-.43.38,30.59,30.59,0,0,1-7.33,4,22.28,22.28,0,0,1-7.53,1.43A21.22,21.22,0,0,1,54,82.87a27.78,27.78,0,0,1-7.41-4.16l0,0ZM94.29,34.4H28.57A10.26,10.26,0,0,0,18.35,44.63V83.18A10.26,10.26,0,0,0,28.57,93.41h3.17a2.61,2.61,0,0,1,2.41,2.77l-1,14.58L52.45,94.15a2.56,2.56,0,0,1,1.83-.75h40a10.26,10.26,0,0,0,10.22-10.23V44.62A10.24,10.24,0,0,0,94.29,34.4Z"/>
                            </svg>
                        </div>
                        <div class="getyo-message-content">
                            <p>Hi! I'm your Get Yo assistant. I can help you with:</p>
                            <ul>
                                <li>Store hours & locations</li>
                                <li>Flavors & menu items</li>
                                <li>Allergen & dairy-free options</li>
                                <li>Nutrition information</li>
                            </ul>
                            <p>What would you like to know?</p>
                            <div class="getyo-quick-replies">
                                <button class="getyo-quick-reply" data-message="What are your hours?">⏰ Hours</button>
                                <button class="getyo-quick-reply" data-message="Do you have dairy-free options?">🥛 Dairy-Free</button>
                                <button class="getyo-quick-reply" data-message="Where are you located?">📍 Locations</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="getyo-chat-input-wrapper">
                    <div class="getyo-chat-input-container">
                        <input 
                            type="text" 
                            class="getyo-chat-input" 
                            id="getyo-chat-input" 
                            placeholder="Type your message..." 
                            maxlength="200"
                        />
                        <button class="getyo-chat-send" id="getyo-chat-send" aria-label="Send message">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(widget);
    }

    attachEventListeners() {
        const toggleBtn = document.getElementById('getyo-chat-toggle');
        const minimizeBtn = document.getElementById('getyo-chat-minimize');
        const sendBtn = document.getElementById('getyo-chat-send');
        const input = document.getElementById('getyo-chat-input');
        
        toggleBtn.addEventListener('click', () => this.toggleChat());
        minimizeBtn.addEventListener('click', () => this.toggleChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        // Quick reply buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('getyo-quick-reply')) {
                const message = e.target.getAttribute('data-message');
                input.value = message;
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('getyo-chat-window');
        const button = document.getElementById('getyo-chat-toggle');
        
        if (this.isOpen) {
            window.style.display = 'flex';
            button.classList.add('active');
            document.getElementById('getyo-chat-input').focus();
        } else {
            window.style.display = 'none';
            button.classList.remove('active');
        }
    }

    async sendMessage() {
        const input = document.getElementById('getyo-chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add to history
        this.messageHistory.push({ role: 'user', content: message });
        
        // Add user message to UI
        this.addUserMessage(message);
        input.value = '';
        
        // Show typing indicator
        this.showTyping();
        
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    userId: this.userId,
                    history: this.messageHistory.slice(-10) // Son 10 mesaj
                })
            });
            
            const data = await response.json();
            
            // Remove typing indicator
            this.removeTyping();
            
            if (response.ok) {
                this.messageHistory.push({ role: 'assistant', content: data.response });
                this.addBotMessage(data.response);
            } else {
                this.addBotMessage(data.error || 'Sorry, something went wrong. Please try again.');
            }
            
        } catch (error) {
            this.removeTyping();
            this.addBotMessage('Sorry, I\'m having trouble connecting. Please call us at (732) 617-6332 for immediate assistance.');
        }
    }

    addUserMessage(text) {
        const messagesDiv = document.getElementById('getyo-chat-messages');
        const messageEl = document.createElement('div');
        messageEl.className = 'getyo-message getyo-message-user';
        messageEl.innerHTML = `<div class="getyo-message-user-content">${this.escapeHtml(text)}</div>`;
        messagesDiv.appendChild(messageEl);
        this.scrollToBottom();
    }

    addBotMessage(text) {
        const messagesDiv = document.getElementById('getyo-chat-messages');
        const messageEl = document.createElement('div');
        messageEl.className = 'getyo-message getyo-message-bot';
        messageEl.innerHTML = `
            <div class="getyo-message-bot-avatar">
                <svg viewBox="0 0 122.88 119.35">
                    <path d="M57.49,29.2V23.53a14.41,14.41,0,0,1-2-.93A12.18,12.18,0,0,1,50.44,7.5a12.39,12.39,0,0,1,2.64-3.95A12.21,12.21,0,0,1,57,.92,12,12,0,0,1,61.66,0,12.14,12.14,0,0,1,72.88,7.5a12.14,12.14,0,0,1,0,9.27,12.08,12.08,0,0,1-2.64,3.94l-.06.06a12.74,12.74,0,0,1-2.36,1.83,11.26,11.26,0,0,1-2,.93V29.2H94.3a15.47,15.47,0,0,1,15.42,15.43v2.29H115a7.93,7.93,0,0,1,7.9,7.91V73.2A7.93,7.93,0,0,1,115,81.11h-5.25v2.07A15.48,15.48,0,0,1,94.3,98.61H55.23L31.81,118.72a2.58,2.58,0,0,1-3.65-.29,2.63,2.63,0,0,1-.63-1.85l1.25-18h-.21A15.45,15.45,0,0,1,13.16,83.18V81.11H7.91A7.93,7.93,0,0,1,0,73.2V54.83a7.93,7.93,0,0,1,7.9-7.91h5.26v-2.3A15.45,15.45,0,0,1,28.57,29.2H57.49ZM82.74,47.32a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm-42.58,0a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm6.38,31.36a2.28,2.28,0,0,1-.38-.38,2.18,2.18,0,0,1-.52-1.36,2.21,2.21,0,0,1,.46-1.39,2.4,2.4,0,0,1,.39-.39,3.22,3.22,0,0,1,3.88-.08A22.36,22.36,0,0,0,56,78.32a14.86,14.86,0,0,0,5.47,1A16.18,16.18,0,0,0,67,78.22,25.39,25.39,0,0,0,72.75,75a3.24,3.24,0,0,1,3.89.18,3,3,0,0,1,.37.41,2.22,2.22,0,0,1,.42,1.4,2.33,2.33,0,0,1-.58,1.35,2.29,2.29,0,0,1-.43.38,30.59,30.59,0,0,1-7.33,4,22.28,22.28,0,0,1-7.53,1.43A21.22,21.22,0,0,1,54,82.87a27.78,27.78,0,0,1-7.41-4.16l0,0ZM94.29,34.4H28.57A10.26,10.26,0,0,0,18.35,44.63V83.18A10.26,10.26,0,0,0,28.57,93.41h3.17a2.61,2.61,0,0,1,2.41,2.77l-1,14.58L52.45,94.15a2.56,2.56,0,0,1,1.83-.75h40a10.26,10.26,0,0,0,10.22-10.23V44.62A10.24,10.24,0,0,0,94.29,34.4Z"/>
                </svg>
            </div>
            <div class="getyo-message-content">${this.formatMessage(text)}</div>
        `;
        messagesDiv.appendChild(messageEl);
        this.scrollToBottom();
    }

    showTyping() {
        const messagesDiv = document.getElementById('getyo-chat-messages');
        const typingEl = document.createElement('div');
        typingEl.id = 'getyo-typing';
        typingEl.className = 'getyo-message getyo-message-bot';
        typingEl.innerHTML = `
            <div class="getyo-message-bot-avatar">
                <svg viewBox="0 0 122.88 119.35">
                    <path d="M57.49,29.2V23.53a14.41,14.41,0,0,1-2-.93A12.18,12.18,0,0,1,50.44,7.5a12.39,12.39,0,0,1,2.64-3.95A12.21,12.21,0,0,1,57,.92,12,12,0,0,1,61.66,0,12.14,12.14,0,0,1,72.88,7.5a12.14,12.14,0,0,1,0,9.27,12.08,12.08,0,0,1-2.64,3.94l-.06.06a12.74,12.74,0,0,1-2.36,1.83,11.26,11.26,0,0,1-2,.93V29.2H94.3a15.47,15.47,0,0,1,15.42,15.43v2.29H115a7.93,7.93,0,0,1,7.9,7.91V73.2A7.93,7.93,0,0,1,115,81.11h-5.25v2.07A15.48,15.48,0,0,1,94.3,98.61H55.23L31.81,118.72a2.58,2.58,0,0,1-3.65-.29,2.63,2.63,0,0,1-.63-1.85l1.25-18h-.21A15.45,15.45,0,0,1,13.16,83.18V81.11H7.91A7.93,7.93,0,0,1,0,73.2V54.83a7.93,7.93,0,0,1,7.9-7.91h5.26v-2.3A15.45,15.45,0,0,1,28.57,29.2H57.49ZM82.74,47.32a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm-42.58,0a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm6.38,31.36a2.28,2.28,0,0,1-.38-.38,2.18,2.18,0,0,1-.52-1.36,2.21,2.21,0,0,1,.46-1.39,2.4,2.4,0,0,1,.39-.39,3.22,3.22,0,0,1,3.88-.08A22.36,22.36,0,0,0,56,78.32a14.86,14.86,0,0,0,5.47,1A16.18,16.18,0,0,0,67,78.22,25.39,25.39,0,0,0,72.75,75a3.24,3.24,0,0,1,3.89.18,3,3,0,0,1,.37.41,2.22,2.22,0,0,1,.42,1.4,2.33,2.33,0,0,1-.58,1.35,2.29,2.29,0,0,1-.43.38,30.59,30.59,0,0,1-7.33,4,22.28,22.28,0,0,1-7.53,1.43A21.22,21.22,0,0,1,54,82.87a27.78,27.78,0,0,1-7.41-4.16l0,0ZM94.29,34.4H28.57A10.26,10.26,0,0,0,18.35,44.63V83.18A10.26,10.26,0,0,0,28.57,93.41h3.17a2.61,2.61,0,0,1,2.41,2.77l-1,14.58L52.45,94.15a2.56,2.56,0,0,1,1.83-.75h40a10.26,10.26,0,0,0,10.22-10.23V44.62A10.24,10.24,0,0,0,94.29,34.4Z"/>
                </svg>
            </div>
            <div class="getyo-message-content">
                <div class="getyo-typing">
                    <div class="getyo-typing-dot"></div>
                    <div class="getyo-typing-dot"></div>
                    <div class="getyo-typing-dot"></div>
                </div>
            </div>
        `;
        messagesDiv.appendChild(typingEl);
        this.scrollToBottom();
    }

    removeTyping() {
        const typing = document.getElementById('getyo-typing');
        if (typing) typing.remove();
    }

    formatMessage(text) {
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        const messagesDiv = document.getElementById('getyo-chat-messages');
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new GetYoChatWidget());
} else {
    new GetYoChatWidget();
}