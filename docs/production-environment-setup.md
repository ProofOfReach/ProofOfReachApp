# Production Environment Setup

This document explains how to set up the environment variables for controlling the production/development mode behavior of the Nostr Ad Marketplace application on different hosting environments.

## Environment Variable Settings

The main environment variable to control production mode is:

```
NEXT_PUBLIC_IS_PRODUCTION=true
```

When this variable is set to `true`, the application will:
1. Hide the "Get Started" button in the navigation bar
2. Hide development-only UI elements
3. Disable the development banner
4. Force production mode regardless of domain name

## Setting Up on a Standard VPS

### Method 1: Using a .env File (Recommended)

1. Create or edit a `.env` file in the project root:

```bash
# SSH into your VPS
ssh user@your-server-ip

# Navigate to your project directory
cd /path/to/project

# Create or edit the .env file
nano .env
```

2. Add the following line to the file:

```
NEXT_PUBLIC_IS_PRODUCTION=true
```

3. Save the file and exit (Ctrl+X, then Y, then Enter in nano)

4. Restart your Next.js application to pick up the new environment variable:

```bash
# If using PM2
pm2 restart your-app-name

# If using systemd
sudo systemctl restart your-app-service
```

### Method 2: Using systemd Environment Configuration (For systemd-managed services)

If your Node.js application is managed by systemd:

1. Edit your service file:

```bash
sudo nano /etc/systemd/system/your-app.service
```

2. Add the environment variable to the `[Service]` section:

```
[Service]
Environment="NEXT_PUBLIC_IS_PRODUCTION=true"
...other service configuration...
```

3. Reload systemd and restart your service:

```bash
sudo systemctl daemon-reload
sudo systemctl restart your-app
```

### Method 3: Using PM2 Ecosystem File

If using PM2 process manager:

1. Edit your ecosystem.config.js file:

```bash
nano ecosystem.config.js
```

2. Add the environment variable:

```javascript
module.exports = {
  apps: [{
    name: "nostr-ad-marketplace",
    script: "npm",
    args: "start",
    env: {
      NODE_ENV: "production",
      NEXT_PUBLIC_IS_PRODUCTION: "true"
    }
  }]
};
```

3. Restart using the ecosystem file:

```bash
pm2 restart ecosystem.config.js
```

## Testing Your Configuration

To verify that your environment variable is correctly set and being recognized:

1. SSH into your server
2. Navigate to your project directory
3. Run: `grep -r "NEXT_PUBLIC_IS_PRODUCTION" .` to find files using this variable
4. Check your application logs for any messages related to production mode

## Development Environment

In development environments (including Replit), this variable should not be set, allowing the app to detect development mode based on the domain or other indicators.

For testing production mode in development, you can temporarily set this variable in your local environment.