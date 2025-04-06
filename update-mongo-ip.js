const axios = require('axios');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

// MongoDB Atlas configuration
const MONGODB_PROJECT_ID = process.env.MONGODB_PROJECT_ID || '';

// Path to store the last known IP
const IP_CACHE_FILE = path.join(__dirname, '.last_ip_address');

// Function to get the current public IP address
async function getCurrentIP() {
  try {
    // Try multiple IP services in case one fails
    const services = [
      'https://api.ipify.org?format=json',
      'https://api.my-ip.io/ip.json',
      'https://api64.ipify.org?format=json'
    ];
    
    let ip = null;
    let error = null;
    
    // Try each service until one works
    for (const service of services) {
      try {
        const response = await axios.get(service);
        if (response.data && (response.data.ip || response.data.success)) {
          ip = response.data.ip;
          break;
        }
      } catch (err) {
        error = err;
        console.log(`Service ${service} failed, trying next...`);
      }
    }
    
    if (!ip) {
      if (error) throw error;
      throw new Error('Could not determine IP address from any service');
    }
    
    return ip;
  } catch (error) {
    console.error('Error getting current IP:', error.message);
    throw error;
  }
}

// Function to provide direct URLs for MongoDB Atlas IP whitelist management
async function provideDirectWhitelistLinks(ip) {
  console.log('\n===== MongoDB Atlas IP Whitelist Management =====');
  console.log(`Your current IP address is: ${ip}`);
  console.log('\n1. To manually update your MongoDB Atlas IP whitelist:');
  console.log(`   - Go to: https://cloud.mongodb.com/v2/${MONGODB_PROJECT_ID}#/security/network/accessList`);
  console.log('   - Click "+ ADD IP ADDRESS"');
  console.log('   - Click "ADD CURRENT IP ADDRESS" or enter your IP manually');
  console.log(`   - Your current IP is: ${ip}`);
  
  console.log('\n2. For temporary access (24 hours):');
  console.log('   - When adding your IP, check "Temporary Access" and set it to 24 hours');
  
  console.log('\n3. For development environments:');
  console.log('   - You can use "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)');
  console.log('   - Warning: This is less secure and not recommended for production');
  
  console.log('\n===================================================\n');
  
  // Check if IP has changed since last run
  let cachedIP = '';
  try {
    if (fs.existsSync(IP_CACHE_FILE)) {
      cachedIP = fs.readFileSync(IP_CACHE_FILE, 'utf8').trim();
      console.log(`Last recorded IP: ${cachedIP}`);
      
      if (ip !== cachedIP) {
        console.log('Your IP has changed since the last run.');
        console.log('You will need to update your MongoDB Atlas IP whitelist.');
      } else {
        console.log('Your IP has not changed since the last run.');
        console.log('If you\'re still having connection issues, your whitelist entry might have expired.');
      }
    } else {
      console.log('This appears to be your first time running this script.');
      console.log('Make sure to add your IP to the MongoDB Atlas whitelist.');
    }
    
    // Always update the cached IP
    fs.writeFileSync(IP_CACHE_FILE, ip);
  } catch (error) {
    console.error('Error managing IP cache:', error.message);
  }
}

// Main function
async function main() {
  try {
    // Check if Project ID is provided
    if (!MONGODB_PROJECT_ID) {
      console.error('MongoDB Atlas Project ID is not configured.');
      console.log('Please set the MONGODB_PROJECT_ID in your .env file.');
      console.log('You can find this in the MongoDB Atlas dashboard under "Project Settings".');
      return;
    }

    // Get current IP
    const ip = await getCurrentIP();
    await provideDirectWhitelistLinks(ip);
    
  } catch (error) {
    console.error('An error occurred:', error.message);
    console.log('\nPlease visit https://cloud.mongodb.com/ and manually update your IP whitelist.');
  }
}

// Run the script
main(); 