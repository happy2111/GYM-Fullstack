function buildCheckString(initData) {
  const data = { ...initData };
  delete data.hash;

  const kvPairs = [];

  for (const key of Object.keys(data).sort()) {
    if (typeof data[key] === 'object') {
      kvPairs.push(`${key}=${Object.entries(data[key])
        .map(([k, v]) => `${k}:${v}`)
        .join(',')}`);
    } else {
      kvPairs.push(`${key}=${data[key]}`);
    }
  }

  return kvPairs.join('\n');
}

module.exports = buildCheckString;