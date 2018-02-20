var endpoint;
var key;

// Register a Service Worker.
navigator.serviceWorker.register('service-worker.js')
.then(function(registration) {
  // Use the PushManager to get the user's subscription to the push service.
  return registration.pushManager.getSubscription()
  .then(function(subscription) {
    // If a subscription was found, return it.
    if (subscription) {
      return subscription;
    }

    // Otherwise, subscribe the user.
    return registration.pushManager.subscribe()
    .then(function(newSubscription) {
      return newSubscription;
    });
  });
}).then(function(subscription) {
  // Retrieve the user's public key.
  var rawKey = subscription.getKey ? subscription.getKey('p256dh') : '';
  key = rawKey ?
        btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey))) :
        '';

  endpoint = subscription.endpoint;

  // Send the subscription details to the server using the Fetch API.
  fetch('./register', {
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      key: key,
    }),
  });
});

navigator.serviceWorker.addEventListener('message', function(event) {
  document.getElementById('elem').textContent = event.data.message;
});

// Ask the server to send the client a notification (for testing purposes, in real
// applications the notification will be generated by some event on the server).
document.getElementById('doIt').addEventListener('click', function() {
  fetch('./sendNotification', {
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      endpoint: endpoint,
      key: key,
      payload: document.getElementById('payload').value,
    }),
  });
});