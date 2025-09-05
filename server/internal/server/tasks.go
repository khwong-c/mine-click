package server

import (
	"time"

	"github.com/juju/errors"
)

type ClickMsg struct {
	Clicks map[string]int `json:"clicks"`
}

func (s *Server) reportClicks() {
	const reportInterval = time.Second
	tick := time.Tick(reportInterval)
	for range tick {
		clicks := &ClickMsg{
			Clicks: s.clickSvc.GetClicks(),
		}
		if err := s.hub.Broadcast(clicks); err != nil {
			s.logger.Error("Failed to broadcast Clicks", "error", err, "trace", errors.ErrorStack(err))
		}
	}
}
