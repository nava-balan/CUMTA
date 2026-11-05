"""Serve the Chennai Water Metro concept demo using only the Python standard library."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os


ROOT = Path(__file__).resolve().parent


class DemoHandler(SimpleHTTPRequestHandler):
    """Serve the static demo from the project directory."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, format, *args):
        print(f"{self.address_string()} - {format % args}")


def main() -> None:
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer((host, port), DemoHandler)
    print(f"Chennai Water Metro demo running at http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Chennai Water Metro demo.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
