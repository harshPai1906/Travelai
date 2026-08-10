import os
import time
import re
import hashlib
import secrets
import sqlite3
from typing import Optional
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from langchain_core.messages import HumanMessage
from main import app as langgraph_app
import psycopg

api = FastAPI(title="AI Travel Planner API")

api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@api.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AI Travel Planner Backend API",
        "docs": "/docs"
    }

@api.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Backend service is healthy"}

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/langgraph_memory")

# In-memory session store for tokens -> user dict
SESSIONS = {}

def get_pg_connection():
    try:
        conn = psycopg.connect(DATABASE_URL, connect_timeout=3)
        return conn
    except Exception as e:
        print(f"[Notice] PostgreSQL connection attempt: {e}")
        return None

def get_sqlite_fallback():
    conn = sqlite3.connect("users_fallback.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    # Initialize PostgreSQL if available
    pg_conn = get_pg_connection()
    if pg_conn:
        try:
            with pg_conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        email VARCHAR(255) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                    CREATE TABLE IF NOT EXISTS user_history (
                        id SERIAL PRIMARY KEY,
                        thread_id VARCHAR(255) NOT NULL,
                        user_query TEXT NOT NULL,
                        flight_results TEXT,
                        hotel_results TEXT,
                        itinerary TEXT,
                        final_response TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                pg_conn.commit()
            pg_conn.close()
            print("[Success] PostgreSQL 'users' & 'user_history' tables ready.")
            return
        except Exception as e:
            print(f"[Warning] Failed to initialize PostgreSQL tables: {e}")

    # Fallback to local SQLite DB so auth never fails
    sq_conn = get_sqlite_fallback()
    with sq_conn:
        sq_conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        sq_conn.execute("""
            CREATE TABLE IF NOT EXISTS user_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                thread_id TEXT NOT NULL,
                user_query TEXT NOT NULL,
                flight_results TEXT,
                hotel_results TEXT,
                itinerary TEXT,
                final_response TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
    sq_conn.close()
    print("[Success] Fallback SQLite tables ready.")

init_db()

def save_history(thread_id: str, query: str, flight: str, hotel: str, itin: str, final_resp: str):
    pg_conn = get_pg_connection()
    if pg_conn:
        try:
            with pg_conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO user_history (thread_id, user_query, flight_results, hotel_results, itinerary, final_response)
                    VALUES (%s, %s, %s, %s, %s, %s);
                """, (thread_id, query, flight, hotel, itin, final_resp))
                pg_conn.commit()
            pg_conn.close()
            return
        except Exception as e:
            print(f"[Warning] Failed to save history in Postgres: {e}")

    sq_conn = get_sqlite_fallback()
    try:
        with sq_conn:
            sq_conn.execute("""
                INSERT INTO user_history (thread_id, user_query, flight_results, hotel_results, itinerary, final_response)
                VALUES (?, ?, ?, ?, ?, ?);
            """, (thread_id, query, flight, hotel, itin, final_resp))
    finally:
        sq_conn.close()

def hash_password(password: str) -> str:
    return hashlib.sha256(f"salt_travel_ai_{password}".encode('utf-8')).hexdigest()

# Pydantic Schemas
class TravelRequest(BaseModel):
    user_query: str
    thread_id: str = "aarohi_user"

class UserSignupRequest(BaseModel):
    name: str
    email: str
    password: str

class UserLoginRequest(BaseModel):
    email: str
    password: str

@api.get("/api/health")
def health_check():
    return {"status": "ok", "service": "AI Travel Planner Backend & PostgreSQL Auth"}

@api.get("/api/history")
def get_user_history(thread_id: str = "aarohi_user"):
    history_list = []
    pg_conn = get_pg_connection()
    if pg_conn:
        try:
            with pg_conn.cursor() as cur:
                cur.execute("""
                    SELECT id, user_query, flight_results, hotel_results, itinerary, final_response, created_at
                    FROM user_history
                    WHERE thread_id = %s
                    ORDER BY created_at DESC
                    LIMIT 20;
                """, (thread_id,))
                rows = cur.fetchall()
                for row in rows:
                    history_list.append({
                        "id": row[0],
                        "user_query": row[1],
                        "flight_results": row[2],
                        "hotel_results": row[3],
                        "itinerary": row[4],
                        "final_response": row[5],
                        "created_at": str(row[6])
                    })
            pg_conn.close()
            return {"status": "success", "history": history_list}
        except Exception as e:
            print(f"[Warning] PostgreSQL history query failed: {e}")

    sq_conn = get_sqlite_fallback()
    try:
        cur = sq_conn.execute("""
            SELECT id, user_query, flight_results, hotel_results, itinerary, final_response, created_at
            FROM user_history
            WHERE thread_id = ?
            ORDER BY created_at DESC
            LIMIT 20;
        """, (thread_id,))
        rows = cur.fetchall()
        for row in rows:
            history_list.append({
                "id": row["id"],
                "user_query": row["user_query"],
                "flight_results": row["flight_results"],
                "hotel_results": row["hotel_results"],
                "itinerary": row["itinerary"],
                "final_response": row["final_response"],
                "created_at": str(row["created_at"])
            })
        return {"status": "success", "history": history_list}
    finally:
        sq_conn.close()

# Auth API Endpoints
@api.post("/api/auth/signup")
def signup(req: UserSignupRequest):
    if not req.name.strip() or not req.email.strip() or not req.password:
        raise HTTPException(status_code=400, detail="All fields are required")

    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")

    pwd_hash = hash_password(req.password)
    email_clean = req.email.strip().lower()

    # Try PostgreSQL first
    pg_conn = get_pg_connection()
    if pg_conn:
        try:
            with pg_conn.cursor() as cur:
                cur.execute("SELECT id FROM users WHERE email = %s;", (email_clean,))
                if cur.fetchone():
                    pg_conn.close()
                    raise HTTPException(status_code=400, detail="An account with this email already exists")

                cur.execute(
                    "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s) RETURNING id;",
                    (req.name.strip(), email_clean, pwd_hash)
                )
                user_id = cur.fetchone()[0]
                pg_conn.commit()
            pg_conn.close()

            token = secrets.token_hex(24)
            user_data = {"id": str(user_id), "name": req.name.strip(), "email": email_clean}
            SESSIONS[token] = user_data
            return {"status": "success", "message": "Account created successfully", "token": token, "user": user_data}
        except HTTPException:
            raise
        except Exception as e:
            print(f"[Error] PostgreSQL signup error: {e}")

    # Fallback to SQLite
    sq_conn = get_sqlite_fallback()
    try:
        with sq_conn:
            cur = sq_conn.execute("SELECT id FROM users WHERE email = ?", (email_clean,))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="An account with this email already exists")

            cur = sq_conn.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
                (req.name.strip(), email_clean, pwd_hash)
            )
            user_id = cur.lastrowid
        token = secrets.token_hex(24)
        user_data = {"id": str(user_id), "name": req.name.strip(), "email": email_clean}
        SESSIONS[token] = user_data
        return {"status": "success", "message": "Account created successfully", "token": token, "user": user_data}
    finally:
        sq_conn.close()

@api.post("/api/auth/login")
def login(req: UserLoginRequest):
    email_clean = req.email.strip().lower()
    pwd_hash = hash_password(req.password)

    # Try PostgreSQL first
    pg_conn = get_pg_connection()
    if pg_conn:
        try:
            with pg_conn.cursor() as cur:
                cur.execute(
                    "SELECT id, name, email FROM users WHERE email = %s AND password_hash = %s;",
                    (email_clean, pwd_hash)
                )
                row = cur.fetchone()
                if row:
                    user_data = {"id": str(row[0]), "name": row[1], "email": row[2]}
                    pg_conn.close()
                    token = secrets.token_hex(24)
                    SESSIONS[token] = user_data
                    return {"status": "success", "message": "Logged in successfully", "token": token, "user": user_data}
            pg_conn.close()
        except Exception as e:
            print(f"[Warning] PostgreSQL login query error: {e}")

    # Fallback to SQLite
    sq_conn = get_sqlite_fallback()
    try:
        cur = sq_conn.execute(
            "SELECT id, name, email FROM users WHERE email = ? AND password_hash = ?",
            (email_clean, pwd_hash)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        user_data = {"id": str(row["id"]), "name": row["name"], "email": row["email"]}
        token = secrets.token_hex(24)
        SESSIONS[token] = user_data
        return {"status": "success", "message": "Logged in successfully", "token": token, "user": user_data}
    finally:
        sq_conn.close()

@api.get("/api/auth/me")
def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[1]
    user = SESSIONS.get(token)
    if not user:
        raise HTTPException(status_code=401, detail="Session expired")
    return {"status": "success", "user": user}

from main import parse_travel_intent

import uuid

@api.post("/api/generate")
def generate_travel_plan(req: TravelRequest):
    if not req.user_query.strip():
        raise HTTPException(status_code=400, detail="User query cannot be empty")

    unique_thread_id = f"trip_{uuid.uuid4().hex}_{int(time.time() * 1000)}"
    config = {"configurable": {"thread_id": unique_thread_id}}

    intent = parse_travel_intent(req.user_query)

    try:
        result = langgraph_app.invoke(
            {
                "messages": [HumanMessage(content=req.user_query)],
                "user_query": req.user_query,
                "origin": intent["origin"],
                "destination": intent["destination"],
                "duration_days": intent["duration_days"],
                "flight_required": intent["flight_required"],
                "flight_results": "",
                "hotel_results": "",
                "places_results": "",
                "places_data": [],
                "itinerary": "",
                "trip_story": "",
                "llm_calls": 0,
            },
            config=config,
        )

        destination = result.get("destination") or intent.get("destination") or "Destination"
        flight_results = result.get("flight_results", "")
        hotel_results = result.get("hotel_results", "")
        places_results = result.get("places_results", "")
        itinerary = result.get("itinerary", "")
        trip_story = result.get("trip_story", "")
        llm_calls = result.get("llm_calls", 4)

        messages = result.get("messages", [])
        final_response = messages[-1].content if messages else ""

        # Save search query and generated itinerary into PostgreSQL history DB
        save_history(req.thread_id, req.user_query, flight_results, hotel_results, itinerary, final_response)

        return {
            "status": "success",
            "user_query": req.user_query,
            "origin": intent.get("origin"),
            "destination": destination,
            "duration_days": intent.get("duration_days", 3),
            "flight_required": intent.get("flight_required", False),
            "flight_results": flight_results,
            "hotel_results": hotel_results,
            "places_results": places_results,
            "itinerary": itinerary,
            "final_response": final_response,
            "trip_story": trip_story,
            "llm_calls": llm_calls,
        }
    except Exception as e:
        print(f"[Error] Execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(api, host="0.0.0.0", port=port)


