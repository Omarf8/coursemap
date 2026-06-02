import os
from dotenv import load_dotenv
import json
import pdfplumber
import io
import secrets
import hashlib
import base64
from google import genai
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.errors import HttpError
from googleapiclient.discovery import build
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

load_dotenv()

SCOPES = ["https://www.googleapis.com/auth/calendar.events"] 

class CalendarEvent(BaseModel):
    title: str
    type: str
    date: str
    course: str

app = FastAPI()
oauth_states = {} 

origins = [
    "http://localhost:5173",
    "http://localhost:5174"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)

client = genai.Client()

@app.post("/uploadfile/")
async def parse_syllabus(file: UploadFile):
    rawBytes = await file.read()
    syllabus = io.BytesIO(rawBytes)

    data = ""
    with pdfplumber.open(syllabus) as pdf:
        for page in pdf.pages:
            data += f"\n{page.extract_text()}"

    response = client.models.generate_content(
        model="gemini-3-flash-preview", 
        contents=f"Using the following data, I want you to give me back the defined (not TBD) important dates listed such as homework, exams, quizzes, and/or any other types of assignments. Return the raw JSON with no markdown. Your response should be a JSON array where we want the title of the assignment, the type (HOMEWORK, EXAM, etc.), date (YYYY-MM-DD), and the course (NAME NUMBER): {data}"
    )

    gemini_text = response.text
    json_text = gemini_text.replace("```json", "").replace("```", "") # Potential md stripping
    return json.loads(json_text)

@app.get("/auth/login/")
def auth_login():
    code_verifier = secrets.token_urlsafe(64)
    code_challenge = base64.urlsafe_b64encode(
        hashlib.sha256(code_verifier.encode()).digest()
    ).rstrip(b'=').decode()

    flow = Flow.from_client_secrets_file("credentials.json", scopes=SCOPES, redirect_uri="http://localhost:8000/auth/callback")
    url, state = flow.authorization_url(
        access_type="offline",
        prompt="consent",
        code_challenge=code_challenge,
        code_challenge_method='S256'
    )
    oauth_states[state] = code_verifier
    return {"url": url}

@app.get("/auth/callback/")
def auth_callback(code: str, state: str):
    if state not in oauth_states:
        return {"Error": "Unknown Login Attempt"}

    flow = Flow.from_client_secrets_file("credentials.json", scopes=SCOPES, redirect_uri="http://localhost:8000/auth/callback")
    flow.fetch_token(code=code, code_verifier=oauth_states[state])
    creds = flow.credentials

    with open("user.txt", 'w') as f:
        f.write(creds.to_json())

    del oauth_states[state]
    return RedirectResponse("http://localhost:5173") 

@app.get("/auth/status/")
def auth_status():
    return {"authenticated": os.path.isfile("user.txt")}

@app.post("/calendar/add/")
def calendar_add(events: list[CalendarEvent]):
    try:
        if not os.path.isfile("user.txt"):
            raise HTTPException(status_code=401, detail="Not Authenticated")

        creds = None
        with open("user.txt") as f:
            creds = f.read()

        info = json.loads(creds)
        
        creds = Credentials.from_authorized_user_info(info)
        service = build("calendar", "v3", credentials=creds)

        with open("user.txt", "w") as f:
            f.write(creds.to_json())

        for e in events:
            event = {
                'summary': f"{e.course} - {e.title}",
                'start': {
                    'date': e.date
                },
                'end': {
                    'date': e.date
                }
            }

            service.events().insert(calendarId='primary', body=event).execute()

        return {"success": True}
    except HttpError as http:
        raise HTTPException(status_code=500, detail=http)

