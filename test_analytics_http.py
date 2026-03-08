"""Test analytics endpoint with proper authentication."""
import requests

# Get token first
login_data = {
    "username": "pfarelo",
    "password": "your_password_here"  # Replace with actual password
}

# Try to get analytics
headers = {
    "Authorization": "Token YOUR_ACTUAL_TOKEN_HERE"  # Replace with actual token from localStorage
}

try:
    response = requests.get('http://127.0.0.1:8000/api/analytics/overview/', headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:500]}")  # First 500 chars
    
    if response.status_code == 500:
        print("\n❌ SERVER ERROR - Check Django console for the actual error")
    elif response.status_code == 401:
        print("\n❌ UNAUTHORIZED - Token invalid or missing")
    elif response.status_code == 200:
        print("\n✅ Success!")
        print(f"Data keys: {list(response.json().keys())}")
    else:
        print(f"\n⚠️ Unexpected status code: {response.status_code}")
        
except Exception as e:
    print(f"❌ Connection Error: {e}")
    print("Make sure Django server is running on port 8000")
