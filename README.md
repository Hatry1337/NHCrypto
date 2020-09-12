# NHCrypto
Simple insecure encryptor/decryptor, that's uses nhentai codes to encrypt and decrypt text. 

**ATTENTION! This is a fun encryptor, don't use it in serious projects!**

## How To Use?
  Use as a simple node module:
  ```js
  const nh = require("nhcrypto");
  
  nh.Crypt("Hello, World!", (crypted) =>{
    console.log(crypted); // returns "153098015007278059018006"
  });
  
  nh.Decrypt("153098015007278059018006", (decrypted) =>{
    console.log(decrypted); // returns "hello, world!"
  });
