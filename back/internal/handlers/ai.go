package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

const openaiBase = "https://api.openai.com/v1"

func openaiKey() string {
	return os.Getenv("API_TOKEN")
}

func openaiRequest(method, path string, body any) ([]byte, int, error) {
	var buf io.Reader
	if body != nil {
		raw, err := json.Marshal(body)
		if err != nil {
			return nil, 0, err
		}
		buf = bytes.NewReader(raw)
	}

	req, err := http.NewRequest(method, openaiBase+path, buf)
	if err != nil {
		return nil, 0, err
	}
	req.Header.Set("Authorization", "Bearer "+openaiKey())
	req.Header.Set("Content-Type", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer res.Body.Close()
	data, _ := io.ReadAll(res.Body)
	return data, res.StatusCode, nil
}

/* ============================================================
   POST /api/realtime/session
   Cria um client_secret efêmero para sessão de transcrição
   usando a interface GA da Realtime API.

   IMPORTANTE:
   - Modelo gpt-live-transcribe SUPORTA VAD (turn_detection
     é aplicado por padrão). NÃO enviamos turn_detection.
   - Modelo gpt-realtime-whisper NÃO suporta VAD e retorna
     400 se turn_detection for enviado.
   ============================================================ */
func RealtimeSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if openaiKey() == "" {
		http.Error(w, `{"error":"API_TOKEN não configurado"}`, http.StatusInternalServerError)
		return
	}

	payload := map[string]any{
		"session": map[string]any{
			"type": "transcription",
			"audio": map[string]any{
				"input": map[string]any{
					"format": map[string]any{
						"type": "audio/pcm",
						"rate": 24000,
					},
					"transcription": map[string]any{
						"model":    "gpt-live-transcribe",
						"language": "pt",
					},
					"noise_reduction": map[string]any{
						"type": "near_field",
					},
					// turn_detection OMITIDO de propósito.
					// gpt-live-transcribe usa VAD por padrão.
				},
			},
		},
	}

	data, status, err := openaiRequest(
		http.MethodPost,
		"/realtime/client_secrets",
		payload,
	)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%v"}`, err), http.StatusBadGateway)
		return
	}
	if status >= 400 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		w.Write(data)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

/* ============================================================
   POST /api/ai/insights
   Body: { transcript: [{who, text}], context: {patientName, reason} }
   Retorna: { insights: [{kind, text}] }
   ============================================================ */
type transcriptLine struct {
	Who  string `json:"who"`
	Text string `json:"text"`
}

type insightsRequest struct {
	Transcript []transcriptLine `json:"transcript"`
	Context    map[string]any   `json:"context"`
}

func AIInsights(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if openaiKey() == "" {
		http.Error(w, `{"error":"API_TOKEN não configurado"}`, http.StatusInternalServerError)
		return
	}

	var req insightsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	var transcriptText string
	for _, l := range req.Transcript {
		transcriptText += fmt.Sprintf("%s: %s\n", l.Who, l.Text)
	}

	systemPrompt := `Você é um copiloto clínico. Analise a transcrição parcial de uma teleconsulta e retorne insights úteis para o médico.

Regras:
- Retorne SOMENTE um JSON válido, sem markdown.
- Cada insight tem "kind" (attention | info | suggestion) e "text" (frase curta, direta, em português).
- Máximo de 3 insights por chamada.
- "attention": risco, sintoma preocupante ou inconsistência.
- "info": dado clínico relevante mencionado.
- "suggestion": próximo passo ou pergunta a considerar.
- Nunca invente informação que não está na transcrição.

Formato exato:
{"insights":[{"kind":"attention","text":"..."}]}`

	userPrompt := fmt.Sprintf(
		"Contexto — Paciente: %v, Motivo: %v\n\nTranscrição parcial:\n%s",
		req.Context["patientName"], req.Context["reason"], transcriptText,
	)

	payload := map[string]any{
		"model": "gpt-4o-mini",
		"messages": []map[string]string{
			{"role": "system", "content": systemPrompt},
			{"role": "user", "content": userPrompt},
		},
		"temperature":     0.3,
		"response_format": map[string]string{"type": "json_object"},
	}

	data, status, err := openaiRequest(http.MethodPost, "/chat/completions", payload)
	if err != nil || status >= 400 {
		http.Error(w, "openai error", http.StatusBadGateway)
		return
	}

	var parsed struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.Unmarshal(data, &parsed); err != nil || len(parsed.Choices) == 0 {
		http.Error(w, "parse error", http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(parsed.Choices[0].Message.Content))
}

/* ============================================================
   POST /api/ai/summary
   Body: { transcript: [...], context: {...} }
   Retorna: { motivo, pontos, orientacoes, proximos }
   ============================================================ */
func AISummary(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if openaiKey() == "" {
		http.Error(w, `{"error":"API_TOKEN não configurado"}`, http.StatusInternalServerError)
		return
	}

	var req insightsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	var transcriptText string
	for _, l := range req.Transcript {
		transcriptText += fmt.Sprintf("%s: %s\n", l.Who, l.Text)
	}

	systemPrompt := `Você resume teleconsultas médicas. A partir da transcrição completa, retorne um resumo estruturado em português.

Retorne SOMENTE JSON válido, sem markdown:
{
  "motivo": "motivo principal da consulta em 1 frase",
  "pontos": "principais pontos discutidos, 2-3 frases",
  "orientacoes": "orientações dadas ao paciente, 2-3 frases",
  "proximos": "próximos passos, retorno, exames, 1-2 frases"
}

Nunca invente informação que não está na transcrição. Se algo não foi discutido, escreva "Não informado."`

	userPrompt := fmt.Sprintf(
		"Contexto — Paciente: %v, Motivo: %v\n\nTranscrição completa:\n%s",
		req.Context["patientName"], req.Context["reason"], transcriptText,
	)

	payload := map[string]any{
		"model": "gpt-4o-mini",
		"messages": []map[string]string{
			{"role": "system", "content": systemPrompt},
			{"role": "user", "content": userPrompt},
		},
		"temperature":     0.2,
		"response_format": map[string]string{"type": "json_object"},
	}

	data, status, err := openaiRequest(http.MethodPost, "/chat/completions", payload)
	if err != nil || status >= 400 {
		http.Error(w, "openai error", http.StatusBadGateway)
		return
	}

	var parsed struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.Unmarshal(data, &parsed); err != nil || len(parsed.Choices) == 0 {
		http.Error(w, "parse error", http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(parsed.Choices[0].Message.Content))
}