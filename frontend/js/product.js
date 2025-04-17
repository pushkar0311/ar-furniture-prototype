// File: /frontend/js/product.js
document.addEventListener('DOMContentLoaded', function() {
    // Product data - ONLY uses GLB paths (no JPG dependencies)
    const products = [
        {
            id: 1,
            name: "Modern Bed",
            price: 599.99,
            modelPath: "models/bed.glb"  // Only GLB path needed
        },
        {
            id: 2, 
            name: "Corner Sofa",
            price: 899.99,
            modelPath: "models/corner_sofa.glb"
        },
        {
            id: 3,
            name: "Antique Lantern",
            price: 129.99,
            modelPath: "models/lantern.glb"
        }
    ];

    // Render immediately with placeholder images
    renderProducts(products);
    
    // Hide logout button if not using auth
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.style.display = 'none';
});

/**
 * Renders products with automatic placeholder images
 */
function renderProducts(products) {
    const container = document.getElementById('products-container');
    
    if (!container) {
        console.error("Error: Product container not found");
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${getPlaceholderImage(product.name)}" 
                     alt="${product.name}"
                     class="product-thumbnail">
            </div>
            <div class="product-details">
                <h3>${product.name}</h3>
                <p>$${product.price.toFixed(2)}</p>
                <button onclick="handleViewInAR('${product.modelPath}')">
                    View in AR
                </button>
            </div>
        </div>
    `).join('');

    // Verify models exist in background
    verifyModels(products);
}

/**
 * Generates placeholder image URL (no JPG files needed)
 */
function getPlaceholderImage(productName) {
    const color = '#' + Math.floor(Math.random()*16777215).toString(16);
    return `https://via.placeholder.com/300/${color}/ffffff?text=${encodeURIComponent(productName)}`;
}

/**
 * Checks if models exist (runs after page loads)
 */
async function verifyModels(products) {
    const warnings = [];
    
    for (const product of products) {
        try {
            const exists = await checkFileExists(product.modelPath);
            if (!exists) {
                warnings.push(`Missing: ${product.modelPath}`);
                disableARButton(product.modelPath);
            }
        } catch (error) {
            console.warn(`Error checking ${product.modelPath}:`, error);
        }
    }
    
    if (warnings.length > 0) {
        console.warn("Missing 3D models:\n" + warnings.join('\n'));
    }
}

/**
 * Checks if file exists (for GLB models)
 */
async function checkFileExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Disables AR button if model missing
 */
function disableARButton(modelPath) {
    const buttons = document.querySelectorAll(`button[onclick*="${modelPath}"]`);
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.textContent = "Model Missing";
        btn.title = "3D file not found: " + modelPath;
    });
}

/**
 * Handles AR view with error protection
 */
window.handleViewInAR = function(modelPath) {
    try {
        // Double-check model exists
        fetch(modelPath, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    localStorage.setItem('arModelUrl', modelPath);
                    window.location.href = 'ar-viewer.html';
                } else {
                    alert("Error: 3D model failed to load. Please try another product.");
                    disableARButton(modelPath);
                }
            })
            .catch(() => {
                alert("Network error. Please check your connection.");
            });
    } catch (error) {
        console.error("AR redirection failed:", error);
        alert("System error. Please check console.");
    }
};