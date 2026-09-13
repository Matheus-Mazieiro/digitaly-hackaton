package services

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/matheus-mazieiro/digitaly-hackaton/internal/auth"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/config"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/dto"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/doctor"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/model/patient"
	"github.com/matheus-mazieiro/digitaly-hackaton/internal/repositories"
)

var (
	ErrValidation   = errors.New("validation")
	ErrUnauthorized = errors.New("unauthorized")
	ErrConflict     = errors.New("conflict")
)

// AuthService orquestra signup/login/2FA/verificação.
type AuthService struct {
	cfg    config.Config
	mailer Mailer
}

var authSvc *AuthService

// InitAuth configura o serviço de auth (chamado no main).
func InitAuth(cfg config.Config) {
	authSvc = &AuthService{cfg: cfg, mailer: NewMailer(cfg)}
}

type SignupInput struct {
	Role          string `json:"role"`
	Nome          string `json:"nome"`
	Email         string `json:"email"`
	Telefone      string `json:"telefone"`
	Nascimento    string `json:"nascimento"` // YYYY-MM-DD
	CPF           string `json:"cpf"`
	Senha         string `json:"senha"`
	CRM           string `json:"crm"`
	Biografia     string `json:"biografia"`
	Especialidade string `json:"especialidade"`
}

type LoginInput struct {
	Email string `json:"email"`
	Senha string `json:"senha"`
}

type VerifyInput struct {
	PendingToken string `json:"pendingToken"`
	Code         string `json:"code"`
}

type ResendInput struct {
	PendingToken string `json:"pendingToken"`
}

func Signup(ctx context.Context, in SignupInput) (string, error) {
	if authSvc == nil {
		return "", errors.New("auth não inicializado")
	}
	return authSvc.Signup(ctx, in)
}

func Login(ctx context.Context, in LoginInput) (string, error) {
	if authSvc == nil {
		return "", errors.New("auth não inicializado")
	}
	return authSvc.Login(ctx, in)
}

func Verify(ctx context.Context, in VerifyInput) (token, role string, err error) {
	if authSvc == nil {
		return "", "", errors.New("auth não inicializado")
	}
	return authSvc.Verify(ctx, in)
}

func Resend(ctx context.Context, in ResendInput) error {
	if authSvc == nil {
		return errors.New("auth não inicializado")
	}
	return authSvc.Resend(ctx, in)
}

func MeProfile(ctx context.Context) (dto.Me, error) {
	if authSvc == nil {
		return dto.Me{}, errors.New("auth não inicializado")
	}
	return authSvc.MeProfile(ctx)
}

func (s *AuthService) Signup(ctx context.Context, in SignupInput) (string, error) {
	if strings.TrimSpace(in.Nome) == "" {
		return "", fmt.Errorf("%w: nome é obrigatório", ErrValidation)
	}
	if strings.TrimSpace(in.Telefone) == "" {
		return "", fmt.Errorf("%w: telefone é obrigatório", ErrValidation)
	}
	if err := ValidateEmail(in.Email); err != nil {
		return "", fmt.Errorf("%w: %v", ErrValidation, err)
	}
	if err := ValidateCPF(in.CPF); err != nil {
		return "", fmt.Errorf("%w: %v", ErrValidation, err)
	}
	if err := ValidatePassword(in.Senha); err != nil {
		return "", fmt.Errorf("%w: %v", ErrValidation, err)
	}
	birth, err := time.Parse("2006-01-02", in.Nascimento)
	if err != nil {
		return "", fmt.Errorf("%w: nascimento deve estar em YYYY-MM-DD", ErrValidation)
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(in.Senha), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	switch in.Role {
	case "doctor":
		if err := ValidateCRM(in.CRM); err != nil {
			return "", fmt.Errorf("%w: %v", ErrValidation, err)
		}
		if strings.TrimSpace(in.Especialidade) == "" {
			return "", fmt.Errorf("%w: especialidade é obrigatória para médicos", ErrValidation)
		}
		id, err := repositories.CreateDoctor(ctx, doctor.Doctor{
			Nome: in.Nome, Email: in.Email, Telefone: in.Telefone, Nascimento: birth,
			CPF: in.CPF, CRM: in.CRM, Biografia: in.Biografia, Especialidade: in.Especialidade,
			Senha: string(hash),
		})
		if errors.Is(err, repositories.ErrDuplicate) {
			return "", fmt.Errorf("%w: e-mail ou CPF já cadastrado", ErrConflict)
		}
		if err != nil {
			return "", err
		}
		return s.issueCode(ctx, id, "doctor", "signup", in.Email)
	case "patient":
		id, err := repositories.CreatePatient(ctx, patient.Patient{
			Nome: in.Nome, Email: in.Email, Telefone: in.Telefone, Nascimento: birth,
			CPF: in.CPF, Senha: string(hash),
		})
		if errors.Is(err, repositories.ErrDuplicate) {
			return "", fmt.Errorf("%w: e-mail ou CPF já cadastrado", ErrConflict)
		}
		if err != nil {
			return "", err
		}
		return s.issueCode(ctx, id, "patient", "signup", in.Email)
	default:
		return "", fmt.Errorf("%w: role deve ser 'patient' ou 'doctor'", ErrValidation)
	}
}

func (s *AuthService) Login(ctx context.Context, in LoginInput) (string, error) {
	d, err := repositories.GetDoctorByEmail(ctx, in.Email)
	if err == nil {
		if bcrypt.CompareHashAndPassword([]byte(d.Senha), []byte(in.Senha)) != nil {
			return "", fmt.Errorf("%w: credenciais inválidas", ErrUnauthorized)
		}
		if !d.Ativo {
			return "", fmt.Errorf("%w: conta ainda não verificada", ErrUnauthorized)
		}
		return s.issueCode(ctx, d.ID, "doctor", "login", in.Email)
	}
	if !errors.Is(err, repositories.ErrNotFound) {
		return "", err
	}

	p, err := repositories.GetPatientByEmail(ctx, in.Email)
	if err == nil {
		if bcrypt.CompareHashAndPassword([]byte(p.Senha), []byte(in.Senha)) != nil {
			return "", fmt.Errorf("%w: credenciais inválidas", ErrUnauthorized)
		}
		if !p.Ativo {
			return "", fmt.Errorf("%w: conta ainda não verificada", ErrUnauthorized)
		}
		return s.issueCode(ctx, p.ID, "patient", "login", in.Email)
	}
	if !errors.Is(err, repositories.ErrNotFound) {
		return "", err
	}
	return "", fmt.Errorf("%w: credenciais inválidas", ErrUnauthorized)
}

func (s *AuthService) issueCode(ctx context.Context, userID, role, kind, email string) (string, error) {
	code, err := generateCode()
	if err != nil {
		return "", err
	}
	token, err := generateToken()
	if err != nil {
		return "", err
	}

	// Envia primeiro: se falhar, nada é persistido.
	if err := s.mailer.SendCode(email, code); err != nil {
		return "", fmt.Errorf("não foi possível enviar o código de verificação: %v", err)
	}
	if err := repositories.CreateVerification(ctx, repositories.Verification{
		Token:     token,
		CodeHash:  hashCode(code),
		Kind:      kind,
		Role:      role,
		UserID:    userID,
		Email:     email,
		ExpiresAt: time.Now().Add(5 * time.Minute),
	}); err != nil {
		return "", err
	}
	return token, nil
}

func (s *AuthService) Verify(ctx context.Context, in VerifyInput) (string, string, error) {
	v, err := repositories.GetVerification(ctx, in.PendingToken)
	if err != nil {
		return "", "", fmt.Errorf("%w: código inválido ou expirado", ErrValidation)
	}
	if time.Now().After(v.ExpiresAt) {
		_ = repositories.DeleteVerification(ctx, v.Token)
		return "", "", fmt.Errorf("%w: código expirado", ErrValidation)
	}
	if v.CodeHash != hashCode(in.Code) {
		return "", "", fmt.Errorf("%w: código inválido", ErrValidation)
	}

	if v.Kind == "signup" {
		if v.Role == "doctor" {
			if err := repositories.ActivateDoctor(ctx, v.UserID); err != nil {
				return "", "", err
			}
		} else {
			if err := repositories.ActivatePatient(ctx, v.UserID); err != nil {
				return "", "", err
			}
		}
	}
	_ = repositories.DeleteVerification(ctx, v.Token)

	token, err := auth.GenerateToken(v.UserID, v.Role, s.cfg.JWTSecret)
	if err != nil {
		return "", "", err
	}
	return token, v.Role, nil
}

func (s *AuthService) Resend(ctx context.Context, in ResendInput) error {
	v, err := repositories.GetVerification(ctx, in.PendingToken)
	if err != nil || time.Now().After(v.ExpiresAt) {
		return fmt.Errorf("%w: token inválido ou expirado", ErrValidation)
	}
	code, err := generateCode()
	if err != nil {
		return err
	}
	if err := s.mailer.SendCode(v.Email, code); err != nil {
		return fmt.Errorf("não foi possível reenviar o código: %v", err)
	}
	return repositories.UpdateVerificationCode(ctx, v.Token, hashCode(code), time.Now().Add(5*time.Minute))
}

func (s *AuthService) MeProfile(ctx context.Context) (dto.Me, error) {
	id := auth.UserID(ctx)
	switch auth.Role(ctx) {
	case "doctor":
		d, err := repositories.GetDoctorByID(ctx, id)
		if err != nil {
			return dto.Me{}, err
		}
		crm, uf := d.CRM, ""
		if i := strings.Index(d.CRM, " "); i >= 0 {
			uf, crm = d.CRM[:i], strings.TrimSpace(d.CRM[i+1:])
		}
		return dto.Me{
			ID: d.ID, Nome: d.Nome, Email: d.Email, Role: "doctor",
			Telefone: d.Telefone, Nascimento: d.Nascimento.Format("2006-01-02"), CPF: d.CPF,
			CRM: crm, CRMState: uf, Especialidade: d.Especialidade, Biografia: d.Biografia,
		}, nil
	case "patient":
		p, err := repositories.GetPatientByID(ctx, id)
		if err != nil {
			return dto.Me{}, err
		}
		return dto.Me{
			ID: p.ID, Nome: p.Nome, Email: p.Email, Role: "patient",
			Telefone: p.Telefone, Nascimento: p.Nascimento.Format("2006-01-02"), CPF: p.CPF,
		}, nil
	default:
		return dto.Me{}, fmt.Errorf("%w: role desconhecida", ErrUnauthorized)
	}
}

// sendCode envia um código por e-mail usando o mailer configurado (ou log fallback).
func sendCode(to, code string) error {
	if authSvc == nil || authSvc.mailer == nil {
		return errors.New("auth não inicializado")
	}
	return authSvc.mailer.SendCode(to, code)
}
