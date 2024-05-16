from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
from dotenv import load_dotenv
load_dotenv()
from models import User, UserPreferences, db
from forms import LoginForm, RegisterForm
from flask_wtf.csrf import CSRFProtect, generate_csrf

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')
csrf = CSRFProtect(app)
db.init_app(app)

with app.app_context():
        db.create_all()  

@app.before_request
def before_request():
    # Ensure CSRF token is set in the session for all requests
    if 'csrf_token' not in session:
        session['csrf_token'] = generate_csrf()

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
    hashed_password = generate_password_hash(form.password.data)
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

@app.route('/save_preferences', methods=['POST'])
def save_preferences():
    if 'user_id' not in session:
        return jsonify({"message": "User not logged in"}), 401

    try:
        data = request.get_json()
        print("Received data:", data)

        # Validate the JSON payload
        if not data:
            return jsonify({"message": "No data provided"}), 400

        required_fields = [
            'timezone', 'enableEmailNotif', 'enableEmailNotifReply', 
            'enableEmailNotifBoard', 'enableEmailNotifOwn', 'enableEmailNotifStar',
            'privacy', 'profilePicture', 'username', 'lightDarkMode', 'noteColour'
        ]
        
        # Check for missing fields
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            print(f"Missing fields: {missing_fields}")
            return jsonify({"message": f"Missing fields: {missing_fields}"}), 400

        user_id = session['user_id']
        preferences = UserPreferences.query.filter_by(user_id=user_id).first()

        if not preferences:
            preferences = UserPreferences(user_id=user_id)

        # Assign preferences
        preferences.timezone = data['timezone']
        preferences.enable_email_notif = data['enableEmailNotif']
        preferences.enable_email_notif_reply = data['enableEmailNotifReply']
        preferences.enable_email_notif_board = data['enableEmailNotifBoard']
        preferences.enable_email_notif_own = data['enableEmailNotifOwn']
        preferences.enable_email_notif_star = data['enableEmailNotifStar']
        preferences.privacy = data['privacy']
        preferences.profile_picture = data['profilePicture']
        preferences.username = data['username']
        preferences.light_dark_mode = data['lightDarkMode']
        preferences.note_colour = data['noteColour']

        db.session.add(preferences)
        db.session.commit()
        return jsonify({"message": "Preferences saved successfully"}), 200
    except Exception as e:
        print("Error:", e)  # Debugging
        return jsonify({"message": "Failed to save preferences", "error": str(e)}), 400

@app.route('/get_preferences', methods=['GET'])
def get_preferences():
    if 'user_id' not in session:
        print("User not logged in")

    user_id = session['user_id']
    preferences = UserPreferences.query.filter_by(user_id=user_id).first()
    
    # Create default preferences if not found
    if not preferences:
        preferences = UserPreferences(user_id=user_id)
        db.session.add(preferences)
        db.session.commit()

    # Fix profile picture URL bug
    profile_picture = preferences.profile_picture
    if not profile_picture:
        profile_picture = url_for('static', filename='images/default-avatar.jpg')

    return jsonify({
        'timezone': preferences.timezone,
        'enableEmailNotif': preferences.enable_email_notif,
        'enableEmailNotifReply': preferences.enable_email_notif_reply,
        'enableEmailNotifBoard': preferences.enable_email_notif_board,
        'enableEmailNotifOwn': preferences.enable_email_notif_own,
        'enableEmailNotifStar': preferences.enable_email_notif_star,
        'privacy': preferences.privacy,
        'profilePicture': profile_picture,
        'username': preferences.username,
        'lightDarkMode': preferences.light_dark_mode,
        'noteColour': preferences.note_colour
    }), 200

if __name__ == '__main__':
    app.run(debug=True)