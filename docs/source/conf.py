"""
Sphinx configuration for Tech Pulse v2.0 API Documentation.
"""

import os
import sys
import django

# Add project root to path
sys.path.insert(0, os.path.abspath('../..'))

# Setup Django
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
django.setup()

# -- Project information -----------------------------------------------------
project = 'Tech Pulse v2.0'
copyright = '2026, Pfarelo Channel Mudau (Matanda Software)'
author = 'Pfarelo Channel Mudau (Matanda Software)'
release = '2.0.0'

# General configuration ---------------------------------------------------
extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.napoleon',
    'sphinx.ext.viewcode',
    'sphinx.ext.intersphinx',
    'sphinxcontrib.httpdomain',
    'sphinx_autodoc_typehints',
]

templates_path = ['_templates']
exclude_patterns = [
    # Exclude all .md files from root (your personal docs)
    '../../*.md',
    # Exclude test files
    '**/tests/**',
    '**/*test*.py',
    '**/conftest.py',
    # Exclude migrations
    '**/migrations/**',
    # Exclude frontend
    '../../frontend/**',
    # Exclude build directory
    '_build',
]

# Options for HTML output 
html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']

html_theme_options = {
    'logo_only': False,
    'display_version': True,
    'prev_next_buttons_location': 'bottom',
    'style_external_links': True,
    'navigation_depth': 4,
    'collapse_navigation': False,
    'sticky_navigation': True,
}

# -- Extension configuration -------------------------------------------------
autodoc_default_options = {
    'members': True,
    'member-order': 'bysource',
    'special-members': '__init__',
    'undoc-members': True,
    'exclude-members': '__weakref__'
}

napoleon_google_docstring = True
napoleon_numpy_docstring = False
napoleon_include_init_with_doc = True

intersphinx_mapping = {
    'python': ('https://docs.python.org/3', None),
    'django': ('https://docs.djangoproject.com/en/5.0/', 
               'https://docs.djangoproject.com/en/5.0/_objects/'),
}