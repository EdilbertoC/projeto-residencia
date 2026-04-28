const url = "https://yuanqfswhberkoevtmfr.supabase.co/rest/v1/";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YW5xZnN3aGJlcmtvZXZ0bWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTQzNjksImV4cCI6MjA3MDUzMDM2OX0.g8Fm4XAvtX46zifBZnYVH4tVuQkqUH6Ia9CXQj4DztQ";

async function test() {
  const res = await fetch(url, { headers: { apikey: key }});
  const json = await res.json();
  
  console.log("Doctors columns:", Object.keys(json.definitions.doctors.properties));
  console.log("Patients columns:", Object.keys(json.definitions.patients.properties));
  console.log("Appointments columns:", Object.keys(json.definitions.appointments.properties));
}

test().catch(console.error);
