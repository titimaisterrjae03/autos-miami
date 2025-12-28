
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://izuctllnuzpnvxqzapnk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dWN0bGxudXpwbnZ4cXphcG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MTY1NjgsImV4cCI6MjA4MjM5MjU2OH0.XQrL44E7ZwseKmbH8TLR82-n8R8wiW4cHvYKYhRPxg8";

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
