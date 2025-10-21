// WebHook Server để nhận thông báo từ SePay
// Chạy server này để nhận WebHook từ SePay

const express = require('express');
const crypto = require('crypto');
const app = express();
const PORT = 3000;

// Middleware để parse JSON
app.use(express.json());

// WebHook endpoint cho SePay
app.post('/hooks/sepay-payment', (req, res) => {
    try {
        console.log('WebHook received from SePay:', req.body);
        
        // Xác thực WebHook signature (nếu SePay cung cấp)
        const signature = req.headers['x-sepay-signature'];
        const payload = JSON.stringify(req.body);
        
        // TODO: Verify signature với secret key từ SePay
        // const expectedSignature = crypto
        //     .createHmac('sha256', process.env.SEPAY_WEBHOOK_SECRET)
        //     .update(payload)
        //     .digest('hex');
        
        const transactionData = req.body;
        
        // Xử lý giao dịch
        if (transactionData.status === 'success' && transactionData.amount > 0) {
            console.log('Processing successful transaction:', {
                amount: transactionData.amount,
                description: transactionData.description,
                transactionId: transactionData.transaction_id
            });
            
            // Tìm user dựa trên username (description field)
            const username = transactionData.description;
            if (username) {
                // TODO: Kết nối với Firebase để tìm user và cộng tiền
                // 1. Tìm user trong Firestore với username = description
                // 2. Cộng tiền vào tài khoản user đó
                // 3. Ghi log giao dịch
                
                console.log(`Tìm user với username: ${username}`);
                console.log(`Số tiền: ${transactionData.amount} VNĐ`);
                
                // Ví dụ cấu trúc dữ liệu từ SePay:
                /*
                {
                    "transaction_id": "TXN123456789",
                    "amount": 100000,
                    "description": "username123", // Đây là username của user
                    "status": "success",
                    "created_at": "2024-01-01T00:00:00Z",
                    "bank_code": "VPB",
                    "account_number": "0363064356"
                }
                */
            }
        }
        
        // Trả về response thành công
        res.status(200).json({ 
            success: true, 
            message: 'WebHook processed successfully' 
        });
        
    } catch (error) {
        console.error('Error processing WebHook:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Start server
app.listen(PORT, () => {
    console.log(`WebHook server running on port ${PORT}`);
    console.log(`WebHook URL: http://localhost:${PORT}/hooks/sepay-payment`);
});

// Cấu hình SePay WebHook:
// 1. Đăng nhập vào SePay dashboard
// 2. Vào phần WebHooks
// 3. Thêm URL: https://yourdomain.com/hooks/sepay-payment
// 4. Chọn events: payment.success
// 5. Lưu cấu hình
