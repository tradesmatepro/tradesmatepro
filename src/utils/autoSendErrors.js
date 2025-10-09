export default function autoSendErrors(intervalSec = 30) {
  console.log(`🔇 Auto-send errors disabled (no error server running)`);

  const sendErrors = async () => {
    try {
      let errors = [];

      // Multiple fallbacks for error sources
      if (window.getAllCapturedErrors) {
        errors = window.getAllCapturedErrors();
      } else if (window.capturedErrors) {
        errors = window.capturedErrors;
      } else if (
        window.consoleErrorDetector &&
        window.consoleErrorDetector.errors
      ) {
        errors = window.consoleErrorDetector.errors;
      }

      console.log(`📊 Found ${errors.length} errors (auto-send disabled)`);

      // Disabled to prevent connection errors
      // if (errors && errors.length > 0) {
      //   const response = await fetch("http://localhost:4000/save-errors", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify(errors),
      //   });

      //   if (response.ok) {
      //     const result = await response.json();
      //     console.log(
      //       `✅ Auto-saved ${result.count} errors to ${result.file}, latest.json updated`
      //     );
      //   } else {
      //     console.warn(`⚠️ Error server responded with ${response.status}`);
      //   }
      // } else {
      //   console.log("📝 No errors to send");
      // }
    } catch (err) {
      console.warn("⚠️ Failed to process captured errors:", err.message);
    }
  };

  // Disabled auto-send to prevent connection errors
  // sendErrors();
  // const interval = setInterval(sendErrors, intervalSec * 1000);
  // return interval;

  return null; // Return null instead of interval
}
