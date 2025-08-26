#!/usr/bin/env python3
"""
Simple HTTP server to serve user images for the admin panel.
This is a temporary solution while the Java backend has version issues.
"""

import http.server
import socketserver
import os
import json
from urllib.parse import urlparse, unquote
import mimetypes

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')

class ImageHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = unquote(parsed_path.path)
        
        print(f"🔍 Request: {path}")
        
        # Handle image requests
        if path.startswith('/api/users/image/'):
            self.serve_user_image(path)
        else:
            super().do_GET()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def serve_user_image(self, path):
        try:
            # Parse the path: /api/users/image/{type}/{userId}
            parts = path.split('/')
            if len(parts) < 6:
                self.send_error(400, "Invalid image request format")
                return
            
            image_type = parts[4]  # face, nic, or extracted
            user_id = parts[5]
            
            print(f"🖼️ Looking for {image_type} image for user: {user_id}")
            
            # Determine the directory based on image type
            if image_type == 'face':
                search_dir = os.path.join(UPLOADS_DIR, 'face-images')
                pattern = f"{user_id}_face_"
            elif image_type == 'nic':
                search_dir = os.path.join(UPLOADS_DIR, 'nic-images')
                pattern = f"{user_id}_nic_"
            elif image_type == 'extracted':
                search_dir = os.path.join(UPLOADS_DIR, 'extracted-photos')
                pattern = f"{user_id}_extracted_"
            else:
                self.send_error(400, f"Unknown image type: {image_type}")
                return
            
            # Find the image file
            image_file = self.find_image_file(search_dir, pattern)
            
            if image_file:
                print(f"✅ Found image: {image_file}")
                self.serve_image_file(image_file)
            else:
                print(f"❌ No {image_type} image found for user {user_id} in {search_dir}")
                self.send_error(404, f"Image not found for user {user_id}")
                
        except Exception as e:
            print(f"❌ Error serving image: {e}")
            self.send_error(500, f"Internal server error: {e}")
    
    def find_image_file(self, directory, pattern):
        """Find an image file that matches the pattern."""
        if not os.path.exists(directory):
            print(f"⚠️ Directory not found: {directory}")
            return None
        
        for filename in os.listdir(directory):
            if filename.startswith(pattern) and filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                return os.path.join(directory, filename)
        
        return None
    
    def serve_image_file(self, file_path):
        """Serve an image file with proper headers."""
        try:
            # Determine content type
            content_type, _ = mimetypes.guess_type(file_path)
            if content_type is None:
                content_type = 'application/octet-stream'
            
            # Read and serve the file
            with open(file_path, 'rb') as f:
                file_data = f.read()
            
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(file_data)))
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(file_data)
            
        except Exception as e:
            print(f"❌ Error reading image file {file_path}: {e}")
            self.send_error(500, f"Error reading image file: {e}")

def main():
    print(f"🚀 Starting image server on port {PORT}")
    print(f"📁 Serving from: {BASE_DIR}")
    print(f"🖼️ Images directory: {UPLOADS_DIR}")
    print(f"🌐 Access at: http://localhost:{PORT}")
    print("Press Ctrl+C to stop the server")
    
    with socketserver.TCPServer(("", PORT), ImageHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")

if __name__ == "__main__":
    main()
