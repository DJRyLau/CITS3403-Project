from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
from dotenv import load_dotenv
load_dotenv()
from models import User, db
from forms import LoginForm, RegisterForm
from flask_wtf.csrf import CSRFProtect
from flask_login import LoginManager, login_user, logout_user, login_required, current_user

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')
csrf = CSRFProtect(app)
db.init_app(app)

login_manager = LoginManager(app)
login_manager.login_view = 'authentication'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

with app.app_context():
    db.create_all()

@app.route('/', methods=['GET', 'POST'])
def authentication():
    if current_user.is_authenticated:
        return redirect(url_for('notes'))

    login_form = LoginForm()
    register_form = RegisterForm()

    if request.method == 'POST':
        if 'login' in request.form:
            if login_form.validate_on_submit():
                return process_login(login_form)
            else:
                flash('Login failed. Please check your credentials.', 'alert-loginfail')
                print("Login form validation failed.", login_form.errors)
                return render_template('authentication.html', login_form=login_form, register_form=register_form, form_type='login')

        elif 'register' in request.form:
            existing_user = User.query.filter_by(email=register_form.email.data).first()
            if existing_user:
                flash('Email already registered. Please log in or use a different email.', 'alert-registerfail')
                return render_template('authentication.html', login_form=LoginForm(), register_form=register_form, form_type='register')
            
            if register_form.validate_on_submit():
                return register_user(register_form)
            else:
                flash('Registration failed. Please check your input.', 'alert-registerfail')
                print("Register form validation failed.", register_form.errors)
                return render_template('authentication.html', login_form=LoginForm(), register_form=register_form, form_type='register')

    return render_template('authentication.html', login_form=login_form, register_form=register_form)

@app.route('/notes')
@login_required
def notes():
    return render_template('notes.html')

def process_login(form):
    user = User.query.filter_by(email=form.email.data).first()
    if user and check_password_hash(user.password, form.password.data):
        login_user(user, remember=True)
        flash('Login successful!', 'alert-success')
        return redirect(url_for('notes'))
    
def register_user(form):
    hashed_password = generate_password_hash(form.password.data)
    new_user = User(email=form.email.data, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    flash('Account created successfully! Please log in.', 'alert-success')
    return redirect(url_for('authentication'))

@app.route('/logout')
def logout():
    logout_user()
    flash('You have been logged out.', 'alert-success')
    return redirect(url_for('authentication'))

if __name__ == '__main__':
    app.run(debug=True)
