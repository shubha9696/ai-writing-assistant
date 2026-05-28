import os
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from anthropic import Anthropic

from .models import RewriteHistory
from .serializers import UserRegistrationSerializer, RewriteHistorySerializer

class RegisterView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "User registered successfully",
                "username": user.username
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RewriteView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        text = request.data.get('text', '').strip()
        mode = request.data.get('mode', 'rewrite').strip().lower()
        tone = request.data.get('tone', 'default').strip().lower()
        length = request.data.get('length', 'same').strip().lower()

        if not text:
            return Response({"error": "Text is required."}, status=status.HTTP_400_BAD_REQUEST)

        if mode not in ['rewrite', 'summarise', 'summarize']:
            return Response({"error": "Invalid mode. Must be 'rewrite' or 'summarise'."}, status=status.HTTP_400_BAD_REQUEST)

        # Normalize summarize naming
        mode_normalized = 'summarise' if mode in ['summarise', 'summarize'] else 'rewrite'

        # Fetch API credentials
        api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
        model = os.getenv("CLAUDE_MODEL", "claude-3-5-haiku-20241022").strip()

        # If API key is missing and DEBUG is active, use high-quality local mock to ensure seamless testing
        if not api_key:
            if os.getenv("DEBUG", "True").lower() == 'true':
                output_text = self._generate_mock_output(text, mode_normalized, tone, length)
                # Save to history
                history_record = RewriteHistory.objects.create(
                    user=request.user,
                    original_text=text,
                    output_text=output_text,
                    mode=mode_normalized,
                    tone=tone,
                    length=length
                )
                serializer = RewriteHistorySerializer(history_record)
                return Response({
                    "original_text": text,
                    "output_text": output_text,
                    "mode": mode_normalized,
                    "tone": tone,
                    "length": length,
                    "note": "Running in MOCK mode because ANTHROPIC_API_KEY is not configured in your backend/.env",
                    "history": serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Claude API key not configured. Please add ANTHROPIC_API_KEY to your .env file."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        try:
            # Build detailed prompt instructions
            system_instruction = (
                "You are an expert writing assistant and content editor. "
                "Your objective is to help the user refine, improve, or summarize their text based on the provided parameters. "
                "CRITICAL: Return ONLY the final modified text. Do not include any introductory remarks, "
                "explanations, conversational preambles, or markdown block wrapping like ``` unless the text itself requires code blocks."
            )

            # Craft detailed instructions for the user prompt
            user_prompt = f"Please process this text using the '{mode_normalized}' mode.\n\n"
            user_prompt += f"Original Text:\n\"\"\"\n{text}\n\"\"\"\n\n"
            user_prompt += "Instructions:\n"

            if mode_normalized == 'rewrite':
                user_prompt += "- Rewrite the text to make it more clear, professional, and well-structured.\n"
                user_prompt += "- Maintain the core message and all critical information.\n"
            else:
                user_prompt += "- Summarize the text by condensing it to its core takeaways and essential elements.\n"

            # Apply tone adjustments
            if tone and tone != 'default':
                user_prompt += f"- Use a highly '{tone}' tone. Adjust vocabulary, sentence structure, and style accordingly.\n"
            
            # Apply length adjustments
            if length == 'shorter':
                user_prompt += "- Make the output significantly shorter and more concise than the original.\n"
            elif length == 'longer':
                user_prompt += "- Make the output more detailed, fully expanded, and comprehensive.\n"
            else:
                user_prompt += "- Keep the output approximately the same length as the original.\n"

            user_prompt += "\nRefined Output:"

            # Check if the key is a Google Gemini key
            if api_key.startswith("AIzaSy"):
                import urllib.request
                import json
                
                # Default to gemini-2.5-flash for the Gemini endpoint if a gemini model is not explicitly defined
                gemini_model = model if model.startswith("gemini-") else "gemini-2.5-flash"
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={api_key}"
                
                combined_prompt = f"{system_instruction}\n\nUser Input & Task Details:\n{user_prompt}"
                payload = {
                    "contents": [
                        {
                            "parts": [
                                {
                                    "text": combined_prompt
                                }
                            ]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.7
                    }
                }
                
                req_payload = json.dumps(payload).encode('utf-8')
                req = urllib.request.Request(
                    url,
                    data=req_payload,
                    headers={'Content-Type': 'application/json'},
                    method="POST"
                )
                
                with urllib.request.urlopen(req) as response:
                    res_data = response.read().decode('utf-8')
                    res_json = json.loads(res_data)
                    output_text = res_json['candidates'][0]['content']['parts'][0]['text'].strip()
            else:
                # Query standard Claude API
                client = Anthropic(api_key=api_key)
                response = client.messages.create(
                    model=model,
                    max_tokens=2000,
                    temperature=0.7,
                    system=system_instruction,
                    messages=[
                        {"role": "user", "content": user_prompt}
                    ]
                )
                output_text = response.content[0].text.strip()

            # Save rewrite to user history
            history_record = RewriteHistory.objects.create(
                user=request.user,
                original_text=text,
                output_text=output_text,
                mode=mode_normalized,
                tone=tone,
                length=length
            )
            serializer = RewriteHistorySerializer(history_record)

            return Response({
                "original_text": text,
                "output_text": output_text,
                "mode": mode_normalized,
                "tone": tone,
                "length": length,
                "history": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Error calling Claude API: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _generate_mock_output(self, text, mode, tone, length):
        """Generates high-quality mock data when Claude API key is absent for local front-end debugging."""
        tone_str = f" in a {tone} tone" if tone and tone != 'default' else ""
        length_str = f" ({length} version)" if length and length != 'same' else ""

        if mode == 'summarise':
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            summary_points = lines[:2] if len(lines) > 2 else lines
            joined_points = " ".join(summary_points)
            return (
                f"[MOCK SUMMARY{tone_str.upper()}{length_str.upper()}]: "
                f"The core theme of the input covers: '{joined_points[:120]}...'. "
                f"Overall, this text presents key details about the subject in a structured format."
            )
        else:
            return (
                f"[MOCK REWRITE{tone_str.upper()}{length_str.upper()}]: "
                f"Here is a refined, polished version of your text. "
                f"\"We have carefully adjusted the following: {text.strip()}\". "
                f"This version enhances sentence flow, readability, and impact."
            )

class HistoryView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        history = RewriteHistory.objects.filter(user=request.user)
        serializer = RewriteHistorySerializer(history, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

