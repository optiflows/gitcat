FROM alpine:3.4

ENV GITHUB_APP_KEY ''
ENV GITHUB_APP_SECRET ''

RUN set -ex  && \
    # Dependencies
    apk add --update --no-cache ca-certificates && \
    # Cleaning
    rm -rf /var/cache/apk/*

WORKDIR /home
COPY ./ ./

CMD ./gitcat -port 80

# RUN set -ex  && \
#     # Dependencies
#     apk add --update --no-cache python3  && \
#     apk add --update --no-cache --virtual builds curl py-pip  && \
#     pip3 install --upgrade pip  && \
#     curl -o /etc/ssl/cacert.pem https://curl.haxx.se/ca/cacert.pem  && \
#     # Install Gitcat requirements
#     pip3 install --cert /etc/ssl/cacert.pem -r requirements.txt  && \
#     # Cleaning
#     apk del builds  && \
#     rm -rf /var/cache/apk/* /tmp/* $HOME/.cache

# EXPOSE 80
# ENTRYPOINT [ "python3", "gitcat.py" ]
