"""Local demo server for the Kishun Sharma Law Chambers website.

It serves the static website and provides a small local API for consultation
requests. The server intentionally binds to 127.0.0.1 by default, so the demo
dashboard is visible only on this computer.
"""

from datetime import datetime, timezone
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Lock
from urllib.parse import urlparse
import json
import os
import uuid


ROOT = Path(__file__).parent
DATA_FILE = ROOT.parent / "data" / "consultations.json"
SITE_STATS_FILE = ROOT.parent / "data" / "site_stats.json"
DATA_LOCK = Lock()


def load_consultations():
    """Return saved requests, treating a missing or invalid demo file as empty."""
    try:
        data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def save_consultation(consultation):
    """Save a request atomically so the dashboard never reads a partial file."""
    with DATA_LOCK:
        consultations = load_consultations()
        consultations.insert(0, consultation)
        DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        temporary_file = DATA_FILE.with_suffix(".tmp")
        temporary_file.write_text(
            json.dumps(consultations, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        temporary_file.replace(DATA_FILE)


def load_site_stats():
    try:
        data = json.loads(SITE_STATS_FILE.read_text(encoding="utf-8"))
        page_views = max(0, int(data.get("page_views", 0)))
        return {"page_views": page_views}
    except (FileNotFoundError, json.JSONDecodeError, TypeError, ValueError):
        return {"page_views": 0}


def record_page_view():
    """Increment the public page-view counter without collecting visitor identity."""
    with DATA_LOCK:
        stats = load_site_stats()
        stats["page_views"] += 1
        SITE_STATS_FILE.parent.mkdir(parents=True, exist_ok=True)
        temporary_file = SITE_STATS_FILE.with_suffix(".tmp")
        temporary_file.write_text(json.dumps(stats, indent=2), encoding="utf-8")
        temporary_file.replace(SITE_STATS_FILE)
        return stats


class WebsiteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, payload, status=HTTPStatus.OK):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/consultations":
            self.send_json({"consultations": load_consultations()})
            return
        if path == "/api/site-stats":
            self.send_json(load_site_stats())
            return
        super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/api/site-visits":
            self.send_json(record_page_view(), HTTPStatus.CREATED)
            return

        if path != "/api/consultations":
            self.send_json({"error": "Not found."}, HTTPStatus.NOT_FOUND)
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length <= 0 or content_length > 10_000:
                raise ValueError
            payload = json.loads(self.rfile.read(content_length).decode("utf-8"))
        except (ValueError, UnicodeDecodeError, json.JSONDecodeError):
            self.send_json({"error": "Please submit valid form details."}, HTTPStatus.BAD_REQUEST)
            return

        def clean(field, limit):
            return str(payload.get(field, "")).strip()[:limit]

        name = clean("name", 120)
        phone = clean("phone", 50)
        email = clean("email", 254)
        matter = clean("matter", 80)
        message = clean("message", 2_000)
        if not name or not phone or not email or "@" not in email or not matter:
            self.send_json(
                {"error": "Name, phone number, valid email address, and matter are required."},
                HTTPStatus.BAD_REQUEST,
            )
            return

        consultation = {
            "id": uuid.uuid4().hex[:12],
            "name": name,
            "phone": phone,
            "email": email,
            "matter": matter,
            "message": message,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        save_consultation(consultation)
        self.send_json({"consultation": consultation}, HTTPStatus.CREATED)


class AdvocateServer(ThreadingHTTPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    server = AdvocateServer((host, port), WebsiteHandler)
    print(f"Advocate Chamber website running at http://{host}:{port}")
    print(f"Live request dashboard: http://{host}:{port}/admin.html")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        server.server_close()
