(function(){
  try {
    const hist = window.__supaFetchHistory || [];
    if (!hist.length) {
      console.log('ℹ️ No supaFetch history yet. Interact with the app to generate requests.');
      return;
    }
    console.log(`📜 supaFetch history (${hist.length} entries):`);
    hist.forEach((e, i) => {
      console.log(`#${i+1}`, e);
    });
    if (window.__lastSupaFetchError) {
      console.error('❗ Last supaFetch error:', window.__lastSupaFetchError);
    }

    // Convenience: show last PATCH to companies/settings
    const lastPatch = [...hist].reverse().find(x => x.phase==='request' && x.method==='PATCH');
    if (lastPatch) {
      console.log('🧾 Last PATCH request:', lastPatch);
    }
  } catch (e) {
    console.error('Failed to print supaFetch history', e);
  }
})();

