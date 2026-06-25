FROM python:3.6

RUN mkdir -p /opt/services/djangoapp/src
WORKDIR /opt/services/djangoapp/src

COPY ./requirements.txt /opt/services/djangoapp/src
RUN pip install -r requirements.txt

COPY . /opt/services/djangoapp/src

EXPOSE 8000

CMD ["gunicorn", "--chdir", "TwitterClone", "--bind", ":8000", "TwitterClone.wsgi:application"]