#!/bin/bash
# Start the Python AI Fast Scanner API in the background
python fast_scanner_api.py &

# Start the Node.js API and static file server
node server.js
