// File: backend/src/middleware/sessionMiddleware.js
// Purpose: Extracts client information (IP, user agent, device type) and attaches to request
// Usage: Use in server.js before routes to track client details for security and analytics

/**
 * Session Middleware - Extract Client Information
 *
 * This middleware extracts client details from the HTTP request and attaches them
 * to the request object for use in controllers and session tracking
 *
 * Information extracted:
 * - IP address: User's IP address (handles proxies)
 * - User agent: Browser/device information string
 * - Device type: Mobile or Desktop
 * - Browser type: Chrome, Firefox, Safari, or other
 *
 * Usage in server.js:
 * const { extractClientInfo } = require('./middleware/sessionMiddleware');
 * app.use(extractClientInfo);
 */
const extractClientInfo = (req, res, next) => {
    try {
        // Extract IP address from request
        // Tries multiple sources because app might be behind a proxy/load balancer
        // Priority order:
        // 1. x-forwarded-for header (set by proxies like nginx, Apache)
        // 2. connection.remoteAddress (direct connection)
        // 3. socket.remoteAddress (websocket connection)
        // 4. 'Unknown' (fallback if none available)
        req.clientIP = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            'Unknown';

        // Handle comma-separated IPs from x-forwarded-for
        // When request goes through multiple proxies, first IP is the client
        if (req.clientIP && req.clientIP.includes(',')) {
            req.clientIP = req.clientIP.split(',')[0].trim();
        }

        // Extract user agent string from request headers
        // Contains information about browser, OS, and device
        // Example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        req.userAgent = req.headers['user-agent'] || 'Unknown';

        // Determine device type from user agent
        // Mobile devices typically have "Mobile" in their user agent string
        // This is a simple heuristic; more sophisticated detection available if needed
        req.deviceType = req.userAgent.toLowerCase().includes('mobile') ? 'mobile' : 'desktop';

        // Determine browser type from user agent
        // Each browser has a distinctive string in the user agent
        // Note: Order matters - check specific strings first, then general
        if (req.userAgent.includes('Chrome') && !req.userAgent.includes('Chromium')) {
            req.browserType = 'chrome';
        } else if (req.userAgent.includes('Firefox')) {
            req.browserType = 'firefox';
        } else if (req.userAgent.includes('Safari') && !req.userAgent.includes('Chrome')) {
            req.browserType = 'safari';
        } else if (req.userAgent.includes('Edge') || req.userAgent.includes('Edg')) {
            req.browserType = 'edge';
        } else if (req.userAgent.includes('Opera') || req.userAgent.includes('OPR')) {
            req.browserType = 'opera';
        } else {
            req.browserType = 'other';
        }

        // Extract operating system from user agent
        // Helps identify when user switches devices
        req.osType = 'unknown';
        if (req.userAgent.includes('Windows')) {
            req.osType = 'windows';
        } else if (req.userAgent.includes('Mac')) {
            req.osType = 'macos';
        } else if (req.userAgent.includes('Linux')) {
            req.osType = 'linux';
        } else if (req.userAgent.includes('Android')) {
            req.osType = 'android';
        } else if (req.userAgent.includes('iPhone') || req.userAgent.includes('iPad')) {
            req.osType = 'ios';
        }

        // Continue to next middleware/route handler
        // Even if some parsing fails, don't stop execution
        next();

    } catch (error) {
        // If any error occurs during parsing, log it and continue
        // This middleware should never break the application
        console.error('Session middleware error:', error);
        next();
    }
};

/**
 * Helper function to get friendly device description
 * Can be used in controllers to generate human-readable session info
 *
 * @param {Object} req - Express request object (must have been processed by extractClientInfo)
 * @returns {String} - Friendly description like "Chrome on Windows Desktop"
 *
 * Usage in controller:
 * const description = getDeviceDescription(req);
 * // Result: "Chrome on Windows Desktop"
 */
const getDeviceDescription = (req) => {
    const browser = req.browserType ?
        req.browserType.charAt(0).toUpperCase() + req.browserType.slice(1) :
        'Unknown';
    const os = req.osType ?
        req.osType.charAt(0).toUpperCase() + req.osType.slice(1) :
        'Unknown';
    const device = req.deviceType ?
        req.deviceType.charAt(0).toUpperCase() + req.deviceType.slice(1) :
        'Unknown';

    return `${browser} on ${os} ${device}`;
};

module.exports = {
    extractClientInfo,
    getDeviceDescription
};