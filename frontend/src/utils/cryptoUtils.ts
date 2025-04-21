/**
 * Utility functions for encryption and decryption using Web Crypto API
 */

/**
 * Derives a key from a password and salt using PBKDF2
 */
export async function getKeyFromPassword(password: string, salt: Uint8Array) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a file using AES-GCM with a password-derived key
 */
export async function encryptFile(fileBuffer: ArrayBuffer | File, password: string) {
  try {
    // Convert File to ArrayBuffer if needed
    let buffer: ArrayBuffer;
    if (fileBuffer instanceof File) {
      buffer = await fileBuffer.arrayBuffer();
      console.log(`Starting encryption of file ${fileBuffer.name} (${fileBuffer.size} bytes)`);
    } else {
      buffer = fileBuffer;
      console.log(`Starting encryption of file buffer (${buffer.byteLength} bytes)`);
    }
    
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    console.log("Generated salt and IV for encryption");
    
    const key = await getKeyFromPassword(password, salt);
    console.log("Derived encryption key from password");
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      buffer
    );
    console.log(`Encryption complete, result size: ${encrypted.byteLength} bytes`);
    
    // Combine salt and encrypted data for storage
    const encryptedData = new Uint8Array([...salt, ...new Uint8Array(encrypted)]);
    console.log(`Final encrypted data size: ${encryptedData.length} bytes`);
    
    let base64Data = '';
    let base64Iv = '';
    
    try {
      // This can fail with "Maximum call stack size exceeded" for large files
      base64Data = btoa(String.fromCharCode.apply(null, encryptedData));
      base64Iv = btoa(String.fromCharCode.apply(null, iv));
      console.log(`Base64 encoded data size: ${base64Data.length} chars`);
    } catch (err: any) {
      // Try chunking for large files
      let binary = '';
      const bytes = new Uint8Array(encryptedData);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      base64Data = btoa(binary);
      
      binary = '';
      const ivLen = iv.byteLength;
      for (let i = 0; i < ivLen; i++) {
        binary += String.fromCharCode(iv[i]);
      }
      base64Iv = btoa(binary);
      
      console.log(`Base64 encoded data size (chunked): ${base64Data.length} chars`);
    }
    
    return {
      encryptedData: base64Data,
      iv: base64Iv
    };
  } catch (err: any) {
    console.error("Error during file encryption:", err);
    throw new Error(`Encryption failed: ${err.message}`);
  }
}

/**
 * Decrypts an encrypted file using AES-GCM with a password-derived key
 */
export async function decryptFile(encryptedData: string, iv: string, password: string) {
  try {
    console.log("Starting decryption process");
    
    // Convert base64 to binary string
    const encryptedBinary = atob(encryptedData);
    const ivBinary = atob(iv);
    
    // Convert binary string to Uint8Array
    const encryptedBytes = new Uint8Array(encryptedBinary.length);
    for (let i = 0; i < encryptedBinary.length; i++) {
      encryptedBytes[i] = encryptedBinary.charCodeAt(i);
    }
    
    const ivBytes = new Uint8Array(ivBinary.length);
    for (let i = 0; i < ivBinary.length; i++) {
      ivBytes[i] = ivBinary.charCodeAt(i);
    }
    
    console.log("Converted base64 data", {
      encryptedLength: encryptedBytes.length,
      ivLength: ivBytes.length
    });
    
    // Extract salt (first 16 bytes) and actual encrypted data
    const salt = encryptedBytes.slice(0, 16);
    const data = encryptedBytes.slice(16);
    
    console.log("Extracted salt and data", {
      saltLength: salt.length,
      dataLength: data.length
    });
    
    // Derive key from password
    const key = await getKeyFromPassword(password, salt);
    console.log("Key derived successfully");
    
    // Decrypt
    try {
      const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivBytes },
        key,
        data
      );
      
      console.log("Decryption successful");
      
      return decrypted;
    } catch (error) {
      console.error("Decryption operation failed:", error);
      throw new Error("Decryption failed - incorrect password or corrupted data");
    }
  } catch (err: any) {
    console.error("Decryption error:", err);
    throw new Error(`Failed to decrypt file: ${err.message}`);
  }
}

/**
 * Decrypts an image and returns a URL for display
 */
export async function decryptImage(encryptedData: string, iv: string, password: string) {
  try {
    const decrypted = await decryptFile(encryptedData, iv, password);
    
    // Convert to blob URL for image display
    const blob = new Blob([decrypted], { type: "image/png" });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error("Image decryption error:", err);
    throw err;
  }
}
