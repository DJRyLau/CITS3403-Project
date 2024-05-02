from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
from dotenv import load_dotenv
load_dotenv()
from models import User, db
from forms import LoginForm, RegisterForm

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')
db.init_app(app)
with app.app_context():
        db.create_all()  

@app.route('/', methods=['GET', 'POST'])
def authentication():
    if 'user_id' in session:
        return redirect(url_for('notes'))

    login_form = LoginForm()
    register_form = RegisterForm()

    if login_form.validate_on_submit() and 'login' in request.form:
        return login_user(login_form)

    if register_form.validate_on_submit() and 'register' in request.form:
        return register_user(register_form)

    return render_template('authentication.html', login_form=login_form, register_form=register_form)


@app.route('/notes')
def notes():
    if 'user_id' not in session:
        flash('You are not logged in!')
        return redirect(url_for('authentication'))
    return render_template('notes.html')

def login_user(form):
    user = User.query.filter_by(email=form.email.data).first()
    if user and check_password_hash(user.password, form.password.data):
        session['user_id'] = user.id
        flash('Login successful!')
        return redirect(url_for('notes'))
    else:
        flash('Invalid email or password.')
        return redirect(url_for('authentication'))

def register_user(form):
    hashed_password = generate_password_hash(form.password.data, method='pbkdf2:sha256')
    new_user = User(email=form.email.data, password=hashed_password)
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
    
