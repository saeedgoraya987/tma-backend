import { Address } from '@ton/core';

export const convertHexToNonBounceable = (hex: string) => {
  const workchain = parseInt(hex.slice(0, 2), 16);
  const publicKey = hex.slice(2);

  const address = new Address(workchain, Buffer.from(publicKey, 'hex'));
  return address.toString({ bounceable: false });
};
