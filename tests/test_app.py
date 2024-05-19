import pytest
from app import create_app, db
from app.models import User
from app.config import TestConfig  
from werkzeug.security import generate_password_hash

@pytest.fixture
def app():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        hashed_password = generate_password_hash("securepassword")
        user = User(email="user@example.com", password=hashed_password) 
        db.session.add(user)
        db.session.commit()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()

def test_authentication_page(client):
    response = client.get("/")
    assert b"Sign In" in response.data 
    assert b"Create Account" in response.data 

def test_successful_login(client, app):
    response = client.post('/', data={'email': 'user@example.com', 'password': 'securepassword', 'login': True})
    assert response.status_code == 302
    assert '/notes' in response.headers['Location'] 

def test_unsuccessful_login(client, app):
    response = client.post('/', data={'email': 'user@example.com', 'password': 'wrongpassword', 'login': True})
    assert b'Login failed. Please check your credentials.' in response.data 
    assert response.status_code == 200

def test_successful_registration(client, app):
    response = client.post('/', data={
        'email': 'newuser@example.com',
        'password': 'newpassword',
        'confirm': 'newpassword',
        'register': True
    })
    assert response.status_code == 302
    assert '/login' in response.headers['Location']  

def test_unsuccessful_registration(client, app):
    response = client.post('/', data={
        'email': 'user@example.com', 
        'password': 'password',
        'confirm': 'password',
        'register': True
    })
    assert b'Email already registered. Please log in or use a different email.' in response.data
    assert response.status_code == 200
