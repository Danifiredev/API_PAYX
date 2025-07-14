// @ts-check
const { test, expect } = require('@playwright/test');
const DatabaseHelper = require('../utils/database');

test('Login, criação de dados e consulta no banco - Email', async ({ request }) => {
  // 1. Login
  console.log('--- REQUISIÇÃO 1: LOGIN ---');
  const loginResponse = await request.post('https://api.payx.firedev.com.br/auth', {
    data: {
      username: '47102615043',
      password: 'PayX!!2025'
    }
  });
  expect(loginResponse.status()).toBe(200);
  const loginBody = await loginResponse.json();
  const tokenAuth = loginBody.token;
  console.log('\x1b[32mToken de autenticação gerado no login:', tokenAuth, '\x1b[0m');

  // 2. Solicita token de verificação de email
  const email = 'teste@firedev.com.br';
  const telefone = '11989878760';

  console.log('--- REQUISIÇÃO 2: GERAR TOKEN DE EMAIL ---');
  console.log('Payload:', { email, telefone });
  const response = await request.post('https://api.payx.firedev.com.br/public/token/register/verify-email/request-token', {
    data: {
      email,
      telefone
    }
  });
  expect(response.status()).toBe(200);

  // Aguarda 5 segundos para garantir que o token foi persistido
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Consulta no banco para pegar o token gerado (usando email como IdentificadorPremiado)
  const registros = await DatabaseHelper.buscarTokensRecentesPorIdentificadorETipo(email, 'EMAIL_VERIFICATION');
  console.log('Registros encontrados:', registros);

  // Verifica se encontrou algum registro antes de acessar o primeiro
  if (!registros || registros.length === 0) {
    throw new Error('Nenhum registro do tipo EMAIL_VERIFICATION encontrado para o email informado.');
  }

  // Usa o registro mais recente
  const registro = registros[0];
  const tokenVerificacao = registro.Token;
  const identificadorPremiado = registro.IdentificadorPremiado;

  console.log('--- ETAPA DE CONSULTA NO BANCO ---');
  console.log('Token de verificação encontrado:', tokenVerificacao);
  console.log('IdentificadorPremiado encontrado:', identificadorPremiado);

  // 3. Validação final com todos os campos necessários
  console.log('--- REQUISIÇÃO 3: VALIDAÇÃO FINAL ---');
  console.log('Payload:', {
    token: tokenVerificacao,
    email: email,
    telefone: telefone,
    identificadorPremiado: identificadorPremiado
  });
  const terceiraResponse = await request.post('https://api.payx.firedev.com.br/public/token/register/verify-email/validate-token', {
    data: {
      token: tokenVerificacao,
      email: email,
      telefone: telefone,
      identificadorPremiado: identificadorPremiado
    }
  });

  const terceiraBody = await terceiraResponse.json();

  // Resumo final
  console.log('\n===== RESUMO DO FLUXO =====');
  console.log('\x1b[32mToken de autenticação gerado no login:', tokenAuth, '\x1b[0m');
  console.log('Token de verificação encontrado:', tokenVerificacao);
  console.log('IdentificadorPremiado encontrado:', identificadorPremiado);
  console.log('Payload da validação final:', {
    token: tokenVerificacao,
    email: email,
    telefone: telefone,
    identificadorPremiado: identificadorPremiado
  });
  console.log('Resposta da validação:', terceiraBody);

  expect(terceiraResponse.status()).toBe(200);
});