import { apiConfig } from './src/config/api.js';

async function test() {
  const url = `${apiConfig.restUrl}/appointments?select=*,patients(full_name),doctors(name)`;
  const res = await fetch(url, { headers: { apikey: apiConfig.anonKey }});
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

test().catch(console.error);
