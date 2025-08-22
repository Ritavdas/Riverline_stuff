const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store active calls
const activeCalls = new Map();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initiate outbound call
app.post('/api/call', async (req, res) => {
    const { phoneNumber, customerName, accountLastFour, amountDue, daysOverdue } = req.body;
    
    if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
    }
    
    const callId = `call-${Date.now()}`;
    
    try {
        console.log(`Initiating call to ${phoneNumber} for ${customerName || 'Unknown Customer'}`);
        
        // Store call info
        activeCalls.set(callId, {
            phoneNumber,
            customerName: customerName || 'Unknown',
            accountLastFour: accountLastFour || '4729',
            amountDue: amountDue || 2847.32,
            daysOverdue: daysOverdue || 45,
            status: 'initiating',
            startTime: new Date().toISOString(),
            roomName: null
        });
        
        // In a real implementation, this would call the Python outbound_caller.py
        // For now, we'll simulate the call
        setTimeout(() => {
            const call = activeCalls.get(callId);
            if (call) {
                call.status = 'connected';
                call.roomName = `debt-collection-${phoneNumber.replace(/[^0-9]/g, '')}`;
                activeCalls.set(callId, call);
            }
        }, 2000);
        
        res.json({
            success: true,
            callId,
            message: 'Call initiated successfully',
            phoneNumber,
            customerName: customerName || 'Unknown Customer'
        });
        
    } catch (error) {
        console.error('Call initiation failed:', error);
        res.status(500).json({
            error: 'Failed to initiate call',
            details: error.message
        });
    }
});

// Get call status
app.get('/api/call/:callId', (req, res) => {
    const { callId } = req.params;
    const call = activeCalls.get(callId);
    
    if (!call) {
        return res.status(404).json({ error: 'Call not found' });
    }
    
    res.json(call);
});

// List all calls
app.get('/api/calls', (req, res) => {
    const calls = Array.from(activeCalls.entries()).map(([id, call]) => ({
        id,
        ...call
    }));
    
    res.json(calls);
});

// End call
app.delete('/api/call/:callId', (req, res) => {
    const { callId } = req.params;
    const call = activeCalls.get(callId);
    
    if (!call) {
        return res.status(404).json({ error: 'Call not found' });
    }
    
    call.status = 'ended';
    call.endTime = new Date().toISOString();
    activeCalls.set(callId, call);
    
    res.json({
        success: true,
        message: 'Call ended',
        callId
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        activeCalls: activeCalls.size
    });
});

app.listen(PORT, () => {
    console.log(`Debt Collection Web Interface running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});