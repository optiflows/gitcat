FROM alpine:3.4

WORKDIR /home
COPY ./ ./

RUN set -ex  && \
    # Dependencies
    apk add --update --no-cache bash python3 python3-dev make gcc libc-dev  && \
    python3 -m ensurepip  && \
    pip3 install --upgrade pip  && \
    # Install Gitcat requirements
    pip3 install -r requirements.txt  && \
    # Cleaning
    rm -rf /var/cache/apk/* /tmp/* $HOME/.cache /usr/lib/python*/ensurepip

EXPOSE 80
EXPOSE 8055
ENTRYPOINT [ "python3", "gitcat.py" ]
