from fastapi import FastAPI
from api.routes import router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Visage AI Ensemble Backend", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v2")

@app.get("/")
def read_root():
    return {"status": "Visage AI Core is running", "version": "2.0"}
