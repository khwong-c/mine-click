FROM golang:1.25-alpine AS builder
LABEL authors="khwong"

#RUN apk add build-base

WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o mine-click ./cmd/main.go

FROM alpine/curl AS production
LABEL authors="khwong"

COPY --from=builder /app/mine-click /app/mine-click

EXPOSE 8086
ENTRYPOINT ["/app/mine-click"]
