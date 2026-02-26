export default size => {
  if (typeof size !== 'string') return null;

  const match = size.trim().match(/^([0-9]*\.?[0-9]+)\s*(B|KB|MB|GB|TB)$/i);
  if (!match) return null;

  const value = Number(match[1]);
  const units = {B: 0, KB: 1, MB: 2, GB: 3, TB: 4};
  const unit = match[2].toUpperCase();
  const exponent = units[unit];

  if (Number.isNaN(value) || exponent === undefined) return null;

  return Math.round(value * (1024 ** exponent));
};
