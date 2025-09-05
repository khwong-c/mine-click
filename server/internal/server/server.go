package server

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/gorilla/websocket"
	"github.com/juju/errors"
	"github.com/samber/do"
	"github.com/unrolled/render"

	"github.com/khwong-c/mine-click/server/internal/config"
	"github.com/khwong-c/mine-click/server/internal/features/click"
	"github.com/khwong-c/mine-click/server/internal/server/middlewares"
	"github.com/khwong-c/mine-click/server/internal/tooling/di"
	"github.com/khwong-c/mine-click/server/internal/tooling/log"
)

type Server struct {
	*http.Server
	injector *do.Injector

	config     *config.Config
	logger     *slog.Logger
	render     *render.Render
	wsUpgrader *websocket.Upgrader
	hub        *SessionHub

	clickSvc *click.Click
}

func (s *Server) Serve() {
	go s.reportClicks()
	go func() {
		err := s.ListenAndServe()
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			s.logger.Error("Server error", "err", err, "stack", errors.ErrorStack(err))
		}
	}()
}

func (s *Server) Shutdown() error {
	const shutdownDuration = 5 * time.Second
	ctx, cancel := context.WithTimeout(context.Background(), shutdownDuration)
	defer cancel()
	for session := range s.hub.sessions {
		s.hub.Unregister(session)
	}
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
		wsBufferSize      = 1024
	)
	cfg := di.InvokeOrProvide(injector, config.LoadConfig)
	server := &Server{
		injector: injector,
		config:   cfg,
		logger:   di.InvokeOrProvide(injector, log.SetupLogger).New("server"),
		render:   render.New(),
		hub:      NewSessionHub(),
		clickSvc: di.InvokeOrProvide(injector, click.NewClick),
		wsUpgrader: &websocket.Upgrader{
			ReadBufferSize:  wsBufferSize,
			WriteBufferSize: wsBufferSize,
			CheckOrigin: func(*http.Request) bool {
				return true
			},
		},
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
	r := chi.NewMux()
	r.Use(middlewares.PanicRecovery(s.config, s.render, s.logger.With("panic", true)))
	r.Use(chiMiddleware.Heartbeat("/health"))

	r.Get("/clicks", func(w http.ResponseWriter, _ *http.Request) {
		type response struct {
			Clicks map[string]int `json:"clicks"`
		}
		_ = s.render.JSON(w, http.StatusOK, response{
			Clicks: s.clickSvc.GetClicks(),
		})
	})
	r.Post("/click/{type}", func(w http.ResponseWriter, r *http.Request) {
		t := chi.URLParam(r, "type")
		actualTile := s.clickSvc.AddClick(&t)
		_ = s.render.JSON(w, http.StatusOK, newClickResp{Tile: actualTile})
	})

	r.Get("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := s.wsUpgrader.Upgrade(w, r, nil)
		if err != nil {
			s.logger.Error("Failed to upgrade Session", "error", err, "trace", errors.ErrorStack(err))
			return
		}
		s.NewWSSession(r.Context(), conn)
	})

	return r, nil
}
