window.addEventListener('DOMContentLoaded', function () {
  console.log('DOM fully loaded and parsed');
  websdkready();
});

function websdkready() {
  var testTool = window.testTool;

  // ✅ Load VConsole for mobile debugging (if used)
  if (testTool.isMobileDevice()) {
    var script = document.createElement('script');
    script.src = 'https://unpkg.com/vconsole/dist/vconsole.min.js';
    script.onload = function () { vConsole = new VConsole(); };
    document.head.appendChild(script);
  }

  console.log("Checking system requirements...");
  console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));

  // ✅ Load Zoom SDK properly
  ZoomMtg.setZoomJSLib('https://source.zoom.us/3.11.0/lib', '/av');
  ZoomMtg.preLoadWasm();
  

  const CLIENT_ID = "USroBek9TFK0sdTnKGQcg";
  const CLIENT_SECRET = "xfjGAB6qOuMVQCABv8obRavSaNrd1X8d";

  document.getElementById("display_name").value = "";
  document.getElementById("meeting_number").value = "87370145813";
  document.getElementById("meeting_pwd").value = "0fGYcM";

  // 🔄 Language preference
  const lang = testTool.getCookie("meeting_lang");
  if (lang) {
    document.getElementById("meeting_lang").value = lang;
  }

  document.getElementById("meeting_lang").addEventListener("change", function () {
    const selectedLang = document.getElementById("meeting_lang").value;
    testTool.setCookie("meeting_lang", selectedLang);
    testTool.setCookie("_zm_lang", selectedLang);
  });

  // 🧹 Clear form and cookies
  document.getElementById("clear_all").addEventListener("click", function (e) {
    e.preventDefault();
    testTool.deleteAllCookies();
    document.getElementById("display_name").value = "";
    document.getElementById("meeting_number").value = "";
    document.getElementById("meeting_pwd").value = "";
    document.getElementById("meeting_lang").value = "en-US";
    document.getElementById("meeting_role").value = 0;
    window.location.href = "/index.html";
  });

  // 🚀 Join meeting button
  document.getElementById("join_meeting").addEventListener("click", function (e) {
    e.preventDefault();
    const meetingConfig = testTool.getMeetingConfig();

    if (!meetingConfig.mn || !meetingConfig.name) {
      alert("⚠️ Por favor, escreva o seu nome.");
      return false;
    }

    testTool.setCookie("meeting_number", meetingConfig.mn);
    testTool.setCookie("meeting_pwd", meetingConfig.pwd);

    // ✅ Generate signature (for TESTING ONLY)
    const signature = generateSignature(CLIENT_ID, CLIENT_SECRET, meetingConfig.mn, meetingConfig.role);

    // ✅ Initialize and join meeting
    ZoomMtg.init({
      leaveUrl: "/index.html",
      success: function () {
        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingConfig.mn,
          userName: meetingConfig.name,
          apiKey: CLIENT_ID,
          passWord: meetingConfig.pwd,
          success: function () {
            console.log("✅ Reunião iniciada com sucesso!");
          },
          error: function (err) {
            console.error("❌ Erro ao entrar na reunião:", err);
          }
        });
      },
      error: function (err) {
        console.error("❌ Erro ao inicializar o SDK:", err);
      }
    });
  });

  // 📎 Copy meeting link
  window.copyJoinLink = function () {
    const meetingConfig = testTool.getMeetingConfig();
    if (!meetingConfig.mn || !meetingConfig.name) {
      alert("⚠️ O número da reunião ou o nome do usuário está vazio.");
      return false;
    }

    const signature = generateSignature(CLIENT_ID, CLIENT_SECRET, meetingConfig.mn, meetingConfig.role);
    const joinUrl = `${testTool.getCurrentDomain()}/meeting.html?${testTool.serialize(meetingConfig)}&signature=${signature}`;
    
    const tempInput = document.createElement("input");
    tempInput.value = joinUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);

    alert("📋 Link da reunião copiado!");
  };

  // 🔑 Generate signature (FOR TESTING ONLY)
  function generateSignature(apiKey, apiSecret, meetingNumber, role) {
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;

    const oHeader = { alg: 'HS256', typ: 'JWT' };
    const oPayload = {
      sdkKey: apiKey,
      mn: meetingNumber,
      role: role,
      iat: iat,
      exp: exp,
      appKey: apiKey,
      tokenExp: exp
    };

    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    return KJUR.jws.JWS.sign('HS256', sHeader, sPayload, apiSecret);
  }
}
