// Global variable for the slideshow interval
let slideshowInterval = null;
let currentSlideIndex = 0;

/**
 * Shows a custom toast notification
 * @param {string} message - The message to display.
 */
function showToast(message) {
    // Remove any existing toast
    const oldToast = document.querySelector('.toast-notification');
    if (oldToast) {
        oldToast.remove();
    }

    // Create the new toast element
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Animate out after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        
        // Remove from DOM after transition finishes
        toast.addEventListener('transitionend', () => {
            toast.remove();
        }, { once: true });

    }, 3000);
}

// --- Slideshow Function ---
function startSlideshow() {
    const slides = document.querySelectorAll('.slideshow-container .slide');
    if (slides.length === 0) return;

    // Show the first slide immediately
    slides.forEach(slide => slide.classList.remove('active'));
    currentSlideIndex = 0;
    slides[currentSlideIndex].classList.add('active');

    // Set interval to change slides
    slideshowInterval = setInterval(() => {
        // Hide current slide
        slides[currentSlideIndex].classList.remove('active');

        // Increment index
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;

        // Show next slide
        slides[currentSlideIndex].classList.add('active');
    }, 5000); // Change slide every 5 seconds
}

/**
 * Updates the totals on the cart page.
 */
function updateCartTotals() {
    const cartItems = document.querySelectorAll('.cart-item');
    let subtotal = 0;
    const shipping = 15.00; // Fixed shipping
    const taxRate = 0.08; // 8% tax

    cartItems.forEach(item => {
        const priceInput = item.querySelector('.quantity-input');
        const price = parseFloat(priceInput.dataset.price);
        const quantity = parseInt(priceInput.value);
        const total = price * quantity;
        
        item.querySelector('.item-total').textContent = `$${total.toFixed(2)}`;
        subtotal += total;
    });

    const tax = subtotal * taxRate;
    const total = subtotal + shipping + tax;

    document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('cart-tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;

    // Show/hide empty cart message
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const orderSummary = document.querySelector('.lg\\:w-1\\/3'); // Finds the order summary
    if (cartItems.length === 0) {
        emptyCartMessage.classList.remove('hidden');
        if(orderSummary) orderSummary.classList.add('hidden'); // Hide summary if cart is empty
    } else {
        emptyCartMessage.classList.add('hidden');
        if(orderSummary) orderSummary.classList.remove('hidden');
    }
}


// --- Wait for the DOM to be ready ---
document.addEventListener("DOMContentLoaded", () => {
    
    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const isExpanded = !mobileMenu.classList.contains('hidden');
            mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
        });
    }

    // --- Slideshow (Only on Homepage) ---
    if (document.querySelector('.slideshow-container')) {
        startSlideshow();
    }

    // --- Add to Cart Notification (Global) ---
    // Note: We select all buttons *except* the one on the PDP page
    // because that one has special quantity logic.
    const cartButtons = document.querySelectorAll('.add-to-cart-btn:not(#add-to-cart-pdp)');
    cartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Stop if it's a link
            
            // Get product name
            const productCard = button.closest('.product-card');
            if (productCard) {
                const productTitle = productCard.querySelector('.product-title').textContent;
                showToast(`${productTitle} added to cart!`);
            }
        });
    });


    // --- Product Detail Page (PDP) Logic ---
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.gallery-thumbnail');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const pdpAddToCartBtn = document.getElementById('add-to-cart-pdp');
    const pdpProductName = document.getElementById('product-name');

    // PDP: Image Gallery
    if (mainImage && thumbnails.length > 0) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                // Set main image src
                mainImage.src = thumb.src;
                
                // Update active state
                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });
    }

    // PDP: Tabs
    if (tabButtons.length > 0 && tabPanels.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;

                // Deactivate all buttons and panels
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));

                // Activate clicked button and corresponding panel
                button.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
            });
        });
    }
    
    // PDP: Add to Cart button
    if (pdpAddToCartBtn && pdpProductName) {
        pdpAddToCartBtn.addEventListener('click', () => {
            const productName = pdpProductName.textContent;
            const quantity = document.getElementById('product-quantity').value;
            showToast(`${quantity} x ${productName} added to cart!`);
        });
    }

    // --- Quantity Input Logic (Global: Used on PDP & Cart) ---
    const quantityWrappers = document.querySelectorAll('.quantity-input-wrapper');
    quantityWrappers.forEach(wrapper => {
        const input = wrapper.querySelector('.quantity-input');
        const minusBtn = wrapper.querySelector('.quantity-minus');
        const plusBtn = wrapper.querySelector('.quantity-plus');

        if (!input || !minusBtn || !plusBtn) return;

        minusBtn.addEventListener('click', () => {
            let currentValue = parseInt(input.value);
            if (currentValue > 1) {
                input.value = currentValue - 1;
                // Dispatch a 'change' event to trigger cart updates
                input.dispatchEvent(new Event('change'));
            }
        });

        plusBtn.addEventListener('click', () => {
            let currentValue = parseInt(input.value);
            input.value = currentValue + 1;
            // Dispatch a 'change' event to trigger cart updates
            input.dispatchEvent(new Event('change'));
        });

        // Also trigger updates if user types a number
        input.addEventListener('change', () => {
            if (parseInt(input.value) < 1) {
                input.value = 1;
            }
            // If this is a cart page input, update totals
            if (input.dataset.price) {
                updateCartTotals();
            }
        });
    });

    // --- Cart Page: Remove & Update Logic ---
    const cartContainer = document.getElementById('cart-items-container');
    if (cartContainer) {
        // Initial calculation on load
        updateCartTotals();

        cartContainer.addEventListener('click', (event) => {
            // Check if a "Remove" button was clicked
            if (event.target.classList.contains('remove-item')) {
                event.preventDefault();
                const cartItem = event.target.closest('.cart-item');
                cartItem.remove();
                updateCartTotals();
                showToast("Item removed from cart.");
            }
        });
    }

    // --- Stripe Checkout Button (Cart Page) ---
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            // This is a placeholder for the front-end.
            // In a real app, this would call your backend to create a Stripe session.
            console.log("Proceeding to checkout...");
            showToast("Redirecting to secure payment portal...");

            // --- CONCEPTUAL ---
            // 1. Collect cart items
            // const cartItems = [ ... ]; 
            // 2. Call your backend
            // fetch('/create-checkout-session', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ items: cartItems })
            // })
            // .then(res => res.json())
            // .then(data => {
            //     // 3. Redirect to Stripe
            //     window.location.href = data.url; 
            // })
            // .catch(error => console.error('Error:', error));
        });
    }


    // --- Product Filter Logic (Static Version) ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productGrid = document.getElementById('product-grid');
    const activeFiltersBar = document.getElementById('active-filters-bar');
    const activeFiltersList = document.getElementById('active-filters-list');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const noResultsMessage = document.getElementById('no-results-message');

    // Check if we are on the products page
    if (productGrid && activeFiltersBar) {
        
        let activeFilters = {
            category: 'all',
            price: 'all'
        };

        // Main function to update the product grid
        const applyFilters = () => {
            let productsFound = 0;
            const allProducts = productGrid.querySelectorAll('.product-card');

            allProducts.forEach(product => {
                const category = product.dataset.category;
                const price = parseFloat(product.dataset.price);

                // Category check
                const categoryMatch = (activeFilters.category === 'all' || activeFilters.category === category);

                // Price check
                const [min, max] = activeFilters.price.split('-').map(Number);
                const priceMatch = (activeFilters.price === 'all' || (price >= min && price <= max));

                if (categoryMatch && priceMatch) {
                    product.classList.remove('hidden');
                    productsFound++;
                } else {
                    product.classList.add('hidden');
                }
            });

            // Show/hide "No results" message
            if (noResultsMessage) {
                noResultsMessage.classList.toggle('hidden', productsFound > 0);
            }
        };

        // Function to update the "Active Filters" pills UI
        const updateActiveFiltersUI = () => {
            activeFiltersList.innerHTML = ''; // Clear existing pills
            let hasFilters = false;

            // Update sidebar buttons based on activeFilters
            filterButtons.forEach(btn => {
                const group = btn.dataset.group; // 'category' or 'price'
                const value = btn.dataset.value;
                btn.classList.toggle('active', activeFilters[group] === value);
            });

            // Create "Category" pill
            if (activeFilters.category !== 'all') {
                const text = document.querySelector(`.filter-btn[data-value="${activeFilters.category}"]`).textContent;
                activeFiltersList.appendChild(createFilterPill(text, 'category'));
                hasFilters = true;
            }

            // Create "Price" pill
            if (activeFilters.price !== 'all') {
                const text = document.querySelector(`.filter-btn[data-value="${activeFilters.price}"]`).textContent;
                activeFiltersList.appendChild(createFilterPill(text, 'price'));
                hasFilters = true;
            }

            // Show/hide the entire bar
            activeFiltersBar.classList.toggle('filter-bar-hidden', !hasFilters);
        };

        // Helper function to create a filter pill
        const createFilterPill = (text, group) => {
            const pill = document.createElement('span');
            pill.className = 'filter-pill';
            pill.innerHTML = `
                ${text}
                <button class="filter-pill-remove" data-group="${group}">&times;</button>
            `;
            return pill;
        };

        // Event listener for all filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const group = button.dataset.group; // 'category' or 'price'
                const value = button.dataset.value; // 'pet-care', '25-50', etc.
                
                // Set the active filter
                activeFilters[group] = value;
                
                // Update UI and apply filters
                updateActiveFiltersUI();
                applyFilters();
            });
        });

        // Event listener for removing pills
        activeFiltersList.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-pill-remove')) {
                const group = e.target.dataset.group;
                
                // Reset the filter for that group
                activeFilters[group] = 'all';
                
                // Update UI and apply filters
                updateActiveFiltersUI();
                applyFilters();
            }
        });

        // Event listener for "Clear All" button
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', (e) => {
                e.preventDefault();
                activeFilters.category = 'all';
                activeFilters.price = 'all';
                updateActiveFiltersUI();
                applyFilters();
            });
        }
    } // end of product filter logic

}); // --- END OF DOMContentLoaded ---
