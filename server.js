const express = require('express');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// 1. Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// 2. Dynamically load serverless functions from /api
const apiDir = path.join(__dirname, 'api');

if (fs.existsSync(apiDir)) {
    fs.readdirSync(apiDir).forEach(async file => {
        // Only process .js files
        if (path.extname(file) === '.js') {
            const routePath = '/api/' + path.basename(file, '.js');

            try {
                const modulePath = path.join(apiDir, file);
                const module = await import(pathToFileURL(modulePath).href);
                const handler = module.default;

                // Assume the module exports a default function (req, res) => ...
                if (typeof handler === 'function') {
                    // Register for all HTTP methods
                    app.all(routePath, handler);
                    console.log(`Registered route: ${routePath}`);
                } else {
                    console.warn(`File ${file} in /api does not export a default function.`);
                }
            } catch (err) {
                 console.error(`Error loading route ${routePath}:`, err);
            }
        }
    });
} else {
    console.log('No /api directory found.');
}

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});