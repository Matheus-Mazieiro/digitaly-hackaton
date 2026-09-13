package services

import "testing"

func TestTemplateSlots(t *testing.T) {
	slots := templateSlots()
	if len(slots) != 18 {
		t.Fatalf("a grade deveria ter 18 slots, veio %d", len(slots))
	}
	if slots[0] != "08:00" {
		t.Errorf("primeiro slot deveria ser 08:00, veio %s", slots[0])
	}
	if slots[len(slots)-1] != "16:30" {
		t.Errorf("último slot deveria ser 16:30, veio %s", slots[len(slots)-1])
	}
}

func TestFreeSlots(t *testing.T) {
	template := []string{"08:00", "08:30", "09:00"}
	booked := []string{"08:30"}

	got := freeSlots(template, booked)
	if len(got) != 2 {
		t.Fatalf("esperava 2 slots livres, veio %v", got)
	}
	if got[0] != "08:00" || got[1] != "09:00" {
		t.Errorf("slots livres errados: %v", got)
	}
}
