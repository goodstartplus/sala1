window.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');
    websdkready();
});

function websdkready() {
    const testTool = window.testTool;

    // ✅ Get meeting parameters from URL
    const tmpArgs = testTool.parseQuery();

    // 🚨 Validate required parameters
    if (!tmpArgs.mn || !tmpArgs.signature || !tmpArgs.name) {
        alert("⚠️ Informação da reunião incompleta. Verifique o link.");
        return;
    }

    const meetingConfig = {
        sdkKey: tmpArgs.sdkKey,
        meetingNumber: tmpArgs.mn,
        userName: decodeURIComponent(tmpArgs.name),  // ✅ Fixed Decoding
        passWord: tmpArgs.pwd,
        leaveUrl: "https://goodstart.com.br/area-do-aluno",
        role: parseInt(tmpArgs.role, 10),
        signature: tmpArgs.signature,
        lang: tmpArgs.lang || "pt-PT",
    };

    console.log("🔍 Meeting Config:", meetingConfig);

    // ✅ Initialize Zoom SDK
    ZoomMtg.setZoomJSLib('https://source.zoom.us/3.11.0/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareJssdk();

    ZoomMtg.init({
        leaveUrl: meetingConfig.leaveUrl,
        isSupportAV: true,
        success: function () {
            console.log("✅ SDK Initialized");

            // ✅ Join the Zoom Meeting
            ZoomMtg.join({
                signature: meetingConfig.signature,
                meetingNumber: meetingConfig.meetingNumber,
                userName: meetingConfig.userName,
                apiKey: meetingConfig.sdkKey,
                passWord: meetingConfig.passWord,
                success: function () {
                    console.log("🎉 Reunião iniciada com sucesso!");
                },
                error: function (err) {
                    console.error("❌ Erro ao entrar na reunião:", err);
                    alert("Erro ao entrar na reunião. Verifique o link ou a conexão.");
                }
            });
        },
        error: function (err) {
            console.error("❌ Falha ao inicializar o SDK:", err);
        }
    });
}
