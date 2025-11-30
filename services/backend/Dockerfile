FROM python:3.10-slim
LABEL "language"="python"
LABEL "framework"="fastapi"
LABEL "build-date"="2025-11-30"
WORKDIR /src
COPY services/backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY services/backend/ ./
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]