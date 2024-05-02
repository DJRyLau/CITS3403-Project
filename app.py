from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
from dotenv import load_dotenv
load_dotenv()
from models import User, db

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')
db.init_app(app)
with app.app_context():
        db.create_all()  

@app.route('/')
def authentication():
    if 'user_id' in session:
        return redirect(url_for('notes'))
    return render_template('authentication.html')

@app.route('/notes')
def notes():
    if 'user_id' not in session:
        flash('You are not logged in!')
        return redirect(url_for('authentication'))
    return render_template('notes.html')

@app.route('/login', methods=['POST'])
def login():
    email = request.form['email']
    password = request.form['password']
    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password, password):
        session['user_id'] = user.id
        flash('Login successful!')
        return redirect(url_for('notes'))
    else:
        flash('Invalid email or password.')
        return redirect(url_for('authentication'))

@app.route('/register', methods=['POST'])
def register():
    email = request.form['email']
    password = request.form['password']
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        flash('Email already exists.')
        return redirect(url_for('register'))
    
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    flash('Account created successfully! Please log in.')
    return redirect(url_for('authentication'))

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('You have been logged out.')
    return redirect(url_for('authentication'))

if __name__ == '__main__':
    app.run(debug=True)
    
