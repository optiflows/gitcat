FROM alpine:3.4

ENV GITHUB_APP_KEY ''
ENV GITHUB_APP_SECRET ''
ENV GITHUB_ORGANIZATION ''
ENV GITHUB_ORGANIZATION_MANIFEST ''

WORKDIR /home
COPY ./ ./

RUN set -ex  && \
    # Dependencies
    apk add --update --no-cache jq python3  && \
    apk add --update --no-cache --virtual builds curl py-pip  && \
    pip3 install --upgrade pip  && \
    curl -o /etc/ssl/cacert.pem https://curl.haxx.se/ca/cacert.pem  && \
    # Install Gitcat requirements
    pip3 install --cert /etc/ssl/cacert.pem -r requirements.txt  && \
    chmod +x ./entrypoint.sh  && \
    # Cleaning
    apk del builds  && \
    rm -rf /var/cache/apk/* /tmp/* $HOME/.cache

EXPOSE 80
ENTRYPOINT [ "./entrypoint.sh" ]
