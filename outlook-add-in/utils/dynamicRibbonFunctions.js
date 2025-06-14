// dynamicRibbonFunctions.js

// This file contains the JavaScript functions that will run in the add-in's Shared Runtime.
// It is responsible for fetching an external configuration and updating the ribbon command states.

// Define the URL where your config.json will be hosted.
// IMPORTANT: Replace this with the actual URL where you host your config.json.
// Ensure this URL is publicly accessible and uses HTTPS.
const CONFIG_FILE_URL =
  'https://d3bom75t08e7rj.cloudfront.net/featureConfig.json'; // Example URL

// Map feature names (from config.json) to their corresponding Outlook Command IDs (from manifest.xml)
const FEATURE_COMMAND_MAP = {
  starWars: 'getDataButton1',
  emailData: 'getDataButton2',
  catFacts: 'getCatFactsButton',
  // Note: mblTaskPaneButton is handled separately as it's a direct control, not part of the menu
  // The mobile button's enabled state will be true if any of the main features are enabled.
};

/**
 * Fetches the feature configuration from the external JSON file.
 * @returns {Promise<Object>} A promise that resolves with the configuration object.
 */
async function fetchFeatureConfig() {
  try {
    const response = await fetch(CONFIG_FILE_URL);
    if (!response.ok) {
      console.error(
        `Failed to fetch config.json: HTTP status ${response.status}`
      );
      // Return default state (all disabled) if config cannot be fetched
      return {
        starWars: false,
        emailData: false,
        catFacts: false,
      };
    }
    const config = await response.json();
    console.log('Fetched feature config:', config);
    return config;
  } catch (error) {
    console.error('Error fetching feature config:', error);
    // Return default state (all disabled) on network or parsing error
    return {
      starWars: false,
      emailData: false,
      catFacts: false,
    };
  }
}

/**
 * Updates the Outlook ribbon command states based on the fetched configuration.
 * @param {Object} config The feature configuration object.
 */
function updateRibbonCommands(config) {
  // Check if Office.ribbon API is available (it might not be immediately on add-in start)
  if (
    typeof Office === 'undefined' ||
    !Office.ribbon ||
    !Office.ribbon.requestUpdate
  ) {
    console.warn(
      'Office.ribbon API not available or not ready. Retrying in 1 second...'
    );
    // If not ready, try again after a short delay
    setTimeout(() => updateRibbonCommands(config), 1000);
    return;
  }

  const controlsToUpdate = [
    {
      id: FEATURE_COMMAND_MAP.starWars,
      enabled: config.starWars || false, // Default to false if undefined
    },
    {
      id: FEATURE_COMMAND_MAP.emailData,
      enabled: config.emailData || false, // Default to false if undefined
    },
    {
      id: FEATURE_COMMAND_MAP.catFacts,
      enabled: config.catFacts || false, // Default to false if undefined
    },
  ];

  // For the mobile button, we need to consider if *any* feature is enabled.
  // If all are disabled, the mobile button itself should be disabled.
  const isAnyFeatureEnabled =
    config.starWars || config.emailData || config.catFacts;
  controlsToUpdate.push({
    id: 'mblTaskPaneButton', // ID of the mobile button from the manifest
    enabled: isAnyFeatureEnabled || false, // Mobile button enabled if any linked feature is enabled
  });

  Office.ribbon
    .requestUpdate({
      // Here, we're providing a flat array of controls to update.
      // Office.ribbon.requestUpdate can take either 'tabs' or a 'controls' array at the top level
      // to update specific controls directly by their IDs regardless of their grouping structure.
      controls: controlsToUpdate,
    })
    .then(() => {
      console.log('Ribbon updated successfully based on config.');
    })
    .catch((error) => {
      console.error('Error updating ribbon:', JSON.stringify(error));
      // A common error might be 'The add-in doesn't support the Office.ribbon API yet'
      // if SharedRuntime isn't correctly configured or supported.
    });
}

/**
 * Main function to initialize and periodically update ribbon commands.
 */
async function initializeAndPollRibbonUpdates() {
  // Initial update on add-in load
  const initialConfig = await fetchFeatureConfig();
  updateRibbonCommands(initialConfig);

  // Poll for updates every 30 seconds (adjust as needed)
  // Be mindful of server load if polling too frequently.
  // Also consider using Office.context.roamingSettings to store last poll time
  // or to avoid polling if the add-in is not active/visible.
  setInterval(async () => {
    const updatedConfig = await fetchFeatureConfig();
    updateRibbonCommands(updatedConfig);
  }, 30000); // Poll every 30 seconds
}

// Ensure Office.js is ready before running any code
// Office.onReady ensures the Office Add-in environment is fully loaded.
Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    console.log(
      'Office.js is ready for Outlook. Initializing dynamic ribbon updates.'
    );
    initializeAndPollRibbonUpdates();
  } else {
    console.warn(
      'Office host is not Outlook, dynamic ribbon updates will not be applied.'
    );
  }
});

// IMPORTANT: This file primarily runs in the Shared Runtime.
// If you had any command buttons in the manifest that called a specific
// JavaScript function (e.g., `<Action xsi:type="ExecuteFunction"><FunctionName>myFunction</FunctionName></Action>`),
// those functions would need to be defined here and exposed globally if necessary.
// In our current XML, all actions are `ShowTaskpane`, so this `functionFile` is
// primarily for the background ribbon updating logic.
