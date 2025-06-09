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
      let fileSize = 0;
    
    if (fileBuffer instanceof File) {
      fileSize = fileBuffer.size;
      console.log(`Starting encryption of file ${fileBuffer.name} (${fileBuffer.size} bytes)`);
      
      // Check if file is not too large
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB max
      if (fileSize > MAX_FILE_SIZE) {
        throw new Error(`File is too large (${(fileSize/1024/1024).toFixed(2)}MB). Maximum allowed size is ${MAX_FILE_SIZE/1024/1024}MB.`);
      }
      
      try {
        buffer = await fileBuffer.arrayBuffer();
      } catch (err) {
        console.error("Failed to read file data:", err);
        throw new Error("Failed to read file data. The file might be too large or corrupted.");
      }
    } else {
      buffer = fileBuffer;
      fileSize = buffer.byteLength;
      console.log(`Starting encryption of file buffer (${buffer.byteLength} bytes)`);
    }
    
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    console.log("Generated salt and IV for encryption");
    
    let key;
    try {
      key = await getKeyFromPassword(password, salt);
      console.log("Derived encryption key from password");
    } catch (err) {
      console.error("Key derivation failed:", err);
      throw new Error("Failed to generate encryption key. Your browser may not support the required cryptography features.");
    }
    
    let encrypted;
    try {
      encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        buffer
      );
      console.log(`Encryption complete, result size: ${encrypted.byteLength} bytes`);
    } catch (err) {
      console.error("Encryption operation failed:", err);
      throw new Error("Encryption failed. The file might be too large for your browser to process.");
    }
    
    // Combine salt and encrypted data for storage
    const encryptedData = new Uint8Array(salt.length + encrypted.byteLength);
    encryptedData.set(salt, 0);
    encryptedData.set(new Uint8Array(encrypted), salt.length);
    console.log(`Final encrypted data size: ${encryptedData.length} bytes`);
    
    let base64Data = '';
    let base64Iv = '';
    
    try {
      // Use a safer approach for base64 encoding large data
      base64Data = encodeBase64Chunked(encryptedData);
      base64Iv = encodeBase64Chunked(iv);
      console.log(`Base64 encoded data size: ${base64Data.length} chars`);
    } catch (err) {
      console.error("Base64 encoding failed:", err);
      throw new Error("Failed to encode encrypted data. The file might be too large for your browser to process.");
    }
    
    return {
      encryptedData: base64Data,
      iv: base64Iv
    };
  } catch (err) {
    console.error("Error during file encryption:", err);
    throw err; // Re-throw to propagate the error with the improved message
  }
}

/**
 * Helper function to encode binary data to base64 in chunks
 * to avoid call stack size exceeded errors with large files
 */
function encodeBase64Chunked(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const CHUNK_SIZE = 1024; // Process in 1KB chunks
  let result = '';
  
  // Process in chunks to avoid call stack size exceeded
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.slice(i, i + CHUNK_SIZE);
    const binary = String.fromCharCode.apply(null, chunk);
    const base64Chunk = btoa(binary);
    result += base64Chunk;
  }
  
  return result;
}

/**
 * Helper function to decode chunked base64 data
 */
function decodeBase64Chunked(encodedData: string): Uint8Array {
  try {
    // Calculate total length first to preallocate buffer
    let totalBytes = 0;
    const chunks: { binary: string, length: number }[] = [];
    
    // Standard base64 encodes 3 bytes into 4 characters
    // During encoding we used chunks of 1024 bytes
    const ENCODING_CHUNK_SIZE = 1024; // Must match the chunk size used in encodeBase64Chunked
    
    // Process each chunk
    for (let i = 0; i < encodedData.length; i += 4 * Math.ceil(ENCODING_CHUNK_SIZE / 3)) {
      // Get the next chunk of base64 data
      const end = Math.min(i + 4 * Math.ceil(ENCODING_CHUNK_SIZE / 3), encodedData.length);
      const chunk = encodedData.substring(i, end);
      
      try {
        // Decode this chunk
        const binaryChunk = atob(chunk);
        chunks.push({ binary: binaryChunk, length: binaryChunk.length });
        totalBytes += binaryChunk.length;
      } catch (e) {
        console.error(`Error decoding chunk at position ${i}:`, e);
        throw new Error(`Invalid base64 data at chunk starting at position ${i}`);
      }
    }
    
    // Now that we know the total size, create the output array
    const result = new Uint8Array(totalBytes);
    
    // Fill the array with the decoded data
    let offset = 0;
    for (const chunk of chunks) {
      for (let j = 0; j < chunk.length; j++) {
        result[offset + j] = chunk.binary.charCodeAt(j);
      }
      offset += chunk.length;
    }
    
    return result;
  } catch (err) {
    console.error("Base64 decoding failed:", err);
    throw new Error(`Failed to decode base64 data: ${err.message}`);
  }
}

/**
 * Decrypts an encrypted file using AES-GCM with a password-derived key
 */
export async function decryptFile(encryptedData: string, iv: string, password: string) {
  try {
    console.log("Starting decryption process");
    
    // Validate input
    if (!encryptedData || typeof encryptedData !== 'string') {
      throw new Error(`Invalid encrypted data: ${encryptedData ? typeof encryptedData : 'null or undefined'}`);
    }
    
    if (!iv || typeof iv !== 'string') {
      throw new Error(`Invalid IV: ${iv ? typeof iv : 'null or undefined'}`);
    }
    
    console.log("Input data lengths", { 
      encryptedDataLength: encryptedData.length,
      ivLength: iv.length
    });
    
    // Use chunked base64 decoding to match the encoding method
    console.log("Decoding encrypted data and IV using chunked method");
    let encryptedBytes, ivBytes;
    
    try {
      encryptedBytes = decodeBase64Chunked(encryptedData);
      ivBytes = decodeBase64Chunked(iv);
    } catch (decodeError) {
      console.error("Error decoding base64 data:", decodeError);
      throw new Error(`Failed to decode encrypted data: ${decodeError.message}`);
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
 * Decrypts an encrypted image
 */
export async function decryptImage(
  encryptedData: string,
  iv: string,
  password: string
): Promise<string> {
  try {
    if (!encryptedData || typeof encryptedData !== 'string') {
      throw new Error('Invalid encrypted data');
    }
    
    if (!iv || typeof iv !== 'string') {
      throw new Error('Invalid initialization vector');
    }
    
    // Convert IV from base64 to Uint8Array
    let ivArray;
    try {
      ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
    } catch (err) {
      console.error('Failed to decode IV:', err);
      throw new Error('Invalid IV format');
    }
    
    // Derive key from password
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('salt-for-forge-ph'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    // Decode the chunked base64 encrypted data
    let decodedData;
    try {
      decodedData = decodeBase64Chunked(encryptedData);
    } catch (err) {
      console.error('Failed to decode encrypted data:', err);
      throw new Error(`Failed to decode encrypted data: ${err.message}`);
    }
    
    // Decrypt the data
    let decrypted;
    try {
      decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivArray },
        key,
        decodedData
      );
    } catch (err) {
      console.error('Decryption operation failed:', err);
      throw new Error('Failed to decrypt data');
    }
    
    // Convert the decrypted data back to a base64 string for display
    const decryptedArray = new Uint8Array(decrypted);
    const base64String = btoa(String.fromCharCode.apply(null, decryptedArray));
    
    return `data:image/jpeg;base64,${base64String}`;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error(`Failed to decrypt file: ${error.message}`);
  }
}

/**
 * Encrypts an image file
 */
export async function encryptImage(
  file: File,
  password: string
): Promise<{ encryptedData: string; iv: string }> {
  try {
    // Read the file as an ArrayBuffer
    const fileBuffer = await readFileAsArrayBuffer(file);
    
    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Derive key from password
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('salt-for-forge-ph'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    // Encrypt the file data
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      fileBuffer
    );
    
    // Encode the encrypted data and IV as base64 strings
    const encryptedBase64 = encodeBase64Chunked(encryptedBuffer);
    const ivBase64 = btoa(String.fromCharCode.apply(null, iv));
    
    return {
      encryptedData: encryptedBase64,
      iv: ivBase64
    };
  } catch (error) {
    console.error('Image encryption error:', error);
    throw new Error(`Failed to encrypt image: ${error.message}`);
  }
}

/**
 * Reads a file as an ArrayBuffer
 */
function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}
