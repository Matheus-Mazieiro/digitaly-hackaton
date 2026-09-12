package patient

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	model "github.com/matheus-mazieiro/digitaly-hackaton/internal/model/patient"
)

func GetPatients(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	nome := query.Get("nome")
	email := query.Get("email")
	cpf := query.Get("cpf")

	fmt.Println(nome, email, cpf)

	// passar filtros para o repository
	p := model.Patient{
		Nome:       nome,
		Email:      email,
		Telefone:   "",
		Nascimento: time.Now(),
		CPF:        cpf,
	}

	msg, err := json.Marshal(p)
	if err != nil {
		fmt.Println("got err")
	}
	w.Write(msg)
}
