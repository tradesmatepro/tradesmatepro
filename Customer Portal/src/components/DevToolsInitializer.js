import { useEffect } from 'react';
import { useCustomer } from '../contexts/CustomerContext';
import devToolsService from '../services/DevToolsService';

/**
 * Component to initialize developer tools with supabase client from CustomerContext
 * This ensures the developer tools have access to the authenticated supabase client
 */
const DevToolsInitializer = () => {
  const { supabase } = useCustomer();

  useEffect(() => {
    const initDevTools = async () => {
      if (supabase) {
        try {
          await devToolsService.initialize(supabase);
          console.log('🛠️ Customer Portal Developer tools initialized with supabase client');
        } catch (error) {
          console.error('❌ Customer Portal Developer tools initialization failed:', error);
        }
      }
    };

    initDevTools();
  }, [supabase]);

  // This component doesn't render anything
  return null;
};

export default DevToolsInitializer;
