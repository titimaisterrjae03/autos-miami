
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Env vars missing. Make sure .env is loaded or vars are set.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdmin() {
    const { data, error } = await supabase.auth.signUp({
        email: 'titinarrieche@gmail.com',
        password: '30025443',
        options: {
            data: {
                role: 'admin' // Optional metadata
            }
        }
    });

    if (error) {
        console.error('Error creating user:', error.message);
    } else {
        console.log('User created/fetched:', data.user.email);
        console.log('Confirmation sent if new user.');
    }
}

createAdmin();
