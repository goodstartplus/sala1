window.addEventListener('DOMContentLoaded', function () {
  console.log('DOM fully loaded and parsed');
  websdkready();
});

function websdkready() {
  const testTool = window.testTool;

  // ✅ Get meeting parameters from URL
  const tmpArgs = testTool.parseQuery();

  // 🚨 Validate essential parameters
  if (!tmpArgs.mn || !tmpArgs.signature || !tmpArgs.sdkKey) {
    alert("⚠️ Informação da reunião incompleta. Verifique o link.");
    return;
  }

  // 🔑 Meeting Configuration
  const meetingConfig = {
    sdkKey: tmpArgs.sdkKey,
    meetingNumber: tmpArgs.mn,
    userName: tmpArgs.name ? testTool.b64DecodeUnicode(tmpArgs.name) : "Usuário Anônimo",
    passWord: tmpArgs.pwd,
    leaveUrl: "https://goodstart.com.br/area-do-aluno",
    role: parseInt(tmpArgs.role, 10),
    userEmail: tmpArgs.email ? testTool.b64DecodeUnicode(tmpArgs.email) : "",
    lang: tmpArgs.lang || "pt-PT",
    signature: tmpArgs.signature,
    china: tmpArgs.china === "1",
  };

  // ✅ Debug for mobile devices
  if (testTool.isMobileDevice()) {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/vconsole/dist/vconsole.min.js';
    script.onload = () => { vConsole = new VConsole(); };
    document.head.appendChild(script);
  }

  console.log("🔍 System Requirements:", JSON.stringify(ZoomMtg.checkSystemRequirements()));

  // ✅ Load Zoom SDK
  if (meetingConfig.china) {
    ZoomMtg.setZoomJSLib("https://jssdk.zoomus.cn/3.11.0/lib", "/av");
  } else {
    ZoomMtg.setZoomJSLib("https://source.zoom.us/3.11.0/lib", "/av");
  }
  
  ZoomMtg.preLoadWasm();
  ZoomMtg.prepareJssdk();

  // 🚀 Join the meeting
  function beginJoin(signature) {
    ZoomMtg.init({
      leaveUrl: meetingConfig.leaveUrl,
      disableCORP: !window.crossOriginIsolated,
      externalLinkPage: './externalLinkPage.html',
      success: function () {
        console.log("✅ SDK Initialized");
        ZoomMtg.i18n.load(meetingConfig.lang);
        ZoomMtg.i18n.reload(meetingConfig.lang);

        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingConfig.meetingNumber,
          userName: meetingConfig.userName,
          sdkKey: meetingConfig.sdkKey,
          userEmail: meetingConfig.userEmail,
          passWord: meetingConfig.passWord,
          success: function (res) {
            console.log("🎉 Reunião iniciada com sucesso!");
            ZoomMtg.getAttendeeslist({});
            ZoomMtg.getCurrentUser({
              success: function (res) {
                console.log("🙋‍♂️ Participante atual:", res.result.currentUser);
              }
            });
          },
          error: function (err) {
            console.error("❌ Erro ao entrar na reunião:", err);
            alert("Erro ao entrar na reunião. Verifique a assinatura ou o número da reunião.");
          }
        });
      },
      error: function (err) {
        console.error("❌ Falha ao inicializar o SDK:", err);
      }
    });

    // 🔔 Event Listeners for Meeting Status
    ZoomMtg.inMeetingServiceListener('onUserJoin', function (data) {
      console.log('👤 Novo participante:', data);
    });

    ZoomMtg.inMeetingServiceListener('onUserLeave', function (data) {
      console.log('🚪 Alguém saiu:', data);
    });

    ZoomMtg.inMeetingServiceListener('onUserIsInWaitingRoom', function (data) {
      console.log('🕒 Usuário na sala de espera:', data);
    });

    ZoomMtg.inMeetingServiceListener('onMeetingStatus', function (data) {
      console.log('📊 Status da reunião:', data);
    });
  }

  // ✅ Validate and Join
  if (meetingConfig.signature) {
    beginJoin(meetingConfig.signature);
  } else {
    console.error("❌ Assinatura inválida.");
    alert("Assinatura inválida. Não foi possível entrar na reunião.");
  }
}
