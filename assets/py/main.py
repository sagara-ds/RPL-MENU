import json
import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
from html import escape

PROJECT_ROOT = Path(__file__).resolve().parents[2]
RECEIPTS_DIR = PROJECT_ROOT / "assets" / "receipts"
RECEIPTS_DIR.mkdir(parents=True, exist_ok=True)


class ReceiptHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/assets/"):
            self.serve_file(parsed.path.lstrip("/"))
            return

        self.serve_file("index.html")

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != "/api/receipt":
            self.send_error(404, "Not found")
            return

        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8")
        data = json.loads(body or "{}")

        receipt_path = self.generate_receipt(data)
        receipt_url = f"http://127.0.0.1:8000/{receipt_path.relative_to(PROJECT_ROOT).as_posix()}"

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({"ok": True, "receiptUrl": receipt_url}).encode("utf-8"))

    def generate_receipt(self, data):
        qr_filename = data.get("qrImage", "Link-QR.png")
        customer = data.get("customer", {})
        items = data.get("items", [])
        total = data.get("total", 0)

        now = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_name = "".join(ch if ch.isalnum() else "_" for ch in str(customer.get("nama", "customer")))
        safe_name = safe_name.strip("_") or "customer"

        receipt_path = RECEIPTS_DIR / f"{safe_name}_{now}.html"

        rows = []
        for item in items:
            subtotal = int(item.get("price", 0)) * int(item.get("quantity", 1))
            rows.append(
                f"<tr><td>{escape(str(item.get('name', 'Menu')))}</td><td>{int(item.get('quantity', 1))}x</td><td>Rp {subtotal:,}</td></tr>"
            )

        if not rows:
            rows.append("<tr><td colspan='3'>Tidak ada barang</td></tr>")

        html_content = f"""<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Struk RPL.menu</title>
  <style>
    body {{ font-family: Arial, sans-serif; padding: 24px; color: #111; }}
    .box {{ max-width: 420px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 12px; background-color: #fff; }}
    h2 {{ text-align: center; margin-bottom: 8px; }}
    .meta {{ font-size: 14px; margin-bottom: 16px; }}
    table {{ width: 100%; border-collapse: collapse; }}
    th, td {{ padding: 8px 0; border-bottom: 1px dashed #ccc; text-align: left; }}
    .total {{ font-weight: bold; font-size: 16px; margin-top: 12px; }}
    .footer {{ margin-top: 16px; font-size: 13px; text-align: center; color: #666; }}
    
    /* CSS untuk QR Code */
    .qr-container {{ text-align: center; margin: 20px 0 15px 0; }}
    .qr-container img {{ width: 150px; height: 150px; object-fit: contain; }}
    .qr-text {{ font-size: 12px; color: #555; margin-top: 8px; text-align: center; font-weight: bold; }}
  </style>
</head>
<body>
  <div class="box">
    <h2>RPL.menu</h2>
    <p style="text-align:center; margin: 0 0 12px;">Struk Pembayaran</p>
    
    <div class="meta">
      <div><strong>Nama:</strong> {escape(str(customer.get('nama', '-')))}</div>
      <div><strong>Alamat:</strong> {escape(str(customer.get('alamat', '-')))}</div>
      <div><strong>Catatan:</strong> {escape(str(customer.get('catatan', '-')) or '-')}</div>
      <div><strong>Waktu:</strong> {datetime.datetime.now().strftime('%d-%m-%Y %H:%M:%S')}</div>
    </div>
    
    <table>
      <thead>
        <tr><th>Menu</th><th>Qty</th><th>Subtotal</th></tr>
      </thead>
      <tbody>
        {''.join(rows)}
      </tbody>
    </table>
    
    <div class="total">Total: Rp {int(total):,}</div>
    
   <div class="qr-container">
  <img src="/assets/image/{qr_filename}" alt="QR">
  <div class="qr-text">Scan QRIS di atas untuk membayar</div>
</div>
    
    <div class="footer">Terima kasih telah memesan di RPL.menu</div>
  </div>
</body>
</html>
"""
        receipt_path.write_text(html_content, encoding="utf-8")
        return receipt_path

    def serve_file(self, relative_path):
        target = (PROJECT_ROOT / relative_path).resolve()
        if not str(target).startswith(str(PROJECT_ROOT.resolve())):
            self.send_error(403, "Forbidden")
            return

        if not target.exists():
            self.send_error(404, "Not found")
            return

        content_type = "text/html; charset=utf-8"
        if target.suffix == ".css":
            content_type = "text/css; charset=utf-8"
        elif target.suffix == ".js":
            content_type = "application/javascript; charset=utf-8"
        elif target.suffix == ".png":
            content_type = "image/png"
        elif target.suffix == ".jpg" or target.suffix == ".jpeg":
            content_type = "image/jpeg"

        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(target.read_bytes())

    def log_message(self, format, *args):
        return


def main():
    server = ThreadingHTTPServer(("127.0.0.1", 8000), ReceiptHandler)
    print("Server struk aktif di http://127.0.0.1:8000")
    server.serve_forever()


if __name__ == "__main__":
    main()
