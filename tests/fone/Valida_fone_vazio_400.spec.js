// @ts-check
const { test, expect } = require('@playwright/test');

test('Solicitar token de verificação de telefone com telefone vazio', async ({ request }) => {
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

  // 2. Solicita token de verificação de telefone com telefone vazio
  const telefone = ''; // Telefone vazio
  const email = 'teste@firedev.com.br';

  console.log('--- REQUISIÇÃO 2: GERAR TOKEN DE TELEFONE COM TELEFONE VAZIO ---');
  console.log('Payload:', { email, telefone });
  const response = await request.post('https://api.payx.firedev.com.br/public/token/register/verify-phone/request-token', {
    data: {
      email,
      telefone
    }
  });

  // Espera-se que a API retorne erro 400
  expect(response.status()).toBe(400);

  const responseBody = await response.json();
  console.log('Resposta da API:', responseBody);

  // Validação da mensagem de erro no campo correto
  expect(responseBody.description || '').toMatch(/fone|telefone.*inválido|obrigatório|vazio/i);
});