import CryptoJS from 'crypto-js';

export const encrypt = (m: string, secret: string) => {
  const iv1 = CryptoJS.lib.WordArray.random(16);
  const ciphertext = CryptoJS.AES.encrypt(m, secret, {
    iv: iv1,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const encryptedData = `${iv1.toString(CryptoJS.enc.Base64)}|${ciphertext.toString()}`;
  return encryptedData;
  // return CryptoJS.AES.encrypt(m, secret).toString();
};

export const decrypt = (m: string, secret: string) => {
  const [ivBase64, ciphertext] = m.split('|');
  const iv = CryptoJS.enc.Base64.parse(ivBase64);

  const bytes = CryptoJS.AES.decrypt(ciphertext, secret, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const plaintext = bytes.toString(CryptoJS.enc.Utf8);
  return plaintext;
  // const bytes = CryptoJS.AES.decrypt(m, secret);
  // return bytes.toString(CryptoJS.enc.Utf8);
};
