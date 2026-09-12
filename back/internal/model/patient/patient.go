package patient

import "time"

type Patient struct {
	ID         string    `json:"id"`
	Nome       string    `json:"nome"`
	Email      string    `json:"email"`
	Telefone   string    `json:"telefone"`
	Nascimento time.Time `json:"nascimento"`
	CPF        string    `json:"cpf"`
	Senha      string    `json:"senha"`
	Ativo      bool      `json:"ativo"`
}

type PatientFilter struct {
	ID         string `json:"id"`
	Nome       string `json:"nome"`
	Email      string `json:"email"`
	Telefone   string `json:"telefone"`
	Nascimento string `json:"nascimento"`
	CPF        string `json:"cpf"`
	Senha      string `json:"senha"`
}
