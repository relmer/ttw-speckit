from flask import jsonify, Response, Blueprint, request
from models import db, Game, Publisher, Category
from sqlalchemy.orm import Query
from typing import Any

# Create a Blueprint for games routes
games_bp = Blueprint('games', __name__)

# Default pagination settings
DEFAULT_LIMIT = 12
MAX_LIMIT = 100

def get_games_base_query() -> Query:
    return db.session.query(Game).join(
        Publisher, 
        Game.publisher_id == Publisher.id, 
        isouter=True
    ).join(
        Category, 
        Game.category_id == Category.id, 
        isouter=True
    )

@games_bp.route('/api/games', methods=['GET'])
def get_games() -> Response:
    """Get games with optional filtering and pagination.
    
    Query Parameters:
        category_id (int, optional): Filter by category ID
        publisher_id (int, optional): Filter by publisher ID
        limit (int, optional): Number of games to return (default: 12, max: 100)
        offset (int, optional): Number of games to skip (default: 0)
    
    Returns:
        JSON with games array, total count, and hasMore flag
    """
    query = get_games_base_query()
    
    # Apply optional filters
    category_id: int | None = request.args.get('category_id', type=int)
    publisher_id: int | None = request.args.get('publisher_id', type=int)
    
    if category_id is not None:
        query = query.filter(Game.category_id == category_id)
    if publisher_id is not None:
        query = query.filter(Game.publisher_id == publisher_id)
    
    # Get total count before pagination
    total: int = query.count()
    
    # Apply pagination
    limit: int = min(request.args.get('limit', DEFAULT_LIMIT, type=int), MAX_LIMIT)
    offset: int = max(request.args.get('offset', 0, type=int), 0)
    
    games = query.offset(offset).limit(limit).all()
    games_list: list[dict[str, Any]] = [game.to_dict() for game in games]
    
    # Calculate hasMore
    has_more: bool = offset + len(games_list) < total
    
    return jsonify({
        'games': games_list,
        'total': total,
        'hasMore': has_more
    })

@games_bp.route('/api/games/<int:id>', methods=['GET'])
def get_game(id: int) -> tuple[Response, int] | Response:
    # Use the base query and add filter for specific game
    game_query = get_games_base_query().filter(Game.id == id).first()
    
    # Return 404 if game not found
    if not game_query: 
        return jsonify({"error": "Game not found"}), 404
    
    # Convert the result using the model's to_dict method
    game = game_query.to_dict()
    
    return jsonify(game)
