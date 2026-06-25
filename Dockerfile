FROM python:3.10-slim

# PostgreSQL के ज़रूरी टूल्स इन्स्टॉल करने के लिए ये दो लाइनें जोड़ें
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/services/djangoapp/src

COPY ./requirements.txt /opt/services/djangoapp/src/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /opt/services/djangoapp/src/

EXPOSE 8000

CMD ["gunicorn", "--chdir", "TwitterClone", "--bind", "0.0.0.0:8000", "TwitterClone.wsgi:application"]

