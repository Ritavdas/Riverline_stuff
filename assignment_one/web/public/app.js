class DebtCollectionApp {
    constructor() {
        this.calls = new Map();
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadCalls();
        this.startPolling();
    }
    
    bindEvents() {
        const form = document.getElementById('callForm');
        form.addEventListener('submit', (e) => this.handleCallSubmit(e));
    }
    
    async handleCallSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const callData = {
            phoneNumber: formData.get('phoneNumber'),
            customerName: formData.get('customerName'),
            accountLastFour: formData.get('accountLastFour'),
            amountDue: parseFloat(formData.get('amountDue')) || 2847.32,
            daysOverdue: parseInt(formData.get('daysOverdue')) || 45
        };
        
        if (!callData.phoneNumber) {
            this.showAlert('Phone number is required', 'error');
            return;
        }
        
        this.setButtonLoading(true);
        
        try {
            const response = await fetch('/api/call', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(callData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.showAlert(`Call initiated to ${result.phoneNumber}`, 'success');
                this.clearForm();
                this.loadCalls();
            } else {
                throw new Error(result.error || 'Failed to initiate call');
            }
        } catch (error) {
            this.showAlert(`Error: ${error.message}`, 'error');
        } finally {
            this.setButtonLoading(false);
        }
    }
    
    async loadCalls() {
        try {
            const response = await fetch('/api/calls');
            const calls = await response.json();
            
            this.calls.clear();
            calls.forEach(call => {
                this.calls.set(call.id, call);
            });
            
            this.renderCalls();
        } catch (error) {
            console.error('Failed to load calls:', error);
        }
    }
    
    renderCalls() {
        const callsList = document.getElementById('callsList');
        
        if (this.calls.size === 0) {
            callsList.innerHTML = `
                <p style="color: #6c757d; text-align: center; padding: 20px;">
                    No calls initiated yet. Use the form above to start your first call.
                </p>
            `;
            return;
        }
        
        const callsArray = Array.from(this.calls.values())
            .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        
        callsList.innerHTML = callsArray.map(call => `
            <div class="call-item">
                <div class="call-header">
                    <div class="call-info">
                        <h3>${call.customerName} - ${call.phoneNumber}</h3>
                    </div>
                    <span class="call-status status-${call.status}">${call.status.toUpperCase()}</span>
                </div>
                <div class="call-details">
                    <div><strong>Account:</strong> ***${call.accountLastFour}</div>
                    <div><strong>Amount Due:</strong> $${call.amountDue.toFixed(2)}</div>
                    <div><strong>Days Overdue:</strong> ${call.daysOverdue}</div>
                    <div><strong>Started:</strong> ${this.formatTime(call.startTime)}</div>
                    ${call.roomName ? `<div><strong>Room:</strong> ${call.roomName}</div>` : ''}
                    ${call.endTime ? `<div><strong>Ended:</strong> ${this.formatTime(call.endTime)}</div>` : ''}
                </div>
            </div>
        `).join('');
    }
    
    setButtonLoading(loading) {
        const button = document.getElementById('callButton');
        const buttonText = document.getElementById('buttonText');
        const buttonLoading = document.getElementById('buttonLoading');
        
        if (loading) {
            button.disabled = true;
            buttonText.classList.add('hidden');
            buttonLoading.classList.remove('hidden');
        } else {
            button.disabled = false;
            buttonText.classList.remove('hidden');
            buttonLoading.classList.add('hidden');
        }
    }
    
    clearForm() {
        document.getElementById('callForm').reset();
    }
    
    showAlert(message, type) {
        const alertContainer = document.getElementById('alertContainer');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        alertContainer.appendChild(alert);
        
        // Remove alert after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
    
    formatTime(timeString) {
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    startPolling() {
        // Poll for call updates every 5 seconds
        setInterval(() => {
            if (this.calls.size > 0) {
                this.loadCalls();
            }
        }, 5000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DebtCollectionApp();
});