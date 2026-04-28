const url = "https://yuanqfswhberkoevtmfr.supabase.co/rest/v1/appointments?select=*,patients(full_name),doctors(name)";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YW5xZnN3aGJlcmtvZXZ0bWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTQzNjksImV4cCI6MjA3MDUzMDM2OX0.g8Fm4XAvtX46zifBZnYVH4tVuQkqUH6Ia9CXQj4DztQ";

async function test() {
  const res = await fetch(url, { headers: { apikey: key, Authorization: "Bearer " + key }});
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

test().catch(console.error);
