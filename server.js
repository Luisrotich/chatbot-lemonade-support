const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Load product data
const productData = require('./data/products.json');

// Simple response system (no OpenAI needed)
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
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
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
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (MOCK MODE - no OpenAI needed)`);
});