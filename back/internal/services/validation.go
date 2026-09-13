package services

import (
	"errors"
	"regexp"
	"strings"
)

var (
	emailRe = regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]+$`)
	cpfRe   = regexp.MustCompile(`^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})$`)
	crmRe   = regexp.MustCompile(`^[A-Za-z]{2}\s?\d{4,7}$`)
)

func ValidateEmail(email string) error {
	if !emailRe.MatchString(strings.TrimSpace(email)) {
		return errors.New("e-mail inválido")
	}
	return nil
}

func ValidateCPF(cpf string) error {
	if !cpfRe.MatchString(strings.TrimSpace(cpf)) {
		return errors.New("CPF inválido (use 000.000.000-00 ou 11 dígitos)")
	}
	return nil
}

func ValidateCRM(crm string) error {
	if !crmRe.MatchString(strings.TrimSpace(crm)) {
		return errors.New("CRM inválido (formato esperado: UF + número, ex.: MG 75410)")
	}
	return nil
}

func ValidatePassword(senha string) error {
	if len(senha) < 6 {
		return errors.New("senha deve ter pelo menos 6 caracteres")
	}
	return nil
}
