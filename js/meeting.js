// Parse URL Parameters
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Retrieve meeting details
const signature = getUrlParam('signature');
const meetingNumber = getUrlParam('mn');
const userName = getUrlParam('name');

// Initialize SDK
ZoomMtg.setZoomJSLib('https://source.zoom.us/3.11.0/lib', '/av');
ZoomMtg.preLoadWasm();
ZoomMtg.prepareJssdk();

// Join Meeting
ZoomMtg.init({
  leaveUrl: 'https://goodstart.com.br',
  success: function () {
    ZoomMtg.join({
      signature: signature,
      meetingNumber: meetingNumber,
      userName: userName,
      apiKey: 'USroBek9TFK0sdTnKGQcg',
      passWord: '0fGYcM',
      success: function () {
        console.log('✅ Entrou na reunião!');
      },
      error: function (err) {
        console.error('❌ Erro ao entrar:', err);
      }
    });
  },
  error: function (err) {
    console.error('❌ Erro ao inicializar:', err);
  }
});
