package server

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/juju/errors"
	"github.com/samber/do"
	"github.com/unrolled/render"

	"github.com/khwong-c/mine-click/server/internal/config"
	"github.com/khwong-c/mine-click/server/internal/server/middlewares"
	"github.com/khwong-c/mine-click/server/internal/tooling/di"
	"github.com/khwong-c/mine-click/server/internal/tooling/log"
)

type Server struct {
	*http.Server
	injector *do.Injector

	config *config.Config
	logger *slog.Logger
	render *render.Render
}

func (s *Server) Serve() {
	go func() {
		err := s.Server.ListenAndServe()
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			s.logger.Error("Server error", "err", err, "stack", errors.ErrorStack(err))
		}
	}()
}

func (s *Server) Shutdown() error {
	const shutdownDuration = 5 * time.Second
	ctx, cancel := context.WithTimeout(context.Background(), shutdownDuration)
	defer cancel()
	// Stop Listening for new connections.
	if err := s.Server.Shutdown(ctx); err != nil {
		s.logger.Error("Server shutdown error", "err", err)
		return errors.Trace(err)
	}
	return nil
}

func CreateServer(injector *do.Injector) (*Server, error) {
	var err error
	const (
		readTimeout       = 2 * time.Second
		readHeaderTimeout = 1 * time.Second
		writeTimeout      = 10 * time.Second
	)
	cfg := di.InvokeOrProvide(injector, config.LoadConfig)
	server := &Server{
		injector: injector,
		config:   cfg,
		logger:   di.InvokeOrProvide(injector, log.SetupLogger).New("server"),
		render:   render.New(),
		Server: &http.Server{
			Addr:              fmt.Sprintf(":%d", cfg.HTTPPort),
			ReadTimeout:       readTimeout,
			ReadHeaderTimeout: readHeaderTimeout,
			WriteTimeout:      writeTimeout,
		},
	}
	if server.Handler, err = server.createRoute(); err != nil {
		return nil, errors.Trace(err)
	}
	server.logger.Info("Server created", "addr", server.Addr)
	return server, nil
}

func (s *Server) createRoute() (http.Handler, error) { //nolint:unparam
	// TODO: How to specify the server we want? Is it DI / Compile time config?
	r := chi.NewMux()
	r.Use(middlewares.PanicRecovery(s.config, s.render, s.logger.With("panic", true)))
	r.Use(chiMiddleware.Heartbeat("/health"))
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("OK"))
	})

	return r, nil
}
