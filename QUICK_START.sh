#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        CinéÉtudiants Admin Dashboard - Quick Start         ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "\n📝 Step 1: Update Database Schema"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Running Prisma migration..."
cd "$SCRIPT_DIR/backend"
read -p "Press Enter to run migration (or Ctrl+C to skip): " 
npx prisma migrate dev --name add_admin_role_and_comment_status

echo -e "\n👑 Step 2: Make a User Admin"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Option A: Use Prisma Studio (interactive)"
echo "  Run: npx prisma studio"
echo ""
echo "Option B: Update via SQL"
echo "  SQL: UPDATE \"User\" SET role = 'admin' WHERE email = 'your-email@example.com';"
echo ""
read -p "Press Enter after marking a user as admin, or Ctrl+C to skip: "

echo -e "\n🚀 Step 3: Start Backend & Frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Opening terminal windows... (macOS only)"
echo ""

# For macOS, open new Terminal tabs
if [[ "$OSTYPE" == "darwin"* ]]; then
  # Start Backend
  osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR/backend' && npm start\""
  sleep 1
  
  # Start Frontend
  osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR/projet_plateforme' && npm run dev\""
  
  echo "✓ Backend started in new tab (should run on :5000)"
  echo "✓ Frontend started in new tab (should run on :5173)"
else
  echo "⚠️  Manual startup needed for your OS"
  echo ""
  echo "Terminal 1 - Backend:"
  echo "  cd $SCRIPT_DIR/backend && npm start"
  echo ""
  echo "Terminal 2 - Frontend:"
  echo "  cd $SCRIPT_DIR/projet_plateforme && npm run dev"
fi

echo -e "\n✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Access the Application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo ""
echo "🔑 Testing:"
echo "   1. Login with your admin account"
echo "   2. Look for the 👑 (crown) button in the top-right"
echo "   3. Click to access the Admin Dashboard"
echo ""
echo "📚 Documentation: See ADMIN_SETUP.md for detailed info"
echo ""
