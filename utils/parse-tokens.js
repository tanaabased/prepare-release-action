export default tokens => {
  return tokens.map(token => token.split('='))
    .filter(([token, value]) => typeof token === 'string' && typeof value === 'string')
    .map(([token, value]) => ([token.trim(), value.trim()]));
};
