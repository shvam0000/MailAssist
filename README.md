# MailAssist - Outlook add-in

MailAssist is an Outlook add-in designed to enhance your email experience by providing tools for managing and organizing your emails efficiently. It offers features such as sending email data to the dashboard using a custom built API, other dynamic features are getting Cat Facts and Star Wars API.

### Dynamic Feature Control & Ribbon Limitations

The add-in aims for dynamic feature control without constant XML re-sideloading. However, it's important to note that Office Add-ins have strict UI limitations, meaning certain dynamic changes to the ribbon's appearance are not possible:

### Inability to Dynamically Hide/Remove Dropdown Options

- The Outlook ribbon UI is declarative and static, defined in manifest.xml at load time.

- There is no Office.js API to dynamically hide or completely remove a dropdown item or any other command from the ribbon at runtime. Such changes always require to modify the manifest.xml and re-sideload the add-in.

### Attempted Methods for Dynamic Control

Explored approaches to offer dynamic control, acknowledging the ribbon's static nature:

1. Graying Out Options via Office.ribbon.requestUpdate():

   - Purpose: This Office.js API allows enabling/disabling (graying out) existing ribbon commands. It requires a <SharedRuntime> and a FunctionFile in the manifest for persistent background JavaScript execution.

   - Reason for Abandonment: Persistent "Installation failed" errors occurred during sideloading when attempted to configure the SharedRuntime. This pointed to deep compatibility or environmental issues with the testing Outlook client, making this approach impractical for the environment.

2. Central Task Pane for Dynamic Functionality:

   - Purpose: To achieve dynamic feature functionality (content displayed) even if ribbon items couldn't be dynamically hidden or grayed out.

   - Approach: The manifest.xml would be static, with all dropdown options pointing to a single centralTaskpane.html file using URL parameters (e.g., ?type=starwars). This centralTaskpane.html would then dynamically load content (e.g., my React email component, or an iframe for other features) based on feature flags fetched from my Flask API (MongoDB). A dedicated Next.js web page (Control Center) would manage these flags via my Flask API.

### Troubleshooting Sideloading Issues (Common Causes for "Installation failed" Errors)

When encountered the generic "Installation failed" error, despite a seemingly correct XML, we can consider these crucial troubleshooting steps:

1. URL Accessibility (HTTPS Mandatory):

- All URLs in manifest.xml (icons, HTML files) must be publicly accessible via HTTPS.

- Diagnosis: Verified each URL in an incognito browser window. Checked for correct loading, HTTPS, and absence of certificate warnings or HTTP redirects.

2. XML File Integrity (Encoding/Hidden Characters):

- Outlook's XML parser is extremely sensitive to invisible characters (like BOMs) or incorrect UTF-8 encoding.

- Resolution:

  - Created the manifest.xml file in a very basic text editor (e.g., Notepad).

  - Copied the XML content precisely (no extra spaces/lines).

  - Saved as UTF-8 (without BOM).

## Environment Setup

### Client Dashboard (Next.js)

#### Requirements

- node & npm install

#### Setup

```
cd mail-dashboard && npm install
```

```
npm run dev
```

### API Server (Flask with MongoDB)

#### Requirements

- python
- flask

#### Setup

```
cd api-server && pip install requirements.txt
```

```
flask run
```

#### Outlook add-in

#### Requirements

- Microsoft Business Standard License
- Outlook Web/Desktop app
- `manifest.xml` file

> Note: Make sure you have correct permissions to sideload the add-in

#### Steps to sideload

- In the Microsoft Outlook Desktop web/app, click the Get add-ins option
- Navigate to My add-ins
- In the custom add-ins section, select Add a custom add-in option and upload the `manifest.xml` file
- The add-in will appear in the ribbon bar and ready to be used once you select any email

### Preview

<img src="https://github.com/shvam0000/MailAssist/blob/main/readme-assets/Screenshot%202025-06-14%20at%203.21.20%E2%80%AFAM.png?raw=true" />

<br />

<img src="https://github.com/shvam0000/MailAssist/blob/main/readme-assets/Screenshot%202025-06-14%20at%203.23.38%E2%80%AFAM.png?raw=true" />

<br />

<img src="https://github.com/shvam0000/MailAssist/blob/main/readme-assets/Screenshot%202025-06-14%20at%203.25.42%E2%80%AFAM.png?raw=true" />
