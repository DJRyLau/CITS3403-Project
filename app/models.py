# app/models.py
from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from . import db

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    preferences = db.relationship('UserPreferences', backref='user', uselist=False)
    notes = db.relationship('Note', backref='user', lazy=True)
    boards = db.relationship('Board', backref='owner', lazy=True)

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    color = db.Column(db.String(7)) 
    position_x = db.Column(db.Integer)
    position_y = db.Column(db.Integer)
    width = db.Column(db.Integer)
    height = db.Column(db.Integer)
    board_id = db.Column(db.Integer, db.ForeignKey('board.id'), nullable=False)

class UserPreferences(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    designTheme = db.Column(db.String(150), default='default')
    designBackColor = db.Column(db.String(7), default='#eeeeee')
    designSideBarColor = db.Column(db.String(7), default='#C8C8C8')
    timezone = db.Column(db.String(100), default='+08:00')
    enable_email_notif = db.Column(db.Boolean, default=False)
    enable_email_notif_reply = db.Column(db.Boolean, default=False)
    enable_email_notif_board = db.Column(db.Boolean, default=False)
    enable_email_notif_own = db.Column(db.Boolean, default=False)
    enable_email_notif_star = db.Column(db.Boolean, default=False)
    privacy = db.Column(db.String(50), default='private')
    profile_picture = db.Column(db.String(250))
    username = db.Column(db.String(150), default='Username')
    light_dark_mode = db.Column(db.Boolean, default=False)
    note_colour = db.Column(db.String(7), default='#7785cc')

class Access(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    board_id = db.Column(db.Integer, db.ForeignKey('board.id'), nullable=False)
    can_edit = db.Column(db.Boolean, default=False)

class Board(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    notes = db.relationship('Note', backref='board', lazy=True)

class Reply(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(1000), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    note_id = db.Column(db.Integer, db.ForeignKey('note.id'), nullable=False)

    user = db.relationship('User', backref='replies')

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'username': self.user.preferences.username if self.user.preferences else 'No Username', 
            'timestamp': self.created_at.strftime('%Y-%m-%d %H:%M:%S'), 
            'note_id': self.note_id
        }
