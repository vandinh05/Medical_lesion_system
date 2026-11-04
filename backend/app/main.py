from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.routers import admin as admin_router
from app.routers import auth as auth_router
from app.routers import sessions as sessions_router

app = FastAPI(title="Medical Lesion Detection & VQA System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/storage", StaticFiles(directory=str(settings.STORAGE_DIR)), name="storage")

app.include_router(auth_router.router)
app.include_router(admin_router.router)
app.include_router(sessions_router.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
