#!/bin/bash
# Setup script for run_agent.py with virtual environment

echo "🔧 Setting up Python virtual environment for run_agent.py..."
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 --version)
echo "✅ Found: $PYTHON_VERSION"
echo ""

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

if [ $? -eq 0 ]; then
    echo "✅ Virtual environment created"
else
    echo "❌ Failed to create virtual environment"
    exit 1
fi

echo ""
echo "🔌 Activating virtual environment..."

# Activate virtual environment
source venv/bin/activate

if [ $? -eq 0 ]; then
    echo "✅ Virtual environment activated"
else
    echo "❌ Failed to activate virtual environment"
    exit 1
fi

echo ""
echo "📥 Installing dependencies..."

# Install requirements
pip install -q -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "To use run_agent.py:"
echo ""
echo "1. Activate the virtual environment:"
echo "   source venv/bin/activate"
echo ""
echo "2. Set your API key:"
echo "   export ANTHROPIC_API_KEY='sk-...'"
echo ""
echo "3. Run the agent:"
echo "   python run_agent.py"
echo ""
echo "=========================================="
