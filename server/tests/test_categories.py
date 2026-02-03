import unittest
import json
from typing import Dict, Any
from flask import Flask, Response
from models import Category, db
from routes.categories import categories_bp


class TestCategoriesRoutes(unittest.TestCase):
    """Test cases for categories API endpoints"""
    
    # Test data
    TEST_DATA: Dict[str, Any] = {
        "categories": [
            {"name": "Strategy", "description": "Games requiring tactical thinking"},
            {"name": "Card Game", "description": "Card-based gameplay mechanics"},
            {"name": "Adventure", "description": "Exploration and story-driven games"}
        ]
    }
    
    # API paths
    CATEGORIES_API_PATH: str = '/api/categories'

    def setUp(self) -> None:
        """Set up test database and seed data"""
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        
        self.app.register_blueprint(categories_bp)
        self.client = self.app.test_client()
        
        db.init_app(self.app)
        
        with self.app.app_context():
            db.create_all()
            self._seed_test_data()

    def tearDown(self) -> None:
        """Clean up test database"""
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
            db.engine.dispose()

    def _seed_test_data(self) -> None:
        """Helper method to seed test data"""
        categories = [
            Category(**cat_data) for cat_data in self.TEST_DATA["categories"]
        ]
        db.session.add_all(categories)
        db.session.commit()

    def _get_response_data(self, response: Response) -> Any:
        """Helper method to parse response data"""
        return json.loads(response.data)

    def test_get_categories_success(self) -> None:
        """Test successful retrieval of all categories"""
        # Act
        response = self.client.get(self.CATEGORIES_API_PATH)
        data = self._get_response_data(response)
        
        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), len(self.TEST_DATA["categories"]))

    def test_get_categories_structure(self) -> None:
        """Test the response structure for categories"""
        # Act
        response = self.client.get(self.CATEGORIES_API_PATH)
        data = self._get_response_data(response)
        
        # Assert
        self.assertEqual(response.status_code, 200)
        required_fields = ['id', 'name', 'description', 'game_count']
        for field in required_fields:
            self.assertIn(field, data[0])

    def test_get_categories_sorted_by_name(self) -> None:
        """Test that categories are returned sorted by name"""
        # Act
        response = self.client.get(self.CATEGORIES_API_PATH)
        data = self._get_response_data(response)
        
        # Assert
        self.assertEqual(response.status_code, 200)
        names = [cat['name'] for cat in data]
        self.assertEqual(names, sorted(names))

    def test_get_categories_empty_database(self) -> None:
        """Test retrieval when no categories exist"""
        # Clear all categories
        with self.app.app_context():
            db.session.query(Category).delete()
            db.session.commit()
        
        # Act
        response = self.client.get(self.CATEGORIES_API_PATH)
        data = self._get_response_data(response)
        
        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 0)

    def test_get_categories_game_count(self) -> None:
        """Test that game_count is returned for each category"""
        # Act
        response = self.client.get(self.CATEGORIES_API_PATH)
        data = self._get_response_data(response)
        
        # Assert - all categories should have game_count of 0 (no games seeded)
        for category in data:
            self.assertIn('game_count', category)
            self.assertEqual(category['game_count'], 0)


if __name__ == '__main__':
    unittest.main()
