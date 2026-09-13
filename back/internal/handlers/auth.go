package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/services"
)

func Signup(w http.ResponseWriter, r *http.Request) {
	var in services.SignupInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "body inválido", http.StatusBadRequest)
		return
	}
	token, err := services.Signup(r.Context(), in)
	if err != nil {
		writeErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"pendingToken": token})
}

func Login(w http.ResponseWriter, r *http.Request) {
	var in services.LoginInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "body inválido", http.StatusBadRequest)
		return
	}
	token, err := services.Login(r.Context(), in)
	if err != nil {
		writeErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"pendingToken": token})
}

func Verify(w http.ResponseWriter, r *http.Request) {
	var in services.VerifyInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "body inválido", http.StatusBadRequest)
		return
	}
	token, role, err := services.Verify(r.Context(), in)
	if err != nil {
		writeErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"token": token, "role": role})
}

func Resend(w http.ResponseWriter, r *http.Request) {
	var in services.ResendInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "body inválido", http.StatusBadRequest)
		return
	}
	if err := services.Resend(r.Context(), in); err != nil {
		writeErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func Me(w http.ResponseWriter, r *http.Request) {
	me, err := services.MeProfile(r.Context())
	if err != nil {
		writeErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, me)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, err error) {
	status := http.StatusInternalServerError
	switch {
	case errors.Is(err, services.ErrValidation):
		status = http.StatusBadRequest
	case errors.Is(err, services.ErrUnauthorized):
		status = http.StatusUnauthorized
	case errors.Is(err, services.ErrConflict):
		status = http.StatusConflict
	}
	http.Error(w, err.Error(), status)
}
