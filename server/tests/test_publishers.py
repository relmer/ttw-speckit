import unittest
import json
from typing import Dict, Any
from flask import Flask, Response
from models import Publisher, db
from routes.publishers import publishers_bp


class TestPublishersRoutes(unittest.TestCase):
    """Test cases for publishers API endpoints"""
    
    # Test data
    TEST_DATA: Dict[str, Any] = {
        "publishers": [
            {"name": "DevGames Inc", "description": "Developer-themed games studio"},
            {"name": "Scrum Masters", "description": "Agile gaming experiences"},
            {"name": "Cloud Nine Studios", "description": "Cloud-based gaming publisher"}
        ]
    }
    
    # API paths
    PUBLISHERS_API_PATH: str = '/api/publishers'

    def setUp(self) -> None:
        """Set up test database and seed data"""
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        
        self.app.register_blueprint(publishers_bp)
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
        publishers = [
            Publisher(**pub_data) for pub_data in self.TEST_DATA["publishers"]
        ]
        db.session.add_all(publishers)
        db.session.commit()

    def _get_response_data(self, response: Response) -> Any:
        """Helper method to parse response data"""
        return json.loads(response.data)

    def test_get_publishers_success(self) -> None:
        """Test successful retrieval of all publishers"""
        # Act
        response = self.client.get(self.PUBLISHERS_API_PATH)
        data = self._get_response_data(response)
        
        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), len(self.TEST_DATA["publishers"]))

    def test_get_publishers_structure(self) -> None:
        """Test the response structure for publishers"""
        # Act
        response = self.client.get(self.PUBLISHERS_API_PATH)
        data = self._get_response_data(response)
        
        # Assert
        self.assertEqual(response.status_code, 200)
        required_fields = ['id', 'name', 'description', 'game_count']
        for field in required_fields:
            self.assertIn(field, data[0])

    def test_get_publishers_sorted_by_name(self) -> None:
        """Test that publishers are returned sorted by name"""
        # Act
        response = self.client.get(self.PUBLISHERS_API_PATH)
        data = self._get_response_data(response)
        
        # Assert
        self.assertEqual(response.status_code, 200)
        names = [pub['name'] for pub in data]
        self.assertEqual(names, sorted(names))

    def test_get_publishers_empty_database(self) -> None:
        """Test retrieval when no publishers exist"""
        # Clear all publishers
        with self.app.app_context():
            db.session.query(Publisher).delete()
            db.session.commit()
        
        # Act
        response = self.client.get(self.PUBLISHERS_API_PATH)
        data = self._get_response_data(response)
        
        # Assert
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 0)

    def test_get_publishers_game_count(self) -> None:
        """Test that game_count is returned for each publisher"""
        # Act
        response = self.client.get(self.PUBLISHERS_API_PATH)
        data = self._get_response_data(response)
        
        # Assert - all publishers should have game_count of 0 (no games seeded)
        for publisher in data:
            self.assertIn('game_count', publisher)
            self.assertEqual(publisher['game_count'], 0)


if __name__ == '__main__':
    unittest.main()
