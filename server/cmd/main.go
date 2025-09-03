package main

import (
	"os"
	"syscall"

	"github.com/khwong-c/mine-click/server/internal/server"
	"github.com/khwong-c/mine-click/server/internal/tooling/di"
	"github.com/khwong-c/mine-click/server/internal/tooling/log"
)

func main() {
	injector := di.CreateInjector(false)
	svr := di.InvokeOrProvide(injector, server.CreateServer)
	logger := di.InvokeOrProvide(injector, log.SetupLogger).New("main")
	logger.Info("Server created", "addr", svr.Addr)

	svr.Serve()
	err := injector.ShutdownOnSignals(os.Interrupt, os.Kill, syscall.SIGTERM)
	if err != nil {
		logger.Error("Injector shutdown error", "err", err)
		os.Exit(1)
	}
	logger.Info("System shutdown Gracefully")
}
