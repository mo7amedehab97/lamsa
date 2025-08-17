import MobileMenu from 'mmenu-light';
import Swal from 'sweetalert2';
import Anime from './partials/anime';
import initTootTip from './partials/tooltip';
import AppHelpers from "./app-helpers";

class App extends AppHelpers {
  constructor() {
    super();
    window.app = this;
  }

  loadTheApp() {
    this.commonThings();
    this.initiateNotifier();
    this.initiateMobileMenu();
    this.initiateNewMobileMenu();
    if (header_is_sticky) {
      this.initiateStickyMenu();
    }
    this.initAddToCart();
    this.initiateDropdowns();
    this.initiateModals();
    this.initiateCollapse();
    this.initAttachWishlistListeners();
    this.changeMenuDirection()
    initTootTip();
    this.loadModalImgOnclick();

    // Initialize new header features
    this.initWelcomeBanner();
    this.initEnhancedSearch();
    this.initCartAnimations();
    
    // Initialize banner enhancements
    this.initParallaxBanner();
    this.initSeasonalContent();
    
    // Initialize footer enhancements
    this.initDarkModeToggle();
    this.initFloatingActions();
    this.initEnhancedNewsletter();
    this.initScrollAnimations();
    
    // Initialize general improvements
    this.initLoadingScreen();
    this.initScrollProgress();
    this.initPageTransitions();

    salla.comment.event.onAdded(() => window.location.reload());

    this.status = 'ready';
    document.dispatchEvent(new CustomEvent('theme::ready'));
    this.log('Theme Loaded 🎉');
  }

  /**
   * Initialize loading screen with fashion theme
   */
  initLoadingScreen() {
    // Create loading screen if it doesn't exist
    if (!document.querySelector('.loading-screen')) {
      const loadingScreen = document.createElement('div');
      loadingScreen.className = 'loading-screen';
      loadingScreen.innerHTML = `
        <div class="loading-logo">
          <div class="needle-thread fashion-loading"></div>
        </div>
        <div class="loading-text">لمسة - تحميل الأناقة</div>
        <div class="loading-spinner"></div>
      `;
      document.body.appendChild(loadingScreen);
    }

    // Hide loading screen after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
          loadingScreen.classList.add('fade-out');
          setTimeout(() => {
            loadingScreen.remove();
          }, 500);
        }
      }, 1000); // Show for at least 1 second
    });
  }

  /**
   * Initialize scroll progress indicator
   */
  initScrollProgress() {
    // Create scroll progress indicator
    const progressContainer = document.createElement('div');
    progressContainer.className = 'scroll-progress';
    progressContainer.innerHTML = '<div class="progress-bar"></div>';
    document.body.appendChild(progressContainer);

    const progressBar = progressContainer.querySelector('.progress-bar');

    // Update progress on scroll
    const updateProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      
      progressBar.style.width = `${Math.min(progress, 100)}%`;
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress(); // Initial call
  }

  /**
   * Initialize smooth page transitions
   */
  initPageTransitions() {
    // Add page transition class to main content
    const mainContent = document.querySelector('main') || document.body;
    mainContent.classList.add('page-transition');

    // Trigger loaded state after a short delay
    setTimeout(() => {
      mainContent.classList.add('loaded');
    }, 100);

    // Add stagger animation to product grids
    const productGrids = document.querySelectorAll('.products-grid, .s-product-grid');
    productGrids.forEach(grid => {
      grid.classList.add('stagger-animation');
    });

    // Add image reveal animations
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.parentElement.classList.add('image-reveal');
          
          // Trigger reveal animation
          setTimeout(() => {
            img.parentElement.classList.add('revealed');
          }, 100);
          
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  /**
   * Initialize Welcome Banner Rotation
   */
  initWelcomeBanner() {
    const messages = document.querySelectorAll('.welcome-message');
    if (messages.length === 0) return;

    let currentIndex = 0;
    
    const rotateMessages = () => {
      // Remove active class from current message
      messages[currentIndex].classList.remove('active');
      messages[currentIndex].classList.add('exit');
      
      // Move to next message
      currentIndex = (currentIndex + 1) % messages.length;
      
      // Add active class to next message after a delay
      setTimeout(() => {
        messages.forEach(msg => msg.classList.remove('active', 'exit'));
        messages[currentIndex].classList.add('active');
      }, 250);
    };

    // Start rotation every 3 seconds
    setInterval(rotateMessages, 3000);
  }

  /**
   * Initialize Enhanced Search with AI-like suggestions
   */
  initEnhancedSearch() {
    const searchInput = document.getElementById('ai-search');
    const suggestionsContainer = document.getElementById('search-suggestions');
    const suggestionsList = document.getElementById('suggestions-list');
    
    if (!searchInput || !suggestionsContainer || !suggestionsList) return;

    let searchTimeout;

    // Sample product data for suggestions (in real app, this would come from API)
    const sampleProducts = [
      { name: 'فستان سهرة أنيق', image: 'images/placeholder.png', category: 'نسائي' },
      { name: 'قميص قطني رجالي', image: 'images/placeholder.png', category: 'رجالي' },
      { name: 'عباية عصرية', image: 'images/placeholder.png', category: 'نسائي' },
      { name: 'حقيبة يد فاخرة', image: 'images/placeholder.png', category: 'أكسسوارات' },
      { name: 'حذاء رياضي', image: 'images/placeholder.png', category: 'أحذية' },
      { name: 'ساعة ذكية', image: 'images/placeholder.png', category: 'أكسسوارات' }
    ];

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      
      clearTimeout(searchTimeout);
      
      if (query.length < 2) {
        this.hideSuggestions(suggestionsContainer);
        return;
      }

      searchTimeout = setTimeout(() => {
        this.showSearchSuggestions(query, sampleProducts, suggestionsList, suggestionsContainer);
      }, 300);
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        this.hideSuggestions(suggestionsContainer);
      }
    });

    searchInput.addEventListener('focus', () => {
      if (searchInput.value.length >= 2) {
        suggestionsContainer.classList.add('show');
      }
    });
  }

  showSearchSuggestions(query, products, container, suggestionsContainer) {
    const filtered = products.filter(product => 
      product.name.includes(query) || product.category.includes(query)
    ).slice(0, 4);

    if (filtered.length === 0) {
      this.hideSuggestions(suggestionsContainer);
      return;
    }

    container.innerHTML = filtered.map(product => `
      <div class="suggestion-item" onclick="app.selectSuggestion('${product.name}')">
        <img src="${product.image}" alt="${product.name}" class="suggestion-image">
        <div>
          <div class="suggestion-text font-medium">${product.name}</div>
          <div class="text-xs text-gray-500">${product.category}</div>
        </div>
      </div>
    `).join('');

    suggestionsContainer.classList.add('show');
  }

  hideSuggestions(container) {
    container.classList.remove('show');
  }

  selectSuggestion(productName) {
    const searchInput = document.getElementById('ai-search');
    const suggestionsContainer = document.getElementById('search-suggestions');
    
    if (searchInput) {
      searchInput.value = productName;
    }
    
    this.hideSuggestions(suggestionsContainer);
    
    // Here you would typically trigger a search or navigate to the product
    console.log('Selected product:', productName);
  }

  /**
   * Initialize Cart Animations
   */
  initCartAnimations() {
    // Listen for add to cart events
    salla.cart.event.onUpdated((response) => {
      this.showCartBubble();
    });

    // You can also trigger this manually when adding products
    document.addEventListener('product:added-to-cart', () => {
      this.showCartBubble();
    });
  }

  showCartBubble() {
    const bubble = document.getElementById('cart-bubble');
    if (!bubble) return;

    // Reset animation
    bubble.classList.remove('show');
    bubble.style.opacity = '0';
    bubble.style.transform = 'scale(0)';

    // Trigger animation
    setTimeout(() => {
      bubble.classList.add('show');
      bubble.style.opacity = '1';
      bubble.style.transform = 'scale(1)';
    }, 100);

    // Hide bubble after animation
    setTimeout(() => {
      bubble.classList.remove('show');
      bubble.style.opacity = '0';
      bubble.style.transform = 'scale(0)';
    }, 2000);
  }

  log(message) {
    salla.log(`ThemeApp(Raed)::${message}`);
    return this;
  }

    // fix Menu Direction at the third level >> The menu at the third level was popping off the page
    changeMenuDirection(){
      app.all('.root-level.has-children',item=>{
        if(item.classList.contains('change-menu-dir')) return;
        app.on('mouseover',item,()=>{
          let submenu = item.querySelector('.sub-menu .sub-menu');
          if(submenu){
            let rect = submenu.getBoundingClientRect();
            (rect.left < 10 || rect.right > window.innerWidth - 10) && app.addClass(item,'change-menu-dir')
          }      
        })
      })
    }

  loadModalImgOnclick(){
    document.querySelectorAll('.load-img-onclick').forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        let modal = document.querySelector('#' + link.dataset.modalId),
          img = modal.querySelector('img'),
          imgSrc = img.dataset.src;
        modal.open();

        if (img.classList.contains('loaded')) return;

        img.src = imgSrc;
        img.classList.add('loaded');
      })
    })
  }

  commonThings() {
    this.cleanContentArticles('.content-entry');
  }

  cleanContentArticles(elementsSelector) {
    let articleElements = document.querySelectorAll(elementsSelector);

    if (articleElements.length) {
      articleElements.forEach(article => {
        article.innerHTML = article.innerHTML.replace(/\&nbsp;/g, ' ')
      })
    }
  }

isElementLoaded(selector){
  return new Promise((resolve=>{
    const interval=setInterval(()=>{
    if(document.querySelector(selector)){
      clearInterval(interval)
      return resolve(document.querySelector(selector))
    }
   },160)
}))

  
  };

  copyToClipboard(event) {
    event.preventDefault();
    let aux = document.createElement("input"),
    btn = event.currentTarget;
    aux.setAttribute("value", btn.dataset.content);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);
    this.toggleElementClassIf(btn, 'copied', 'code-to-copy', () => true);
    setTimeout(() => {
      this.toggleElementClassIf(btn, 'code-to-copy', 'copied', () => true)
    }, 1000);
  }

  initiateNotifier() {
    salla.notify.setNotifier(function (message, type, data) {
      if (typeof message == 'object') {
        return Swal.fire(message).then(type);
      }

      return Swal.mixin({
        toast: true,
        position: salla.config.get('theme.is_rtl') ? 'top-start' : 'top-end',
        showConfirmButton: false,
        timer: 2000,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      }).fire({
        icon: type,
        title: message,
        showCloseButton: true,
        timerProgressBar: true
      })
    });
  }


  initiateMobileMenu() {

  this.isElementLoaded('#mobile-menu').then((menu) => {

 
  const mobileMenu = new MobileMenu(menu, "(max-width: 1024px)", "( slidingSubmenus: false)");

  salla.lang.onLoaded(() => {
    mobileMenu.navigation({ title: salla.lang.get('blocks.header.main_menu') });
  });
  const drawer = mobileMenu.offcanvas({ position: salla.config.get('theme.is_rtl') ? "right" : 'left' });

  this.onClick("a[href='#mobile-menu']", event => {
    document.body.classList.add('menu-opened');
    event.preventDefault() || drawer.close() || drawer.open()
    
  });
  this.onClick(".close-mobile-menu", event => {
    document.body.classList.remove('menu-opened');
    event.preventDefault() || drawer.close()
  });
  });

  }

  initiateNewMobileMenu() {
    // Handle new mobile menu toggle for the redesigned header
    salla.event.on('mobile-menu::toggle', () => {
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
        document.body.classList.toggle('overflow-hidden');
      }
    });

    salla.event.on('mobile-menu::close', () => {
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu) {
        mobileMenu.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }
    });

    // Close mobile menu when clicking outside
    this.onClick('#mobile-menu', (event) => {
      if (event.target.id === 'mobile-menu') {
        salla.event.dispatch('mobile-menu::close');
      }
    });
  }

 initAttachWishlistListeners() {
    let isListenerAttached = false;
  
    function toggleFavoriteIcon(id, isAdded = true) {
      document.querySelectorAll('.s-product-card-wishlist-btn[data-id="' + id + '"]').forEach(btn => {
        app.toggleElementClassIf(btn, 's-product-card-wishlist-added', 'not-added', () => isAdded);
        app.toggleElementClassIf(btn, 'pulse-anime', 'un-favorited', () => isAdded);
      });
    }
  
    if (!isListenerAttached) {
      salla.wishlist.event.onAdded((event, id) => toggleFavoriteIcon(id));
      salla.wishlist.event.onRemoved((event, id) => toggleFavoriteIcon(id, false));
      isListenerAttached = true; // Mark the listener as attached
    }
  }

  initiateStickyMenu() {
    let header = this.element('#mainnav'),
      height = this.element('#mainnav .inner')?.clientHeight;
    //when it's landing page, there is no header
    if (!header) {
      return;
    }

    window.addEventListener('load', () => setTimeout(() => this.setHeaderHeight(), 500))
    window.addEventListener('resize', () => this.setHeaderHeight())

    window.addEventListener('scroll', () => {
      window.scrollY >= header.offsetTop + height ? header.classList.add('fixed-pinned', 'animated') : header.classList.remove('fixed-pinned');
      window.scrollY >= 200 ? header.classList.add('fixed-header') : header.classList.remove('fixed-header', 'animated');
    }, { passive: true });
  }

  setHeaderHeight() {
    let height = this.element('#mainnav .inner').clientHeight,
      header = this.element('#mainnav');
    header.style.height = height + 'px';
  }

  initiateDropdowns() {
    this.onClick('.dropdown__trigger', ({ target: btn }) => {
      btn.parentElement.classList.toggle('is-opened');
      document.body.classList.toggle('dropdown--is-opened');
      // Click Outside || Click on close btn
      window.addEventListener('click', ({ target: element }) => {
        if (!element.closest('.dropdown__menu') && element !== btn || element.classList.contains('dropdown__close')) {
          btn.parentElement.classList.remove('is-opened');
          document.body.classList.remove('dropdown--is-opened');
        }
      });
    });
  }

  initiateModals() {
    this.onClick('[data-modal-trigger]', e => {
      let id = '#' + e.target.dataset.modalTrigger;
      this.removeClass(id, 'hidden');
      setTimeout(() => this.toggleModal(id, true)); //small amont of time to running toggle After adding hidden
    });
    salla.event.document.onClick("[data-close-modal]", e => this.toggleModal('#' + e.target.dataset.closeModal, false));
  }

  toggleModal(id, isOpen) {
    this.toggleClassIf(`${id} .s-salla-modal-overlay`, 'ease-out duration-300 opacity-100', 'opacity-0', () => isOpen)
      .toggleClassIf(`${id} .s-salla-modal-body`,
        'ease-out duration-300 opacity-100 translate-y-0 sm:scale-100', //add these classes
        'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95', //remove these classes
        () => isOpen)
      .toggleElementClassIf(document.body, 'modal-is-open', 'modal-is-closed', () => isOpen);
    if (!isOpen) {
      setTimeout(() => this.addClass(id, 'hidden'), 350);
    }
  }

  initiateCollapse() {
    document.querySelectorAll('.btn--collapse')
      .forEach((trigger) => {
        const content = document.querySelector('#' + trigger.dataset.show);
        const state = { isOpen: false }

        const onOpen = () => anime({
          targets: content,
          duration: 225,
          height: content.scrollHeight,
          opacity: [0, 1],
          easing: 'easeOutQuart',
        });

        const onClose = () => anime({
          targets: content,
          duration: 225,
          height: 0,
          opacity: [1, 0],
          easing: 'easeOutQuart',
        })

        const toggleState = (isOpen) => {
          state.isOpen = !isOpen
          this.toggleElementClassIf([content, trigger], 'is-closed', 'is-opened', () => isOpen);
        }

        trigger.addEventListener('click', () => {
          const { isOpen } = state
          toggleState(isOpen)
          isOpen ? onClose() : onOpen();
        })
      });
  }


  /**
   * Workaround for seeking to simplify & clean, There are three ways to use this method:
   * 1- direct call: `this.anime('.my-selector')` - will use default values
   * 2- direct call with overriding defaults: `this.anime('.my-selector', {duration:3000})`
   * 3- return object to play it letter: `this.anime('.my-selector', false).duration(3000).play()` - will not play animation unless calling play method.
   * @param {string|HTMLElement} selector
   * @param {object|undefined|null|null} options - in case there is need to set attributes one by one set it `false`;
   * @return {Anime|*}
   */
  anime(selector, options = null) {
    let anime = new Anime(selector, options);
    return options === false ? anime : anime.play();
  }

  /**
   * These actions are responsible for pressing "add to cart" button,
   * they can be from any page, especially when mega-menu is enabled
   */
  initAddToCart() {
    salla.cart.event.onUpdated(summary => {
      document.querySelectorAll('[data-cart-total]').forEach(el => el.innerHTML = salla.money(summary.total));
      document.querySelectorAll('[data-cart-count]').forEach(el => el.innerText = salla.helpers.number(summary.count));
    });

    salla.cart.event.onItemAdded((response, prodId) => {
      app.element('salla-cart-summary').animateToCart(app.element(`#product-${prodId} img`));
    });
  }

  /**
   * Initialize Parallax Banner Effects
   */
  initParallaxBanner() {
    const parallaxContainer = document.querySelector('[data-parallax-container]');
    const parallaxBg = document.querySelector('[data-parallax-bg]');
    
    if (!parallaxContainer || !parallaxBg) return;

    const parallaxImage = parallaxBg.querySelector('.parallax-image');
    let ticking = false;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const containerTop = parallaxContainer.offsetTop;
      const containerHeight = parallaxContainer.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Check if element is in viewport
      if (scrolled + windowHeight > containerTop && scrolled < containerTop + containerHeight) {
        const speed = 0.5;
        const yPos = -(scrolled - containerTop) * speed;
        
        if (parallaxImage) {
          parallaxImage.style.transform = `scale(1.1) translate3d(0, ${yPos}px, 0)`;
        }
      }
      
      ticking = false;
    };

    const requestParallaxUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    // Listen for scroll events
    window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
    
    // Initial call
    updateParallax();

    // Intersection Observer for performance optimization
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
        } else {
          window.removeEventListener('scroll', requestParallaxUpdate);
        }
      });
    });

    observer.observe(parallaxContainer);
  }

  /**
   * Initialize Seasonal Content
   */
  initSeasonalContent() {
    const seasonalBadge = document.querySelector('.seasonal-badge');
    if (!seasonalBadge) return;

    // Get current season
    const month = new Date().getMonth();
    let season = 'ربيع';
    let seasonEmoji = '🌸';
    let seasonColor = 'from-green-400 to-blue-500';

    if (month >= 2 && month <= 4) {
      season = 'ربيع';
      seasonEmoji = '🌸';
      seasonColor = 'from-green-400 to-blue-500';
    } else if (month >= 5 && month <= 7) {
      season = 'صيف';
      seasonEmoji = '☀️';
      seasonColor = 'from-yellow-400 to-orange-500';
    } else if (month >= 8 && month <= 10) {
      season = 'خريف';
      seasonEmoji = '🍂';
      seasonColor = 'from-orange-400 to-red-500';
    } else {
      season = 'شتاء';
      seasonEmoji = '❄️';
      seasonColor = 'from-blue-400 to-purple-500';
    }

    // Update seasonal content
    const badgeText = seasonalBadge.querySelector('.inline-flex');
    if (badgeText) {
      badgeText.innerHTML = `
        <span class="mr-2">${seasonEmoji}</span>
        مجموعة ${season} ${new Date().getFullYear()} الحصرية
      `;
      badgeText.classList.add('bg-gradient-to-r', ...seasonColor.split(' '));
    }

    // Add seasonal animations to floating elements
    this.addSeasonalAnimations();
  }

  /**
   * Add seasonal animations to floating elements
   */
  addSeasonalAnimations() {
    const floatingElements = document.querySelectorAll('.floating-element');
    const month = new Date().getMonth();

    floatingElements.forEach((element, index) => {
      // Winter: snowflake effect
      if (month >= 11 || month <= 1) {
        element.style.animation = `snowfall ${6 + index}s linear infinite`;
        element.style.background = 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(173,216,230,0.4) 100%)';
      }
      // Summer: sun rays effect
      else if (month >= 5 && month <= 7) {
        element.style.animation = `sunRays ${4 + index}s ease-in-out infinite`;
        element.style.background = 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, rgba(255,165,0,0.3) 100%)';
      }
      // Autumn: falling leaves
      else if (month >= 8 && month <= 10) {
        element.style.animation = `fallingLeaves ${8 + index}s ease-in-out infinite`;
        element.style.background = 'radial-gradient(circle, rgba(255,140,0,0.7) 0%, rgba(165,42,42,0.4) 100%)';
      }
      // Spring: blooming flowers
      else {
        element.style.animation = `bloom ${5 + index}s ease-in-out infinite`;
        element.style.background = 'radial-gradient(circle, rgba(255,192,203,0.7) 0%, rgba(144,238,144,0.4) 100%)';
      }
    });

    // Add dynamic CSS for seasonal animations
    this.addSeasonalCSS();
  }

  /**
   * Add seasonal CSS animations dynamically
   */
  addSeasonalCSS() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes snowfall {
        0% { transform: translateY(-100vh) rotate(0deg); }
        100% { transform: translateY(100vh) rotate(360deg); }
      }
      
      @keyframes sunRays {
        0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.6; }
        50% { transform: scale(1.3) rotate(180deg); opacity: 0.9; }
      }
      
      @keyframes fallingLeaves {
        0% { transform: translateY(-20px) rotate(0deg); }
        25% { transform: translateY(5px) rotate(90deg); }
        50% { transform: translateY(-10px) rotate(180deg); }
        75% { transform: translateY(15px) rotate(270deg); }
        100% { transform: translateY(-20px) rotate(360deg); }
      }
      
      @keyframes bloom {
        0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.5; }
        50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Initialize Dark Mode Toggle
   */
  initDarkModeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    toggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      
      if (isDark) {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      }
      
      // Add transition effect
      toggle.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        toggle.style.transform = '';
      }, 300);
    });
  }

  /**
   * Initialize Floating Action Buttons
   */
  initFloatingActions() {
    const backToTop = document.getElementById('back-to-top');
    const quickContact = document.getElementById('quick-contact');
    
    if (backToTop) {
      // Show/hide back to top button based on scroll
      const toggleBackToTop = () => {
        if (window.pageYOffset > 300) {
          backToTop.classList.add('show');
          backToTop.style.opacity = '1';
        } else {
          backToTop.classList.remove('show');
          backToTop.style.opacity = '0';
        }
      };

      window.addEventListener('scroll', toggleBackToTop, { passive: true });
      
      // Smooth scroll to top
      backToTop.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }

    if (quickContact) {
      quickContact.addEventListener('click', () => {
        // Open contact modal or WhatsApp
        this.openQuickContact();
      });
    }
  }

  /**
   * Open quick contact options
   */
  openQuickContact() {
    const modal = document.createElement('div');
    modal.className = 'contact-modal fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
    modal.innerHTML = `
      <div class="contact-content bg-white dark:bg-gray-800 rounded-lg p-6 mx-4 max-w-sm w-full">
        <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">تواصل معنا</h3>
        <div class="space-y-3">
          <a href="tel:+966123456789" class="contact-option flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <i class="sicon-phone text-white"></i>
            </div>
            <div>
              <div class="font-medium text-gray-800 dark:text-gray-200">اتصل بنا</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">+966 12 345 6789</div>
            </div>
          </a>
          
          <a href="https://wa.me/966123456789" target="_blank" class="contact-option flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
              <i class="sicon-whatsapp text-white"></i>
            </div>
            <div>
              <div class="font-medium text-gray-800 dark:text-gray-200">واتساب</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">تواصل سريع</div>
            </div>
          </a>
          
          <a href="mailto:info@lamsa.com" class="contact-option flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <i class="sicon-mail text-white"></i>
            </div>
            <div>
              <div class="font-medium text-gray-800 dark:text-gray-200">البريد الإلكتروني</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">info@lamsa.com</div>
            </div>
          </a>
        </div>
        
        <button class="close-contact mt-4 w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200">
          إغلاق
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal
    const closeBtn = modal.querySelector('.close-contact');
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
   * Initialize Enhanced Newsletter
   */
  initEnhancedNewsletter() {
    const form = document.querySelector('.newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = form.querySelector('input[type="email"]').value;
      const button = form.querySelector('.newsletter-btn');
      
      if (!email || !this.isValidEmail(email)) {
        this.showNewsletterMessage('يرجى إدخال بريد إلكتروني صحيح', 'error');
        return;
      }

      // Show loading state
      const originalContent = button.innerHTML;
      button.innerHTML = '<i class="sicon-loading animate-spin"></i>';
      button.disabled = true;

      // Simulate API call (replace with actual implementation)
      setTimeout(() => {
        // Reset button
        button.innerHTML = originalContent;
        button.disabled = false;
        
        // Clear input
        form.querySelector('input[type="email"]').value = '';
        
        // Show success message
        this.showNewsletterMessage('تم الاشتراك بنجاح! شكراً لك', 'success');
      }, 2000);
    });
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Show newsletter message
   */
  showNewsletterMessage(message, type) {
    const form = document.querySelector('.newsletter-form');
    const existingMessage = form.parentNode.querySelector('.newsletter-message');
    
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `newsletter-message mt-2 p-2 text-sm rounded ${
      type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 
      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }`;
    messageDiv.textContent = message;

    form.parentNode.appendChild(messageDiv);

    // Remove message after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 5000);
  }

  /**
   * Initialize scroll-based animations
   */
  initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe footer elements
    const footerElements = document.querySelectorAll('.footer-section, .newsletter-enhanced, .reviews-preview');
    footerElements.forEach(el => {
      el.classList.add('animate-on-scroll');
      observer.observe(el);
    });
  }

  /**
   * Open store map (placeholder function)
   */
  openStoreMap() {
    // This would integrate with Google Maps or another mapping service
    const mapUrl = 'https://maps.google.com/?q=Store+Location';
    window.open(mapUrl, '_blank');
  }
}

customElements.define('custom-salla-product-card', ProductCard);

// Initialize the app
app = new App();
salla.onReady(() => app.loadTheApp());

// Make openStoreMap globally accessible for footer
window.openStoreMap = function() {
  const mapUrl = 'https://maps.google.com/?q=Store+Location';
  window.open(mapUrl, '_blank');
};
