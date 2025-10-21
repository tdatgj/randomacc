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
        
        // Log thông tin giao dịch
        console.log('Transaction details:', {
            amount: transactionData.amount,
            description: transactionData.description,
            status: transactionData.status,
            transactionId: transactionData.transaction_id
        });
        
        // Xử lý giao dịch thành công
        if (transactionData.status === 'success' && transactionData.amount > 0) {
            const username = transactionData.description;
            console.log(`Processing payment for username: ${username}, amount: ${transactionData.amount} VNĐ`);
            
            // TODO: Thêm logic cộng tiền vào Firebase ở đây
            // Hiện tại chỉ log để test
        }
        
        // Trả về response thành công
        res.status(200).json({ 
            success: true, 
            message: 'WebHook received successfully',
            timestamp: new Date().toISOString(),
            receivedData: {
                amount: transactionData.amount,
                description: transactionData.description,
                status: transactionData.status
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
