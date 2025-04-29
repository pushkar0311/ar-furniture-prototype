// Auto-detect API URL (works with localhost, ngrok, and production)
const API_URL = (() => {
    if (window.location.hostname.includes('ngrok')) {
      return window.location.origin.replace(/:\d+$/, ':8000');
    }
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8000'
      : 'https://your-production-api.com';
  })();
  
  document.addEventListener('DOMContentLoaded', async function() {
      console.log('Using API URL:', API_URL);
      
      // Handle logout if token exists
      const token = localStorage.getItem('arFurnitureToken');
      const logoutBtn = document.getElementById('logout-btn');
      
      if (token && logoutBtn) {
          logoutBtn.style.display = 'block';
          logoutBtn.addEventListener('click', () => {
              localStorage.removeItem('arFurnitureToken');
              window.location.href = 'login.html';
          });
      }
  
      // Load products
      try {
          await loadAndRenderProducts();
      } catch (error) {
          console.error('Failed to load products:', error);
          renderProducts(getFallbackProducts());
      }
  });
  
  async function loadAndRenderProducts() {
      const products = await fetchProducts();
      renderProducts(products);
      await verify3DModels(products);
      await updateWishlistButtons();
  }
  
  async function fetchProducts() {
      const headers = {};
      const token = localStorage.getItem('arFurnitureToken');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const response = await fetch(`${API_URL}/api/products`, { headers });
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
  }
  
  function renderProducts(products) {
      const container = document.getElementById('products-container');
      if (!container) {
          console.error("Product container not found");
          return;
      }
  
      container.innerHTML = products.map(product => `
          <div class="product-card" data-id="${product.id}">
              <div class="product-image">
                  <img src="${getPlaceholderImage(product.name)}" 
                       alt="${product.name}"
                       class="product-thumbnail">
              </div>
              <div class="product-details">
                  <h3>${product.name}</h3>
                  <p>$${product.price.toFixed(2)}</p>
                  <div class="product-actions">
                      <button class="view-ar-btn" 
                              onclick="handleViewInAR('${product.arModelUrl || product.modelPath}')">
                          View in AR
                      </button>
                      <button class="wishlist-btn" 
                              data-id="${product.id}"
                              onclick="addToWishlist(${product.id})">
                          ♡ Add to Wishlist
                      </button>
                  </div>
              </div>
          </div>
      `).join('');
  }
  
  async function verify3DModels(products) {
      const verificationResults = await Promise.all(
          products.map(async product => {
              const modelUrl = product.arModelUrl || product.modelPath;
              try {
                  const exists = await checkFileExists(modelUrl);
                  if (!exists) {
                      disableARButton(modelUrl);
                      return `Missing: ${modelUrl}`;
                  }
              } catch (error) {
                  console.warn(`Model check failed for ${modelUrl}:`, error);
              }
              return null;
          })
      );
  
      const warnings = verificationResults.filter(Boolean);
      if (warnings.length) {
          console.warn("Missing 3D models:\n" + warnings.join('\n'));
      }
  }
  
  async function updateWishlistButtons() {
      const token = localStorage.getItem('arFurnitureToken');
      if (!token) return;
  
      try {
          const response = await fetch(`${API_URL}/api/wishlist`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
              const { wishlist } = await response.json();
              wishlist.forEach(productId => {
                  document.querySelectorAll(`.wishlist-btn[data-id="${productId}"]`)
                      .forEach(btn => {
                          btn.innerHTML = '✓ In Wishlist';
                          btn.classList.add('in-wishlist');
                          btn.onclick = null;
                      });
              });
          }
      } catch (error) {
          console.error('Failed to update wishlist buttons:', error);
      }
  }
  
  window.handleViewInAR = async function(modelPath) {
      try {
          const response = await fetch(modelPath, { method: 'HEAD' });
          if (response.ok) {
              localStorage.setItem('arModelUrl', modelPath);
              window.location.href = 'ar-viewer.html';
          } else {
              alert("3D model failed to load. Please try another product.");
              disableARButton(modelPath);
          }
      } catch (error) {
          console.error("AR redirection failed:", error);
          alert("Network error. Please check your connection.");
      }
  };
  
  window.addToWishlist = async function(productId) {
      try {
          const token = localStorage.getItem('arFurnitureToken');
          if (!token) {
              alert('Please login to use wishlist');
              return window.location.href = 'login.html';
          }
  
          const response = await fetch(`${API_URL}/api/wishlist`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ productId })
          });
  
          if (!response.ok) {
              const error = await response.text();
              throw new Error(error || 'Failed to add to wishlist');
          }
  
          document.querySelectorAll(`.wishlist-btn[data-id="${productId}"]`)
              .forEach(btn => {
                  btn.innerHTML = '✓ In Wishlist';
                  btn.classList.add('in-wishlist');
                  btn.onclick = null;
              });
      } catch (error) {
          console.error('Wishlist error:', error);
          alert(error.message || 'Failed to update wishlist');
      }
  };
  
  // Helper functions
  function getPlaceholderImage(productName) {
      const color = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      return `https://via.placeholder.com/300/${color}/ffffff?text=${encodeURIComponent(productName)}`;
  }
  
  async function checkFileExists(url) {
      try {
          const response = await fetch(url, { method: 'HEAD' });
          return response.ok;
      } catch {
          return false;
      }
  }
  
  function disableARButton(modelPath) {
      document.querySelectorAll(`button[onclick*="${modelPath}"]`)
          .forEach(btn => {
              btn.disabled = true;
              btn.textContent = "Model Missing";
              btn.title = `3D file not found: ${modelPath}`;
          });
  }
  
  function getFallbackProducts() {
      return [
          {
              id: 1,
              name: "Modern Bed",
              price: 599.99,
              modelPath: "models/bed.glb",
              arModelUrl: "models/bed.glb"
          },
          {
              id: 2, 
              name: "Corner Sofa",
              price: 899.99,
              modelPath: "models/corner_sofa.glb",
              arModelUrl: "models/corner_sofa.glb"
          },
          {
              id: 3,
              name: "Antique Lantern",
              price: 129.99,
              modelPath: "models/lantern.glb",
              arModelUrl: "models/lantern.glb"
          }
      ];
  }