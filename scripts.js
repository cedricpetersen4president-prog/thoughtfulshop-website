/**
 * Global JavaScript for The Thoughtful Shop
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Toggle ---
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            // Toggle the 'active' class to show/hide the menu
            mobileNav.classList.toggle('active');

            // Toggle ARIA attributes for accessibility
            const isExpanded = mobileNav.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    // --- Add to Cart Notification ---
    const cartButtons = document.querySelectorAll('.add-to-cart-btn');
    cartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Stop if it's a link
            
            // Get product name
            const productCard = button.closest('.product-card');
            const productTitle = productCard.querySelector('.product-title').textContent;
            
            showToast(`${productTitle} added to cart!`);
        });
    });

});

/**
 * Shows a custom toast notification at the bottom of the screen.
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
    // We use a tiny timeout to allow the element to be added to the DOM
    // before starting the CSS transition.
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
