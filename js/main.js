// Global variable for the slideshow interval
let slideshowInterval = null;
let currentSlideIndex = 0;

// Global variable to store all products from the API
let allProducts = [];

// Global API URL
const API_URL = "https://script.google.com/macros/s/AKfycbw_MAl9Qf14HxnznpF9Pm65JlCLQII1wuQMZsAuArRjA2CwZ25afASjCfgFltclXwgq/exec";


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

/**
 * Starts the hero slideshow (only on the homepage)
 */
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
 * Formats a number as USD currency
 * @param {number} number - The number to format
 * @returns {string} - Formatted currency string (e.g., "$129.99")
 */
function formatCurrency(number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(number);
}


// -----------------------------------------------------------------------------
// --- MAIN SCRIPT EXECUTION (AFTER DOM LOADS) ---
// -----------------------------------------------------------------------------

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

    // --- Homepage Slideshow ---
    const slideshow = document.querySelector('.slideshow-container');
    if (slideshow) {
        startSlideshow();
    }

    // --- Add to Cart Toast Notification ---
    const cartButtons = document.querySelectorAll('.add-to-cart-btn');
    cartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Check if we are on the product detail page (where button is not a link)
            if (!button.closest('a')) {
                 event.preventDefault();
            }
           
            const productCard = button.closest('.product-card');
            if (productCard) {
                const productTitle = productCard.querySelector('.product-title').textContent;
                showToast(`${productTitle} added to cart!`);
            }
        });
    });

    // --- Product Detail Page: Gallery ---
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.gallery-thumbnail');
    if (mainImage && thumbnails.length > 0) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                // Set main image src
                mainImage.src = thumb.dataset.image;
                // Update active state
                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });
    }

    // --- Product Detail Page: Tabs ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Update button active state
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Update panel active state
                tabPanels.forEach(panel => {
                    if (panel.id === `tab-${targetTab}`) {
                        panel.classList.add('active');
                    } else {
                        panel.classList.remove('active');
                    }
                });
            });
        });
    }

    // --- General: Quantity Input Controls ---
    const quantityWrappers = document.querySelectorAll('.quantity-input-wrapper');
    quantityWrappers.forEach(wrapper => {
        const minusBtn = wrapper.querySelector('.quantity-minus');
        const plusBtn = wrapper.querySelector('.quantity-plus');
        const input = wrapper.querySelector('.quantity-input');

        minusBtn.addEventListener('click', () => {
            let currentValue = parseInt(input.value);
            if (currentValue > 1) {
                input.value = currentValue - 1;
                // Dispatch a 'change' event so the cart page can listen for it
                input.dispatchEvent(new Event('change'));
            }
        });

        plusBtn.addEventListener('click', () => {
            let currentValue = parseInt(input.value);
            input.value = currentValue + 1;
            // Dispatch a 'change' event so the cart page can listen for it
            input.dispatchEvent(new Event('change'));
        });

        // Also trigger change on manual input
        input.addEventListener('change', () => {
            if (parseInt(input.value) < 1 || isNaN(parseInt(input.value))) {
                input.value = 1;
            }
        });
    });

    // --- Cart Page: Remove & Update Logic ---
    const cartContainer = document.getElementById('cart-items-container');
    if (cartContainer) {
        // Function to update totals
        function updateCartTotals() {
            const allItems = cartContainer.querySelectorAll('.cart-item');
            const emptyCartMessage = document.getElementById('empty-cart-message');
            
            if (allItems.length === 0) {
                // Show empty cart message
                if (emptyCartMessage) emptyCartMessage.classList.remove('hidden');
                document.getElementById('cart-subtotal').textContent = formatCurrency(0);
                document.getElementById('cart-shipping').textContent = formatCurrency(0);
                document.getElementById('cart-tax').textContent = formatCurrency(0);
                document.getElementById('cart-total').textContent = formatCurrency(0);
                return;
            }

            if (emptyCartMessage) emptyCartMessage.classList.add('hidden');

            let subtotal = 0;
            allItems.forEach(item => {
                const input = item.querySelector('.quantity-input');
                const price = parseFloat(input.dataset.price);
                const quantity = parseInt(input.value);
                const itemTotalEl = item.querySelector('.item-total');
                
                const itemTotal = price * quantity;
                itemTotalEl.textContent = formatCurrency(itemTotal);
                subtotal += itemTotal;
            });

            // Example shipping and tax logic
            const shipping = 15.00;
            const tax = subtotal * 0.08; // 8% tax
            const total = subtotal + shipping + tax;

            document.getElementById('cart-subtotal').textContent = formatCurrency(subtotal);
            document.getElementById('cart-shipping').textContent = formatCurrency(shipping);
            document.getElementById('cart-tax').textContent = formatCurrency(tax);
            document.getElementById('cart-total').textContent = formatCurrency(total);
        }

        // Listen for changes in the container (for quantity and remove)
        cartContainer.addEventListener('click', (e) => {
            // Remove item
            if (e.target.classList.contains('remove-item')) {
                e.target.closest('.cart-item').remove();
                updateCartTotals();
                showToast("Item removed from cart.");
            }
        });

        cartContainer.addEventListener('change', (e) => {
            // Quantity change
            if (e.target.classList.contains('quantity-input')) {
                updateCartTotals();
            }
        });

        // Initial calculation on page load
        updateCartTotals();

        // --- Stripe Checkout Button ---
        const checkoutButton = document.getElementById('checkout-button');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', () => {
                // This is a placeholder for a real checkout
                // In a real app, this would call your backend (see conceptual-backend/server.js)
                
                // Simulate loading state
                checkoutButton.textContent = 'Redirecting to payment...';
                checkoutButton.disabled = true;

                // Show a toast message as a placeholder
                setTimeout(() => {
                    showToast("This is a demo. No real payment will be processed.");
                    checkoutButton.textContent = 'Proceed to Checkout';
                    checkoutButton.disabled = false;
                }, 2000);

                // In a real implementation with a backend:
                // 1. Get all cart items
                // const cartItems = [ ... build array of {id, quantity} ... ];
                // 2. Call your backend
                // fetch('/create-checkout-session', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({ items: cartItems })
                // })
                // .then(res => res.json())
                // .then(data => {
                //     // Redirect to Stripe checkout
                //     window.location.href = data.url; 
                // })
                // .catch(error => {
                //     console.error('Error:', error);
                //     showToast("Could not connect to payment. Please try again.");
                //     checkoutButton.textContent = 'Proceed to Checkout';
                //     checkoutButton.disabled = false;
                // });
            });
        }
    } // end if(cartContainer)


    // --- Product Filter Logic (for products.html) ---
    const productGrid = document.getElementById('product-grid');
    const activeFiltersBar = document.getElementById('active-filters-bar');
    
    // Only run this logic if we are on the products page
    if (productGrid && activeFiltersBar) {
        const categoryFilters = document.getElementById('category-filters');
        const priceFilters = document.getElementById('price-filters');
        const noResultsMessage = document.getElementById('no-results-message');
        const activeFiltersContainer = document.getElementById('active-filters-container');
        const clearAllFiltersBtn = document.getElementById('clear-all-filters');

        let activeFilters = {
            category: 'all',
            price: 'all'
        };

        /**
         * Renders the product grid based on the 'allProducts' global variable
         */
        function renderProducts(productsToRender) {
            const skeletons = productGrid.querySelectorAll('.product-card-skeleton');
            
            // Show "no results" if needed
            if (productsToRender.length === 0) {
                noResultsMessage.classList.remove('hidden');
                skeletons.forEach(s => s.classList.add('hidden')); // Hide skeletons if no results
            } else {
                noResultsMessage.classList.add('hidden');
                skeletons.forEach(s => s.classList.add('hidden')); // Hide skeletons once products are ready
            }

            // Clear existing products (but not skeletons)
            const existingProducts = productGrid.querySelectorAll('.product-card');
            existingProducts.forEach(p => p.remove());

            // Render new products
            productsToRender.forEach(product => {
                const price = Number(product.price); // FIX: Convert price string to number
                if (isNaN(price)) {
                    console.error("Invalid price for product:", product.name);
                    return; // Skip this product
                }

                const productEl = document.createElement('a');
                productEl.href = `product-detail.html?id=${product.id}`; // Link to product detail page
                productEl.className = 'product-card block bg-white rounded-lg shadow-md overflow-hidden border border-gray-medium group transition-shadow hover:shadow-xl';
                productEl.dataset.id = product.id;
                productEl.dataset.category = product.category;
                productEl.dataset.price = price;

                productEl.innerHTML = `
                    <img src="${product.imageUrl}" alt="${product.name}" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h4 class="product-title font-bold text-lg truncate">${product.name}</h4>
                        <p class="text-gray-600 mb-4 capitalize">${product.category.replace('-', ' ')}</p>
                        <div class="flex justify-between items-center">
                            <span class="product-price text-xl font-bold text-secondary">${formatCurrency(price)}</span>
                            <button class="add-to-cart-btn bg-primary text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary-dark transition duration-300 pointer-events-none">
                                View Details
                            </button>
                        </div>
                    </div>
                `;
                productGrid.appendChild(productEl);
            });
        }

        /**
         * Applies filters to the 'allProducts' list and re-renders the grid
         */
        function applyFilters() {
            let filteredProducts = [...allProducts];

            // 1. Filter by Category
            if (activeFilters.category !== 'all') {
                filteredProducts = filteredProducts.filter(product => product.category === activeFilters.category);
            }

            // 2. Filter by Price
            if (activeFilters.price !== 'all') {
                filteredProducts = filteredProducts.filter(product => {
                    const price = Number(product.price); // FIX: Convert price string to number
                    if (isNaN(price)) return false;

                    switch (activeFilters.price) {
                        case '0-25': return price >= 0 && price <= 25;
                        case '25-50': return price > 25 && price <= 50;
                        case '50-100': return price > 50 && price <= 100;
                        case '100+': return price > 100;
                        default: return true;
                    }
                });
            }

            renderProducts(filteredProducts);
            updateActiveFiltersUI();
        }

        /**
         * Updates the sidebar buttons and the top "pill" bar to match activeFilters
         */
        function updateActiveFiltersUI() {
            activeFiltersContainer.innerHTML = '';
            let filtersApplied = false;

            // Update Category buttons
            categoryFilters.querySelectorAll('.filter-btn').forEach(btn => {
                if (btn.dataset.filterValue === activeFilters.category) {
                    btn.classList.add('active');
                    if (activeFilters.category !== 'all') {
                        addFilterPill(btn.dataset.filterType, btn.dataset.filterValue, btn.textContent);
                        filtersApplied = true;
                    }
                } else {
                    btn.classList.remove('active');
                }
            });

            // Update Price buttons
            priceFilters.querySelectorAll('.filter-btn').forEach(btn => {
                if (btn.dataset.filterValue === activeFilters.price) {
                    btn.classList.add('active');
                    if (activeFilters.price !== 'all') {
                        addFilterPill(btn.dataset.filterType, btn.dataset.filterValue, btn.textContent);
                        filtersApplied = true;
                    }
                } else {
                    btn.classList.remove('active');
                }
            });

            // Show/Hide the active filter bar
            if (filtersApplied) {
                activeFiltersBar.classList.remove('filter-bar-hidden');
            } else {
                activeFiltersBar.classList.add('filter-bar-hidden');
            }
        }

        /**
         * Creates and adds a filter "pill" to the active filter bar
         */
        function addFilterPill(type, value, text) {
            const pill = document.createElement('span');
            pill.className = 'filter-pill';
            pill.innerHTML = `
                ${text}
                <button class="filter-pill-remove" data-filter-type="${type}" data-filter-value="${value}">&times;</button>
            `;
            activeFiltersContainer.appendChild(pill);
        }

        /**
         * Fetches all products from the Google Sheet API
         */
        async function fetchProducts() {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const data = await response.json();
                
                if (data.success && Array.isArray(data.products)) {
                    allProducts = data.products;
                    // Initial render of all products
                    applyFilters(); 
                } else {
                    throw new Error("API returned an error or invalid data structure.");
                }
            } catch (error) {
                console.error("Failed to load products:", error);
                productGrid.innerHTML = `<p class="col-span-full text-center text-red-600 font-medium">${error.message}</p>`;
            }
        }

        // --- Event Listeners for Filters ---

        // Listen for clicks on filter buttons (Category & Price)
        [categoryFilters, priceFilters].forEach(container => {
            container.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn')) {
                    const type = e.target.dataset.filterType;
                    const value = e.target.dataset.filterValue;
                    activeFilters[type] = value;
                    applyFilters();
                }
            });
        });

        // Listen for clicks on "Clear All"
        clearAllFiltersBtn.addEventListener('click', () => {
            activeFilters.category = 'all';
            activeFilters.price = 'all';
            applyFilters();
        });

        // Listen for clicks on individual "pill" remove buttons
        activeFiltersContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-pill-remove')) {
                const type = e.target.dataset.filterType;
                activeFilters[type] = 'all';
                applyFilters();
            }
        });

        // --- Initial Load ---
        fetchProducts(); // Fetch products on page load
        updateActiveFiltersUI(); // Set initial UI state

    } // end if(productGrid && activeFiltersBar)

});