.PHONY: all mod build

all: mod build

mod:
	go mod download

build:
	go build -o mine-click ./cmd/main.go

test:
	go test -v ./... -json | tee test-report.json

lint: mod
	go tool github.com/golangci/golangci-lint/v2/cmd/golangci-lint run ./... --new-from-rev=main
