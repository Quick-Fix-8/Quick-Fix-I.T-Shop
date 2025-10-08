// Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const loginForm = document.getElementById('adminLogin');
  const dashboard = document.getElementById('dashboard');
  const errorMsg = document.getElementById('errorMsg');
  const logoutBtn = document.getElementById('logoutBtn');
  const addProductForm = document.getElementById('addProductForm');
  const productList = document.getElementById('productList');
  const refreshProducts = document.getElementById('refreshProducts');
  const exportProducts = document.getElementById('exportProducts');
  const clearForm = document.getElementById('clearForm');
  const emptyState = document.getElementById('emptyState');
  const notification = document.getElementById('adminNotification');
  
  // Image upload elements
  const imageUploadContainer = document.getElementById('imageUploadContainer');
  const imageFile = document.getElementById('imageFile');
  const imagePreview = document.getElementById('imagePreview');
  const imageUrl = document.getElementById('imageUrl');
  
  // Stats elements
  const totalProducts = document.getElementById('totalProducts');
  const totalOrders = document.getElementById('totalOrders');
  const totalCustomers = document.getElementById('totalCustomers');
  const totalRevenue = document.getElementById('totalRevenue');
  
  // Admin credentials
  const ADMIN_USER = "admin";
  const ADMIN_PASS = "12345";
  
  // Load products from localStorage
  let products = JSON.parse(localStorage.getItem('products')) || [];
  
  // Check if user is already logged in
  checkLoginStatus();
  
  // Initialize image upload functionality
  initializeImageUpload();
  
  // Login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      if (username === ADMIN_USER && password === ADMIN_PASS) {
        // Successful login
        localStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
        showNotification('Login successful!', 'success');
      } else {
        // Failed login
        errorMsg.textContent = 'Invalid username or password.';
        showNotification('Login failed!', 'error');
      }
    });
  }
  
  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.removeItem('adminLoggedIn');
      hideDashboard();
      showNotification('Logged out successfully!', 'success');
    });
  }
  
  // Add product form
  if (addProductForm) {
    addProductForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = document.getElementById('productName').value;
      const category = document.getElementById('productCategory').value;
      const price = parseFloat(document.getElementById('productPrice').value);
      const stock = parseInt(document.getElementById('productStock').value) || 0;
      const description = document.getElementById('productDescription').value;
      const badge = document.getElementById('productBadge').value;
      
      // Get image data
      let imageData = '';
      if (imagePreview.style.display !== 'none') {
        // Use uploaded image
        imageData = imagePreview.src;
      } else if (imageUrl.value.trim() !== '') {
        // Use URL
        imageData = imageUrl.value.trim();
      } else {
        // Use default image based on category
        imageData = `./images/${category}.jpg`;
      }
      
      // Generate a unique ID
      const id = Date.now();
      
      // Add product to array
      products.push({
        id,
        name,
        category,
        price,
        stock,
        image: imageData,
        description,
        badge: badge || null,
        createdAt: new Date().toISOString()
      });
      
      // Save to localStorage
      localStorage.setItem('products', JSON.stringify(products));
      
      // Update UI
      renderProducts();
      updateStats();
      
      // Reset form
      resetForm();
      
      // Show success message
      showNotification('Product added successfully!', 'success');
    });
  }
  
  // Clear form button
  if (clearForm) {
    clearForm.addEventListener('click', resetForm);
  }
  
  // Refresh products
  if (refreshProducts) {
    refreshProducts.addEventListener('click', function() {
      renderProducts();
      updateStats();
      showNotification('Products refreshed!', 'success');
    });
  }
  
  // Export products
  if (exportProducts) {
    exportProducts.addEventListener('click', exportProductsData);
  }
  
  // Functions
  function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    
    if (isLoggedIn === 'true') {
      showDashboard();
    }
  }
  
  function showDashboard() {
    document.getElementById('loginForm').classList.add('hidden');
    dashboard.classList.remove('hidden');
    
    // Load data
    renderProducts();
    updateStats();
  }
  
  function hideDashboard() {
    dashboard.classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    
    // Clear form
    if (loginForm) {
      loginForm.reset();
    }
    errorMsg.textContent = '';
  }
  
  function initializeImageUpload() {
    // File input change event
    imageFile.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        handleImageFile(file);
      }
    });
    
    // Drag and drop events
    imageUploadContainer.addEventListener('dragover', function(e) {
      e.preventDefault();
      this.classList.add('dragover');
    });
    
    imageUploadContainer.addEventListener('dragleave', function() {
      this.classList.remove('dragover');
    });
    
    imageUploadContainer.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('dragover');
      
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleImageFile(file);
      } else {
        showNotification('Please drop a valid image file!', 'error');
      }
    });
    
    // Click to open file dialog
    imageUploadContainer.addEventListener('click', function() {
      imageFile.click();
    });
    
    // URL input change event
    imageUrl.addEventListener('input', function() {
      if (this.value.trim() !== '') {
        clearImagePreview();
        imagePreview.src = this.value;
        imagePreview.style.display = 'block';
        imagePreview.onerror = function() {
          showNotification('Failed to load image from URL!', 'error');
          clearImagePreview();
        };
      }
    });
  }
  
  function handleImageFile(file) {
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showNotification('Image size must be less than 2MB!', 'error');
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file!', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      imagePreview.src = e.target.result;
      imagePreview.style.display = 'block';
      imageUrl.value = ''; // Clear URL input
    };
    reader.readAsDataURL(file);
  }
  
  function clearImagePreview() {
    imagePreview.style.display = 'none';
    imagePreview.src = '';
    imageFile.value = '';
  }
  
  function resetForm() {
    addProductForm.reset();
    clearImagePreview();
    imageUrl.value = '';
    showNotification('Form cleared!', 'success');
  }
  
  function renderProducts() {
    if (products.length === 0) {
      productList.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }
    
    emptyState.style.display = 'none';
    
    productList.innerHTML = products.map((product, index) => `
      <tr>
        <td class="product-image-cell">
          <img src="${product.image}" alt="${product.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWc8L3RleHQ+PC9zdmc+'">
        </td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>$${product.price}</td>
        <td>${product.stock}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn edit-btn" onclick="editProduct(${index})">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="action-btn delete-btn" onclick="deleteProduct(${index})">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }
  
  function updateStats() {
    // Update product count
    totalProducts.textContent = products.length;
    
    // Calculate totals
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
    
    // In a real application, these would come from a database
    totalOrders.textContent = Math.floor(products.length * 2.5);
    totalCustomers.textContent = Math.floor(products.length * 3.2);
    
    // Calculate total revenue
    totalRevenue.textContent = `$${totalValue.toFixed(2)}`;
  }
  
  function exportProductsData() {
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quickfix-products-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Products exported successfully!', 'success');
  }
  
  function showNotification(message, type = '') {
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = 'notification';
    
    if (type) {
      notification.classList.add(type);
    }
    
    notification.classList.add('active');
    
    setTimeout(() => {
      notification.classList.remove('active');
    }, 3000);
  }
  
  // Make functions globally accessible
  window.deleteProduct = function(index) {
    if (confirm('Are you sure you want to delete this product?')) {
      const productName = products[index].name;
      products.splice(index, 1);
      localStorage.setItem('products', JSON.stringify(products));
      renderProducts();
      updateStats();
      showNotification(`"${productName}" deleted successfully!`, 'success');
    }
  };
  
  window.editProduct = function(index) {
    const product = products[index];
    
    // Populate the form with product data
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productBadge').value = product.badge || '';
    
    // Handle image
    if (product.image.startsWith('data:')) {
      // Base64 image
      imagePreview.src = product.image;
      imagePreview.style.display = 'block';
      imageUrl.value = '';
    } else {
      // URL image
      imageUrl.value = product.image;
      clearImagePreview();
    }
    
    // Delete the product (since we're replacing it)
    products.splice(index, 1);
    
    // Scroll to the form
    document.getElementById('addProductForm').scrollIntoView({
      behavior: 'smooth'
    });
    
    showNotification('Product data loaded into form. Make your changes and click "Add Product" to update.', 'success');
  };
  
  window.clearAllProducts = function() {
    if (confirm('Are you sure you want to delete ALL products? This action cannot be undone!')) {
      products = [];
      localStorage.setItem('products', JSON.stringify(products));
      renderProducts();
      updateStats();
      showNotification('All products cleared!', 'success');
    }
  };
  
  window.generateSampleProducts = function() {
    const sampleProducts = [
      {
        id: Date.now() + 1,
        name: "HP Pavilion Laptop",
        category: "laptop",
        price: 799,
        stock: 15,
        image: "./images/laptop.jpg",
        description: "Intel Core i7, 16GB RAM, 512GB SSD, 15.6\" Display",
        badge: "Popular",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 2,
        name: "Samsung Galaxy S23",
        category: "phone",
        price: 899,
        stock: 20,
        image: "./images/phone.jpg",
        description: "6.1\" Dynamic AMOLED, 128GB Storage, 50MP Camera",
        badge: "New",
        createdAt: new Date().toISOString()
      }
    ];
    
    products.push(...sampleProducts);
    localStorage.setItem('products', JSON.stringify(products));
    renderProducts();
    updateStats();
    showNotification('Sample products generated!', 'success');
  };
  
  window.backupProducts = function() {
    localStorage.setItem('products_backup', JSON.stringify(products));
    showNotification('Products backed up successfully!', 'success');
  };
  
  window.showSystemInfo = function() {
    const info = `
      Total Products: ${products.length}
      Storage Used: ${JSON.stringify(products).length} bytes
      Last Backup: ${localStorage.getItem('products_backup') ? 'Available' : 'Not available'}
      Admin: Logged In
    `;
    alert('System Information:\n' + info);
  };
  
  window.clearImage = function() {
    clearImagePreview();
    imageUrl.value = '';
  };
});