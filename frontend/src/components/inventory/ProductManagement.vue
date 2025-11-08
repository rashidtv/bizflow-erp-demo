<template>
  <div class="inventory-page">
    <div class="page-header">
      <h1>📦 Inventory Management</h1>
      <p>Track products, manage stock levels, and handle suppliers</p>
    </div>

    <div class="demo-banner" v-if="$route.query.demo">
      <div class="demo-content">
        <span class="demo-badge">DEMO MODE</span>
        <p>Experience real-time inventory tracking and stock management</p>
      </div>
    </div>

    <div class="inventory-grid">
      <!-- Quick Stats -->
      <div class="stats-section">
        <div class="stats-overview">
          <div class="stat-card">
            <div class="stat-icon total">📊</div>
            <div class="stat-info">
              <h3>{{ totalProducts }}</h3>
              <p>Total Products</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon low-stock">⚠️</div>
            <div class="stat-info">
              <h3>{{ lowStockCount }}</h3>
              <p>Low Stock Items</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon value">💰</div>
            <div class="stat-info">
              <h3>RM {{ totalValue.toLocaleString() }}</h3>
              <p>Total Inventory Value</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon suppliers">🏢</div>
            <div class="stat-info">
              <h3>{{ suppliers.length }}</h3>
              <p>Active Suppliers</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="actions-section">
        <h2>Quick Actions</h2>
        <div class="action-buttons">
          <button class="action-btn primary" @click="showAddProduct = true">
            <span class="btn-icon">➕</span>
            Add Product
          </button>
          <button class="action-btn" @click="showStockAdjustment = true">
            <span class="btn-icon">📝</span>
            Stock Adjustment
          </button>
          <button class="action-btn" @click="generateReport">
            <span class="btn-icon">📊</span>
            Stock Report
          </button>
          <button class="action-btn" @click="showSupplierModal = true">
            <span class="btn-icon">🏢</span>
            Add Supplier
          </button>
        </div>
      </div>

      <!-- Products List -->
      <div class="products-section">
        <div class="section-header">
          <h2>Products</h2>
          <div class="search-filter">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search products..." 
              class="search-input"
            >
            <select v-model="categoryFilter" class="filter-select">
              <option value="">All Categories</option>
              <option value="services">Services</option>
              <option value="products">Products</option>
              <option value="materials">Materials</option>
            </select>
          </div>
        </div>
        
        <div class="products-table">
          <div class="table-header">
            <div class="col-name">Product Name</div>
            <div class="col-sku">SKU</div>
            <div class="col-category">Category</div>
            <div class="col-stock">Stock</div>
            <div class="col-price">Price</div>
            <div class="col-actions">Actions</div>
          </div>
          
          <div 
            v-for="product in filteredProducts" 
            :key="product.id" 
            class="table-row"
            :class="{ 'low-stock': product.stock < product.low_stock_alert }"
          >
            <div class="col-name">
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-description">{{ product.description }}</div>
              </div>
            </div>
            <div class="col-sku">{{ product.sku }}</div>
            <div class="col-category">
              <span class="category-badge" :class="product.category">
                {{ product.category }}
              </span>
            </div>
            <div class="col-stock">
              <div class="stock-info">
                <span class="stock-quantity">{{ product.stock }}</span>
                <div class="stock-bar">
                  <div 
                    class="stock-fill" 
                    :class="getStockLevel(product.stock, product.low_stock_alert)"
                    :style="{ width: getStockPercentage(product.stock, product.max_stock) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
            <div class="col-price">
              <div class="price-amount">RM {{ product.price.toLocaleString() }}</div>
              <div class="cost-amount">Cost: RM {{ product.cost.toLocaleString() }}</div>
            </div>
            <div class="col-actions">
              <button class="btn-icon-small" @click="editProduct(product)" title="Edit">
                ✏️
              </button>
              <button class="btn-icon-small" @click="adjustStock(product)" title="Adjust Stock">
                📦
              </button>
              <button class="btn-icon-small danger" @click="deleteProduct(product)" title="Delete">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Low Stock Alert -->
      <div class="alerts-section" v-if="lowStockProducts.length > 0">
        <h2>⚠️ Low Stock Alerts</h2>
        <div class="alerts-list">
          <div v-for="product in lowStockProducts" :key="product.id" class="alert-item">
            <div class="alert-content">
              <strong>{{ product.name }}</strong>
              <span>Only {{ product.stock }} left (Min: {{ product.low_stock_alert }})</span>
            </div>
            <button class="btn-small primary" @click="reorderProduct(product)">Reorder</button>
          </div>
        </div>
      </div>

      <!-- Suppliers -->
      <div class="suppliers-section">
        <h2>Suppliers</h2>
        <div class="suppliers-list">
          <div v-for="supplier in suppliers" :key="supplier.id" class="supplier-card">
            <div class="supplier-avatar">
              {{ supplier.name.charAt(0) }}
            </div>
            <div class="supplier-info">
              <h4>{{ supplier.name }}</h4>
              <p>{{ supplier.contact_email }}</p>
              <span class="supplier-meta">{{ supplier.phone }}</span>
            </div>
            <div class="supplier-products">
              {{ supplier.product_count }} products
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Product Modal -->
    <div v-if="showAddProduct" class="modal-overlay" @click="showAddProduct = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Add New Product</h3>
          <button class="close-btn" @click="showAddProduct = false">×</button>
        </div>
        <div class="modal-content">
          <div class="form-row">
            <div class="form-group">
              <label>Product Name *</label>
              <input type="text" v-model="newProduct.name" placeholder="Enter product name">
            </div>
            <div class="form-group">
              <label>SKU *</label>
              <input type="text" v-model="newProduct.sku" placeholder="Product SKU">
            </div>
          </div>
          
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newProduct.description" placeholder="Product description"></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Category *</label>
              <select v-model="newProduct.category">
                <option value="services">Services</option>
                <option value="products">Products</option>
                <option value="materials">Materials</option>
              </select>
            </div>
            <div class="form-group">
              <label>Supplier</label>
              <select v-model="newProduct.supplier_id">
                <option value="">Select Supplier</option>
                <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                  {{ supplier.name }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Cost Price (RM) *</label>
              <input type="number" v-model="newProduct.cost" step="0.01">
            </div>
            <div class="form-group">
              <label>Selling Price (RM) *</label>
              <input type="number" v-model="newProduct.price" step="0.01">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Current Stock *</label>
              <input type="number" v-model="newProduct.stock">
            </div>
            <div class="form-group">
              <label>Low Stock Alert</label>
              <input type="number" v-model="newProduct.low_stock_alert" placeholder="10">
            </div>
            <div class="form-group">
              <label>Max Stock</label>
              <input type="number" v-model="newProduct.max_stock" placeholder="1000">
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showAddProduct = false">Cancel</button>
          <button class="btn-primary" @click="addProduct">Add Product</button>
        </div>
      </div>
    </div>

    <!-- Stock Adjustment Modal -->
    <div v-if="showStockAdjustment" class="modal-overlay" @click="showStockAdjustment = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Bulk Stock Adjustment</h3>
          <button class="close-btn" @click="showStockAdjustment = false">×</button>
        </div>
        <div class="modal-content">
          <div class="form-group">
            <label>Select Product</label>
            <select v-model="selectedProductId">
              <option value="">Select a product</option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.name }} (Current: {{ product.stock }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Adjustment Type</label>
            <select v-model="adjustmentType">
              <option value="add">Add Stock</option>
              <option value="remove">Remove Stock</option>
              <option value="set">Set Stock</option>
            </select>
          </div>
          <div class="form-group">
            <label>Quantity</label>
            <input type="number" v-model="adjustmentQuantity" placeholder="Enter quantity">
          </div>
          <div class="adjustment-preview" v-if="selectedProduct">
            <h4>Preview</h4>
            <div class="preview-item">
              <span>Current Stock:</span>
              <span>{{ selectedProduct.stock }}</span>
            </div>
            <div class="preview-item">
              <span>New Stock:</span>
              <span>{{ calculateNewStock }}</span>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showStockAdjustment = false">Cancel</button>
          <button class="btn-primary" @click="applyBulkAdjustment" :disabled="!selectedProductId || !adjustmentQuantity">
            Apply Adjustment
          </button>
        </div>
      </div>
    </div>

    <!-- Add Supplier Modal -->
    <div v-if="showSupplierModal" class="modal-overlay" @click="showSupplierModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Add New Supplier</h3>
          <button class="close-btn" @click="showSupplierModal = false">×</button>
        </div>
        <div class="modal-content">
          <div class="form-row">
            <div class="form-group">
              <label>Supplier Name *</label>
              <input type="text" v-model="newSupplier.name" placeholder="Enter supplier name">
            </div>
            <div class="form-group">
              <label>Contact Email</label>
              <input type="email" v-model="newSupplier.contact_email" placeholder="email@supplier.com">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Phone Number</label>
              <input type="text" v-model="newSupplier.phone" placeholder="+603-1234-5678">
            </div>
            <div class="form-group">
              <label>Address</label>
              <input type="text" v-model="newSupplier.address" placeholder="Supplier address">
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showSupplierModal = false">Cancel</button>
          <button class="btn-primary" @click="addSupplier">Add Supplier</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductManagement',
  data() {
    return {
      showAddProduct: false,
      showStockAdjustment: false,
      showSupplierModal: false,
      searchQuery: '',
      categoryFilter: '',
      selectedProductId: null,
      adjustmentType: 'add',
      adjustmentQuantity: 0,
      newProduct: {
        name: '',
        sku: '',
        description: '',
        category: 'products',
        supplier_id: null,
        cost: 0,
        price: 0,
        stock: 0,
        low_stock_alert: 10,
        max_stock: 1000
      },
      newSupplier: {
        name: '',
        contact_email: '',
        phone: '',
        address: ''
      },
      products: [
        {
          id: 1,
          name: 'Consulting Package - Basic',
          sku: 'CON-BASIC-001',
          description: 'Basic consulting services package',
          category: 'services',
          cost: 800,
          price: 2000,
          stock: 999,
          low_stock_alert: 10,
          max_stock: 1000
        },
        {
          id: 2,
          name: 'Consulting Package - Premium',
          sku: 'CON-PREMIUM-001',
          description: 'Premium consulting services with additional features',
          category: 'services',
          cost: 2000,
          price: 5000,
          stock: 999,
          low_stock_alert: 10,
          max_stock: 1000
        },
        {
          id: 3,
          name: 'Business Cards (500 pcs)',
          sku: 'PRD-CARD-500',
          description: 'Premium business card printing',
          category: 'products',
          cost: 150,
          price: 300,
          stock: 45,
          low_stock_alert: 20,
          max_stock: 500
        },
        {
          id: 4,
          name: 'Marketing Brochures',
          sku: 'PRD-BROCH-100',
          description: 'Full color marketing brochures',
          category: 'products',
          cost: 200,
          price: 450,
          stock: 15,
          low_stock_alert: 25,
          max_stock: 200
        },
        {
          id: 5,
          name: 'Office Paper A4',
          sku: 'MAT-PAPER-A4',
          description: 'Premium A4 office paper',
          category: 'materials',
          cost: 25,
          price: 45,
          stock: 8,
          low_stock_alert: 15,
          max_stock: 100
        }
      ],
      suppliers: [
        {
          id: 1,
          name: 'Print Solutions Sdn Bhd',
          contact_email: 'sales@printsolutions.my',
          phone: '+603-1234-5678',
          product_count: 2
        },
        {
          id: 2,
          name: 'Office Supplies Malaysia',
          contact_email: 'orders@officesupplies.com',
          phone: '+603-8765-4321',
          product_count: 1
        }
      ]
    }
  },
  computed: {
    filteredProducts() {
      return this.products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            product.sku.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesCategory = !this.categoryFilter || product.category === this.categoryFilter;
        return matchesSearch && matchesCategory;
      });
    },
    totalProducts() {
      return this.products.length;
    },
    lowStockCount() {
      return this.lowStockProducts.length;
    },
    lowStockProducts() {
      return this.products.filter(product => product.stock < product.low_stock_alert);
    },
    totalValue() {
      return this.products.reduce((total, product) => total + (product.cost * product.stock), 0);
    },
    selectedProduct() {
      return this.products.find(p => p.id === parseInt(this.selectedProductId));
    },
    calculateNewStock() {
      if (!this.selectedProduct) return 0;
      
      const current = this.selectedProduct.stock;
      const quantity = parseInt(this.adjustmentQuantity) || 0;
      
      switch (this.adjustmentType) {
        case 'add':
          return current + quantity;
        case 'remove':
          return Math.max(0, current - quantity);
        case 'set':
          return Math.max(0, quantity);
        default:
          return current;
      }
    }
  },
  methods: {
    getStockLevel(stock, lowStockAlert) {
      if (stock === 0) return 'out-of-stock';
      if (stock < lowStockAlert) return 'low';
      if (stock < lowStockAlert * 2) return 'medium';
      return 'good';
    },
    getStockPercentage(stock, maxStock) {
      return Math.min((stock / maxStock) * 100, 100);
    },
    addProduct() {
      // Validation
      if (!this.newProduct.name || !this.newProduct.sku) {
        this.$root.showNotification(
          'Missing Information',
          'Please fill in all required fields (Name and SKU).',
          'error'
        );
        return;
      }

      const newProd = {
        id: this.products.length + 1,
        ...this.newProduct
      };
      this.products.unshift(newProd);
      this.showAddProduct = false;
      this.resetNewProduct();
      
      this.$root.showNotification(
        'Product Added',
        `${newProd.name} has been added to inventory.`,
        'success'
      );
    },
    resetNewProduct() {
      this.newProduct = {
        name: '',
        sku: '',
        description: '',
        category: 'products',
        supplier_id: null,
        cost: 0,
        price: 0,
        stock: 0,
        low_stock_alert: 10,
        max_stock: 1000
      };
    },
    editProduct(product) {
      this.$root.showNotification(
        'Edit Mode',
        `Editing ${product.name}. Make your changes and save.`,
        'info'
      );
    },
    adjustStock(product) {
      const adjustment = prompt(`Adjust stock for ${product.name}. Current: ${product.stock}. Enter change (+/-):`, '0');
      if (adjustment !== null) {
        const newStock = product.stock + parseInt(adjustment);
        if (newStock >= 0) {
          product.stock = newStock;
          this.$root.showNotification(
            'Stock Updated',
            `Stock for ${product.name} updated to ${newStock}.`,
            'success'
          );
        } else {
          this.$root.showNotification(
            'Invalid Quantity',
            'Stock quantity cannot be negative.',
            'error'
          );
        }
      }
    },
    deleteProduct(product) {
      if (confirm(`Are you sure you want to delete ${product.name}?`)) {
        this.products = this.products.filter(p => p.id !== product.id);
        this.$root.showNotification(
          'Product Deleted',
          `${product.name} has been removed from inventory.`,
          'warning'
        );
      }
    },
    reorderProduct(product) {
      this.$root.showNotification(
        'Reorder Requested',
        `Reorder request sent for ${product.name}. Current stock: ${product.stock}`,
        'warning',
        6000
      );
    },
    generateReport() {
      this.$root.showNotification(
        'Report Generated',
        'Inventory report has been generated and downloaded.',
        'success'
      );
    },
    applyBulkAdjustment() {
      if (!this.selectedProductId || !this.adjustmentQuantity) {
        this.$root.showNotification(
          'Missing Information',
          'Please select a product and enter quantity.',
          'error'
        );
        return;
      }

      const product = this.selectedProduct;
      const newStock = this.calculateNewStock;

      if (newStock < 0) {
        this.$root.showNotification(
          'Invalid Quantity',
          'Stock quantity cannot be negative.',
          'error'
        );
        return;
      }

      product.stock = newStock;
      this.showStockAdjustment = false;
      this.selectedProductId = null;
      this.adjustmentQuantity = 0;

      this.$root.showNotification(
        'Stock Adjusted',
        `${product.name} stock updated to ${newStock}.`,
        'success'
      );
    },
    addSupplier() {
      if (!this.newSupplier.name) {
        this.$root.showNotification(
          'Missing Information',
          'Please enter supplier name.',
          'error'
        );
        return;
      }

      const newSupp = {
        id: this.suppliers.length + 1,
        ...this.newSupplier,
        product_count: 0
      };
      this.suppliers.push(newSupp);
      this.showSupplierModal = false;
      this.newSupplier = { name: '', contact_email: '', phone: '', address: '' };

      this.$root.showNotification(
        'Supplier Added',
        `${newSupp.name} has been added to suppliers.`,
        'success'
      );
    }
  }
}
</script>

<style scoped>
.inventory-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
  width: 100%;
  max-width: 100%;
}

.page-header h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  margin-bottom: 0.5rem;
  color: #2d3748;
  word-wrap: break-word;
}

.page-header p {
  color: #718096;
  font-size: clamp(0.9rem, 2vw, 1.2rem);
  max-width: 600px;
  margin: 0 auto;
  word-wrap: break-word;
}

.demo-banner {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.demo-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.demo-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Enhanced Grid Layout */
.inventory-grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto auto auto;
  gap: 2rem;
  width: 100%;
  max-width: 100%;
  grid-template-areas: 
    "stats"
    "actions"
    "products"
    "alerts"
    "suppliers";
}

.stats-section {
  grid-area: stats;
  width: 100%;
  max-width: 100%;
}

.actions-section {
  grid-area: actions;
  width: 100%;
  max-width: 100%;
}

.products-section {
  grid-area: products;
  width: 100%;
  max-width: 100%;
}

.alerts-section {
  grid-area: alerts;
  width: 100%;
  max-width: 100%;
}

.suppliers-section {
  grid-area: suppliers;
  width: 100%;
  max-width: 100%;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e1e5e9;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2.5rem;
  padding: 1rem;
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-icon.total {
  background: linear-gradient(135deg, #4299e1, #3182ce);
}

.stat-icon.low-stock {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
}

.stat-icon.value {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.stat-icon.suppliers {
  background: linear-gradient(135deg, #9f7aea, #805ad5);
}

.stat-info h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  word-wrap: break-word;
}

.stat-info p {
  margin: 0.25rem 0 0 0;
  color: #718096;
  font-size: 0.9rem;
  word-wrap: break-word;
}

.actions-section h2,
.products-section h2,
.alerts-section h2,
.suppliers-section h2 {
  margin-bottom: 1rem;
  color: #2d3748;
  word-wrap: break-word;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 100%;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
}

.action-btn:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.action-btn.primary {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  color: white;
  border-color: transparent;
}

.action-btn.primary:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
}

.search-filter {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
}

.search-input {
  padding: 0.75rem 1rem;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  min-width: 200px;
  flex: 1;
  max-width: 100%;
  box-sizing: border-box;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  background: white;
  min-width: 150px;
  max-width: 100%;
  box-sizing: border-box;
}

.products-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e5e9;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f7fafc;
  border-bottom: 1px solid #e1e5e9;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e1e5e9;
  align-items: center;
  transition: background 0.3s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.table-row:hover {
  background: #f7fafc;
}

.table-row.low-stock {
  background: #fff5f5;
  border-left: 4px solid #e53e3e;
}

.table-row:last-child {
  border-bottom: none;
}

.col-name {
  font-weight: 600;
  color: #2d3748;
  min-width: 0;
}

.product-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.product-name {
  font-weight: 600;
  color: #2d3748;
  word-wrap: break-word;
  overflow-wrap: break-word;
  min-width: 0;
}

.product-description {
  font-size: 0.8rem;
  color: #718096;
  margin-top: 0.25rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
  min-width: 0;
}

.col-sku {
  font-family: monospace;
  color: #4a5568;
  font-size: 0.9rem;
  word-wrap: break-word;
}

.category-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
}

.category-badge.services {
  background: #e6fffa;
  color: #234e52;
}

.category-badge.products {
  background: #ebf8ff;
  color: #2a4365;
}

.category-badge.materials {
  background: #faf5ff;
  color: #44337a;
}

.stock-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.stock-quantity {
  font-weight: 600;
  color: #2d3748;
  word-wrap: break-word;
}

.stock-bar {
  width: 100%;
  height: 6px;
  background: #e1e5e9;
  border-radius: 3px;
  overflow: hidden;
}

.stock-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.stock-fill.good {
  background: #48bb78;
}

.stock-fill.medium {
  background: #ed8936;
}

.stock-fill.low {
  background: #e53e3e;
}

.stock-fill.out-of-stock {
  background: #a0aec0;
}

.price-amount {
  font-weight: 700;
  color: #2d3748;
  word-wrap: break-word;
}

.cost-amount {
  font-size: 0.8rem;
  color: #718096;
  word-wrap: break-word;
}

.col-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn-icon-small {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.3s ease;
  font-size: 1rem;
  flex-shrink: 0;
}

.btn-icon-small:hover {
  background: #f7fafc;
}

.btn-icon-small.danger:hover {
  background: #fed7d7;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
}

.alert-item {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.alert-content strong {
  color: #2d3748;
  word-wrap: break-word;
}

.alert-content span {
  color: #718096;
  font-size: 0.9rem;
  word-wrap: break-word;
}

.btn-small {
  padding: 0.5rem 1rem;
  border: 1px solid #e1e5e9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.btn-small:hover {
  background: #f7fafc;
}

.btn-small.primary {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-small.primary:hover {
  background: #5a67d8;
}

.suppliers-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 100%;
}

.supplier-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e5e9;
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.supplier-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.supplier-info {
  flex: 1;
  min-width: 0;
}

.supplier-info h4 {
  margin: 0 0 0.25rem 0;
  color: #2d3748;
  word-wrap: break-word;
}

.supplier-info p {
  margin: 0 0 0.5rem 0;
  color: #718096;
  font-size: 0.9rem;
  word-wrap: break-word;
}

.supplier-meta {
  background: #edf2f7;
  color: #4a5568;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  word-wrap: break-word;
}

.supplier-products {
  font-weight: 600;
  color: #667eea;
  flex-shrink: 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e1e5e9;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
  word-wrap: break-word;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.close-btn:hover {
  color: #4a5568;
}

.modal-content {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 100%;
}

.form-group label {
  font-weight: 500;
  color: #4a5568;
  font-size: 0.9rem;
  word-wrap: break-word;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  font-family: inherit;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-actions {
  padding: 1.5rem;
  border-top: 1px solid #e1e5e9;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-primary {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
  max-width: 100%;
  box-sizing: border-box;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(44, 90, 160, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
  max-width: 100%;
  box-sizing: border-box;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.adjustment-preview {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 6px;
}

.adjustment-preview h4 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  word-wrap: break-word;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e1e5e9;
}

.preview-item:last-child {
  border-bottom: none;
}

/* Enhanced Responsive Design */
@media (max-width: 1024px) {
  .inventory-grid {
    gap: 1.5rem;
  }
  
  .stats-overview {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .inventory-page {
    padding: 0.75rem;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .page-header p {
    font-size: 1rem;
  }

  .inventory-grid {
    gap: 1.5rem;
  }

  .stats-overview {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .search-filter {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input,
  .filter-select {
    min-width: auto;
    width: 100%;
  }

  .table-header {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 1.25rem;
    border-bottom: 1px solid #e1e5e9;
  }

  .table-row:last-child {
    border-bottom: none;
  }

  .col-name,
  .col-sku,
  .col-category,
  .col-stock,
  .col-price,
  .col-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0;
  }

  .col-name::before { content: "Product Name: "; font-weight: 600; }
  .col-sku::before { content: "SKU: "; font-weight: 600; }
  .col-category::before { content: "Category: "; font-weight: 600; }
  .col-stock::before { content: "Stock: "; font-weight: 600; }
  .col-price::before { content: "Price: "; font-weight: 600; }
  .col-actions::before { content: "Actions: "; font-weight: 600; }

  .col-actions {
    justify-content: flex-start;
    gap: 0.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal {
    width: 95%;
    margin: 1rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions button {
    width: 100%;
  }

  .suppliers-list {
    grid-template-columns: 1fr;
  }

  .alert-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    text-align: center;
  }

  .supplier-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .inventory-page {
    padding: 0.5rem;
  }

  .stats-overview {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1.25rem;
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .action-btn {
    padding: 0.875rem 1.25rem;
  }

  .table-row {
    padding: 1rem;
  }

  .modal-header {
    padding: 1.25rem;
  }

  .modal-content {
    padding: 1.25rem;
  }

  .modal-actions {
    padding: 1.25rem;
  }

  .page-header h1 {
    font-size: 1.75rem;
  }
}

/* Critical overflow prevention */
@media (max-width: 400px) {
  .inventory-page {
    padding: 0.25rem;
  }
  
  .stat-card,
  .table-row,
  .alert-item,
  .supplier-card {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
}

/* Print Styles */
@media print {
  .demo-banner,
  .action-buttons,
  .btn-primary,
  .btn-small,
  .modal-overlay {
    display: none !important;
  }

  .inventory-grid {
    grid-template-columns: 1fr;
  }

  .stat-card,
  .products-table,
  .alert-item,
  .supplier-card {
    box-shadow: none;
    border: 1px solid #000;
  }
}

/* Touch device optimizations */
@media (hover: none) {
  .stat-card:hover,
  .action-btn:hover,
  .btn-primary:hover,
  .btn-small:hover {
    transform: none;
  }
  
  .stat-card:active,
  .action-btn:active {
    transform: scale(0.98);
  }
}

/* Ensure proper text rendering */
.product-name,
.product-description,
.stat-info h3,
.stat-info p {
  word-break: break-word;
  overflow-wrap: break-word;
}

/* Scrollbar styling for modals */
.modal::-webkit-scrollbar {
  width: 6px;
}

.modal::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.modal::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.modal::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>