'use strict';

(function () {
  function readHidden(id) {
    var field = document.getElementById(id);
    return field ? field.value : '';
  }

  function parseClientConfig(raw) {
    try {
      return JSON.parse(raw);
    } catch (error) {
      return { error: 'invalid-config' };
    }
  }

  var toggle = readHidden('WidgetToggleHidden');
  var clientConfig = parseClientConfig(readHidden('ClientConfigHidden'));

  if (toggle === 'enabled' && !clientConfig.error) {
    window.widgetConfig = {
      refreshInterval: clientConfig.refreshInterval,
      audience: clientConfig.audience
    };
  }
})();
