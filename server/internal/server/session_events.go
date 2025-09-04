package server

type ReceivePacket struct {
	Type string `json:"type"`
}

func (s *WSSession) HandleInput(ReceivePacket) {
}
