// Simple Caesar Cipher encryption/decryption
function encrypt(text, shift = 13) {
    if (!text) return '';
    
    let result = '';
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        let code = text.charCodeAt(i);
        
        // Handle uppercase letters
        if (code >= 65 && code <= 90) {
            char = String.fromCharCode(((code - 65 + shift) % 26) + 65);
        }
        // Handle lowercase letters
        else if (code >= 97 && code <= 122) {
            char = String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
        // Handle numbers
        else if (code >= 48 && code <= 57) {
            char = String.fromCharCode(((code - 48 + shift) % 10) + 48);
        }
        // Handle other printable ASCII characters
        else if (code >= 32 && code <= 126) {
            char = String.fromCharCode(((code - 32 + shift) % 95) + 32);
        }
        
        result += char;
    }
    return result;
}

function decrypt(text, shift = 13) {
    return encrypt(text, -shift);
}