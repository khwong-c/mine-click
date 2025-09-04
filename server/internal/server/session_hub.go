package server

import (
	"encoding/json"

	"github.com/juju/errors"
)

type SessionHub struct {
	sessions   map[*WSSession]bool
	register   chan *WSSession
	unregister chan *WSSession
	broadcast  chan []byte
}

func NewSessionHub() *SessionHub {
	h := &SessionHub{
		sessions:   make(map[*WSSession]bool),
		register:   make(chan *WSSession),
		unregister: make(chan *WSSession),
		broadcast:  make(chan []byte),
	}
	go h.run()
	return h
}

func (h *SessionHub) Register(s *WSSession) {
	h.register <- s
}

func (h *SessionHub) Unregister(s *WSSession) {
	h.unregister <- s
}

func (h *SessionHub) Broadcast(data any) error {
	raw, err := json.Marshal(data)
	if err != nil {
		return errors.Trace(err)
	}
	h.broadcast <- raw
	return nil
}

func (h *SessionHub) run() {
	for {
		select {
		case session := <-h.register:
			h.sessions[session] = true
		case session := <-h.unregister:
			if h.sessions[session] {
				delete(h.sessions, session)
				close(session.wQueue)
			}
		case message := <-h.broadcast:
			for session := range h.sessions {
				session.SendMsg(message)
			}
		}
	}
}
