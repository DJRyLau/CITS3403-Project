# app/routes.py
from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify, Response
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from .models import User, Note
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
                return render_template('authentication.html', login_form=login_form, register_form=register_form, form_type='register')
            
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
    return render_template('notes.html', notes=notes, form=form)

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
