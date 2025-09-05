package server

type EventType string

type ReceivePacket struct {
	Type EventType `json:"type"`
	Tile *string   `json:"tile,omitempty"`
}

const (
	EventClick EventType = "click"
)

func (s *WSSession) HandleInput(pkt ReceivePacket) {
	switch pkt.Type {
	case EventClick:
		newTile := s.server.clickSvc.AddClick(pkt.Tile)
		s.SendMsg(newClickResp{Tile: newTile})
	default:
		return
	}
}
