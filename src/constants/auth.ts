export const COOKIE_ONBOARDING_IN_PROGRESS = "onboarding_in_progress";

export const AUTH_ERROR_MESSAGES_PT: Record<string, string> = {
  // Rate limits
  over_email_send_rate_limit: "Aguarde um minuto antes de tentar novamente.",
  over_request_rate_limit:
    "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  over_sms_send_rate_limit:
    "Muitas mensagens enviadas. Aguarde um momento antes de tentar novamente.",

  // OTP / Magic link
  otp_expired: "O link expirou. Solicite um novo link de acesso.",
  otp_disabled:
    "Login por email está desativado. Entre em contato com o suporte.",

  // Email
  email_not_confirmed:
    "Confirme seu email antes de fazer login. Verifique sua caixa de entrada.",
  email_exists:
    "Este email já está cadastrado. Faça login ou recupere sua senha.",
  email_address_invalid: "Endereço de email inválido.",
  email_address_not_authorized:
    "Não foi possível enviar o email. Configure o SMTP do projeto ou use outro email.",

  // User
  user_already_exists: "Já existe uma conta com este email.",
  user_not_found: "Usuário não encontrado.",
  user_banned: "Esta conta foi suspensa. Entre em contato com o suporte.",

  // OAuth
  provider_disabled: "Login com este provedor está desativado.",
  oauth_provider_not_supported: "Provedor de login não suportado.",
  provider_email_needs_verification:
    "Verifique seu email antes de continuar. Enviamos um link de confirmação.",

  // Session / Token
  invalid_credentials: "Credenciais inválidas. Tente novamente.",
  session_expired: "Sua sessão expirou. Faça login novamente.",
  session_not_found: "Sessão não encontrada. Faça login novamente.",
  flow_state_expired: "O link expirou. Solicite um novo.",
  flow_state_not_found: "Link inválido ou já utilizado. Solicite um novo.",

  // Signup
  signup_disabled: "Cadastros estão desativados no momento.",
  email_provider_disabled: "Cadastro por email está desativado.",

  // Generic
  unexpected_failure: "Ocorreu um erro inesperado. Tente novamente.",
  validation_failed: "Dados inválidos. Verifique e tente novamente.",
};
