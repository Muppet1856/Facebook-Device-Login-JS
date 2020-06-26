// https://developers.facebook.com/docs/facebook-login/for-devices                                                                                                            
///////////////////////////////////////////////////
//              -= Config Block =-               //
// Change the following strings to match your    //                                                                                                                           // Facebook Developer account information.       //
///////////////////////////////////////////////////
vvar fb_app_id = "YOUR_APP_ID";                              // Ex. var fb_app_id = "1234567890";
var fb_client_token = "CLIENT_TOKEN";                        // Ex. fb_client_token = "abc123def456fed789cba0";
var fb_permissions = "COMMA_SEPERATED_LIST_OF_PERMISSIONS";  // Ex. fb_permissions = "public_profile,email";
///////////////////////////////////////////////////
//            -= End Config Block =-             //
///////////////////////////////////////////////////

window.onload = function () {  //  Placeholder function - starts the application on load
  initSend();  //  Main function.  Will produce fbAuthentication
}

// fbAuthentication is the result of this script.  It contains the "access_token", "data_access_expiration_time", and "expires_in" response data as JSON.
// Access the elements using fbAuthentication.access_token, fbAuthentication.data_access_expiration_time, fbAuthentication.expires_in
var fbAuthentication;

var retries = 0;
// https://developers.facebook.com/docs/facebook-login/for-devices#tech-step1
function initSend() {
  var init = new XMLHttpRequest();
  init.onreadystatechange = function() {
    if ((this.readyState == 4) && (this.status == 200)) {
      var initResponse = JSON.parse(this.responseText);
// https://developers.facebook.com/docs/facebook-login/for-devices#tech-step2
      document.getElementById("fb-code").innerHTML = initResponse.user_code;  // Placeholder for the code to be shown in element.  Just add id="fb-code"
      document.getElementById("fb-uri").innerHTML = initResponse.verification_uri;  // Placeholder for uri to be shown to the user.  Just add id="fb-uri"
      document.getElementById("fb-uri").setAttribute("href","https://www.facebook.com/device?user_code="+initResponse.user_code);
      ackSend(initResponse);
    } else if ((this.readyState == 4) && (this.status >= 400)) {
      console.log("Something went really bad...");
      console.log(init);                                                                                                                                                            console.log(this.responseText);
    }
  }
  init.open("POST", "https://graph.facebook.com/v7.0/device/login", true);
  init.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  init.send("access_token="+fb_app_id+"|"+fb_client_token+"&scope="+fb_permissions);
}

function ackSend(initResponse) {
  var ack = new XMLHttpRequest();
  if (ack) {
    ack.open("POST", "https://graph.facebook.com/v7.0/device/login_status", true);
    ack.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    ack.timeout = initResponse.interval*1000;
// Set retry strategy based on initializtion response JSON.  (Typically 5 seconds)                                                                                                var ackTimeout = setTimeout(function() {ackresponseTimeout(ack,initResponse);},(initResponse.interval*1000));
    ack.onreadystatechange = function() {
      if ((this.readyState == 4) && (this.status == 200)) {
        var ackResponse = JSON.parse(this.responseText);
        if (!ackResponse.error) {
          retries = (initResponse.expires_in/initResponse.interval);
          clearTimeout(ackTimeout);
        }
      } else if ((this.readyState == 4) && (this.status >= 400)) {
        console.log("Something went really bad...");
        console.log(ack);
        console.log(this.responseText);
      }
    }
    retries++;
    ack.send("access_token="+fb_app_id+"|"+fb_client_token+"&code="+initResponse.code);
  }
}

function ackresponseTimeout(ack,initResponse) {
  ack.abort();
// Limit retries to equal the expriation time.  Found by dividing the expire time by the interval.                                                                              if (retries  < (initResponse.expires_in/initResponse.interval)) {
    ackSend(initResponse);
  }
}
