from flask import jsonify, Response, Blueprint
from models import db, Category
from typing import Any

# Create a Blueprint for categories routes
categories_bp = Blueprint('categories', __name__)


@categories_bp.route('/api/categories', methods=['GET'])
def get_categories() -> Response:
    """Get all categories for filter dropdowns.
    
    Returns:
        JSON array of categories with id, name, description, and game_count
    """
    categories = db.session.query(Category).order_by(Category.name).all()
    categories_list: list[dict[str, Any]] = [category.to_dict() for category in categories]
    
    return jsonify(categories_list)
