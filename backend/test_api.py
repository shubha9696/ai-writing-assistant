import json
import urllib.request
import urllib.error
import time

BASE_URL = "http://127.0.0.1:8000"

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    
    req_data = None
    if data:
        req_data = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
        
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode('utf-8')
            return response.status, json.loads(res_data) if res_data else None
    except urllib.error.HTTPError as e:
        res_data = e.read().decode('utf-8')
        try:
            parsed = json.loads(res_data)
        except:
            parsed = res_data
        return e.code, parsed
    except Exception as e:
        return 500, str(e)

def run_tests():
    print("Starting API integration tests...")
    print("=" * 50)
    
    username = f"tester_{int(time.time())}"
    password = "SecurePassword123!"
    
    # 1. Test User Registration
    print("\n[Test 1] User Registration...")
    reg_data = {
        "username": username,
        "email": f"{username}@example.com",
        "password": password,
        "password_confirm": password
    }
    status, res = make_request(f"{BASE_URL}/api/auth/register/", "POST", reg_data)
    print(f"Status: {status}")
    print(f"Response: {json.dumps(res, indent=2)}")
    assert status == 201, f"Failed registration: {res}"
    
    # 2. Test Login & Get Token
    print("\n[Test 2] User Login (Token Acquisition)...")
    login_data = {
        "username": username,
        "password": password
    }
    status, res = make_request(f"{BASE_URL}/api/auth/token/", "POST", login_data)
    print(f"Status: {status}")
    print("Response tokens obtained successfully!" if "access" in res else "Failed tokens")
    assert status == 200, f"Failed login: {res}"
    assert "access" in res, "Access token missing in response"
    
    access_token = res["access"]
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # 3. Test Rewrite Endpoint (Unauthenticated)
    print("\n[Test 3] Calling Rewrite without Authentication (Should Fail)...")
    status, res = make_request(f"{BASE_URL}/api/rewrite/", "POST", {"text": "Hello world", "mode": "rewrite"})
    print(f"Status (Expected 401): {status}")
    assert status == 401, f"Expected 401 unauthorized, got {status}"
    
    # 4. Test Rewrite Endpoint (Authenticated - Mock Mode since no Claude key)
    print("\n[Test 4] Calling Rewrite with Authentication...")
    rewrite_payload = {
        "text": "The quick brown fox jumps over the lazy dog.",
        "mode": "rewrite",
        "tone": "professional",
        "length": "shorter"
    }
    status, res = make_request(f"{BASE_URL}/api/rewrite/", "POST", rewrite_payload, headers=headers)
    print(f"Status: {status}")
    print(f"Response: {json.dumps(res, indent=2)}")
    assert status == 200, f"Failed rewrite: {res}"
    assert "output_text" in res, "Output text missing in response"
    
    # 5. Test Summarize Endpoint
    print("\n[Test 5] Calling Summarize with Authentication...")
    summarise_payload = {
        "text": "Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design. Built by experienced developers, it takes care of much of the hassle of web development, so you can focus on writing your app without needing to reinvent the wheel. It’s free and open source.",
        "mode": "summarise",
        "tone": "casual"
    }
    status, res = make_request(f"{BASE_URL}/api/rewrite/", "POST", summarise_payload, headers=headers)
    print(f"Status: {status}")
    print(f"Response: {json.dumps(res, indent=2)}")
    assert status == 200, f"Failed summarize: {res}"
    
    # 6. Test Fetching History
    print("\n[Test 6] Fetching Revision History...")
    status, res = make_request(f"{BASE_URL}/api/history/", "GET", headers=headers)
    print(f"Status: {status}")
    print(f"History records found: {len(res)}")
    print(f"First record: {json.dumps(res[0], indent=2)}")
    assert status == 200, f"Failed to fetch history: {res}"
    assert len(res) >= 2, "Expected at least 2 history records"
    
    print("\n" + "=" * 50)
    print("ALL API INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 50)

if __name__ == "__main__":
    run_tests()
