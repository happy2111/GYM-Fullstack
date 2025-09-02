const useragent = require('useragent');

function parseDevice(userAgent) {
  const agent = useragent.parse(userAgent);
  const browser = agent.toAgent();
  const os = agent.os.toString();

  return `${browser} on ${os}`;
}

function getClientInfo(req) {
  const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0];
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const device = parseDevice(userAgent);

  return { ip, userAgent, device };
}

module.exports = { parseDevice, getClientInfo };