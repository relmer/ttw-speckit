from flask import jsonify, Response, Blueprint
from models import db, Publisher
from typing import Any

# Create a Blueprint for publishers routes
publishers_bp = Blueprint('publishers', __name__)


@publishers_bp.route('/api/publishers', methods=['GET'])
def get_publishers() -> Response:
    """Get all publishers for filter dropdowns.
    
    Returns:
        JSON array of publishers with id, name, description, and game_count
    """
    publishers = db.session.query(Publisher).order_by(Publisher.name).all()
    publishers_list: list[dict[str, Any]] = [publisher.to_dict() for publisher in publishers]
    
    return jsonify(publishers_list)
