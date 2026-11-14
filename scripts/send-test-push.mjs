/**
 * Sends one real push through Expo and reports the ticket AND the receipt.
 *
 * A push is only proven when the receipt says "ok" - a ticket of "ok" just
 * means Expo accepted the request.
 *
 *   node scripts/send-test-push.mjs "ExponentPushToken[...]" "optional message"
 */
import https from 'node:https';

const HOST = 'exp.host';
const ADDRESS = process.env.EXPO_PUSH_IP || '34.110.201.56';
const token = process.argv[2];
const body = process.argv[3] || 'Push delivery test from True Diet.';

if (!token || !/^Expo(nent)?PushToken\[.+\]$/.test(token)) {
  console.error('usage: node scripts/send-test-push.mjs "ExponentPushToken[...]"');
  process.exit(1);
}

function post(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = https.request(
      {
        method: 'POST',
        host: ADDRESS,
        path,
        servername: HOST,
        family: 4,
        headers: {
          Host: HOST,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'Accept-Encoding': 'gzip, deflate',
        },
      },
      (res) => {
        let out = '';
        res.on('data', (c) => (out += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(out));
          } catch {
            resolve({ raw: out, status: res.statusCode });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const run = async () => {
  const ticketResponse = await post('/--/api/v2/push/send', {
    to: token,
    title: 'True Diet',
    body,
    sound: 'default',
    priority: 'high',
    channelId: 'messages',
    data: { type: 'message', screen: 'Dietitian' },
  });

  const ticket = ticketResponse?.data;
  console.log('ticket:', JSON.stringify(ticket));
  if (!ticket?.id) {
    console.log('\nNo ticket id - Expo rejected the request.');
    process.exit(1);
  }

  console.log('waiting 20s for the receipt...');
  await new Promise((r) => setTimeout(r, 20000));

  const receiptResponse = await post('/--/api/v2/push/getReceipts', { ids: [ticket.id] });
  const receipt = receiptResponse?.data?.[ticket.id];
  console.log('receipt:', JSON.stringify(receipt));

  if (receipt?.status === 'ok') {
    console.log('\nRESULT: delivered to FCM/APNs (receipt ok).');
    process.exit(0);
  }
  console.log('\nRESULT: not delivered.');
  console.log('error code:', receipt?.details?.error || 'none');
  process.exit(1);
};

run().catch((e) => {
  console.error('request failed:', e.message);
  process.exit(1);
});
