import BasePage from '../base-page';
class ProductCard extends HTMLElement {
  constructor(){
    super()
  }
  
  connectedCallback(){
    // Parse product data
    this.product = this.product || JSON.parse(this.getAttribute('product')); 

    if (window.app?.status === 'ready') {
      this.onReady();
    } else {
      document.addEventListener('theme::ready', () => this.onReady() )
    }
  }

  onReady(){
      this.fitImageHeight = salla.config.get('store.settings.product.fit_type');
      this.placeholder = salla.url.asset(salla.config.get('theme.settings.placeholder'));
      this.getProps()

	  this.source = salla.config.get("page.slug");
      // If the card is in the landing page, hide the add button and show the quantity
	  if (this.source == "landing-page") {
	  	this.hideAddBtn = true;
	  	this.showQuantity = window.showQuantity;
	  }

      salla.lang.onLoaded(() => {
        // Language
        this.remained = salla.lang.get('pages.products.remained');
        this.donationAmount = salla.lang.get('pages.products.donation_amount');
        this.startingPrice = salla.lang.get('pages.products.starting_price');
        this.addToCart = salla.lang.get('pages.cart.add_to_cart');
        this.outOfStock = salla.lang.get('pages.products.out_of_stock');

        // re-render to update translations
        this.render();
      })
      
      this.render()
  }

  /**
   * Enhanced hover effects and interactions
   */
  initEnhancedHoverEffects() {
    const productCard = this;
    const hoverActions = this.querySelector('.product-hover-actions');
    const quickViewBtn = this.querySelector('.quick-view-btn');
    const compareBtn = this.querySelector('.compare-btn');
    const productImage = this.querySelector('.s-product-card-image img');

    // Enhanced hover animation
    productCard.addEventListener('mouseenter', () => {
      productCard.classList.add('product-card-hovered');
      if (hoverActions) {
        hoverActions.style.opacity = '1';
        hoverActions.style.transform = 'translateY(0)';
      }
    });

    productCard.addEventListener('mouseleave', () => {
      productCard.classList.remove('product-card-hovered');
      if (hoverActions) {
        hoverActions.style.opacity = '0';
        hoverActions.style.transform = 'translateY(20px)';
      }
    });

    // Quick view functionality
    if (quickViewBtn) {
      quickViewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showQuickView();
      });
    }

    // Compare functionality
    if (compareBtn) {
      compareBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleCompare();
      });
    }

    // Color swatches hover effect
    const colorSwatches = this.querySelectorAll('.color-swatch');
    colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.changeProductVariant(swatch.dataset.variantId, swatch.dataset.imageUrl);
      });
    });
  }

  /**
   * Show quick view modal
   */
  showQuickView() {
    // Create quick view modal
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
    modal.innerHTML = `
      <div class="quick-view-content bg-white rounded-lg p-6 max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="product-quick-image">
            <img src="${this.product.image?.url || this.product.thumbnail}" alt="${this.product.name}" class="w-full rounded-lg">
          </div>
          <div class="product-quick-details">
            <h3 class="text-2xl font-bold mb-3">${this.product.name}</h3>
            ${this.product.subtitle ? `<p class="text-gray-600 mb-4">${this.product.subtitle}</p>` : ''}
            <div class="product-quick-price mb-4">
              ${this.getProductPrice()}
            </div>
            ${this.product.rating?.stars ? `
              <div class="product-quick-rating mb-4 flex items-center">
                <div class="flex text-yellow-400">
                  ${Array.from({length: 5}, (_, i) => `<i class="sicon-star${i < this.product.rating.stars ? '2' : ''} text-sm"></i>`).join('')}
                </div>
                <span class="ml-2 text-gray-600">(${this.product.rating.stars})</span>
              </div>
            ` : ''}
            <div class="product-quick-actions mt-6">
              <a href="${this.product.url}" class="btn btn-primary mr-3">عرض التفاصيل</a>
              <button class="btn btn-secondary quick-view-close">إغلاق</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal events
    const closeBtn = modal.querySelector('.quick-view-close');
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  /**
   * Toggle compare functionality
   */
  toggleCompare() {
    const compareItems = JSON.parse(localStorage.getItem('compareItems') || '[]');
    const productId = this.product.id;
    const compareBtn = this.querySelector('.compare-btn');

    if (compareItems.includes(productId)) {
      // Remove from compare
      const index = compareItems.indexOf(productId);
      compareItems.splice(index, 1);
      compareBtn.classList.remove('active');
      this.showNotification('تم إزالة المنتج من المقارنة', 'success');
    } else {
      // Add to compare (max 3 items)
      if (compareItems.length >= 3) {
        this.showNotification('يمكن مقارنة 3 منتجات فقط', 'warning');
        return;
      }
      compareItems.push(productId);
      compareBtn.classList.add('active');
      this.showNotification('تم إضافة المنتج للمقارنة', 'success');
    }

    localStorage.setItem('compareItems', JSON.stringify(compareItems));
    this.updateCompareCounter();
  }

  /**
   * Update compare counter in header
   */
  updateCompareCounter() {
    const compareItems = JSON.parse(localStorage.getItem('compareItems') || '[]');
    const counter = document.querySelector('.compare-counter');
    if (counter) {
      counter.textContent = compareItems.length;
      counter.style.display = compareItems.length > 0 ? 'block' : 'none';
    }
  }

  /**
   * Change product variant (color/size)
   */
  changeProductVariant(variantId, imageUrl) {
    const productImage = this.querySelector('.s-product-card-image img');
    if (productImage && imageUrl) {
      productImage.src = imageUrl;
    }

    // Update active color swatch
    this.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.classList.remove('active');
    });
    this.querySelector(`[data-variant-id="${variantId}"]`)?.classList.add('active');
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white ${
      type === 'success' ? 'bg-green-500' : 
      type === 'warning' ? 'bg-yellow-500' : 
      type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  /**
   * Generate smart badges
   */
  getSmartBadges() {
    const badges = [];
    
    // Promotion badge
    if (this.product.promotion_title) {
      badges.push(`<div class="product-badge promotion-badge">${this.product.promotion_title}</div>`);
    }
    
    // Best seller badge (mock logic - would be based on real data)
    if (this.product.rating?.stars >= 4.5) {
      badges.push(`<div class="product-badge bestseller-badge">🏆 الأكثر مبيعاً</div>`);
    }
    
    // New badge (for products added in last 30 days)
    const productDate = new Date(this.product.created_at);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (productDate > thirtyDaysAgo) {
      badges.push(`<div class="product-badge new-badge">✨ جديد</div>`);
    }
    
    // Sale badge
    if (this.product.is_on_sale) {
      const discount = Math.round(((this.product.regular_price - this.product.sale_price) / this.product.regular_price) * 100);
      badges.push(`<div class="product-badge sale-badge">-${discount}%</div>`);
    }
    
    // Limited stock badge
    if (this.product.quantity > 0 && this.product.quantity <= 5) {
      badges.push(`<div class="product-badge limited-badge">⚡ كمية محدودة</div>`);
    }
    
    // Out of stock badge
    if (this.product.is_out_of_stock) {
      badges.push(`<div class="product-badge out-of-stock-badge">نفد المخزون</div>`);
    }

    return badges.join('');
  }

  /**
   * Generate color swatches if available
   */
  getColorSwatches() {
    if (!this.product.options || !this.product.options.length) return '';
    
    const colorOption = this.product.options.find(opt => opt.name.toLowerCase().includes('لون') || opt.name.toLowerCase().includes('color'));
    if (!colorOption) return '';

    const swatches = colorOption.values.slice(0, 4).map(value => `
      <div class="color-swatch" 
           data-variant-id="${value.id}" 
           data-image-url="${value.image || this.product.image?.url}"
           style="background-color: ${value.hex_code || '#ccc'}"
           title="${value.name}">
      </div>
    `).join('');

    return `<div class="color-swatches flex gap-1 mt-2">${swatches}</div>`;
  }

  initCircleBar() {
    let qty = this.product.quantity,
      total = this.product.quantity > 100 ? this.product.quantity * 2 : 100,
      roundPercent = (qty / total) * 100,
      bar = this.querySelector('.s-product-card-content-pie-svg-bar'),
      strokeDashOffsetValue = 100 - roundPercent;
    bar.style.strokeDashoffset = strokeDashOffsetValue;
  }

  formatDate(date) {
    let d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  } 

  getProductBadge() {
    if (this.product.promotion_title) {
      return `<div class="s-product-card-promotion-title">${this.product.promotion_title}</div>`
    }
    if (this.showQuantity && this.product?.quantity) {
      return `<div
        class="s-product-card-quantity">${this.remained} ${salla.helpers.number(this.product?.quantity)}</div>`
    }
    if (this.showQuantity && this.product?.is_out_of_stock) {
      return `<div class="s-product-card-out-badge">${this.outOfStock}</div>`
    }
    return '';
  }

  getPriceFormat(price) {
    if (!price || price == 0) {
      return salla.config.get('store.settings.product.show_price_as_dash')?'-':'';
    }

    return salla.money(price);
  }

  getProductPrice() {
    let price = '';
    if (this.product.is_on_sale) {
      price = `<div class="s-product-card-sale-price">
                <h4>${this.getPriceFormat(this.product.sale_price)}</h4>
                <span>${this.getPriceFormat(this.product?.regular_price)}</span>
              </div>`;
    }
    else if (this.product.starting_price) {
      price = `<div class="s-product-card-starting-price">
                  <p>${this.startingPrice}</p>
                  <h4> ${this.getPriceFormat(this.product?.starting_price)} </h4>
              </div>`
    }
    else{
      price = `<h4 class="s-product-card-price">${this.getPriceFormat(this.product?.price)}</h4>`
    }

    return price;
  }

  getAddButtonLabel() {
    if (this.product.status === 'sale' && this.product.type === 'booking') {
      return salla.lang.get('pages.cart.book_now'); 
    }

    if (this.product.status === 'sale') {
      return salla.lang.get('pages.cart.add_to_cart');
    }

    if (this.product.type !== 'donating') {
      return salla.lang.get('pages.products.out_of_stock');
    }

    // donating
    return salla.lang.get('pages.products.donation_exceed');
  }

  getProps(){

    /**
     *  Horizontal card.
     */
    this.horizontal = this.hasAttribute('horizontal');
  
    /**
     *  Support shadow on hover.
     */
    this.shadowOnHover = this.hasAttribute('shadowOnHover');
  
    /**
     *  Hide add to cart button.
     */
    this.hideAddBtn = this.hasAttribute('hideAddBtn');
  
    /**
     *  Full image card.
     */
    this.fullImage = this.hasAttribute('fullImage');
  
    /**
     *  Minimal card.
     */
    this.minimal = this.hasAttribute('minimal');
  
    /**
     *  Special card.
     */
    this.isSpecial = this.hasAttribute('isSpecial');
  
    /**
     *  Show quantity.
     */
    this.showQuantity = this.hasAttribute('showQuantity');
  }

  render(){
    this.classList.add('s-product-card-entry', 'enhanced-product-card'); 
    this.setAttribute('id', this.product.id);
    !this.horizontal && !this.fullImage && !this.minimal? this.classList.add('s-product-card-vertical') : '';
    this.horizontal && !this.fullImage && !this.minimal? this.classList.add('s-product-card-horizontal') : '';
    this.fitImageHeight && !this.isSpecial && !this.fullImage && !this.minimal? this.classList.add('s-product-card-fit-height') : '';
    this.isSpecial? this.classList.add('s-product-card-special') : '';
    this.fullImage? this.classList.add('s-product-card-full-image') : '';
    this.minimal? this.classList.add('s-product-card-minimal') : '';
    this.product?.donation?  this.classList.add('s-product-card-donation') : '';
    this.shadowOnHover?  this.classList.add('s-product-card-shadow') : '';
    this.product?.is_out_of_stock?  this.classList.add('s-product-card-out-of-stock') : '';
    this.isInWishlist = !salla.config.isGuest() && salla.storage.get('salla::wishlist', []).includes(Number(this.product.id));
    
    const compareItems = JSON.parse(localStorage.getItem('compareItems') || '[]');
    const isInCompare = compareItems.includes(this.product.id);
    
    this.innerHTML = `
        <div class="${!this.fullImage ? 's-product-card-image' : 's-product-card-image-full'} product-image-container">
          <a href="${this.product?.url}">
            <img class="s-product-card-image-${salla.url.is_placeholder(this.product?.image?.url)
              ? 'contain'
              : this.fitImageHeight
                ? this.fitImageHeight
                : 'cover'} lazy product-main-image"
              src=${this.placeholder}
              alt=${this.product?.image?.alt}
              data-src=${this.product?.image?.url || this.product?.thumbnail}
            />
            
            {# Enhanced Smart Badges #}
            <div class="product-badges-container">
              ${this.getSmartBadges()}
            </div>
          </a>
          
          {# Enhanced Hover Actions #}
          <div class="product-hover-actions">
            <button class="quick-view-btn product-action-btn" title="عرض سريع">
              <i class="sicon-eye"></i>
            </button>
            <button class="compare-btn product-action-btn ${isInCompare ? 'active' : ''}" title="مقارنة">
              <i class="sicon-compare"></i>
            </button>
            ${!this.horizontal && !this.fullImage ?
              `<salla-button
                shape="icon"
                fill="outline"
                color="light"
                name="product-name-${this.product.id}"
                aria-label="Add or remove to wishlist"
                class="s-product-card-wishlist-btn product-action-btn animated ${this.isInWishlist ? 's-product-card-wishlist-added pulse-anime' : 'not-added un-favorited'}"
                onclick="salla.wishlist.toggle(${this.product.id})"
                data-id="${this.product.id}">
                <i class="sicon-heart"></i>
              </salla-button>` : ``
            }
          </div>
          
          ${this.fullImage ? `<a href="${this.product?.url}" aria-label=${this.product.name} class="s-product-card-overlay"></a>`:''}
        </div>
        <div class="s-product-card-content">
          ${this.isSpecial && this.product?.quantity ?
            `<div class="s-product-card-content-pie">
              <span>
                <b>${salla.helpers.number(this.product?.quantity)}</b>
                ${this.remained}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -1 36 34" class="s-product-card-content-pie-svg">
                <circle cx="16" cy="16" r="15.9155" class="s-product-card-content-pie-svg-base" />
                <circle cx="16" cy="16" r="15.9155" class="s-product-card-content-pie-svg-bar" />
              </svg>
            </div>`
            : ``}

          <div class="s-product-card-content-main ${this.isSpecial ? 's-product-card-content-extra-padding' : ''}">
            <h3 class="s-product-card-content-title">
              <a href="${this.product?.url}">${this.product?.name}</a>
            </h3>

            ${this.product?.subtitle && !this.minimal ?
              `<p class="s-product-card-content-subtitle opacity-80">${this.product?.subtitle}</p>`
              : ``}
              
            {# Color Swatches #}
            ${this.getColorSwatches()}
          </div>
          ${this.product?.donation && !this.minimal && !this.fullImage ?
          `<salla-progress-bar donation=${JSON.stringify(this.product?.donation)}></salla-progress-bar>
          <div class="s-product-card-donation-input">
            ${this.product?.donation?.can_donate ?
              `<label for="donation-amount-${this.product.id}">${this.donationAmount} <span>*</span></label>
              <input
                type="text"
                onInput="${e => {
                  salla.helpers.inputDigitsOnly(e.target);
                  this.addBtn.donatingAmount = (e.target).value;
                }}"
                id="donation-amount-${this.product.id}"
                name="donating_amount"
                class="s-form-control"
                placeholder="${this.donationAmount}" />`
              : ``}
          </div>`
            : ''}
          <div class="s-product-card-content-sub ${this.isSpecial ? 's-product-card-content-extra-padding' : ''}">
            ${this.product?.donation?.can_donate ? '' : this.getProductPrice()}
            ${this.product?.rating?.stars ?
              `<div class="s-product-card-rating">
                <i class="sicon-star2 before:text-orange-300"></i>
                <span>${this.product.rating.stars}</span>
              </div>`
               : ``}
          </div>

          ${this.isSpecial && this.product.discount_ends
            ? `<salla-count-down date="${this.formatDate(this.product.discount_ends)}" end-of-day=${true} boxed=${true}
              labeled=${true} />`
            : ``}


          ${!this.hideAddBtn ?
            `<div class="s-product-card-content-footer gap-2">
              <salla-add-product-button fill="outline" width="wide"
                product-id="${this.product.id}"
                product-status="${this.product.status}"
                product-type="${this.product.type}">
                ${this.product.status == 'sale' ? 
                    `<i class="text-base sicon-${ this.product.type == 'booking' ? 'calendar-time' : 'shopping-bag'}"></i>` : ``
                  }
                <span>${this.product.add_to_cart_label ? this.product.add_to_cart_label : this.getAddButtonLabel() }</span>
              </salla-add-product-button>

              ${this.horizontal || this.fullImage ?
                `<salla-button 
                  shape="icon" 
                  fill="outline" 
                  color="light" 
                  id="card-wishlist-btn-${this.product.id}-horizontal"
                  aria-label="Add or remove to wishlist"
                  class="s-product-card-wishlist-btn animated ${this.isInWishlist ? 's-product-card-wishlist-added pulse-anime' : 'not-added un-favorited'}"
                  onclick="salla.wishlist.toggle(${this.product.id})"
                  data-id="${this.product.id}">
                  <i class="sicon-heart"></i> 
                </salla-button>`
                : ``}
            </div>`
            : ``}
        </div>
      `

      this.querySelectorAll('[name="donating_amount"]').forEach((element)=>{
        element.addEventListener('input', (e) => {
          e.target
            .closest(".s-product-card-content")
            .querySelector("salla-add-product-button")
            .setAttribute("donating-amount", e.target.value); 
        });
      })

      document.lazyLoadInstance?.update(this.querySelectorAll('.lazy'));

      if (this.product?.quantity && this.isSpecial) {
        this.initCircleBar();
      }
      
      // Initialize enhanced features
      this.initEnhancedHoverEffects();
      this.updateCompareCounter();
    }
}

customElements.define('custom-salla-product-card', ProductCard);