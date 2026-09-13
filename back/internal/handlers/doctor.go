package handlers

import (
	"net/http"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/doctor"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/services"
)

func GetDoctors(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	filter := doctor.DoctorFilter{
		ID:            q.Get("id"),
		Nome:          q.Get("name"),
		Email:         q.Get("email"),
		Telefone:      q.Get("phone"),
		Nascimento:    q.Get("birthDate"),
		CPF:           q.Get("cpf"),
		CRM:           q.Get("crm"),
		Biografia:     q.Get("bio"),
		Especialidade: q.Get("specialty"),
	}

	doctors, err := services.GetDoctors(r.Context(), filter)
	if err != nil {
		writeErr(w, err)
		return
	}

	// Se "date" for informado, preenche os horários livres de cada médico.
	if date := q.Get("date"); date != "" {
		for i := range doctors {
			slots, err := services.GetAvailableSlots(r.Context(), doctors[i].ID, date)
			if err != nil {
				writeErr(w, err)
				return
			}
			doctors[i].Slots = slots
		}
	}

	writeJSON(w, http.StatusOK, doctors)
}

func GetDoctorSlots(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	date := r.URL.Query().Get("date")

	slots, err := services.GetAvailableSlots(r.Context(), id, date)
	if err != nil {
		writeErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, slots)
}
