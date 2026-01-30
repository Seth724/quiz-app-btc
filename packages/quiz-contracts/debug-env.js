import { config } from 'dotenv';
import { Computer } from '@bitcoin-computer/lib';

// Explicitly load the .env file
const result = config();
console.log('Dotenv result:', result);

console.log('Environment variables:');
console.log('NEXT_PUBLIC_URL:', process.env.NEXT_PUBLIC_URL);
console.log('URL:', process.env.URL);
console.log('BCN_URL:', process.env.BCN_URL);

// Use the environment variables with fallbacks
const url = process.env.URL || process.env.NEXT_PUBLIC_URL || process.env.BCN_URL || 'http://localhost:1031';
const chain = process.env.CHAIN || process.env.NEXT_PUBLIC_CHAIN || process.env.BCN_CHAIN || 'LTC';
const network = process.env.NETWORK || process.env.NEXT_PUBLIC_NETWORK || process.env.BCN_NETWORK || 'regtest';

console.log('\nUsing:');
console.log('URL:', url);
console.log('Chain:', chain);
console.log('Network:', network);

try {
  const computer = new Computer({ url, chain, network });
  console.log('\nComputer instance created successfully');
  console.log('Address:', computer.getAddress());
  console.log('Public Key:', computer.getPublicKey().substring(0, 20) + '...');
} catch (error) {
  console.error('\nError creating computer:', error.message);
}