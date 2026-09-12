# Digitaly Hub — Plano de Implementação (10h, 2 back + 2 front)

Complementa a spec em `docs/superpowers/specs/2026-09-12-teleconsulta-mvp-design.md`.
Cada task tem: o que fazer, "pronto quando", tempo estimado e dependências.

**Trilhas:** BA (back auth/fundação) · BB (back domínio/IA/PDF/WS) · FA (front auth/agendamento/listas) · FB (front chamada/IA/PDFs).

---

## Fase 0 — Setup e contrato (todos, ~45 min)

| ID | Task | Pronto quando | Dono |
|---|---|---|---|
| S0 | Subir estrutura Go completa (pastas `config/model/repositories/services/handlers/ws/routes`), env, `.gitignore`, Makefile | `go build` e `go run` sobem | BA |
| S1 | SQLite + migrations + seeds (7 especialidades, ~6 médicos demo com CRM/UF, senhas hash) | `go run` cria o banco e popula | BA |
| S2 | Cliente `frontend/src/lib/api.js` com todas as rotas do contrato + helpers de auth (Bearer) | chamadas tipadas prontas (ainda sem backend) | FA |
| S3 | Fixtures JSON de contrato (médicos, slots, consultas) para o front construir antes do back | front roda contra fixtures | FA |

> **Regra de ouro:** o contrato da spec (§6) é a interface. Ninguém espera ninguém — front usa fixtures até o endpoint real existir.

---

## Trilha BA — Fundação + Auth (dono: dev 1 back)

| ID | Task | Pronto quando | Tempo | Depende |
|---|---|---|---|---|
| BA1 | Modelos (Paciente, Médico, Consulta, Notificacao) + repositório base CRUD | structs + queries no SQLite | 1h | S1 |
| BA2 | JWT (gerar/validar) + bcrypt + middleware de auth e role | middleware protege rotas | 1h | BA1 |
| BA3 | `mailer` (interface + implementação do provedor) + serviço de código 2FA (gerar, expirar 5min, reenviar) | envia e-mail de verdade; código com expiração | 1h | BA1 |
| BA4 | Validação de formato: CPF, e-mail, CRM (UF+número), senha mínima | funções de validação + testes | 0.5h | BA1 |
| BA5 | Endpoints auth: signup / login / verify / resend / me | fluxo de auth completo via REST | 1.5h | BA2, BA3, BA4 |
| BA6 | Testes unitários (validações, JWT, código 2FA) | `go test ./...` verde | 0.5h | BA5 |

**Entrega crítica:** BA1+BA2 até ~H2 (destrava BB). Após BA6 (~H5), o BA **pega emprestado** de BB: **geração de PDF** (BB5) e **notificações** (BB3).

---

## Trilha BB — Domínio + IA + PDF + WebSocket (dono: dev 2 back)

| ID | Task | Pronto quando | Tempo | Depende |
|---|---|---|---|---|
| BB1 | Especialidades (lista fixa) + médicos (listagem com `rating`/`reviews` derivados) + slots livres por data (template − consultas) | `GET /specialties`, `GET /doctors?specialty=&date=`, `GET /doctors/:id/slots` | 1.5h | BA1 |
| BB2 | Consultas: agendar / confirmar (código e-mail) / start / status / detalhe / listagem por usuário | `POST /appointments` + confirm + start + GETs | 1.5h | BA1, BB1 |
| BB3 | Notificações: criar nos eventos + listar + marcar lida | `GET /notifications` + `PATCH .../read` | 0.75h | BA1 |
| BB4 | Integração OpenAI: `gpt-transcribe` (diarização) + `gpt-4o-mini` (resumo JSON) | `/audio` devolve `{resumo}` real | 1.5h | BB2 |
| BB5 | Geração de PDF: `prontuário.pdf` (do resumo) e `receita.pdf` (do formulário) | endpoints de download retornam PDF | 1.25h | BB4 (prontuário), BB2 |
| BB6 | WebSocket signaling: sala por `appointmentId`, relay de offer/answer/ice, JWT no handshake | dois peers trocam SDP/ICE via WS | 1h | BA2 |
| BB7 | Avaliação: `POST /review` atualiza `avaliacao_soma`/`n_consultas` | rating do médico muda | 0.25h | BB2 |
| BB8 | Testes (disponibilidade, parse resumo) | `go test ./...` verde | 0.5h | BB1, BB4 |

**Marcos BB:** BB1+BB2 até ~H4 (destrava FA). BB6 até ~H5 (destrava FB). BB4+BB5 até ~H6 (destrava resumo/PDFs).

---

## Trilha FA — Auth + Agendamento + Listas (dono: dev 1 front)

| ID | Task | Pronto quando | Tempo | Depende |
|---|---|---|---|---|
| FA1 | Auth store: JWT no contexto, redirect por role, guard de rotas | login persiste sessão | 1h | S2 |
| FA2 | Login/cadastro/2FA reais (campos controlados, loading, erro, reenviar, contador 30s) | fluxo de auth funcional contra API | 1.5h | FA1, BA5 |
| FA3 | Agendamento real (especialidade → data → médico → slots → confirmar → código) | agenda e confirma via API | 2h | FA1, BB1, BB2 |
| FA4 | Consultas/histórico/detalhe reais (listar por status, detalhe com resumo/documentos) | telas leem da API | 1.5h | BB2 |
| FA5 | Notificações reais (listar + marcar lida) | notificações vêm da API | 1h | BB3 |
| FA6 | Avaliação só-estrela (remover campo de texto) | avalia com estrela via API | 0.5h | BB7 |

---

## Trilha FB — Chamada + IA + PDFs (dono: dev 2 front)

| ID | Task | Pronto quando | Tempo | Depende |
|---|---|---|---|---|
| FB1 | WebRTC: `getUserMedia` + `RTCPeerConnection` + cliente de signaling WS (join/offer/answer/ice) | vídeo ao vivo entre 2 abas | 2h | S2, BB6 |
| FB2 | Tela de chamada real: vídeos, controles (mic/cam mute), timer, "Gravando…", MediaRecorder capturando áudio, upload ao encerrar | áudio sobe no `/audio` | 2h | FB1, BB4 |
| FB3 | Formulário de receita (nova tela pós-consulta) → `POST /receita` | gera receita.pdf | 1h | BB5 |
| FB4 | Exibição do resumo (Summary/ConsultaDetail) + botões de download dos 2 PDFs | baixa prontuário.pdf e receita.pdf | 1h | BB4, BB5 |
| FB5 | Avaliação (estrela) + ajustes fim-a-fim no fluxo do médico | fluxo completo fecha | 1.5h | BB7, FB4 |

---

## Fase final — Integração + demo (todos, ~1.5–2h)

| ID | Task | Pronto quando | Dono |
|---|---|---|---|
| F1 | Plugar front no back real (desligar fixtures/mocks), resolver CORS/proxy Vite | app roda contra a API | todos |
| F2 | Rodar o **script de demo (§10 da spec)** e corrigir bugs | fluxo feliz de ponta a ponta | todos |
| F3 | Fallback de rede/vídeo + ensaio da apresentação | demo ensaiada | todos |

---

## Linha do tempo (referência)

```
H0      Fase 0 (setup/contrato)
H0–2    BA1+BA2 (DB + JWT) ──► destrava BB
H2–4    BB1+BB2 (médicos + consultas) ──► destrava FA
H4–5    BB6 (WS signaling) ──► destrava FB
H5–6    BA finaliza auth; BB4 (OpenAI) + BB5 (PDF)
H6–8    FA pluga agendamento/listas; FB pluga vídeo+áudio+resumo
H8–10   F1+F2+F3 (integração + demo)
```

## Rebalanceamento (se algo atrasar)

- **BA termina ~H5** → pega de BB: **PDF (BB5)** e **notificações (BB3)**.
- **FA termina ~H6** → ajuda FB com **resumo/download PDFs (FB4)** e **formulário de receita (FB3)**.
- Se **WebRTC** atrasar (FB1/FB2 é o maior risco): reduzir escopo para **1 aba de teste** e priorizar o pipeline de áudio→resumo (que é o diferencial de IA).

## Riscos no caminho crítico

1. **WebRTC (FB1/FB2)** — maior risco técnico. Mitigação: começar cedo, testar com 2 abas locais.
2. **OpenAI (BB4)** — precisa da API key. Mitigação: mock da resposta JSON do resumo para o FB avançar.
3. **E-mail (BA3)** — precisa credenciais do provedor. Mitigação: interface `mailer` + Mailpit local até ter o provedor.
4. **PDF (BB5)** — usar lib pronta (`gofpdf`/`fpdf`), texto simples, sem layout complexo.
