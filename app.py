from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
from dotenv import load_dotenv
load_dotenv()
from models import User, db
from forms import LoginForm, RegisterForm
from flask_wtf.csrf import CSRFProtect


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')
csrf = CSRFProtect(app)

db.init_app(app)
with app.app_context():
        db.create_all()  

@app.route('/', methods=['GET', 'POST'])
def authentication():
    print("Form data:", request.form)  # Debug to show all form data received
    
    if 'user_id' in session:
        return redirect(url_for('notes'))

    login_form = LoginForm()
    register_form = RegisterForm()

    if request.method == 'POST':
        if 'login' in request.form:
            print("Login form submitted.")
            if login_form.validate():
                return login_user(login_form)
            else:
                print("Login form validation failed.", login_form.errors)
                return login_user(login_form)
            

        if 'register' in request.form:
            # Check for existing user before validating form
            existing_user = User.query.filter_by(email=register_form.email.data).first()
            if existing_user:
                flash('Email already registered. Please log in or use a different email.', 'alert-registerfail')
                return render_template('authentication.html', login_form=LoginForm(), register_form=register_form, form_type='register')

            if register_form.validate():
                return register_user(register_form)
            else:
                print("Register form validation failed.", register_form.errors)

    return render_template('authentication.html', login_form=login_form, register_form=register_form, form_type=None)

@app.route('/notes')
def notes():
    if 'user_id' not in session:
        flash('You are not logged in!', 'alert-loginfail')
        return redirect(url_for('authentication'))
    return render_template('notes.html')

def login_user(form):
    user = User.query.filter_by(email=form.email.data).first()
    if user and check_password_hash(user.password, form.password.data):
        session['user_id'] = user.id
        flash('Login successful!', 'alert-success')
        return redirect(url_for('notes'))
    else:
        flash('Invalid email or password.', 'alert-loginfail')
        print("Login failed")
        return render_template('authentication.html', login_form=form, register_form=RegisterForm(), form_type='login')

def register_user(form):
    hashed_password = generate_password_hash(form.password.data, method='pbkdf2:sha256')
    new_user = User(email=form.email.data, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    flash('Account created successfully! Please log in.', 'alert-success')
    return render_template('authentication.html', login_form=LoginForm(), register_form=form, form_type='register')


@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('You have been logged out.', 'alert-success')
    return redirect(url_for('authentication'))

if __name__ == '__main__':
    app.run(debug=True)
    
