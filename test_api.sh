#!/bin/bash

echo "🧪 Testing Squid Game API..."

# Test with a new user to see if HP is correct
echo "📊 Testing new user creation..."
RESPONSE=$(curl -s "http://localhost:3000/api/user/test_new_user_$(date +%s)")

echo "Response: $RESPONSE"

# Extract HP and maxHP values
HP=$(echo $RESPONSE | grep -o '"hp":[0-9]*' | cut -d':' -f2)
MAX_HP=$(echo $RESPONSE | grep -o '"maxHP":[0-9]*' | cut -d':' -f2)

echo "HP: $HP"
echo "Max HP: $MAX_HP"

if [ "$HP" = "23040" ] && [ "$MAX_HP" = "23040" ]; then
    echo "✅ API is working correctly! HP = 23040"
else
    echo "❌ API still has old values. HP = $HP, Max HP = $MAX_HP"
    echo "Expected: HP = 23040, Max HP = 23040"
fi

echo "🏁 Test completed" 