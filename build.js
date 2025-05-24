const fs = require('fs');
const path = require('path');

// Read the firebase-config.js file
let configContent = fs.readFileSync('firebase-config.js', 'utf8');

// Replace placeholders with environment variables
configContent = configContent
    .replace('__FIREBASE_API_KEY__', process.env.FIREBASE_API_KEY || '')
    .replace('__FIREBASE_AUTH_DOMAIN__', process.env.FIREBASE_AUTH_DOMAIN || '')
    .replace('__FIREBASE_PROJECT_ID__', process.env.FIREBASE_PROJECT_ID || '')
    .replace('__FIREBASE_STORAGE_BUCKET__', process.env.FIREBASE_STORAGE_BUCKET || '')
    .replace('__FIREBASE_MESSAGING_SENDER_ID__', process.env.FIREBASE_MESSAGING_SENDER_ID || '')
    .replace('__FIREBASE_APP_ID__', process.env.FIREBASE_APP_ID || '');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Copy and transform all necessary files to dist
const filesToCopy = ['index.html', 'style.css', 'app.js'];

filesToCopy.forEach(file => {
    fs.copyFileSync(file, path.join('dist', file));
});

// Write the processed firebase config
fs.writeFileSync(path.join('dist', 'firebase-config.js'), configContent);

console.log('Build completed successfully!'); 