/**
 * Snowstorm script - adapted for Blue Bay Mechanical
 * Creates a snow falling animation effect for the "REFRESHED" text
 */
const snowStorm = {
  // Configuration
  flakesMax: 32,           // Maximum snowflakes
  flakesMaxActive: 16,     // Maximum snowflakes active at once
  animationInterval: 50,   // Animation speed (ms)
  snowColor: '#fff',       // Snowflake color
  snowCharacter: '•',      // Snowflake character
  flakeWidth: 8,
  flakeHeight: 8,
  zIndex: 1,
  targetElement: null,     // Will be set to the REFRESHED element

  // Internal properties
  flakes: [],
  active: false,
  disabled: false,
  timer: null,
  
  // Initialize snow effect on specific target
  init: function(targetElement) {
    if (!targetElement) return false;
    
    this.targetElement = targetElement;
    this.flakes = [];
    this.active = true;
    this.disabled = false;
    
    // Create initial snowflakes
    this.createSnow();
    
    // Start animation
    this.animateSnow();
    
    // Add resize handler
    window.addEventListener('resize', this.resizeHandler.bind(this));
    
    return this;
  },

  // Create snowflakes
  createSnow: function() {
    // Clear existing flakes
    this.flakes = [];
    
    // Create container if it doesn't exist
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'snowstorm-container';
      this.container.style.position = 'absolute';
      this.container.style.top = '0';
      this.container.style.left = '0';
      this.container.style.width = '100%';
      this.container.style.height = '100%';
      this.container.style.overflow = 'hidden';
      this.container.style.pointerEvents = 'none'; // Don't block interactions
      this.targetElement.appendChild(this.container);
    }
    
    // Get dimensions
    const rect = this.targetElement.getBoundingClientRect();
    const width = rect.width;
    
    // Create flakes
    for (let i = 0; i < this.flakesMax; i++) {
      const flake = document.createElement('div');
      flake.className = 'snowflake';
      flake.innerHTML = this.snowCharacter;
      flake.style.color = this.snowColor;
      flake.style.position = 'absolute';
      flake.style.top = '-20px'; // Start above
      flake.style.left = Math.random() * width + 'px';
      flake.style.fontSize = (8 + Math.random() * 10) + 'px';
      flake.style.fontWeight = 'bold';
      flake.style.zIndex = this.zIndex;
      flake.style.opacity = 0.7 + Math.random() * 0.3;
      flake.style.pointerEvents = 'none';
      
      // Store data for animation
      flake._data = {
        y: -20,
        x: parseFloat(flake.style.left),
        vY: 1 + Math.random() * 3,
        vX: (Math.random() * 2 - 1) * 0.5,
        active: i < this.flakesMaxActive
      };
      
      this.container.appendChild(flake);
      this.flakes.push(flake);
    }
  },
  
  // Animation loop
  animateSnow: function() {
    if (!this.active || this.disabled) return;

    // Get container dimensions
    const height = this.targetElement.offsetHeight;
    const width = this.targetElement.offsetWidth;
    
    // Move each snowflake
    for (let i = 0; i < this.flakes.length; i++) {
      if (!this.flakes[i]._data.active) continue;
      
      // Update position
      const data = this.flakes[i]._data;
      data.y += data.vY;
      data.x += data.vX;
      
      // Reset if out of bounds
      if (data.y > height) {
        data.y = -20;
        data.x = Math.random() * width;
      } else if (data.x > width) {
        data.x = 0;
      } else if (data.x < 0) {
        data.x = width;
      }
      
      // Apply position
      this.flakes[i].style.top = data.y + 'px';
      this.flakes[i].style.left = data.x + 'px';
    }
    
    // Schedule next frame
    this.timer = setTimeout(() => {
      window.requestAnimationFrame(this.animateSnow.bind(this));
    }, this.animationInterval);
  },
  
  // Handle window resize
  resizeHandler: function() {
    // Reposition flakes proportionally
    const width = this.targetElement.offsetWidth;
    
    for (let i = 0; i < this.flakes.length; i++) {
      const data = this.flakes[i]._data;
      const ratio = parseFloat(data.x) / parseFloat(width);
      data.x = width * ratio;
      this.flakes[i].style.left = data.x + 'px';
    }
  },
  
  // Stop animation and clean up
  stop: function() {
    this.active = false;
    clearTimeout(this.timer);
    this.timer = null;
  }
};

export default snowStorm;
