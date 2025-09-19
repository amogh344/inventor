#!/bin/bash

# Install requirements from the backend folder
pip3 install -r backend/requirements.txt

# Run migrations using the manage.py at the root
python3 manage.py migrate