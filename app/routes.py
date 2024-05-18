# app/routes.py
from flask import Blueprint, render_template, redirect, session, url_for, flash, request, jsonify, Response
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from .models import User, Note, Board, Access
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
        if not user.boards:
            # Create a default board if the user has none
            default_board = Board(title='Default Board', owner=user)
            db.session.add(default_board)
            db.session.commit()
            session['active_board_id'] = default_board.id
        else:
            session['active_board_id'] = user.boards[0].id 
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
    color = request.form.get('color', '#ffffff')
    print("Received note content:", content)  
    print("Received colour:", color) 
    board_id = session.get('active_board_id', None)  # Get the active board ID from session

    if not board_id:
        flash('No active board selected.', 'error')
        return redirect(url_for('app.notes'))

    if content:
        note = Note(content=content, color=color, user_id=current_user.id, board_id=board_id)
        db.session.add(note)
        db.session.commit()
        flash('Note added successfully!', 'success')
    else:
        flash('Note content cannot be empty.', 'error')

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
        return jsonify({"error": "Note not found"}), 404
    if note.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()  
    print("Received update data:", data)  
    note.position_x = data.get('position_x', note.position_x)
    note.position_y = data.get('position_y', note.position_y)
    note.width = data.get('width', note.width)
    note.height = data.get('height', note.height)
    db.session.commit()
    return jsonify({"message": "Note updated successfully"}), 200


@app.route('/boards/list')
@login_required
def list_boards():
    boards = Board.query.filter_by(owner_id=current_user.id).all()
    return render_template('list_boards.html', boards=boards)

@app.route('/boards/switch/<int:board_id>', methods=['POST'])
@login_required
def switch_board(board_id):
    board = Board.query.get_or_404(board_id)
    if board.owner_id != current_user.id:
        return jsonify({'message': 'No Access'}), 403
    session['active_board_id'] = board_id
    return jsonify({'message': 'Board switched successfully'})


@app.route('/boards/share', methods=['POST'])
@login_required
def share_board():
    board_id = request.form.get('board_id')
    username = request.form.get('username')
    board = Board.query.get_or_404(board_id)
    if board.owner_id != current_user.id:
        flash('No Access', 'error')
        return redirect(url_for('board_details', board_id=board_id))

    user = User.query.filter_by(username=username).first()
    if not user:
        flash('User not found', 'error')
        return redirect(url_for('board_details', board_id=board_id))
    
    access = Access.query.filter_by(user_id=user.id, board_id=board_id).first()
    if access:
        db.session.delete(access)
        flash('Access revoked', 'success')
    else:
        new_access = Access(user_id=user.id, board_id=board_id, can_edit=True)
        db.session.add(new_access)
        flash('Access granted', 'success')
    db.session.commit()
    return redirect(url_for('board_details', board_id=board_id))

@app.route('/boards/details/<int:board_id>')
@login_required
def board_details(board_id):
    board = Board.query.get_or_404(board_id)
    if board.owner_id != current_user.id:
        flash('No Access', 'error')
        return redirect(url_for('list_boards'))
    return render_template('board_details.html', board=board)

@app.route('/create_board', methods=['POST'])
@login_required
def create_board():
    title = request.form['title']
    new_board = Board(title=title, owner_id=current_user.id)
    db.session.add(new_board)
    db.session.commit()
    flash('Board created successfully', 'success')
    return redirect(url_for('list_boards'))

@app.route('/debug/notes')
def debug_notes():
    notes = Note.query.all()  # Gets all notes
    notes_data = [{'id': note.id, 'content': note.content, 'board_id': note.board_id} for note in notes]
    return jsonify(notes_data) 