import { supabase } from "./supabaseClient"; // Adjust the path as necessary

export const login = async (email: string, password: string) => {
  const { user, error } = await supabase.auth.signIn({
    email,
    password,
  });
  if (error) {
    console.error("Error logging in:", error);
    throw error;
  }
  return user;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error logging out:", error);
    throw error;
  }
}; 