const enc = Buffer.from('xYz', 'utf8').toString('hex');
const dec = Buffer.from(enc, 'hex').toString('utf8');
console.log({ enc, dec });
