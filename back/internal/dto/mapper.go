package dto

import (
	"encoding/json"
	"math"
	"strings"
	"time"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/appointment"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/doctor"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/notification"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/patient"
)

func round2(x float64) float64 { return math.Round(x*100) / 100 }

// splitCRM separa "UF 123456" em (número, UF). Sem espaço, devolve número e UF vazia.
func splitCRM(crm string) (num, uf string) {
	crm = strings.TrimSpace(crm)
	if i := strings.Index(crm, " "); i >= 0 {
		return strings.TrimSpace(crm[i+1:]), strings.TrimSpace(crm[:i])
	}
	return crm, ""
}

func DoctorFromEntity(d doctor.Doctor) Doctor {
	rating := 0.0
	if d.NConsultas > 0 {
		rating = round2(float64(d.AvaliacaoSoma) / float64(d.NConsultas))
	}
	crm, uf := splitCRM(d.CRM)
	return Doctor{
		ID:        d.ID,
		Name:      d.Nome,
		Specialty: d.Especialidade,
		CRM:       crm,
		CRMState:  uf,
		Rating:    rating,
		Reviews:   d.NConsultas,
		Bio:       d.Biografia,
	}
}

func PatientFromEntity(p patient.Patient) Patient {
	return Patient{
		ID:        p.ID,
		Name:      p.Nome,
		Email:     p.Email,
		Phone:     p.Telefone,
		BirthDate: p.Nascimento.Format("2006-01-02"),
		CPF:       p.CPF,
	}
}

func AppointmentFromEntity(a appointment.Appointment) Appointment {
	out := Appointment{
		ID:         a.ID,
		DoctorID:   a.Medico,
		Date:       a.Hora.Format("2006-01-02"),
		Time:       a.Hora.Format("15:04"),
		Status:     a.Status,
		Reason:     a.Motivo,
		HasSummary: a.Resumo != "",
		Documents:  []Document{},
	}

	if a.Resumo != "" {
		var s Summary
		if err := json.Unmarshal([]byte(a.Resumo), &s); err == nil {
			out.Summary = &s
		}
	}

	docs := []Document{}
	if a.Prontuario != "" {
		docs = append(docs, Document{Name: "Prontuário da consulta", Type: "Prontuário", From: "Médico"})
	}
	if a.Receita != "" {
		docs = append(docs, Document{Name: "Receita", Type: "Receita", From: "Médico"})
	}
	out.Documents = docs
	out.HasReport = len(docs) > 0
	return out
}

func NotificationFromEntity(n notification.Notification) Notification {
	return Notification{
		ID:   n.ID,
		Type: n.Tipo,
		Text: n.Msg,
		Time: n.Data.Format(time.RFC3339),
		Read: n.Lida,
	}
}
