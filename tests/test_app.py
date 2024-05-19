import pytest
from app import create_app, db
from app.models import User, Note, UserPreferences
from app.config import TestConfig  
from werkzeug.security import generate_password_hash
from flask import url_for
from selenium import webdriver
from selenium.webdriver.common.by import By

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

def login(client):
    return client.post('/', data={'email': 'user@example.com', 'password': 'securepassword', 'login': True})

def get_csrf_token(client):
    response = client.get('/notes')
    if response.status_code == 200:
        html_content = response.data.decode()
        start_index = html_content.find('meta name="csrf-token" content="')
        if start_index != -1:
            start_index += len('meta name="csrf-token" content="')
            end_index = html_content.find('"', start_index)
            if end_index != -1:
                csrf_token = html_content[start_index:end_index]
                return csrf_token
    return None

def test_authentication_page(client):
    response = client.get("/")
    assert b"Sign In" in response.data 
    assert b"Create Account" in response.data 

def test_successful_login(client, app):
    response = login(client)
    assert response.status_code == 302
    assert '/notes' in response.headers['Location'] 

def test_unsuccessful_login(client, app):
    response = client.post('/', data={'email': 'newuser@example.com', 'password': 'securepassword', 'login': True})
    assert b'Login failed. Please check your credentials.' in response.data 
    assert response.status_code == 200

# def test_successful_registration(client, app):
#     response = client.post('/', data={
#         'email': 'newuser@example.com',
#         'password': 'newpassword',
#         'confirm': 'newpassword',
#         'register': True
#     })
#     assert response.status_code == 302
#     assert '/login' in response.headers['Location']  

def test_unsuccessful_registration(client, app):
    response = client.post('/', data={
        'email': 'user@example.com', 
        'password': 'password',
        'confirm': 'password',
        'register': True
    })
    assert b'Email already registered. Please log in or use a different email.' in response.data
    assert response.status_code == 200
def test_successful_note_creation(client, app):
    login_response = login(client)
    assert login_response.status_code == 302
    
    with client.session_transaction() as session:
        session['active_board_id'] = 1
    
    response = client.get('/notes')
    html_content = response.data.decode()
    start_index = html_content.find('meta name="csrf-token" content="')
    assert start_index != -1, "CSRF token meta tag not found"
    start_index += len('meta name="csrf-token" content="')
    end_index = html_content.find('"', start_index)
    csrf_token = html_content[start_index:end_index]
    assert csrf_token is not None, "CSRF token not found"

    response = client.post('/notes/add', data={'csrf_token': csrf_token, 'content': 'New note content', 'color': '#ffffff'}, follow_redirects=True)
    assert response.status_code == 200
    json_response = response.get_json()
    assert json_response['success'] == True

    with app.app_context():
        note = Note.query.filter_by(content='New note content').first()
        assert note is not None
        assert note.content == 'New note content'
        assert note.user_id == 1
        assert note.board_id == 1
    
def test_unsuccessful_note_creation(client, app):
    login_response = login(client)
    assert login_response.status_code == 302
    
    with client.session_transaction() as session:
        session['active_board_id'] = 1
    
    response = client.get('/notes')
    html_content = response.data.decode()
    start_index = html_content.find('meta name="csrf-token" content="')
    assert start_index != -1, "CSRF token meta tag not found"
    start_index += len('meta name="csrf-token" content="')
    end_index = html_content.find('"', start_index)
    csrf_token = html_content[start_index:end_index]
    assert csrf_token is not None, "CSRF token not found"

    response = client.post('/notes/add', data={'csrf_token': csrf_token, 'content': '', 'color': '#ffffff'}, follow_redirects=True)
    assert response.status_code == 400
    json_response = response.get_json()
    assert json_response['success'] == False
    assert json_response['message'] == 'Note content cannot be empty.'

    with app.app_context():
        note = Note.query.filter_by(content='').first()
        assert note is None

def test_successful_note_reply(client, app):
    login_response = login(client)
    assert login_response.status_code == 302

    response = client.post('/notes/add', data={'content': 'Test note', 'color': '#ffffff'}, follow_redirects=True)
    assert response.status_code == 200
    note_id = response.json['id']

    response = client.post(f'/notes/{note_id}/add_reply', json={
        'content': 'This is a test reply'
    }, headers={'Content-Type': 'application/json'})
    assert response.status_code == 201
    assert response.json['content'] == 'This is a test reply'
    assert response.json['note_id'] == note_id

def test_unsuccessful_note_reply(client, app):
    login_response = login(client)
    assert login_response.status_code == 302

    non_existent_note_id = 9999
    response = client.post(f'/notes/{non_existent_note_id}/add_reply', json={'content': 'This is a test reply'}, headers={'Content-Type': 'application/json'})
    assert response.status_code == 404
    
def test_successful_settings_update(client, app):
    login_response = login(client)
    assert login_response.status_code == 302
    
    csrf_token = get_csrf_token(client)
    assert csrf_token is not None, "CSRF token not found"
    
    preferences_data = {
        'designTheme': 'default',
        'designBackColor': '#6b4d38',
        'designSideBarColor': '#7d5b3b',
        'timezone': '+07:00',
        'enableEmailNotif': True,
        'enableEmailNotifReply': True,
        'enableEmailNotifBoard': True,
        'enableEmailNotifOwn': True,
        'enableEmailNotifStar': True,
        'privacy': 'public',
        'profilePicture': '/static/images/default-avatar.jpg',
        'username': 'newusername',
        'lightDarkMode': True,
        'noteColour': '#ffffff'
    }

    response = client.post('/save_preferences', json=preferences_data, headers={'X-CSRF-Token': csrf_token})
    assert response.status_code == 200
    user_preferences = UserPreferences.query.filter_by(user_id=1).first()
    assert user_preferences is not None
    assert user_preferences.username == 'newusername'

def test_unsuccessful_settings_update(client, app):
    login_response = login(client)
    assert login_response.status_code == 302

    csrf_token = get_csrf_token(client)
    assert csrf_token is not None, "CSRF token not found"


    incomplete_preferences_data = {
        'timezone': '+09:00',
        'enableEmailNotif': 'true'
    }

    response = client.post('/save_preferences', json=incomplete_preferences_data, headers={'X-CSRF-Token': csrf_token})
    assert response.status_code == 400
    assert b'Missing fields' in response.data
    
def test_successful_logout(client, app):
    response = client.post('/', data={'email': 'user@example.com','password': 'securepassword','login': True})
    assert response.status_code == 302
    assert '/notes' in response.headers['Location'] 

    response = client.get('/logout', follow_redirects=True)
    assert response.status_code == 200
    assert b'You have been logged out.' in response.data

def test_unsuccessful_logout(client, app):
    response = client.post('/', data={'email': 'newuser@example.com', 'password': 'securepassword', 'login': True})
    assert b'Login failed. Please check your credentials.' in response.data 
    assert response.status_code == 200
    
    response = client.get('/logout', follow_redirects=True)
    assert response.status_code == 200
    assert b'You have been logged out.' in response.data

# SELENIUM
driver = webdriver.Chrome()

driver.implicitly_wait(10)

driver.get("http://127.0.0.1:5000")

title = driver.title

driver.implicitly_wait(10)

create_account = driver.find_element(By.ID, "create-btn")
create_account.click()

driver.implicitly_wait(10)

driver.quit()
