import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Parse .env manually to get environment variables
const envPath = '.env';
if (!fs.existsSync(envPath)) {
  console.error('.env file not found.');
  process.exit(1);
}
const envContent = fs.readFileSync(envPath, 'utf8');
const processEnv = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    processEnv[key] = value;
  }
});

const clerkSecretKey = processEnv.CLERK_SECRET_KEY;
const supabaseUrl = processEnv.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = processEnv.PUBLIC_SUPABASE_ANON_KEY;

async function resetClerkUsers() {
  if (!clerkSecretKey) {
    console.log('No Clerk Secret Key found, skipping Clerk reset.');
    return;
  }

  console.log('Fetching users from Clerk...');
  try {
    const response = await fetch('https://api.clerk.com/v1/users?limit=100', {
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to fetch Clerk users: ${response.status} - ${errText}`);
    }

    const users = await response.json();
    console.log(`Found ${users.length} users in Clerk.`);

    for (const user of users) {
      console.log(`Deleting Clerk user: ${user.id} (${user.username || user.emailAddresses?.[0]?.emailAddress})`);
      const deleteResponse = await fetch(`https://api.clerk.com/v1/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${clerkSecretKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!deleteResponse.ok) {
        console.error(`Failed to delete user ${user.id}:`, await deleteResponse.text());
      } else {
        console.log(`Successfully deleted user ${user.id}`);
      }
    }
  } catch (error) {
    console.error('Error resetting Clerk users:', error);
  }
}

async function resetSupabaseProfiles() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('No Supabase URL/Anon Key found, skipping profiles reset.');
    return;
  }

  console.log('Clearing Supabase profiles table...');
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  try {
    // Delete all rows
    const { error } = await supabaseClient
      .from('profiles')
      .delete()
      .neq('id', 'placeholder_nonexistent_id'); // deletes all rows

    if (error) {
      console.error('Error clearing profiles table via Supabase client:', error);
    } else {
      console.log('Successfully cleared profiles table via Supabase client.');
    }
  } catch (error) {
    console.error('Unexpected error resetting profiles:', error);
  }
}

async function main() {
  await resetClerkUsers();
  await resetSupabaseProfiles();
  console.log('Reset complete!');
}

main();
