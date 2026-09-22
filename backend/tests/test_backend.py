"""
Test script for Sentinel AI Backend
Run with: python tests/test_backend.py
"""

import requests
import json
from pathlib import Path

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health check endpoint"""
    print("\n=== Testing Health Check ===")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_dashboard():
    """Test dashboard endpoint"""
    print("\n=== Testing Dashboard ===")
    try:
        response = requests.get(f"{BASE_URL}/api/dashboard")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Stats: {json.dumps(data.get('stats'), indent=2)}")
        print(f"Assets: {len(data.get('assets', []))} assets")
        print(f"Recent Analyses: {len(data.get('recent_analyses', []))} analyses")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_assets():
    """Test assets endpoint"""
    print("\n=== Testing Assets ===")
    try:
        response = requests.get(f"{BASE_URL}/api/assets")
        print(f"Status: {response.status_code}")
        assets = response.json()
        print(f"Found {len(assets)} assets")
        if assets:
            print(f"First asset: {json.dumps(assets[0], indent=2, default=str)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_analyses():
    """Test analyses endpoint"""
    print("\n=== Testing Analyses ===")
    try:
        response = requests.get(f"{BASE_URL}/api/analyses?limit=5")
        print(f"Status: {response.status_code}")
        analyses = response.json()
        print(f"Found {len(analyses)} analyses")
        if analyses:
            print(f"First analysis: {json.dumps(analyses[0], indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_image_upload(image_path: str):
    """Test image upload endpoint"""
    print(f"\n=== Testing Image Upload with {image_path} ===")
    
    if not Path(image_path).exists():
        print(f"Image file not found: {image_path}")
        return False
    
    try:
        with open(image_path, 'rb') as f:
            files = {
                'file': (Path(image_path).name, f, 'image/jpeg')
            }
            data = {
                'asset_id': 'TEST-001',
                'asset_type': 'Road',
                'location': 'Test Location',
                'latitude': 18.5644,
                'longitude': 73.7997,
            }
            
            response = requests.post(f"{BASE_URL}/api/analyze", files=files, data=data)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"Analysis Result:")
                print(f"  - ID: {result.get('id')}")
                print(f"  - Asset: {result.get('asset_id')}")
                print(f"  - Detections: {result.get('num_detections')}")
                print(f"  - Risk Score: {result.get('risk_score')}")
                print(f"  - Severity: {result.get('severity')}")
                print(f"  - Status: {result.get('status')}")
                return True
            else:
                print(f"Error Response: {response.text}")
                return False
    
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("Sentinel AI Backend Test Suite")
    print("=" * 60)
    
    print(f"\nTesting against: {BASE_URL}")
    
    # Run basic tests
    results = {
        "Health Check": test_health(),
        "Dashboard": test_dashboard(),
        "Assets": test_assets(),
        "Analyses": test_analyses(),
    }
    
    # Optional: test with a sample image if provided
    import sys
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        results["Image Upload"] = test_image_upload(image_path)
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary:")
    print("=" * 60)
    for test_name, passed in results.items():
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    print("\n" + ("All tests passed! ✓" if all_passed else "Some tests failed ✗"))
    
    return all_passed

if __name__ == "__main__":
    import sys
    sys.exit(0 if main() else 1)
