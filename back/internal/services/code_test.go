package services

import "testing"

func TestGenerateCode(t *testing.T) {
	code, err := generateCode()
	if err != nil {
		t.Fatal(err)
	}
	if len(code) != 6 {
		t.Fatalf("código deve ter 6 dígitos, veio %q", code)
	}
	for _, c := range code {
		if c < '0' || c > '9' {
			t.Fatalf("código não-numérico: %q", code)
		}
	}
}

func TestHashCode(t *testing.T) {
	if hashCode("123456") != hashCode("123456") {
		t.Fatal("mesmo código deve gerar o mesmo hash")
	}
	if hashCode("123456") == hashCode("654321") {
		t.Fatal("códigos diferentes não podem ter o mesmo hash")
	}
}
