function stableStringify(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  const keys = Object.keys(obj).sort();
  const sorted = {};
  for (const k of keys) {
    sorted[k] = obj[k];
  }
  return JSON.stringify(sorted);
}
// Формируем data_check_string по правилам Telegram:
// - исключаем hash
// - сортируем ключи по алфавиту
// - пары в виде "key=value"
// - если value — объект, используем JSON.stringify БЕЗ переупорядочивания ключей
function buildCheckString(initData) {
  const data = { ...initData };
  delete data.hash;

  const pairs = Object.keys(data)
    .sort()
    .map((key) => {
      const value = data[key];
      const serialized =
        value !== null && typeof value === 'object'
          ? JSON.stringify(value) // важно: без стабильной сортировки ключей
          : String(value);
      return `${key}=${serialized}`;
    });

  return pairs.join('\n');
}

// Совместимость с разными стилями импорта
module.exports = buildCheckString;
module.exports.buildCheckString = buildCheckString;