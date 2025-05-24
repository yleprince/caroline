const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Read the source files
const htmlContent = fs.readFileSync('index.html', 'utf8');
const styleContent = fs.readFileSync('style.css', 'utf8');
const appContent = fs.readFileSync('app.js', 'utf8');

// Create the Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Replace the Firebase configuration in the HTML
const updatedHtmlContent = htmlContent.replace(
    /window\.firebaseConfig = {[\s\S]*?};/,
    `window.firebaseConfig = ${JSON.stringify(firebaseConfig, null, 4)};`
);

// Write the processed files to dist
fs.writeFileSync('dist/index.html', updatedHtmlContent);
fs.writeFileSync('dist/style.css', styleContent);
fs.writeFileSync('dist/app.js', appContent);

console.log('Build completed successfully!'); 