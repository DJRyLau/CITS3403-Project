import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from app import create_app, db
from app.models import User

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"
    })
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()

@pytest.fixture(scope="module")
def init_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    driver = webdriver.Chrome(options=options)
    yield driver
    driver.quit()

def test_authentication_page(client):
    response = client.get("/")
    assert b"Sign In" in response.data  # Ensure the page includes the button
    assert b"Create Account" in response.data  # Ensure the page includes the button
