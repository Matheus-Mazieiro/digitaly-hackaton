package services

import (
	"fmt"
	"log"
	"net/smtp"
	"os"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/config"
)

// Mailer envia o código de verificação por e-mail.
type Mailer interface {
	SendCode(to, code string) error
}

// NewMailer usa SMTP (Gmail) quando houver credenciais; senão, cai no log (dev/teste).
func NewMailer(cfg config.Config) Mailer {
	pass := os.Getenv("MAIL_PASS")
	if cfg.SMTPPass != "" {
		pass = cfg.SMTPPass
	}

	host := cfg.SMTPHost
	if host == "" {
		host = "smtp.gmail.com"
	}
	user := cfg.SMTPUser
	if user == "" {
		user = os.Getenv("MAIL_USER")
	}
	if user == "" {
		user = "sirmmazi@gmail.com"
	}
	port := cfg.SMTPPort
	if port == "" {
		port = "587"
	}

	// Sem senha, não dá pra autenticar no SMTP → log no terminal.
	if pass == "" {
		return logMailer{}
	}
	return smtpMailer{host: host, port: port, user: user, pass: pass, from: user}
}

type smtpMailer struct {
	host, port, user, pass, from string
}

func (m smtpMailer) SendCode(to, code string) error {
	subject := "Seu código de verificação — Digitaly Hub"
	body := fmt.Sprintf("Seu código de verificação é: %s\nEle expira em 5 minutos.", code)
	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s", m.from, to, subject, body)

	auth := smtp.PlainAuth("", m.user, m.pass, m.host)
	return smtp.SendMail(m.host+":"+m.port, auth, m.from, []string{to}, []byte(msg))
}

// logMailer imprime o código no terminal (desenvolvimento/teste, sem SMTP configurado).
type logMailer struct{}

func (logMailer) SendCode(to, code string) error {
	log.Printf("[MAILER] código de verificação para %s: %s", to, code)
	return nil
}
