export function removeAllClickListeners(element) {
  var listeners = getEventListeners(element)['click'];
  if (listeners) {
    listeners.forEach(function (listener) {
      element.removeEventListener('click', listener.listener);
    });
  }
}

export function getEventListeners(element) {
  if (!(element instanceof Element)) {
    throw new Error('getEventListeners: Invalid argument.');
  }
  var result = {};
  var events = getEventListeners.events;
  var listeners = events.listeners(element);
  for (var i = 0; i < listeners.length; i++) {
    var listener = listeners[i];
    var type = listener.type;
    if (!result[type]) {
      result[type] = [];
    }
    result[type].push(listener);
  }
  return result;
}

getEventListeners.events = (function () {
  var events = require('events');
  if (events && events.EventEmitter && events.EventEmitter.prototype) {
    return events.EventEmitter.prototype;
  }
  return undefined;
})();
