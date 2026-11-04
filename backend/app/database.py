"""
MySQL connection setup (SQLAlchemy).

`Base` is imported by every model in app/models/.
`get_db()` is a FastAPI dependency that yields a session and
always closes it afterwards, even if the request raises.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # avoids "MySQL server has gone away" on idle connections
    pool_recycle=3600,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
