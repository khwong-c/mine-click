package server

type ReceivePacket struct {
	Type string `json:"type"`
}

func (s *WSSession) HandleInput(pkt ReceivePacket) {
	switch pkt.Type {
	}
}
