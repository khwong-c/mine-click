package server

import (
	"context"
	"encoding/json"
	"log/slog"
	"time"

	"github.com/gorilla/websocket"
	"github.com/juju/errors"
	"golang.org/x/time/rate"
)

const (
	queueSize      = 16
	maxMessageSize = 512

	writeWait    = 10 * time.Second
	pongWait     = 60 * time.Second
	pingInterval = pongWait * 9 / 10
	msgRate      = 10.0
	msgBurst     = int(msgRate) * 2
)

type WSSession struct {
	ctx      context.Context
	wsConn   *websocket.Conn
	server   *Server
	hub      *SessionHub
	logger   *slog.Logger
	wQueue   chan any
	rLimiter *rate.Limiter
}

func (s *Server) NewWSSession(ctx context.Context, wsConn *websocket.Conn) *WSSession {
	newSession := &WSSession{
		ctx:      ctx,
		wsConn:   wsConn,
		server:   s,
		hub:      s.hub,
		logger:   s.logger,
		wQueue:   make(chan any, queueSize),
		rLimiter: rate.NewLimiter(msgRate, msgBurst),
	}
	s.hub.Register(newSession)
	go newSession.writeLoop()
	go newSession.readLoop()
	return newSession
}

func (s *WSSession) SendMsg(data any) {
	s.wQueue <- data
}

func (s *WSSession) writeLoop() {
	pingTicker := time.NewTicker(pingInterval)
	defer func() {
		pingTicker.Stop()
		s.hub.Unregister(s)
		_ = s.wsConn.Close()
	}()
	for {
		select {
		case data, ok := <-s.wQueue:
			if !ok {
				_ = s.wsConn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			var err error
			switch msg := data.(type) {
			case []byte:
				err = s.wsConn.WriteMessage(websocket.TextMessage, msg)
			default:
				err = s.wsConn.WriteJSON(msg)
			}
			if err != nil {
				s.logger.Error(
					"Error on sending message",
					"error", err, "trace", errors.ErrorStack(err),
				)
			}
		case <-pingTicker.C:
			_ = s.wsConn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := s.wsConn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (s *WSSession) readLoop() {
	defer func() {
		s.hub.Unregister(s)
		_ = s.wsConn.Close()
	}()
	s.wsConn.SetReadLimit(maxMessageSize)
	s.wsConn.SetPongHandler(func(string) error {
		return errors.Trace(s.wsConn.SetReadDeadline(time.Now().Add(pongWait)))
	})
	_ = s.wsConn.SetReadDeadline(time.Now().Add(pongWait))
	for {
		_, message, err := s.wsConn.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseNormalClosure) {
				return
			}
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				s.logger.Error("Read Error", "error", err, "trace", errors.ErrorStack(err))
			}
			break
		}

		// Rate Limiter
		if !s.rLimiter.Allow() {
			s.logger.Warn("Request Over-rated")
			continue
		}

		pkt := ReceivePacket{}
		if err := json.Unmarshal(message, &pkt); err != nil {
			s.logger.Warn("Error on unmarshalling message", "error", err, "trace", errors.ErrorStack(err))
			continue
		}
		s.HandleInput(pkt)
	}
}
