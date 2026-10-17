import { BrowserAgent } from "@newrelic/browser-agent/loaders/browser-agent";

const {
  VITE_NEW_RELIC_ACCOUNT_ID: accountID,
  VITE_NEW_RELIC_AGENT_ID: agentID,
  VITE_NEW_RELIC_LICENSE_KEY: licenseKey,
  VITE_NEW_RELIC_APP_ID: applicationID,
  VITE_NEW_RELIC_REGION: configuredRegion,
} = import.meta.env;

const region = (configuredRegion || "US").toUpperCase();
const beaconByRegion = {
  US: "bam.nr-data.net",
  EU: "bam.eu01.nr-data.net",
};
const beacon = beaconByRegion[region];

const missingConfig = Object.entries({
  VITE_NEW_RELIC_ACCOUNT_ID: accountID,
  VITE_NEW_RELIC_LICENSE_KEY: licenseKey,
  VITE_NEW_RELIC_APP_ID: applicationID,
})
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (!beacon) {
  missingConfig.push("VITE_NEW_RELIC_REGION (US or EU)");
}

if (missingConfig.length > 0) {
  console.warn(
    `New Relic Browser monitoring is disabled; missing configuration: ${missingConfig.join(", ")}.`
  );
} else {
  new BrowserAgent({
    init: {
      browser_consent_mode: { enabled: false },
      privacy: { cookies_enabled: true },
      distributed_tracing: { enabled: true },
      performance: { capture_measures: true },
      ajax: {
        deny_list: [beacon],
        capture_payloads: "none",
      },
    },
    loader_config: {
      accountID,
      trustKey: accountID,
      agentID: agentID || applicationID,
      licenseKey,
      applicationID,
    },
    info: {
      beacon,
      errorBeacon: beacon,
      licenseKey,
      applicationID,
      sa: 1,
    },
  });
}
