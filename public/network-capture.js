(function () {
  const oldFetch = window.fetch;
  const requests = [];

  window.fetch = async function (...args) {
    const [input, init] = args;
    const url = typeof input === "string" ? input : input.url;
    const method = (init && init.method) || "GET";

    const record = {
      url,
      method,
      requestBody: init && init.body ? init.body.toString() : null,
      status: null,
      responseBody: null,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await oldFetch(...args);
      record.status = response.status;

      // Clone so body can still be read downstream
      const clone = response.clone();
      try {
        record.responseBody = await clone.text();
      } catch (e) {
        record.responseBody = '[Unable to read response body]';
      }

      requests.push(record);
      window.__capturedRequests = requests;

      return response;
    } catch (err) {
      record.status = "NETWORK_ERROR";
      record.responseBody = err.message;
      requests.push(record);
      window.__capturedRequests = requests;
      throw err;
    }
  };

  // Also capture XMLHttpRequest for completeness
  const oldXHROpen = XMLHttpRequest.prototype.open;
  const oldXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this._captureMethod = method;
    this._captureUrl = url;
    this._captureTimestamp = new Date().toISOString();
    return oldXHROpen.call(this, method, url, ...args);
  };

  XMLHttpRequest.prototype.send = function(body) {
    const xhr = this;
    const record = {
      url: xhr._captureUrl,
      method: xhr._captureMethod,
      requestBody: body ? body.toString() : null,
      status: null,
      responseBody: null,
      timestamp: xhr._captureTimestamp,
      type: 'XMLHttpRequest'
    };

    const oldOnReadyStateChange = xhr.onreadystatechange;
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        record.status = xhr.status;
        record.responseBody = xhr.responseText;
        requests.push(record);
        window.__capturedRequests = requests;
      }
      if (oldOnReadyStateChange) {
        oldOnReadyStateChange.call(xhr);
      }
    };

    return oldXHRSend.call(this, body);
  };

  console.log('🌐 Network capture initialized - all fetch/XHR requests will be logged');
})();
