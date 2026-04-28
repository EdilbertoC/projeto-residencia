# Auditoria de Implementacao e Mapeamento da API

Este documento resume o estado atual da integracao entre o front-end e os endpoints da API.

## Integrado no front

- **Autenticacao**
  - Login com email e senha via Supabase Auth (`/auth/v1/token`).
  - Solicitar reset de senha: tenta `/solicitar-reset-de-senha` e usa `/auth/v1/recover` como fallback.
  - Dados do usuario autenticado: tenta `/informacoes-do-usuario-autenticado` e usa `/auth/v1/user` como fallback.
  - Logout: tenta `/logout`, usa `/auth/v1/logout` como fallback e sempre limpa a sessao local.

- **Pacientes**
  - Listar, criar, atualizar e deletar pacientes via Supabase REST.
  - Criar paciente com validacao via Edge Function quando disponivel.

- **Agendamentos**
  - Listar agendamentos: tenta `GET /agendamentos` e usa Supabase REST `appointments` como fallback.
  - Criar agendamento: tenta `POST /agendamentos` e usa Supabase REST `appointments` como fallback.

- **Laudos Medicos**
  - Listar relatorios: tenta `GET /reports` e usa Supabase REST `reports` como fallback.
  - Criar relatorio: tenta `POST /reports` e usa Supabase REST `reports` como fallback.
  - Atualizar relatorio: tenta `PATCH /reports/{id}`, depois `PATCH /reports`, e usa Supabase REST `reports` como fallback.

- **Medicos / Profissionais**
  - Listar medicos: tenta `GET /listar-medicos` e usa Supabase REST `doctors` como fallback.

- **Mensageria**
  - Enviar SMS: tenta `POST /enviar-sms-via-twilio` e usa Edge Function `send-sms` como fallback.
  - O formulario agora coleta telefone quando o canal selecionado e SMS.

- **Storage**
  - Upload de avatar: tenta `/upload-avatar` e usa Supabase Storage no bucket `avatars` como fallback.
  - A tela de perfil atualiza a imagem exibida apos upload bem-sucedido.

## Ainda sem endpoint consolidado documentado

- Dashboard / Inicio (`HomePage` / `homeRepository.js`).
- Estatisticas e BI (`AnalyticsPage` / `analyticsRepository.js`).
- Prontuarios especificos separados de laudos (`MedicalRecordsPage` / `medicalRecordRepository.js`).
- Consultas isoladas fora de agendamento (`VisitsPage` / `visitRepository.js`).
- Configuracoes gerais do tenant (`SettingsPage` / `settingsRepository.js`).

## Observacoes

- `VITE_API_BASE_URL` define a base dos endpoints nomeados da API. Quando nao informado, o front usa `VITE_SUPABASE_FUNCTIONS_URL`.
- Os reposititorios aceitam formatos de resposta comuns como arrays diretos ou objetos com chaves `data`, `reports`, `agendamentos`, `medicos` etc.
- Os fallbacks existem para manter o front funcional em ambientes onde parte das Edge Functions ainda nao foi publicada.
