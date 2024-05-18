# app/routes.py
from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify, Response, session
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from .models import User, Note, UserPreferences
from .forms import LoginForm, RegisterForm, NoteForm
from . import db, login_manager

app = Blueprint('app', __name__)

@app.route('/', methods=['GET', 'POST'])
def authentication():
    print("Form data:", request.form)  # Debug to show all form data received
    
    if current_user.is_authenticated:
        return redirect(url_for('app.notes'))

    login_form = LoginForm()
    register_form = RegisterForm()

    if request.method == 'POST':
        if 'login' in request.form:
            if login_form.validate_on_submit():
                response = process_login(login_form)
                if response:
                    return response
                else:
                    flash('Login failed. Please check your credentials.', 'alert-loginfail')
            else:
                flash('Login failed. Please check your credentials.', 'alert-loginfail')
            return render_template('authentication.html', login_form=login_form, register_form=register_form, form_type='login')

        elif 'register' in request.form:
            existing_user = User.query.filter_by(email=register_form.email.data).first()
            if existing_user:
                flash('Email already registered. Please log in or use a different email.', 'alert-registerfail')
                return render_template('authentication.html', login_form=LoginForm(), register_form=register_form, form_type='register')
            
            if register_form.validate_on_submit():
                response = register_user(register_form)
                if response:
                    return response
                else:
                    flash('Registration failed. Please check your input.', 'alert-registerfail')
            else:
                flash('Registration failed. Please check your input.', 'alert-registerfail')
            return render_template('authentication.html', login_form=login_form, register_form=register_form, form_type='register')

    return render_template('authentication.html', login_form=login_form, register_form=register_form)


@app.route('/notes', methods=['GET', 'POST'])
@login_required
def notes():
    form = NoteForm()
    if request.method == 'POST' and form.validate_on_submit():
        new_note = Note(content=form.content.data, user_id=current_user.id)
        db.session.add(new_note)
        db.session.commit()
        flash('Note added successfully!', 'alert-success')
        return redirect(url_for('app.notes'))
    notes = Note.query.filter_by(user_id=current_user.id).all()
    
    # Fetch user information for formatting
    notes_with_user_data = [
        {
            'note': note,
            'user_name': note.user.preferences.username if note.user.preferences else note.user.email,
            'user_photo': note.user.preferences.profile_picture if note.user.preferences and note.user.preferences.profile_picture else url_for('static', filename='images/default-avatar.jpg')
        }
        for note in notes
    ]
    
    return render_template('notes.html', notes=notes_with_user_data, form=form)

def process_login(form):
    user = User.query.filter_by(email=form.email.data).first()
    if user and check_password_hash(user.password, form.password.data):
        login_user(user, remember=True)
        flash('Login successful!', 'alert-success')
        return redirect(url_for('app.notes'))
    else:
        return None

def register_user(form):
    hashed_password = generate_password_hash(form.password.data)
    new_user = User(email=form.email.data, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    flash('Account created successfully! Please log in.', 'alert-success')
    return redirect(url_for('app.authentication'))

@app.route('/logout')
def logout():
    logout_user()
    flash('You have been logged out.', 'alert-success')
    return redirect(url_for('app.authentication'))

@login_manager.unauthorized_handler
def unauthorized():
    flash('You must be logged in to view that page.', 'alert-error')
    return redirect(url_for('app.authentication'))

@app.route('/notes/add', methods=['POST'])
@login_required
def add_note():
    content = request.form['content']
    colour = request.form.get('color', '#ffffff')
    if content:
        note = Note(content=content, color=colour, user_id=current_user.id)
        db.session.add(note)
        db.session.commit()
        flash('Note added successfully!', 'alert-success')
    else:
        flash('Note content cannot be empty.', 'alert-error')
    return redirect(url_for('app.notes'))

@app.route('/notes')
@login_required
def get_notes():
    notes = Note.query.filter_by(user_id=current_user.id).all()
    return render_template('notes.html', notes=notes)

@app.route('/notes/delete/<int:note_id>', methods=['POST'])
@login_required
def delete_note(note_id):
    note = Note.query.get_or_404(note_id)
    if note.user_id != current_user.id:
        flash('Permission denied', 'alert-error')
        return redirect(url_for('get_notes'))
    db.session.delete(note)
    db.session.commit()
    flash('Note deleted successfully!', 'alert-success')
    return redirect(url_for('app.notes'))

@app.route('/notes/update/<int:note_id>', methods=['POST'])
@login_required
def update_note_position_and_size(note_id):
    note = Note.query.get(note_id)
    if note is None:
        return Response("Note not found", status=404)
    if note.user_id != current_user.id:
        return Response("Unauthorized", status=403)

    data = request.get_json()
    note.position_x = data.get('position_x', note.position_x)
    note.position_y = data.get('position_y', note.position_y)
    note.width = data.get('width', note.width)
    note.height = data.get('height', note.height)
    db.session.commit()

    return Response("Note updated successfully", status=200)

@app.route('/save_preferences', methods=['POST'])
def save_preferences():
    if not current_user.is_authenticated:
        return jsonify({"message": "User not logged in"}), 401

    try:
        data = request.get_json()
        print("Received data:", data)

        # Validate the JSON payload
        if not data:
            return jsonify({"message": "No data provided"}), 400

        required_fields = [
            'designTheme', 'designBackColor', 'designSideBarColor',
            'timezone', 'enableEmailNotif', 'enableEmailNotifReply', 
            'enableEmailNotifBoard', 'enableEmailNotifOwn', 'enableEmailNotifStar',
            'privacy', 'profilePicture', 'username', 'lightDarkMode', 'noteColour'
        ]
        
        # Check for missing fields
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            print(f"Missing fields: {missing_fields}")
            return jsonify({"message": f"Missing fields: {missing_fields}"}), 400

        user_id = current_user.id
        preferences = UserPreferences.query.filter_by(user_id=user_id).first()

        if not preferences:
            preferences = UserPreferences(user_id=user_id)

        # Assign preferences
        preferences.designTheme = data['designTheme']
        preferences.designBackColor = data['designBackColor']
        preferences.designSideBarColor = data['designSideBarColor']
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
    if not current_user.is_authenticated:
        return jsonify({"message": "User not logged in"}), 401

    user_id = current_user.id
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
        'designTheme': preferences.designTheme,
        'designBackColor': preferences.designBackColor,
        'designSideBarColor': preferences.designSideBarColor,
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
