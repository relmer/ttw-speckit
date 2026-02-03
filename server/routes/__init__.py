# This file makes the routes directory a Python package
from .games import games_bp
from .categories import categories_bp
from .publishers import publishers_bp

__all__ = ['games_bp', 'categories_bp', 'publishers_bp']
