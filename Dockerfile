# 1. पायथन का स्थिर वर्शन इस्तेमाल करें
FROM python:3.10-slim

# 2. Pillow और psycopg2 के लिए सभी आवश्यक सिस्टम टूल्स इंस्टॉल करें
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    zlib1g-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/*

# 3. वर्किंग डायरेक्टरी सेट करें
WORKDIR /opt/services/djangoapp/src

# 4. आवश्यकताओं वाली फाइल कॉपी करें और पैकेजेस इंस्टॉल करें
COPY ./requirements.txt /opt/services/djangoapp/src/
RUN pip install --no-cache-dir -r requirements.txt

# 5. अपने पूरे प्रोजेक्ट का कोड कॉपी करें
COPY . /opt/services/djangoapp/src/

# 6. पोर्ट 8000 को ओपन करें
EXPOSE 8000

# 7. Gunicorn सर्वर चालू करें
CMD ["gunicorn", "--chdir", "TwitterClone", "--bind", "0.0.0.0:8000", "TwitterClone.wsgi:application"]
