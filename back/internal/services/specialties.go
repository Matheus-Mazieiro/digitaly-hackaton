package services

import "github.com/matheus-mazieiro/digitaly-hackaton/internal/dto"

// specialties é a lista fixa de especialidades (mesma do mock do front).
var specialties = []dto.Specialty{
	{ID: "cardio", Name: "Cardiologia", Icon: "activity"},
	{ID: "derma", Name: "Dermatologia", Icon: "sparkle"},
	{ID: "geral", Name: "Clínica geral", Icon: "shield"},
	{ID: "orto", Name: "Ortopedia", Icon: "activity"},
	{ID: "psiq", Name: "Psiquiatria", Icon: "user"},
	{ID: "pedia", Name: "Pediatria", Icon: "users"},
	{ID: "gineco", Name: "Ginecologia", Icon: "shield"},
}

func GetSpecialties() []dto.Specialty {
	out := make([]dto.Specialty, len(specialties))
	copy(out, specialties)
	return out
}
