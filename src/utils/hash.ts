import crypto from 'crypto';

export function hash(val: any) {
  let hashStr = val;
  if (typeof val !== 'string') {
    hashStr = JSON.stringify(val);
  }
  return crypto.createHash('sha256').update(hashStr).digest('hex');
}
