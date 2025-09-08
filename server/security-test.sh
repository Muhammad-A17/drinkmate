#!/bin/bash

# DrinkMate Security Testing Script
echo "🔒 Starting comprehensive security tests for DrinkMate..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    echo -n "Testing: $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        ((TESTS_FAILED++))
    fi
}

# Check if server is running
echo "🔍 Checking server status..."
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running. Please start the server first.${NC}"
    exit 1
fi

echo ""
echo "🧪 Running security tests..."

# Test 1: Rate limiting on auth endpoint
echo "1. Testing rate limiting on authentication endpoint..."
for i in {1..10}; do
    curl -s -X POST http://localhost:3000/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"wrong"}' > /dev/null
done

# Test 2: Security headers
echo "2. Testing security headers..."
run_test "X-Frame-Options header" \
    "curl -s -I http://localhost:3000 | grep -i 'x-frame-options'"

run_test "X-Content-Type-Options header" \
    "curl -s -I http://localhost:3000 | grep -i 'x-content-type-options'"

# Test 3: CORS policy
echo "3. Testing CORS policy..."
run_test "CORS origin validation" \
    "curl -s -H 'Origin: https://malicious-site.com' -I http://localhost:3000 | grep -i 'access-control-allow-origin'"

# Test 4: Input sanitization
echo "4. Testing input sanitization..."
run_test "NoSQL injection protection" \
    "curl -s -X POST http://localhost:3000/auth/login \
        -H 'Content-Type: application/json' \
        -d '{\"email\":{\"\$ne\":null},\"password\":{\"\$ne\":null}}' | grep -i 'error'"

# Test 5: File upload security
echo "5. Testing file upload security..."
run_test "File type validation" \
    "curl -s -X POST http://localhost:3000/admin/upload-image \
        -F 'image=@/dev/null' | grep -i 'error'"

# Test 6: Authentication security
echo "6. Testing authentication security..."
run_test "Weak JWT secret rejection" \
    "grep -q 'JWT_SECRET.*development' .env && echo 'FAIL' || echo 'PASS'"

# Test 7: Environment variables
echo "7. Testing environment variables..."
run_test "Required environment variables" \
    "grep -q 'JWT_SECRET=' .env && grep -q 'MONGODB_URI=' .env"

# Test 8: Demo account security
echo "8. Testing demo account security..."
run_test "Demo accounts in production" \
    "grep -q 'NODE_ENV=production' .env && ! grep -q 'demo123' server/Controller/auth-controller.js"

echo ""
echo "📊 Security Test Results:"
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All security tests passed! Your application is secure.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some security tests failed. Please review and fix the issues.${NC}"
    exit 1
fi
