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
