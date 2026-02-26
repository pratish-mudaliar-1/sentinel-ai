# How to Use the Export Feature

## Quick Start Guide

### Step 1: Start the Backend
```bash
cd "c:\Research 2 machine algorithm\backend"
python main_simulated.py
```

### Step 2: Access the Fraud Monitor
1. Open your browser
2. Navigate to: `http://localhost:8000/fraud-monitor`
3. Wait for transactions to start flowing

### Step 3: Download Reports
1. Scroll down to the **"EXPORT REPORTS"** panel
2. You'll see two sections:
   - **🛡 FRAUD TRANSACTIONS** (Red theme)
   - **🔄 CORRECTED TRANSACTIONS** (Purple theme)

### Step 4: Choose Your Format

#### For Fraud Transactions:
- Click **"📄 PDF"** to download fraud report as PDF
- Click **"📊 EXCEL"** to download fraud report as Excel

#### For Corrected Transactions:
- Click **"📄 PDF"** to download corrected report as PDF
- Click **"📊 EXCEL"** to download corrected report as Excel

## What Gets Downloaded?

### Fraud Transaction Reports
Contains details of all detected fraudulent transactions:
- Transaction ID
- Amount in USD
- Transaction fees
- Source information
- Timestamp
- Risk factors that triggered detection
- Detection status

### Corrected Transaction Reports
Shows all instances where the AI corrected its decision:
- Transaction ID
- Amount in USD
- What the AI initially decided
- What it corrected to
- When the correction happened
- Current neural sensitivity level
- Learning event details

## File Locations
Downloaded files will appear in your browser's default download folder with names like:
- `fraud_transactions_20260128_210530.pdf`
- `fraud_transactions_20260128_210530.xlsx`
- `corrected_transactions_20260128_210530.pdf`
- `corrected_transactions_20260128_210530.xlsx`

## Tips
- Reports are generated in real-time from the current ledger
- PDF files are best for viewing and presenting
- Excel files are best for data analysis and filtering
- Each download includes a notification in the AI correction log
- Files are timestamped to avoid overwriting

## Troubleshooting

### No data in reports?
- Wait for transactions to process (system needs to run for a few seconds)
- Check that the backend is running
- Verify you're on the fraud monitor page

### Download not starting?
- Check browser popup blocker settings
- Ensure backend server is running on port 8000
- Check browser console for errors

### Want specific date ranges?
- Currently shows all available data
- Future enhancement will add filtering options

---
**Enjoy your professional transaction reports! 📊**
