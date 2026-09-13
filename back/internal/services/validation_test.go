package services

import "testing"

func TestValidateCPF(t *testing.T) {
	valid := []string{"123.456.789-09", "12345678909"}
	invalid := []string{"", "123", "123.456.789-0", "1234567890", "abc"}

	for _, v := range valid {
		if err := ValidateCPF(v); err != nil {
			t.Errorf("ValidateCPF(%q) deveria ser válido, veio: %v", v, err)
		}
	}
	for _, v := range invalid {
		if err := ValidateCPF(v); err == nil {
			t.Errorf("ValidateCPF(%q) deveria ser inválido", v)
		}
	}
}

func TestValidateCRM(t *testing.T) {
	valid := []string{"MG 75410", "SP112938", "rj 60122"}
	invalid := []string{"", "75410", "MG", "M 75410", "MG 12", "MG12345x"}

	for _, v := range valid {
		if err := ValidateCRM(v); err != nil {
			t.Errorf("ValidateCRM(%q) deveria ser válido, veio: %v", v, err)
		}
	}
	for _, v := range invalid {
		if err := ValidateCRM(v); err == nil {
			t.Errorf("ValidateCRM(%q) deveria ser inválido", v)
		}
	}
}

func TestValidateEmail(t *testing.T) {
	valid := []string{"a@b.com", "x.y+z@domain.com.br"}
	invalid := []string{"", "a@", "a@b", "@b.com", "a b@c.com"}

	for _, v := range valid {
		if err := ValidateEmail(v); err != nil {
			t.Errorf("ValidateEmail(%q) deveria ser válido, veio: %v", v, err)
		}
	}
	for _, v := range invalid {
		if err := ValidateEmail(v); err == nil {
			t.Errorf("ValidateEmail(%q) deveria ser inválido", v)
		}
	}
}

func TestValidatePassword(t *testing.T) {
	if err := ValidatePassword("123456"); err != nil {
		t.Errorf("senha de 6 chars deveria ser válida, veio: %v", err)
	}
	for _, v := range []string{"", "12345"} {
		if err := ValidatePassword(v); err == nil {
			t.Errorf("ValidatePassword(%q) deveria ser inválida", v)
		}
	}
}
