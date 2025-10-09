8 – Environment & Ports (Final Corrected Guide)

This guide enforces how dev servers are run for TradesMate projects.
It eliminates “port already in use” errors and prevents Claude from leaving processes hanging.

🔑 Golden Rules

Each app has a fixed port.

TradesMatePro main app → 3000

Customer Portal → 3001

Dev Tools → 3002

Always kill ports before starting.

Never start a dev server without clearing its assigned port.

This prevents ghost processes left by Claude or you.

Use scripts, not manual commands.

Scripts wrap the port kill + dev start into one step.

Claude must always use these scripts, not npm start directly.

⚙️ Setup Instructions
Install Kill-Port
npm install --save-dev kill-port

Add Scripts to package.json (Main App)
"scripts": {
  "kill-main": "npx kill-port 3000",
  "dev-main": "npm run kill-main && react-scripts start"
}

Add Scripts to package.json (Customer Portal)
"scripts": {
  "kill-customer": "npx kill-port 3001",
  "dev-customer": "npm run kill-customer && react-scripts start"
}

Add Scripts to package.json (Dev Tools)
"scripts": {
  "kill-devtools": "npx kill-port 3002",
  "dev-devtools": "npm run kill-devtools && react-scripts start"
}

Universal Kill Script

For convenience, you can also add:

"scripts": {
  "kill-all": "npx kill-port 3000 3001 3002"
}

🚦 Usage

To start the main app:

npm run dev-main


To start the customer portal:

npm run dev-customer


To start the dev tools:

npm run dev-devtools


To reset everything:

npm run kill-all

🚫 What Not to Do

❌ Don’t run npm start directly (skips port reset).

❌ Don’t let multiple apps fight for the same port.

❌ Don’t leave processes hanging in the background.

🎯 Key Principles

Each app = fixed port.

Ports always killed before running.

Only use scripted commands, never manual.

Sandbox rules still apply (no real project).