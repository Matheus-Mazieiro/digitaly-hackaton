// Package ws implementará o signaling WebRTC (task BB6 do plano).
// Por ora é apenas um stub para deixar a rota documentada.
package ws

import "net/http"

// SignalHandler é o endpoint de signaling. Será implementado na BB6.
func SignalHandler(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "signaling WebRTC ainda não implementado", http.StatusNotImplemented)
}
