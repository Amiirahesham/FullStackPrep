class Product {
  constructor(id, name, price, category, stockQuantity = 10) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.category = category;
    this.stockQuantity = stockQuantity;
  }

  getFinalPrice() {
    return this.price;
  }
}

class DiscountedProduct extends Product {
  constructor(id, name, price, category, stockQuantity, discountRate) {
    super(id, name, price, category, stockQuantity);
    this.discountRate = discountRate;
  }

  getFinalPrice() {
    return this.price - (this.price * this.discountRate);
  }
}

Product.prototype.getFormattedPrice = function() {
  return `$${this.getFinalPrice().toFixed(2)}`;
};

class Cart {
  constructor() {
    this.items = [];
  }

  addProduct(product, quantity = 1) {
    const existingItem = this.items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ product, quantity });
    }
    this.saveState();
  }

  removeProduct(productId) {
    this.items = this.items.filter(item => item.product.id !== productId);
    this.saveState();
  }

  getCartSummary() {
    return this.items.map(item => ({
      id: item.product.id,
      name: item.product.name,
      unitPrice: item.product.getFinalPrice(),
      quantity: item.quantity,
      subtotal: item.product.getFinalPrice() * item.quantity
    }));
  }

  calculateTotal() {
    return this.items.reduce((total, item) => {
      return total + (item.product.getFinalPrice() * item.quantity);
    }, 0);
  }

  findItemDetails(productId) {
    return this.items.find(item => item.product.id === productId);
  }

  hasDiscountedItems() {
    return this.items.some(item => item.product instanceof DiscountedProduct);
  }

  isStockAvailableForOrder() {
    return this.items.every(item => item.quantity <= item.product.stockQuantity);
  }

  sortBySubtotal(ascending = true) {
    return [...this.items].sort((a, b) => {
      const subtotalA = a.product.getFinalPrice() * a.quantity;
      const subtotalB = b.product.getFinalPrice() * b.quantity;
      return ascending ? subtotalA - subtotalB : subtotalB - subtotalA;
    });
  }

  filterByCategory(categoryName) {
    return this.items.filter(item => item.product.category === categoryName);
  }

  saveState() {
    try {
      const serializedData = JSON.stringify(this.items);
      localStorage.setItem('shoppingCart', serializedData);
    } catch (error) {
      console.error("Storage failed", error);
    }
  }

  loadState(catalog) {
    try {
      const storedData = localStorage.getItem('shoppingCart');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        this.items = parsedData.map(data => {
          const matchedProduct = catalog.find(p => p.id === data.product.id);
          return { product: matchedProduct, quantity: data.quantity };
        }).filter(item => item.product !== undefined);
      }
    } catch (error) {
      console.error("Load failed", error);
    }
  }
}

const storeCatalog = [
  new Product(1, "Laptop", 1200, "Electronics", 5),
  new Product(2, "Wireless Mouse", 40, "Electronics", 20),
  new DiscountedProduct(3, "Mechanical Keyboard", 150, "Electronics", 10, 0.20),
  new Product(4, "Ceramic Mug", 15, "Kitchen", 50)
];

const userCart = new Cart();
userCart.loadState(storeCatalog);

const productGrid = document.getElementById("product-grid");
const cartList = document.getElementById("cart-list");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");

function renderCatalog(products) {
  productGrid.innerHTML = products.map(product => `
    <div class="product-card">
      <span class="product-category">${product.category}</span>
      <h3 class="product-title">${product.name}</h3>
      <p class="product-price">${product.getFormattedPrice()}</p>
      <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
    </div>
  `).join("");
}

function renderCart(itemsToRender = userCart.items) {
  cartList.innerHTML = itemsToRender.map(item => `
    <li class="cart-item">
      <div class="cart-item-info">
        <span class="cart-item-title">${item.product.name} (x${item.quantity})</span>
        <span class="cart-item-meta">Subtotal: $${(item.product.getFinalPrice() * item.quantity).toFixed(2)}</span>
      </div>
      <button class="remove-btn" onclick="removeFromCart(${item.product.id})">Remove</button>
    </li>
  `).join("");

  const total = itemsToRender.reduce((sum, item) => sum + (item.product.getFinalPrice() * item.quantity), 0);
  cartTotal.textContent = `$${total.toFixed(2)}`;
  checkoutBtn.disabled = itemsToRender.length === 0;
}

window.addToCart = function(productId) {
  const product = storeCatalog.find(p => p.id === productId);
  if (product) {
    userCart.addProduct(product, 1);
    renderCart();
  }
};

window.removeFromCart = function(productId) {
  userCart.removeProduct(productId);
  renderCart();
};

document.getElementById("sort-asc").addEventListener("click", () => {
  renderCart(userCart.sortBySubtotal(true));
});

document.getElementById("sort-desc").addEventListener("click", () => {
  renderCart(userCart.sortBySubtotal(false));
});

document.getElementById("filter-all").addEventListener("click", () => {
  renderCatalog(storeCatalog);
});

document.getElementById("filter-electronics").addEventListener("click", () => {
  renderCatalog(storeCatalog.filter(p => p.category === "Electronics"));
});

document.getElementById("filter-kitchen").addEventListener("click", () => {
  renderCatalog(storeCatalog.filter(p => p.category === "Kitchen"));
});

renderCatalog(storeCatalog);
renderCart();