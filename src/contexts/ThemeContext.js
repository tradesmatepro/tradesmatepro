import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize from localStorage or default to 'light'
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  // Apply theme to DOM whenever it changes
  useEffect(() => {
    const root = document.documentElement;

    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else if (themeMode === 'light') {
      root.classList.remove('dark');
    } else if (themeMode === 'system') {
      // Follow system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Save to localStorage
    localStorage.setItem('theme', themeMode);

    // Save to database (async, non-blocking)
    saveThemeToDatabase(themeMode);
  }, [themeMode]);

  // Save theme to database with retry logic
  const saveThemeToDatabase = async (theme, retryCount = 0) => {
    const MAX_RETRIES = 3;

    try {
      console.log('💾 Attempting to save theme to database:', { theme, attempt: retryCount + 1 });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('⚠️  No user logged in, skipping database save');
        return { success: false, reason: 'no_user' };
      }

      console.log('👤 User ID:', user.id);

      // First, get current preferences to merge
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error fetching current preferences:', fetchError);
        // If profile doesn't exist, we'll create it on update
      }

      const currentPrefs = currentProfile?.preferences || {};
      const newPrefs = { ...currentPrefs, theme };

      console.log('📝 Current preferences:', currentPrefs);
      console.log('📝 New preferences:', newPrefs);

      // Update profiles table
      const { data, error } = await supabase
        .from('profiles')
        .update({
          preferences: newPrefs,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to save theme to database:', error);

        // Retry on network errors or temporary failures
        if (retryCount < MAX_RETRIES && (error.code === 'PGRST301' || error.message.includes('network'))) {
          console.log(`🔄 Retrying save (attempt ${retryCount + 2}/${MAX_RETRIES + 1})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
          return saveThemeToDatabase(theme, retryCount + 1);
        }

        return { success: false, error };
      }

      console.log('✅ Theme saved to database successfully:', { theme, data });
      return { success: true, data };
    } catch (err) {
      console.error('❌ Error saving theme:', err);

      // Retry on exceptions
      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 Retrying save after exception (attempt ${retryCount + 2}/${MAX_RETRIES + 1})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return saveThemeToDatabase(theme, retryCount + 1);
      }

      return { success: false, error: err };
    }
  };

  // Load theme from database on mount with retry logic
  useEffect(() => {
    let isMounted = true;
    let retryTimer = null;

    const loadThemeFromDatabase = async (retryCount = 0) => {
      const MAX_RETRIES = 3;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('⚠️  No user logged in, skipping theme load from database');
          return;
        }

        console.log('🔍 Loading theme from database for user:', user.id);

        const { data, error } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('❌ Error loading theme from database:', error);
          return;
        }

        if (data?.preferences?.theme) {
          const dbTheme = data.preferences.theme;
          console.log('📥 Found theme in database:', dbTheme);
          // Only update if different from current
          if (dbTheme !== themeMode) {
            console.log('🔄 Updating theme from', themeMode, 'to', dbTheme);
            setThemeMode(dbTheme);
          } else {
            console.log('✅ Theme already matches database:', dbTheme);
          }
        } else {
          console.log('⚠️  No theme found in database preferences');
        }
      } catch (err) {
        console.error('❌ Error loading theme:', err);
      }
    };

    // Add a small delay to ensure auth is ready
    const timer = setTimeout(() => {
      loadThemeFromDatabase();
    }, 500);

    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  const isDarkMode = themeMode === 'dark' ||
    (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};