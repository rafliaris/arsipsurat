# Backend
cd .\backend\
.venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080

# Frontend
cd .\frontend\
npm run dev 