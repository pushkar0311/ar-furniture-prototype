document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('arFurnitureToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Fetch wishlist items
        const wishlistResponse = await fetch(`${API_URL}/api/wishlist`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!wishlistResponse.ok) {
            throw new Error('Failed to load wishlist');
        }
        
        const wishlistData = await wishlistResponse.json();
        const productIds = wishlistData.wishlist;

        // Fetch all products
        const productsResponse = await fetch(`${API_URL}/api/products`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!productsResponse.ok) {
            throw new Error('Failed to load products');
        }
        
        const allProducts = await productsResponse.json();
        
        // Filter wishlist products
        const wishlistProducts = allProducts.filter(product => 
            productIds.includes(product.id)
        );

        renderWishlist(wishlistProducts);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('wishlist-container').innerHTML = `
            <div class="error-message">
                Error loading wishlist: ${error.message}
            </div>
        `;
    }
});

function renderWishlist(products) {
    const container = document.getElementById('wishlist-container');
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-wishlist">
                Your wishlist is empty. <a href="products.html">Browse products</a> to add items.
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="wishlist-item">
            <img src="${getProductImage(product)}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>$${product.price.toFixed(2)}</p>
            <button class="remove-btn" onclick="removeFromWishlist(${product.id})">
                Remove
            </button>
        </div>
    `).join('');
}

window.removeFromWishlist = async function(productId) {
    try {
        const token = localStorage.getItem('arFurnitureToken');
        const response = await fetch(`${API_URL}/api/wishlist`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId: productId })
        });

        if (!response.ok) {
            throw new Error('Failed to remove item');
        }

        // Refresh wishlist
        document.querySelector(`.wishlist-item button[onclick="removeFromWishlist(${productId})"]`)
            .closest('.wishlist-item').remove();
            
        if (document.querySelectorAll('.wishlist-item').length === 0) {
            renderWishlist([]);
        }
    } catch (error) {
        alert('Error removing item: ' + error.message);
    }
};