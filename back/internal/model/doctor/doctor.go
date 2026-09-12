package doctor

import "time"

type Doctor struct {
	ID            string    `json:"id"`
	Nome          string    `json:"nome"`
	Email         string    `json:"email"`
	Telefone      string    `json:"telefone"`
	Nascimento    time.Time `json:"nascimento"`
	CPF           string    `json:"cpf"`
	CRM           string    `json:"crm"`
	Biografia     string    `json:"biografia"`
	AvaliacaoSoma int       `json:"avaliacao_soma"`
	NConsultas    int       `json:"n_consultas"`
	Especialidade string    `json:"especialidade"`
	Senha         string    `json:"senha"`
}

type DoctorFilter struct {
	ID            string `json:"id"`
	Nome          string `json:"nome"`
	Email         string `json:"email"`
	Telefone      string `json:"telefone"`
	Nascimento    string `json:"nascimento"`
	CPF           string `json:"cpf"`
	CRM           string `json:"crm"`
	Biografia     string `json:"biografia"`
	AvaliacaoSoma string `json:"avaliacao_soma"`
	NConsultas    string `json:"n_consultas"`
	Especialidade string `json:"especialidade"`
	Senha         string `json:"senha"`
}
