from fastapi import FastAPI

app = FastAPI(title="${{ values.name }}")


@app.get("/")
def read_root():
    return {"service": "${{ values.name }}", "status": "ok"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
