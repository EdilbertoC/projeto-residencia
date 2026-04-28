const url1 = "https://yuanqfswhberkoevtmfr.supabase.co/rest/v1/doctors?select=*&limit=1";
const url2 = "https://yuanqfswhberkoevtmfr.supabase.co/rest/v1/patients?select=*&limit=1";
const url3 = "https://yuanqfswhberkoevtmfr.supabase.co/rest/v1/appointments?select=*&limit=1";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YW5xZnN3aGJlcmtvZXZ0bWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTQzNjksImV4cCI6MjA3MDUzMDM2OX0.g8Fm4XAvtX46zifBZnYVH4tVuQkqUH6Ia9CXQj4DztQ";

async function test() {
  const reqs = [url1, url2, url3].map(u => fetch(u, { headers: { apikey: key, Authorization: "Bearer " + key }}));
  const res = await Promise.all(reqs);
  for(const r of res) {
    console.log(r.url, await r.text());
  }
}

test().catch(console.error);
