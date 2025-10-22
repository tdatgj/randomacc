// Simple encryption/decryption functions for game account credentials
// This is a basic example - for production, use more robust encryption

// Simple Caesar cipher for demo purposes - encrypts ALL characters
function encrypt(text, shift = 13) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        let shifted = code + shift;
        
        // Handle different character ranges
        if (code >= 65 && code <= 90) { // A-Z
            shifted = ((shifted - 65) % 26) + 65;
        } else if (code >= 97 && code <= 122) { // a-z
            shifted = ((shifted - 97) % 26) + 97;
        } else if (code >= 48 && code <= 57) { // 0-9
            shifted = ((shifted - 48) % 10) + 48;
        } else if (code >= 32 && code <= 126) { // Printable ASCII
            shifted = ((shifted - 32) % 95) + 32;
        }
        // For other characters, keep as is
        
        result += String.fromCharCode(shifted);
    }
    return result;
}

function decrypt(text, shift = 13) {
    return encrypt(text, -shift);
}

// More secure encryption using Web Crypto API (if available)
async function encryptSecure(text, password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    // Generate key from password
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );
    
    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode('salt123'), // Use a random salt in production
            iterations: 100000,
            hash: 'SHA-256'
        },
        key,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        derivedKey,
        data
    );
    
    return {
        encrypted: Array.from(new Uint8Array(encrypted)),
        iv: Array.from(iv)
    };
}

async function decryptSecure(encryptedData, password) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Generate key from password
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );
    
    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode('salt123'), // Use the same salt
            iterations: 100000,
            hash: 'SHA-256'
        },
        key,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
        derivedKey,
        new Uint8Array(encryptedData.encrypted)
    );
    
    return decoder.decode(decrypted);
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { encrypt, decrypt, encryptSecure, decryptSecure };
}
