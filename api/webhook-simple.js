// Simple WebHook endpoint để test
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-sepay-signature');
    
    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Chỉ cho phép POST request
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        console.log('WebHook received from SePay:', JSON.stringify(req.body, null, 2));
        
        const transactionData = req.body;
        
        // Log thông tin giao dịch theo format SePay
        console.log('Transaction details:', {
            gateway: transactionData.gateway,
            transferAmount: transactionData.transferAmount,
            content: transactionData.content,
            transferType: transactionData.transferType,
            accountNumber: transactionData.accountNumber,
            transactionDate: transactionData.transactionDate
        });
        
        // Xử lý giao dịch tiền vào
        if (transactionData.transferType === 'in' && transactionData.transferAmount > 0) {
            const username = transactionData.content;
            console.log(`Processing payment for username: ${username}, amount: ${transactionData.transferAmount} VNĐ`);
            
            // TODO: Thêm logic cộng tiền vào Firebase ở đây
            // Hiện tại chỉ log để test
        }
        
        // Trả về response thành công
        res.status(200).json({ 
            success: true, 
            message: 'WebHook received successfully',
            timestamp: new Date().toISOString(),
            receivedData: {
                gateway: transactionData.gateway,
                transferAmount: transactionData.transferAmount,
                content: transactionData.content,
                transferType: transactionData.transferType
            }
        });
        
    } catch (error) {
        console.error('Error processing WebHook:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message
        });
    }
}
