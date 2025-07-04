module.exports = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return `${diff} day${diff > 1 ? 's' : ''}`;
}