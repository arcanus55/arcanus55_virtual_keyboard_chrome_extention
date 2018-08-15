/*
      _____     _____    ______  _____     ___    _    ___    __       __
   /  \    |    \   /  __)    /  \    |    \  |  | |  |   |  |  )  ____) 
  /    \   |     ) |  /      /    \   |  |\ \ |  | |  |   |  | (  (___  
 /  ()  \  |    /  | |      /  ()  \  |  | \ \|  | |  |   |  |  \___  \ 
|   __   | | |\ \  |  \__  |   __   | |  |  \    | |   \_/   |  ____)  )
|  (__)  |_| |_\ \__\    )_|  (__)  |_|  |___\   |__\       /__(      (__ 5 5
*/

var oAudContx = new AudioContext();    //    HTML5 Audio
var oTabContent;    //    Chrome Tab

var oAJAXReq = new XMLHttpRequest();    //    Get Sounds
var aAudioBuffer = new Array(10);    //    Store Sound files
var fetchSoundConfig = {sound_max: 18, sound_current: 1};    //    Sound limits

fetchSound();

function fetchSound(){
    //    AJAX a single sound binary
    oAJAXReq.open("GET", "scott_c_krause/au/s" + fetchSoundConfig.sound_current + ".mp3", true);
    oAJAXReq.responseType = "arraybuffer";
    oAJAXReq.send();
    oAJAXReq.onload = fetchSoundonload;
}

function fetchSoundonload() {
    //    The audio file has loaded via AJAX
    oAudContx.decodeAudioData(oAJAXReq.response, function (decAudBuf) {
        aAudioBuffer[ fetchSoundConfig.sound_current ] = decAudBuf;
        fetchSoundConfig.sound_current = fetchSoundConfig.sound_current + 1;
        if(fetchSoundConfig.sound_current <= fetchSoundConfig.sound_max){
            oAJAXReq = new XMLHttpRequest();
            oAJAXReq.responseType = "arraybuffer";
            fetchSound( fetchSoundConfig.sound_current );
        }
    });
};

function playAudioFile( nSound ) {
    //    Play MP3 if sound toggle is true
    if( localStorage.getItem("sound_switch") !== "false" ){
        var oSrc = oAudContx.createBufferSource();
        var volume = oAudContx.createGain();
        oSrc.buffer = aAudioBuffer[nSound];
        volume.gain.value = 0.0;
        oSrc.connect(volume);  
        volume.connect(oAudContx.destination);
        oSrc.connect(oAudContx.destination);
        volume.gain.value = 0.0;
        oSrc.start(oAudContx.currentTime);
    }    
};

function audioSuccessSound() {
    //
    playNote(493.883, oAudContx.currentTime,  0.12);
    playNote(659.255, oAudContx.currentTime + 0.12, 0.24);
};

function audioAlert() {
    //
    playNote(300, oAudContx.currentTime,  0.03);
    playNote(400, oAudContx.currentTime + 0.03, 0.06);
};

function audioBleep_1() {
    //
    playNote(800, oAudContx.currentTime + 0.0, 0.10);
};

function audioTick_1() {
    //
    playNote(100, oAudContx.currentTime,  0.60, 0.80);
    playNote(200, oAudContx.currentTime + 0.80, 0.10);
};

function playNote(frequency, startTime, duration) {
    //

    if( localStorage.getItem("sound_switch") !== "false" ){
        var osc = oAudContx.createOscillator(),
            osc2 = oAudContx.createOscillator(),
            volume = oAudContx.createGain();

        // Multiplies the incoming signal by 0.16
        volume.gain.value = 0.16;

        // Make sure the gain value is at 0.216, 0.04 seconds before the note stops.
        volume.gain.setValueAtTime(0.16, startTime + duration - 0.04);
        volume.gain.linearRampToValueAtTime(0, startTime + duration);

        osc.frequency.value = frequency;
        osc.type = 'triangle';

        osc2.frequency.value = frequency;
        osc2.type = 'triangle';

        osc.detune.value = -16;
        osc2.detune.value = 16;

        osc.connect(volume);
        volume.connect(oAudContx.destination);

        osc2.connect(volume);

        osc.start(startTime);
        osc.stop(startTime + duration);

        osc2.start(startTime);
        osc2.stop(startTime + duration);
    }
};

function aJTab( sPanel, sData_all_tags ){
    //    Create or reuse a tab and make its location that had from an href
    localStorage.setItem("eplsg-template--article", sPanel);
    localStorage.setItem("eplsg-template--all_tags", sData_all_tags);

    if( oTabContent === undefined ){
        chrome.tabs.create({url: "scott_c_krause/ever_present_living_style_guide.html", index: 0}, function(tab) {
            oTabContent = tab;
         });    
    }else{
        chrome.tabs.update(oTabContent.Id, {url: "scott_c_krause/ever_present_living_style_guide.html"}, function(tab) {
        });
    }
}

function runTool( sTool ){
    //    Inject CSS or JS into a tab
    switch ( sTool ) {
        case "cmdGrayScale":
            //
            chrome.tabs.insertCSS({code: "body {-webkit-filter: grayscale(1);}"});
            break;
        case "cmdMissingAltTagsLTD":
            //  ALT Audit LTD
            var aURL =  [""];

            clearChromeStorage();
            chrome.tabs.getSelected(null, function(tab){
                for(var iCnt=0;iCnt < aURL.length;iCnt++){
                    chrome.tabs.update(tab.id, {url: aURL[iCnt]});
                    sleep(2800);
                    chrome.tabs.executeScript({file: "scott_c_krause/js/tool_missing_alt_tags.js"});
                    sleep(800);
                }
                aJTab( localStorage.getItem("repo_name") + "/" + "tab-report.html");                
            });

            break;
        case "cmdInjectPrimeBanner":
            //
            chrome.tabs.executeScript({file: "scott_c_krause/js/tool_inject_prime_banner.js"});
            break;
    } 
    //
    setTimeout( function(){
        displayMsg( "Tab Tool Complete" );
    }, 1840);
}

function clearChromeStorage(){
    //    Clear All Chrome Storage
    chrome.storage.local.clear(function() {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
    });
}

function sleep(ms) {
    //  Synce Sleep
    var start = new Date().getTime(), expire = start + ms;
    while (new Date().getTime() < expire) { }
    return;
}

function displayMsg( sMsg ){
    //    System Tray Notification
    console.log( sMsg );
    if (!("Notification" in window)) {
        console.log('Notification API not supported.');
        return;
    } else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        audioSuccessSound();
                var notification = new Notification( Nowish(), {icon: "http://neodigm.github.io/ever-present-living-style-guide-site/img/ever-present-living-style-guide.png", body: sMsg} );
    } else if (Notification.permission !== "denied") {
        // Otherwise, we need to ask the user for permission

        Notification.requestPermission(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
                var notification = new Notification( Nowish(), {icon: "http://neodigm.github.io/ever-present-living-style-guide-site/img/ever-present-living-style-guide.png", body: sMsg} );
            }
        });
    }
}

function Nowish(){
    //    A readable Client-side time/date stamp
    var dNow = new Date();
    return dNow.toString().substr(0, dNow.toString().length - 33);
}

function createCookie(name, value, days) {
    //    Lets also create a chrome store assoc array
    var expires;
    chrome.storage.local.set({cookie_name:  name});
    chrome.storage.local.set({cookie_value: value});
    /* We do not need to create a cookie as the inserted js does that
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
    */
}

function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}