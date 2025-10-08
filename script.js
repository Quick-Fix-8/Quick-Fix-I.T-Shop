// Main JavaScript for Quick-Fix I.T Shop

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  
  if (hamburger) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }
  
  // Close mobile menu when clicking on a link
  document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  }));
  
  // Cart functionality
  const cartSidebar = document.getElementById('cartSidebar');
  const closeCart = document.getElementById('closeCart');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const cartCount = document.querySelector('.cart-count');
  const notification = document.getElementById('notification');
  
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Initialize products
  initializeProducts();
  
  // Initialize cart
  updateCart();
  
  // Cart toggle
  document.querySelector('.cart-icon a').addEventListener('click', function(e) {
    e.preventDefault();
    cartSidebar.classList.add('active');
  });
  
  // Close cart
  if (closeCart) {
    closeCart.addEventListener('click', function() {
      cartSidebar.classList.remove('active');
    });
  }
  
  // Price range update
  const priceRange = document.getElementById('priceRange');
  const priceValue = document.getElementById('priceValue');
  
  if (priceRange && priceValue) {
    priceRange.addEventListener('input', function() {
      priceValue.textContent = `$${this.value}`;
      filterProducts();
    });
  }
  
  // Search and filter functionality
  const searchBox = document.getElementById('searchBox');
  const categoryFilter = document.getElementById('categoryFilter');
  const sortBy = document.getElementById('sortBy');
  
  if (searchBox) {
    searchBox.addEventListener('input', filterProducts);
  }
  
  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterProducts);
  }
  
  if (sortBy) {
    sortBy.addEventListener('change', filterProducts);
  }
  
  // Load more products
  const loadMoreBtn = document.getElementById('loadMore');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', loadMoreProducts);
  }
  
  // Contact form submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      showNotification('Thank you for your message! We will get back to you soon.', 'success');
      this.reset();
    });
  }
  
  // Newsletter form
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      showNotification('Thank you for subscribing to our newsletter!', 'success');
      this.reset();
    });
  }
  
  // Functions
  function initializeProducts() {
    // Check if products exist in localStorage (from admin panel)
    const adminProducts = JSON.parse(localStorage.getItem('products'));
    
    if (adminProducts && adminProducts.length > 0) {
      // Use admin products
      displayProducts(adminProducts);
    } else {
      // Use sample products
      const sampleProducts = getSampleProducts();
      displayProducts(sampleProducts);
    }
  }
  
  function getSampleProducts() {
    return [
      {
        id: 1,
        name: "HP Pavilion Laptop",
        category: "laptop",
        price: 799,
        image: "./images/laptop.jpg",
        description: "Intel Core i7, 16GB RAM, 512GB SSD, 15.6\" Display",
        badge: "Popular"
      },
      {
        id: 2,
        name: "Samsung Galaxy S23",
        category: "phone",
        price: 899,
        image: "./images/phone.jpg",
        description: "6.1\" Dynamic AMOLED, 128GB Storage, 50MP Camera",
        badge: "New"
      },
      {
        id: 3,
        name: "Apple Watch Series 8",
        category: "watch",
        price: 399,
        image: "./images/smartwatch.jpg",
        description: "GPS, 45mm, Heart Rate Monitor, Always-On Retina Display"
      },
      {
        id: 4,
        name: "Sony WH-1000XM5",
        category: "earbuds",
        price: 349,
        image: "./images/earbuds.jpg",
        description: "Noise Canceling Wireless Headphones, 30hr Battery",
        badge: "Sale"
      },
      {
        id: 5,
        name: "Dell XPS 13",
        category: "laptop",
        price: 999,
        image: "./images/laptop.jpg",
        description: "Intel Core i5, 8GB RAM, 256GB SSD, 13.4\" Display"
      },
      {
        id: 6,
        name: "iPhone 14 Pro",
        category: "phone",
        price: 999,
        image: "./images/phone.jpg",
        description: "6.1\" Super Retina XDR, 128GB, Triple Camera System",
        badge: "Best Seller"
      },
      {
        id: 7,
        name: "Fitbit Versa 4",
        category: "watch",
        price: 229,
        image: "./images/smartwatch.jpg",
        description: "Health & Fitness Smartwatch, GPS, Sleep Tracking"
      },
      {
        id: 8,
        name: "AirPods Pro",
        category: "earbuds",
        price: 249,
        image: "./images/earbuds.jpg",
        description: "Active Noise Cancellation, Transparency Mode, Spatial Audio"
      }
    ];
  }
  
  function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    
    if (!productsGrid) return;
    
    productsGrid.innerHTML = products.map(product => `
      <div class="product-card" data-category="${product.category}" data-price="${product.price}">
        ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" onerror="handleImageError(this)">
        </div>
        <div class="product-info">
          <div class="product-category">${product.category}</div>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-price">$${product.price}</div>
          <div class="product-actions">
            <button class="add-to-cart" onclick="addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.image}')">
              Add to Cart
            </button>
            <button class="wishlist">
              <i class="far fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  function filterProducts() {
    const searchText = searchBox.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const maxPrice = parseInt(priceRange.value);
    const sortValue = sortBy.value;
    
    const productsGrid = document.getElementById('productsGrid');
    const productCards = productsGrid.querySelectorAll('.product-card');
    
    let visibleProducts = 0;
    
    productCards.forEach(card => {
      const name = card.querySelector('.product-title').textContent.toLowerCase();
      const category = card.getAttribute('data-category');
      const price = parseInt(card.getAttribute('data-price'));
      
      const matchesSearch = name.includes(searchText);
      const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
      const matchesPrice = price <= maxPrice;
      
      if (matchesSearch && matchesCategory && matchesPrice) {
        card.style.display = 'block';
        visibleProducts++;
      } else {
        card.style.display = 'none';
      }
    });
    
    // Sort products if a sort option is selected
    if (sortValue !== 'default') {
      sortProducts(sortValue);
    }
    
    // Show message if no products found
    const noProductsMsg = document.getElementById('noProductsMessage');
    if (visibleProducts === 0) {
      if (!noProductsMsg) {
        const message = document.createElement('p');
        message.id = 'noProductsMessage';
        message.style.textAlign = 'center';
        message.style.gridColumn = '1 / -1';
        message.style.padding = '2rem';
        message.textContent = 'No products found matching your criteria.';
        productsGrid.appendChild(message);
      }
    } else if (noProductsMsg) {
      noProductsMsg.remove();
    }
  }
  
  function sortProducts(sortValue) {
    const productsGrid = document.getElementById('productsGrid');
    const productCards = Array.from(productsGrid.querySelectorAll('.product-card'));
    
    productCards.sort((a, b) => {
      const priceA = parseInt(a.getAttribute('data-price'));
      const priceB = parseInt(b.getAttribute('data-price'));
      const nameA = a.querySelector('.product-title').textContent.toLowerCase();
      const nameB = b.querySelector('.product-title').textContent.toLowerCase();
      
      switch(sortValue) {
        case 'priceLow':
          return priceA - priceB;
        case 'priceHigh':
          return priceB - priceA;
        case 'nameAZ':
          return nameA.localeCompare(nameB);
        case 'nameZA':
          return nameB.localeCompare(nameA);
        default:
          return 0;
      }
    });
    
    // Re-append sorted products
    productCards.forEach(card => productsGrid.appendChild(card));
  }
  
  function loadMoreProducts() {
    // In a real application, this would fetch more products from an API
    showNotification('Loading more products...', 'success');
    
    // Simulate loading delay
    setTimeout(() => {
      showNotification('No more products to load at the moment.', 'error');
    }, 1000);
  }
  
  // Image error handling
  window.handleImageError = function(img) {
    // Replace broken image with a placeholder
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg';
    img.alt = 'Image not available';
  };
  
  // Cart functions (make them globally accessible)
  window.addToCart = function(productId, productName, productPrice, productImage) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
        quantity: 1
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
    showNotification(`${productName} added to cart!`, 'success');
    
    // Open cart sidebar
    cartSidebar.classList.add('active');
  };
  
  function updateCart() {
    // Update cart count in navbar
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
      cartCount.textContent = totalItems;
    }
    
    // Update cart items in sidebar
    if (cartItems) {
      if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; padding: 2rem;">Your cart is empty</p>';
      } else {
        cartItems.innerHTML = cart.map(item => `
          <div class="cart-item">
            <div class="cart-item-image">
              <img src="${item.image}" alt="${item.name}" onerror="handleImageError(this)">
            </div>
            <div class="cart-item-details">
              <div class="cart-item-title">${item.name}</div>
              <div class="cart-item-price">$${item.price}</div>
              <div class="cart-item-actions">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                <button class="remove-item" onclick="removeFromCart(${item.id})">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('');
      }
    }
    
    // Update cart total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal) {
      cartTotal.textContent = `$${total.toFixed(2)}`;
    }
  }
  
  window.updateQuantity = function(productId, newQuantity) {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
      item.quantity = newQuantity;
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCart();
    }
  };
  
  window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
    showNotification('Item removed from cart', 'error');
  };
  
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
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Add active class to nav links based on scroll position
  window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (pageYOffset >= sectionTop - 100) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
});