from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    preferences = db.relationship('UserPreferences', backref='user', uselist=False)
    
class UserPreferences(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timezone = db.Column(db.String(100), default='+08:00')
    enable_email_notif = db.Column(db.Boolean, default=False)
    enable_email_notif_reply = db.Column(db.Boolean, default=False)
    enable_email_notif_board = db.Column(db.Boolean, default=False)
    enable_email_notif_own = db.Column(db.Boolean, default=False)
    enable_email_notif_star = db.Column(db.Boolean, default=False)
    privacy = db.Column(db.String(50), default='Private')
    profile_picture = db.Column(db.String(250))
    username = db.Column(db.String(150), default='User')
    light_dark_mode = db.Column(db.Boolean, default=False)
    note_colour = db.Column(db.String(7), default='#7785cc')