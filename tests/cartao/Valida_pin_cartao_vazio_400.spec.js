// @ts-check
const { test, expect } = require('@playwright/test');
const DatabaseHelper = require('C:/Users/danie/Desktop/Projetos_API/API_PAYX/utils/database.js');

test.use({ browserName: 'webkit' });

test('Validação de email com IdentificadorPremiado vazio', async ({ request }) => {
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

  if (!registros || registros.length === 0) {
    throw new Error(`Nenhum registro encontrado para o email: ${email}`);
  }

  // 3. Valida o token gerado
  const tokenGerado = registros[0].Token;
  console.log('Token gerado encontrado:', tokenGerado);

  // 4. Valida o token na API com identificadorPremiado vazio
  const validationResponse = await request.post('https://api.payx.firedev.com.br/public/token/register/verify-email/validate-token', {
    data: {
      email,
      telefone,
      token: tokenGerado,
      identificadorPremiado: '' // IdentificadorPremiado vazio
    }
  });

  // Exibe o status retornado pela API
  console.log('Status retornado pela API na validação do token:', validationResponse.status());

  const responseBody = await validationResponse.json();
  console.log('Resposta da API:', responseBody);

  expect(validationResponse.status()).toBe(400);

  // Validação da mensagem de erro
  expect((responseBody.description || '')).toMatch(/identificador.*inválido|obrigatório|vazio/i);

  console.log('Teste concluído - IdentificadorPremiado vazio retornou erro 400 como esperado');
});