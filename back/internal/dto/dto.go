// Package dto define os formatos de resposta da API (camelCase, alinhados ao front).
package dto

// Summary é o resumo gerado pela IA (chaves batem com o mock do front).
type Summary struct {
	Motivo      string `json:"motivo"`
	Pontos      string `json:"pontos"`
	Orientacoes string `json:"orientacoes"`
	Proximos    string `json:"proximos"`
}

type Document struct {
	Name string `json:"name"`
	Type string `json:"type"`
	From string `json:"from"`
}

type Specialty struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Icon string `json:"icon"`
}

type Doctor struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Specialty string  `json:"specialty"`
	CRM       string  `json:"crm"`
	CRMState  string  `json:"crmState"`
	Rating    float64 `json:"rating"`
	Reviews   int     `json:"reviews"`
	Bio       string  `json:"bio"`
	Slots     []string `json:"slots"`
}

type Patient struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	BirthDate string `json:"birthDate"`
	CPF       string `json:"cpf"`
}

type Appointment struct {
	ID         string     `json:"id"`
	DoctorID   string     `json:"doctorId"`
	Date       string     `json:"date"`
	Time       string     `json:"time"`
	Status     string     `json:"status"`
	Reason     string     `json:"reason"`
	HasSummary bool       `json:"hasSummary"`
	HasReport  bool       `json:"hasReport"`
	Summary    *Summary   `json:"summary,omitempty"`
	Documents  []Document `json:"documents"`
}

type Notification struct {
	ID   string `json:"id"`
	Type string `json:"type"`
	Text string `json:"text"`
	Time string `json:"time"`
	Read bool   `json:"read"`
}

// Me é o perfil do usuário autenticado (GET /api/auth/me).
type Me struct {
	ID           string `json:"id"`
	Nome         string `json:"nome"`
	Email        string `json:"email"`
	Role         string `json:"role"`
	Telefone     string `json:"telefone,omitempty"`
	Nascimento   string `json:"nascimento,omitempty"`
	CPF          string `json:"cpf,omitempty"`
	CRM          string `json:"crm,omitempty"`
	CRMState     string `json:"crmState,omitempty"`
	Especialidade string `json:"especialidade,omitempty"`
	Biografia    string `json:"biografia,omitempty"`
}
