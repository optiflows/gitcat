FROM alpine:3.6

ENV GITHUB_APP_KEY ''
ENV GITHUB_APP_SECRET ''

RUN set -ex  && \
    # Dependencies
    apk add --update --no-cache ca-certificates && \
    # Cleaning
    rm -rf /var/cache/apk/*

WORKDIR /home
COPY ./ ./

EXPOSE 80
CMD ./gitcat -port 80
