from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import time
import requests

app = Flask(__name__)
CORS(app)  # 启用CORS支持

# 智谱AI的配置
API_KEY = "0781e234e878c818d156d8503dbba90b.KUNggSsuQu1lqqqD"
API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"

def generate_token(api_key: str):
    try:
        id, secret = api_key.split(".")
    except Exception as e:
        raise Exception("invalid apikey", e)
    
    payload = {
        "api_key": id,
        "exp": int(round(time.time() * 1000)) + 3600 * 1000,  # 1小时后过期
        "timestamp": int(round(time.time() * 1000)),
    }
    
    return jwt.encode(
        payload,
        secret,
        algorithm="HS256",
        headers={"alg": "HS256", "sign_type": "SIGN"},
    )

@app.route('/chat', methods=['POST'])
def chat():
    try:
        # 获取用户消息
        user_message = request.json.get('message')
        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # 生成token
        token = generate_token(API_KEY)

        # 准备请求智谱AI
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        data = {
            "model": "glm-4",
            "messages": [
                {
                    "role": "user",
                    "content": user_message
                }
            ]
        }

        # 发送请求到智谱AI
        response = requests.post(API_URL, headers=headers, json=data)
        response.raise_for_status()  # 检查响应状态

        # 解析响应
        result = response.json()
        if 'choices' in result and len(result['choices']) > 0:
            bot_response = result['choices'][0]['message']['content']
            return jsonify({"response": bot_response})
        else:
            return jsonify({"error": "Invalid response from AI service"}), 500

    except Exception as e:
        print(f"Error: {str(e)}")  # 服务器端日志
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 
