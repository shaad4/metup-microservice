import sys
import os

# Add this directory to the python import search path so that the
# generated proto files can resolve their internal non-relative imports.
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
