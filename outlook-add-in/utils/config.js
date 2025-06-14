// Configuration object to store UI element states
const UIConfig = {
  // Default states for all UI elements
  elements: {
    dropdown1: true,
    dropdown2: true,
    option1: true,
    option2: true,
    // Add more elements as needed
  },

  // Load configuration from storage
  loadConfig() {
    const savedConfig = localStorage.getItem('uiConfig');
    if (savedConfig) {
      this.elements = JSON.parse(savedConfig);
    }
  },

  // Save configuration to storage
  saveConfig() {
    localStorage.setItem('uiConfig', JSON.stringify(this.elements));
  },

  // Toggle an element's visibility
  toggleElement(elementId) {
    this.elements[elementId] = !this.elements[elementId];
    this.saveConfig();
    return this.elements[elementId];
  },

  // Get element visibility state
  isVisible(elementId) {
    return this.elements[elementId];
  },
};

// Initialize configuration
UIConfig.loadConfig();
