FROM golang:1.25-bookworm AS builder
LABEL authors="khwong"

WORKDIR /mod-download
COPY go.mod go.sum ./
RUN go mod download

WORKDIR /app
COPY . .
RUN go build -o mine-click ./cmd/main.go

FROM public.ecr.aws/docker/library/buildpack-deps:bookworm-curl AS production
LABEL authors="khwong"

COPY --from=builder /app/mine-click /app/mine-click

EXPOSE 8086
ENTRYPOINT ["/app/mine-click"]
