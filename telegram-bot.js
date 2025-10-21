// Telegram Bot Integration for Card Deposit Notifications
// This file handles sending card information to Telegram group

// Telegram Bot Configuration with encrypted keys
const TELEGRAM_BOT_TOKEN = getConfig('telegram', 'botToken');
const TELEGRAM_CHAT_ID = getConfig('telegram', 'chatId');

// Send card information to Telegram group
async function sendCardToTelegram(cardData) {
    try {
        const message = formatCardMessage(cardData);
        
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        if (response.ok) {
            console.log('Card information sent to Telegram successfully');
            return true;
        } else {
            console.error('Failed to send to Telegram:', await response.text());
            return false;
        }
    } catch (error) {
        console.error('Error sending to Telegram:', error);
        return false;
    }
}

// Format card message for Telegram
function formatCardMessage(cardData) {
    const { username, cardType, cardAmount, cardSerial, cardCode, discountAmount, finalAmount, status } = cardData;
    
    let statusEmoji = '⏳';
    if (status === 'approved') statusEmoji = '✅';
    else if (status === 'rejected') statusEmoji = '❌';
    
    return `
${statusEmoji} <b>YÊU CẦU NẠP THẺ ĐIỆN THOẠI</b>

👤 <b>User:</b> ${username}
📱 <b>Loại thẻ:</b> ${cardType.toUpperCase()}
💰 <b>Mệnh giá:</b> ${cardAmount.toLocaleString()} VNĐ
🔢 <b>Serial:</b> <code>${cardSerial}</code>
🔑 <b>Mã thẻ:</b> <code>${cardCode}</code>
💸 <b>Chiết khấu:</b> ${discountAmount.toLocaleString()} VNĐ
💵 <b>Số tiền nhận:</b> ${finalAmount.toLocaleString()} VNĐ
📊 <b>Trạng thái:</b> ${status === 'pending' ? 'Chờ duyệt' : status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
🕐 <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}

${status === 'pending' ? '⚠️ <i>Vui lòng kiểm tra và duyệt yêu cầu này</i>' : ''}
    `.trim();
}

// Send approved card notification
async function sendApprovedCardNotification(cardData) {
    const message = `
✅ <b>THẺ ĐÃ ĐƯỢC DUYỆT</b>

👤 <b>User:</b> ${cardData.username}
📱 <b>Loại thẻ:</b> ${cardData.cardType.toUpperCase()}
💰 <b>Mệnh giá:</b> ${cardData.cardAmount.toLocaleString()} VNĐ
💵 <b>Số tiền nhận:</b> ${cardData.finalAmount.toLocaleString()} VNĐ
🕐 <b>Thời gian duyệt:</b> ${new Date().toLocaleString('vi-VN')}

<i>Thẻ đã được xử lý thành công!</i>
    `.trim();
    
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        return response.ok;
    } catch (error) {
        console.error('Error sending approval notification:', error);
        return false;
    }
}

// Send rejected card notification
async function sendRejectedCardNotification(cardData) {
    const message = `
❌ <b>THẺ BỊ TỪ CHỐI</b>

👤 <b>User:</b> ${cardData.username}
📱 <b>Loại thẻ:</b> ${cardData.cardType.toUpperCase()}
💰 <b>Mệnh giá:</b> ${cardData.cardAmount.toLocaleString()} VNĐ
🕐 <b>Thời gian từ chối:</b> ${new Date().toLocaleString('vi-VN')}

<i>Thẻ không hợp lệ hoặc đã được sử dụng!</i>
    `.trim();
    
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        return response.ok;
    } catch (error) {
        console.error('Error sending rejection notification:', error);
        return false;
    }
}

// Test Telegram connection
async function testTelegramConnection() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
        const data = await response.json();
        
        if (data.ok) {
            console.log('Telegram Bot connected successfully:', data.result.first_name);
            return true;
        } else {
            console.error('Telegram Bot connection failed:', data.description);
            return false;
        }
    } catch (error) {
        console.error('Error testing Telegram connection:', error);
        return false;
    }
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        sendCardToTelegram, 
        sendApprovedCardNotification, 
        sendRejectedCardNotification,
        testTelegramConnection 
    };
}
