package services

import (
	"context"
	"fmt"
	"time"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/repositories"
)

// templateSlots gera a grade padrão de atendimento (todos os dias, 08:00–16:30, a cada 30 min).
func templateSlots() []string {
	out := make([]string, 0, 18)
	for t := 8 * 60; t <= 16*60+30; t += 30 {
		out = append(out, fmt.Sprintf("%02d:%02d", t/60, t%60))
	}
	return out
}

// freeSlots devolve template − ocupados.
func freeSlots(template, booked []string) []string {
	occupied := make(map[string]bool, len(booked))
	for _, b := range booked {
		occupied[b] = true
	}
	out := make([]string, 0, len(template))
	for _, t := range template {
		if !occupied[t] {
			out = append(out, t)
		}
	}
	return out
}

// GetAvailableSlots devolve os horários LIVRES de um médico numa data.
// Livres = grade padrão (todos os dias) − consultas já marcadas.
func GetAvailableSlots(ctx context.Context, doctorID, date string) ([]string, error) {
	if _, err := time.Parse("2006-01-02", date); err != nil {
		return nil, fmt.Errorf("%w: data inválida (use YYYY-MM-DD)", ErrValidation)
	}
	booked, err := repositories.ListBookedTimes(ctx, doctorID, date)
	if err != nil {
		return nil, err
	}
	return freeSlots(templateSlots(), booked), nil
}
