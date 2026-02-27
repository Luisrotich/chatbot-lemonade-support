const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend folder - THIS IS CRITICAL for Railway!
app.use(express.static('frontend'));

// Also serve from root if needed (fallback)
app.use(express.static(path.join(__dirname)));

// Load product data with error handling
let productData;
try {
    productData = require('./data/products.json');
    console.log('✅ Product data loaded successfully');
} catch (error) {
    console.log('⚠️ products.json not found, using default data');
    // Default data if file is missing
    productData = {
        products: [
            {
                id: "classic-1",
                name: "Classic Lemonade",
                price: 4.99,
                description: "Our signature classic lemonade made with fresh lemons and cane sugar",
                tags: ["classic", "original", "traditional"]
            },
            {
                id: "sugarfree-1",
                name: "Sugar-Free Lemonade",
                price: 5.99,
                description: "All the flavor with zero sugar, sweetened with stevia",
                tags: ["sugar-free", "diet", "zero sugar"]
            },
            {
                id: "strawberry-1",
                name: "Strawberry Bliss",
                price: 5.99,
                description: "Fresh strawberry puree blended with our classic lemonade",
                tags: ["strawberry", "berry", "fruit"]
            },
            {
                id: "ginger-1",
                name: "Ginger Zing",
                price: 5.99,
                description: "A refreshing kick of fresh ginger in our classic lemonade",
                tags: ["ginger", "spicy", "zing"]
            },
            {
                id: "lavender-1",
                name: "Lavender Dream",
                price: 6.99,
                description: "Floral lavender infused lemonade for a unique experience",
                tags: ["lavender", "floral", "unique"]
            }
        ],
        faqs: [
            {
                question: "What are your lemonade flavors?",
                answer: "We offer Classic, Sugar-Free, Strawberry Bliss, Ginger Zing, and Lavender Dream!"
            },
            {
                question: "Are your lemonades vegan?",
                answer: "Yes! All our lemonades are 100% vegan and plant-based."
            },
            {
                question: "How long does shipping take?",
                answer: "We ship within 2-3 business days. Standard shipping takes 3-5 days."
            },
            {
                question: "What is your return policy?",
                answer: "If you're not satisfied, contact us within 7 days for a full refund!"
            },
            {
                question: "Do you have sugar-free options?",
                answer: "Yes! Our Sugar-Free Lemonade is sweetened with stevia and has zero sugar."
            }
        ]
    };
}

// Simple response system
const responses = {
    greeting: [
        "Hi there! 👋 I'm Sunny, your lemonade expert. How can I help you today?",
        "Welcome to Sunny Sips! 🍋 What kind of lemonade are you looking for?",
        "Hey! Ready to find your perfect lemonade? 😊"
    ],
    products: {
        classic: "Our Classic Lemonade is our bestseller! Made with fresh lemons and cane sugar. Would you like to try it?",
        sugarfree: "Yes! We have Sugar-Free Lemonade sweetened with stevia. It's delicious and has zero sugar!",
        strawberry: "Our Strawberry Bliss Lemonade is amazing! Fresh strawberry puree mixed with our classic recipe.",
        ginger: "The Ginger Zing Lemonade has a nice kick! Fresh ginger blended perfectly with our lemonade.",
        lavender: "Lavender Dream is our most unique flavor - floral, refreshing, and absolutely delightful!"
    },
    fallback: [
        "That's a great question! Let me help you with that.",
        "I'd be happy to help you find the perfect lemonade!",
        "Great choice! Let me tell you more about our options."
    ]
};

// Simple keyword matching
function getResponse(message) {
    const msg = message.toLowerCase();
    
    // Greetings
    if (msg.match(/hi|hello|hey|greetings/)) {
        return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
    }
    
    // Product queries
    if (msg.match(/classic|original|regular/)) {
        return responses.products.classic;
    }
    if (msg.match(/sugar[ -]?free|no sugar|diet|zero sugar/)) {
        return responses.products.sugarfree;
    }
    if (msg.match(/strawberry|berry/)) {
        return responses.products.strawberry;
    }
    if (msg.match(/ginger|spicy|zing/)) {
        return responses.products.ginger;
    }
    if (msg.match(/lavender|floral|purple/)) {
        return responses.products.lavender;
    }
    
    // FAQ matching
    if (msg.match(/shipping|delivery|how long/)) {
        return "We ship within 2-3 business days. Standard shipping takes 3-5 days. 🚚";
    }
    if (msg.match(/return|refund|money back/)) {
        return "If you're not satisfied, contact us within 7 days for a full refund! 👍";
    }
    if (msg.match(/vegan|plant based|dairy free/)) {
        return "All our lemonades are 100% vegan and plant-based! 🌱";
    }
    if (msg.match(/price|cost|how much/)) {
        return "Our lemonades range from $4.99 to $27.99 for party packs. Which one interests you? 💰";
    }
    if (msg.match(/flavor|flavours|types|kinds/)) {
        return "We have Classic, Sugar-Free, Strawberry Bliss, Ginger Zing, and Lavender Dream! Which sounds good to you? 🍋🍓";
    }
    if (msg.match(/menu|options|what do you have/)) {
        return "Here's our menu: 🍋 Classic Lemonade ($4.99), 🍓 Strawberry Bliss ($5.99), 🌿 Sugar-Free ($5.99), 🌸 Lavender Dream ($6.99), and 🔥 Ginger Zing ($5.99). What sounds good?";
    }
    
    // Default response
    return responses.fallback[Math.floor(Math.random() * responses.fallback.length)] + 
           " You can ask me about our flavors, prices, or shipping!";
}

// Store conversation history (simplified)
const conversations = new Map();

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        // Get or create conversation history
        if (!conversations.has(sessionId)) {
            conversations.set(sessionId, []);
        }
        
        // Get response based on message
        const botResponse = getResponse(message);
        
        // Store conversation (optional)
        const history = conversations.get(sessionId);
        history.push({ user: message, bot: botResponse });
        
        // Keep only last 5 exchanges
        if (history.length > 5) {
            history.shift();
        }
        
        res.json({
            message: botResponse,
            sessionId: sessionId
        });
        
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

// Get all products
app.get('/api/products', (req, res) => {
    res.json(productData.products);
});

// Search products
app.get('/api/products/search', (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.json(productData.products);
    }
    
    const searchTerm = q.toLowerCase();
    const filtered = productData.products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
    
    res.json(filtered);
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
    const product = productData.products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
});

// Get FAQs
app.get('/api/faqs', (req, res) => {
    res.json(productData.faqs);
});

// Clear conversation
app.post('/api/chat/clear', (req, res) => {
    const { sessionId } = req.body;
    conversations.delete(sessionId);
    res.json({ success: true, message: 'Conversation cleared' });
});

// Health check endpoint (good for Railway)
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch-all route to serve frontend for any unknown routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Serving frontend from: ${path.join(__dirname, 'frontend')}`);
    console.log(`🌍 Health check: http://localhost:${PORT}/health`);
    console.log(`🤖 Chat endpoint: http://localhost:${PORT}/api/chat`);
});