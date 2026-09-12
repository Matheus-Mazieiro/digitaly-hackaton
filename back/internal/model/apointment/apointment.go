package apointment

import "time"

type Apointment struct {
	ID         string    `json:"id"`
	Paciente   string    `json:"paciente"`
	Medico     string    `json:"medico"`
	Hora       time.Time `json:"hora"`
	Status     string    `json:"status"`
	Prontuario string    `json:"prontuario"`
	Resumo     string    `json:"resumo"`
	Receita    string    `json:"receita"`
	Link       string    `json:"link"`
	Reason     string    `json:"reason"`
}
