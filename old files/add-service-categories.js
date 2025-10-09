const { createClient } = require('@supabase/supabase-js');

// Use the same config as the app
const supabaseUrl = "https://amgtktrwpdsigcomavlg.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addServiceCategories() {
  console.log('🏗️ Adding Service Categories...\n');

  const categories = [
    { name: 'Electrical', description: 'Electrical work and repairs' },
    { name: 'Plumbing', description: 'Plumbing installation and repairs' },
    { name: 'HVAC', description: 'Heating, ventilation, and air conditioning' },
    { name: 'Roofing', description: 'Roof installation and repairs' },
    { name: 'Flooring', description: 'Floor installation and refinishing' },
    { name: 'Painting', description: 'Interior and exterior painting' },
    { name: 'Carpentry', description: 'Custom carpentry and woodwork' },
    { name: 'Landscaping', description: 'Lawn care and landscaping services' }
  ];

  try {
    // Check if categories already exist
    const { data: existing } = await supabase
      .from('service_categories')
      .select('name');

    if (existing && existing.length > 0) {
      console.log(`✅ Found ${existing.length} existing categories`);
      existing.forEach(cat => console.log(`   - ${cat.name}`));
      return;
    }

    // Insert categories
    const { data, error } = await supabase
      .from('service_categories')
      .insert(categories)
      .select();

    if (error) {
      console.error('❌ Error adding categories:', error.message);
      return;
    }

    console.log(`✅ Added ${data.length} service categories:`);
    data.forEach(cat => console.log(`   - ${cat.name} (ID: ${cat.id})`));

  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

addServiceCategories();
