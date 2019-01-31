FROM alpine:3.9

WORKDIR /home/
COPY ./gitcat.go /home/go/src/github.com/optiflows/gitcat/gitcat.go
RUN set -ex && \
    export GOPATH=/home/go && \
    cd /home/go/src/github.com/optiflows/gitcat && \
    apk add --update --virtual .build go build-base git && \
    apk add ca-certificates && \
    go get -d -v ./... && \
    go build -ldflags "-s" -a -o /home/gitcat && \
    apk del .build && \
    rm -rf /var/cache/apk/* /home/go

COPY ./logo ./logo
COPY ./webapp ./webapp

ENV GITHUB_APP_KEY ''
ENV GITHUB_APP_SECRET ''
EXPOSE 80
ENTRYPOINT ["/home/gitcat", "-port", "80"]
