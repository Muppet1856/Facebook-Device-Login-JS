var retries = 0;

window.onload = function () {
  var init = new XMLHttpRequest();
  init.onreadystatechange = function() {
    if (this.readyState ==4 && this.status ==200) {
      var initResponse = JSON.parse(this.responseText);
      document.getElementById("fb-code").innerHTML = initResponse.user_code;
      document.getElementById("fb-uri").innerHTML = initResponse.verification_uri;
      ackSend(initResponse);
    }
  }
  init.open("POST", "https://graph.facebook.com/v7.0/device/login", true);
  init.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  init.send("access_token=YOUR_APP_ID|CLIENT_TOKEN&scope=COMMA_SEPERATED_LIST_OF_PERMISSIONS");
}

function ackSend(initResponse) {
  var ack = new XMLHttpRequest();
  if (ack) {
    ack.open("POST", "https://graph.facebook.com/v7.0/device/login_status", true);
    ack.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    ack.timeout = initResponse.interval*1000;
    var timeout = setTimeout(function() {responseTimeout(ack,initResponse);},(initResponse.interval*1000));
    ack.onreadystatechange = function() {
      if (this.readyState ==4 && this.status ==200) {
        var ackResponse = JSON.parse(this.responseText);
        if (!ackResponse.error) {
          retries = (initResponse.expires_in/initResponse.interval);
          clearTimeout(timeout);
        }
      }
    }
    retries++;
    ack.send("access_token=YOUR_APP_ID|CLIENT_TOKEN&code="+initResponse.code);
  }
}

function responseTimeout(ack,initResponse) {
  ack.abort();
  if (retries  < (initResponse.expires_in/initResponse.interval)) {
    ackSend(initResponse);
  }
}
