// This is a CONCEPTUAL backend file.
// It shows the server-side code needed to make Stripe work.
// You would run this on a server, NOT in the browser.

// 1. SET UP YOUR SERVER & STRIPE
// Use 'npm install express stripe dotenv' to get these packages
require('dotenv').config(); // Loads .env file with your STRIPE_SECRET_KEY
const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.use(express.static('public')); // Not strictly needed for this, but good practice
app.use(express.json()); // To read JSON from the front-end

// 2. DEFINE THE CHECKOUT ENDPOINT
// This is the endpoint our js/main.js file would call.
app.post('/create-checkout-session', async (req, res) => {
    
    // In a real app, you would get cart items from req.body
    // For this example, we'll use the hardcoded items from cart.html
    const lineItems = [
        {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Cordless Drill Set',
                    images: ['https://placehold.co/150x150/F0F0F0/AAA?text=Product+1'],
                },
                unit_amount: 12999, // Price in cents ($129.99)
            },
            quantity: 1, // You would get this from the cart
        },
        {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Premium Dog Food',
                    images: ['https://placehold.co/150x150/E0E0E0/999?text=Product+2'],
                },
                unit_amount: 5999, // Price in cents ($59.99)
            },
            quantity: 2, // You would get this from the cart
        },
    ];

    try {
        // 3. CREATE THE STRIPE SESSION
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            // IMPORTANT: Set these to your own website's URLs
            success_url: `https://your-domain.com/order-success.html`,
            cancel_url: `https://your-domain.com/cart.html`,
        });

        // 4. REDIRECT THE USER
        // The front-end can either redirect using this URL,
        // or the backend can redirect directly.
        // Sending the URL to the front-end is common for SPAs.
        // For our simple MPA, a direct redirect is fine.
        res.redirect(303, session.url);

    } catch (error) {
        console.error("Error creating Stripe session:", error);
        res.status(500).send("Error creating checkout session");
    }
});

// 5. START THE SERVER
const PORT = 4242;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));