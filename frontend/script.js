// API Configuration
const API_URL = 'http://localhost:3000/api';
let sessionId = generateSessionId();
let isLoading = false;

// Generate a unique session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Initialize chatbot
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadFAQs();
});

// Setup event listeners
function setupEventListeners() {
    // Send message on button click
    const sendButton = document.getElementById('send-button');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    // Send message on Enter key
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Clear chat
    const clearChatBtn = document.getElementById('clear-chat');
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', clearChat);
    }
    
    // Suggested questions
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById('chat-input');
            if (input) {
                input.value = btn.textContent;
                sendMessage();
            }
        });
    });
}

// Send message to chatbot
async function sendMessage() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    
    const message = input.value.trim();
    
    if (!message || isLoading) return;
    
    // Clear input
    input.value = '';
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                sessionId: sessionId
            })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add bot response to chat
        addMessageToChat(data.message, 'bot');
        
    } catch (error) {
        console.error('Error sending message:', error);
        removeTypingIndicator();
        showErrorMessage('Sorry, I had trouble responding. Please try again.');
    }
}

// Add message to chat
function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${formatMessage(message)}</p>
            <span class="message-time">${time}</span>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Format message with line breaks and links
function formatMessage(message) {
    // Convert URLs to links
    message = message.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    
    // Convert line breaks to <br>
    message = message.replace(/\n/g, '<br>');
    
    return message;
}

// Show typing indicator
function showTypingIndicator() {
    isLoading = true;
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
    isLoading = false;
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Show error message
function showErrorMessage(message) {
    addMessageToChat(message, 'bot');
}

// Scroll chat to bottom
function scrollToBottom() {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Clear chat history
async function clearChat() {
    try {
        await fetch(`${API_URL}/chat/clear`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId })
        });
        
        // Clear messages
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="message bot-message">
                    <div class="message-content">
                        <p>Hi there! 👋 I'm Sunny, your lemonade expert. How can I help you find the perfect drink today?</p>
                        <span class="message-time">Just now</span>
                    </div>
                </div>
            `;
        }
        
        // Generate new session
        sessionId = generateSessionId();
        
    } catch (error) {
        console.error('Error clearing chat:', error);
    }
}

// Load FAQs
async function loadFAQs() {
    try {
        const response = await fetch(`${API_URL}/faqs`);
        const faqs = await response.json();
        // Store FAQs for later use
        window.faqs = faqs;
    } catch (error) {
        console.error('Error loading FAQs:', error);
    }
}