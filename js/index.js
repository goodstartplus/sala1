// Zoom Credentials (FOR TESTING ONLY)
const apiKey = 'USroBek9TFK0sdTnKGQcg';
const apiSecret = 'xfjGAB6qOuMVQCABv8obRavSaNrd1X8d';
const meetingNumber = '87370145813';
const passWord = '0fGYcM';

// Generate Signature
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

// Button Event
document.getElementById('joinMeeting').addEventListener('click', function () {
  const userName = document.getElementById('display_name').value.trim();
  if (!userName) {
    alert('⚠️ Digite seu nome!');
    return;
  }

  const signature = generateSignature(apiKey, apiSecret, meetingNumber, 0);
  window.location.href = `meeting.html?signature=${signature}&mn=${meetingNumber}&name=${encodeURIComponent(userName)}`;
});
