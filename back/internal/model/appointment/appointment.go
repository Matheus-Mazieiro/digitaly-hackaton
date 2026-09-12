package appointment

import "time"

type Appointment struct {
	ID         string    `json:"id"`
	Paciente   string    `json:"paciente"`
	Medico     string    `json:"medico"`
	Hora       time.Time `json:"hora"`
	Status     string    `json:"status"`
	Motivo     string    `json:"motivo"`
	Prontuario string    `json:"prontuario"`
	Resumo     string    `json:"resumo"`
	Receita    string    `json:"receita"`
	Link       string    `json:"link"`
}
