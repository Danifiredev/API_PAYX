// @ts-check
const { test, expect } = require('@playwright/test');
const DatabaseHelper = require('C:/Users/danie/Desktop/Projetos_API/API_PAYX/utils/database.js'); // Alterado para usar database.js
//test.use({ browserName: 'webkit' }); 

test('Fluxo completo: gera token, usa para novo token/identificador e valida', async ({ request }) => {
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
  console.log('Token de autenticação gerado no login:', tokenAuth);

  // 2. Gera o primeiro token de verificação de email
  const email = 'teste@firedev.com.br';
  const telefone = '11989878760';

  console.log('--- REQUISIÇÃO 2: GERAR PRIMEIRO TOKEN ---');
  console.log('Payload:', { email, telefone });
  const response1 = await request.post('https://api.payx.firedev.com.br/public/token/register/verify-email/request-token', {
    data: { email, telefone }
  });
  expect(response1.status()).toBe(200);

  // Aguarda persistência
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 3. Busca o primeiro token gerado no banco
  const registros1 = await DatabaseHelper.buscarTokensRecentesPorIdentificadorETipo(email, 'EMAIL_VERIFICATION');
  if (!registros1 || registros1.length === 0) throw new Error('Primeiro token não encontrado.');
  const registro1 = registros1[0];
  const token1 = registro1.Token;
  const identificadorPremiado1 = registro1.IdentificadorPremiado;

  // 4. Usa o primeiro token para gerar um novo token e identificador premiado
  console.log('--- REQUISIÇÃO 3: GERAR SEGUNDO TOKEN ---');
  console.log('Payload:', { email, telefone, tokenAnterior: token1 });
  const response2 = await request.post('https://api.payx.firedev.com.br/public/token/register/verify-email/request-token', {
    data: {
      email,
      telefone,
      tokenAnterior: token1
    },
    headers: {
      Authorization: `Bearer ${tokenAuth}`
    }
  });
  expect(response2.status()).toBe(200);

  // Aguarda persistência
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 5. Busca o novo token e identificador premiado no banco
  const registros2 = await DatabaseHelper.buscarTokensRecentesPorIdentificadorETipo(email, 'EMAIL_VERIFICATION');
  if (!registros2 || registros2.length === 0) throw new Error('Segundo token não encontrado.');
  const registro2 = registros2[0];
  const token2 = registro2.Token;
  const identificadorPremiado2 = registro2.IdentificadorPremiado;

  // 6. Validação final usando o novo token e identificador premiado
  console.log('--- REQUISIÇÃO 4: VALIDAÇÃO FINAL ---');
  console.log('Payload:', {
    token: token2,
    email: email,
    telefone: telefone,
    identificadorPremiado: identificadorPremiado2
  });
  const response3 = await request.post('https://api.payx.firedev.com.br/public/token/register/verify-email/validate-token', {
    data: {
      token: token2,
      email: email,
      telefone: telefone,
      identificadorPremiado: identificadorPremiado2
    },
    headers: {
      Authorization: `Bearer ${tokenAuth}`
    }
  });

  const body3 = await response3.json();

  // Resumo final
  console.log('\n===== RESUMO DO FLUXO =====');
  console.log('Token de autenticação gerado no login:', tokenAuth);
  console.log('Primeiro token gerado:', token1);
  console.log('IdentificadorPremiado 1:', identificadorPremiado1);
  console.log('Segundo token gerado:', token2);
  console.log('IdentificadorPremiado 2:', identificadorPremiado2);
  console.log('Payload da validação final:', {
    token: token2,
    email: email,
    telefone: telefone,
    identificadorPremiado: identificadorPremiado2
  });
  console.log('Resposta da validação:', body3);

  expect(response3.status()).toBe(200);
});

