const BASE_URL = "be.mine-click.coolpay64.net"
export const API_URL = BASE_URL.startsWith("localhost") ? `http://${BASE_URL}` : `https://${BASE_URL}`;
export const WS_ENDPOINT = BASE_URL.startsWith("localhost") ? `ws://${BASE_URL}/ws` : `wss://${BASE_URL}/ws`;