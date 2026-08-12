import requests

response = requests.post(
    "http://127.0.0.1:5000/get",
    json={"message": "test"}
)
print(response.status_code)
print(response.text)