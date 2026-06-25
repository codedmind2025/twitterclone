# 1. पायथन का नया और स्थिर वर्शन इस्तेमाल करें
FROM python:3.10-slim

# 2. वर्किंग डायरेक्टरी सेट करें
WORKDIR /opt/services/djangoapp/src

# 3. आवश्यकताओं वाली फाइल कॉपी करें और पैकेज इंस्टॉल करें
COPY ./requirements.txt /opt/services/djangoapp/src/
RUN pip install --no-cache-dir -r requirements.txt

# 4. अपने पूरे प्रोजेक्ट का कोड कॉपी करें
COPY . /opt/services/djangoapp/src/

# 5. पोर्ट 8000 को ओपन करें
EXPOSE 8000

# 6. Gunicorn सर्वर चालू करें
CMD ["gunicorn", "--chdir", "TwitterClone", "--bind", "0.0.0.0:8000", "TwitterClone.wsgi:application"]
