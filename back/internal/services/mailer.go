package services

import (
	"fmt"
	"log"
	"net/smtp"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/config"
)

// Mailer envia o código de verificação por e-mail.
type Mailer interface {
	SendCode(to, code string) error
}

// NewMailer escolhe SMTP real ou o fallback de log (dev) se SMTP_HOST estiver vazio.
func NewMailer(cfg config.Config) Mailer {
	if cfg.SMTPHost == "" {
		return logMailer{}
	}
	return smtpMailer{cfg: cfg}
}

type smtpMailer struct {
	cfg config.Config
}

func (m smtpMailer) SendCode(to, code string) error {
	subject := "Seu código de verificação — Digitaly Hub"
	body := fmt.Sprintf("Seu código de verificação é: %s\nEle expira em 5 minutos.", code)
	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s", m.cfg.EmailFrom, to, subject, body)

	addr := fmt.Sprintf("%s:%s", m.cfg.SMTPHost, m.cfg.SMTPPort)
	if m.cfg.SMTPUser != "" {
		auth := smtp.PlainAuth("", m.cfg.SMTPUser, m.cfg.SMTPPass, m.cfg.SMTPHost)
		return smtp.SendMail(addr, auth, m.cfg.EmailFrom, []string{to}, []byte(msg))
	}
	return smtp.SendMail(addr, nil, m.cfg.EmailFrom, []string{to}, []byte(msg))
}

// logMailer imprime o código no terminal (desenvolvimento, sem SMTP configurado).
type logMailer struct{}

func (logMailer) SendCode(to, code string) error {
	log.Printf("[MAILER] código de verificação para %s: %s", to, code)
	return nil
}
