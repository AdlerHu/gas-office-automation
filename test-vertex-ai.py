import vertexai
from vertexai.generative_models import GenerativeModel
import requests

def generativeai(input_text):
    vertexai.init(project='skills-building-413521', location="asia-east1")

    model = GenerativeModel(model_name="gemini-1.0-pro-002")

    response = model.generate_content(
        input_text
    )

    return response.text


def send_telegram_message(bot_token, chat_id, message):
    """
    向 Telegram 聊天頻道發送消息。

    Args:
        bot_token: Telegram Bot 的 API 令牌。
        chat_id: Telegram 聊天頻道的 ID。
        message: 要發送的消息。
    """
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    data = {
        "chat_id": chat_id,
        "text": message
    }
    requests.post(url, json=data)


def main():
    # 獲取 Telegram Bot 的 API 令牌和聊天 ID
    bot_token = "7063049506:AAE68MPnhfWmPwOJY_L72hhCZvto34SrOuc"
    chat_id = "6124294048"

    # 讓使用者輸入景點
    while True:
        input_text = input("請輸入您想查詢的景點（輸入 '結束' 停止）：")

        # 如果使用者輸入 '結束'，則停止迴圈
        if input_text == "結束":
            break

        # 使用 generativeai 函數生成回應
        response = generativeai(input_text=input_text)

        # 向 Telegram 聊天頻道發送回應
        send_telegram_message(bot_token, chat_id, response)


if __name__ == '__main__':
    main()
