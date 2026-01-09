import fetch from 'node-fetch';

async function checkApp() {
  try {
    const response = await fetch('http://localhost:3000');
    const html = await response.text();
    console.log('HTTP Status:', response.status);
    console.log('HTML Length:', html.length);
    console.log('HTML Content:', html);
  } catch (error) {
    console.error('Error fetching page:', error);
  }
}

checkApp();