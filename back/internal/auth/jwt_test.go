package auth

import "testing"

func TestGenerateAndParseToken(t *testing.T) {
	tok, err := GenerateToken("u1", "patient", "secret")
	if err != nil {
		t.Fatal(err)
	}
	claims, err := ParseToken(tok, "secret")
	if err != nil {
		t.Fatal(err)
	}
	if claims.UserID != "u1" || claims.Role != "patient" {
		t.Fatalf("claims inesperadas: %+v", claims)
	}
}

func TestParseTokenWrongSecret(t *testing.T) {
	tok, _ := GenerateToken("u1", "patient", "secret")
	if _, err := ParseToken(tok, "wrong"); err == nil {
		t.Fatal("token com secret errada deveria falhar")
	}
}

func TestParseTokenGarbage(t *testing.T) {
	if _, err := ParseToken("not-a-jwt", "secret"); err == nil {
		t.Fatal("token inválido deveria falhar")
	}
}
