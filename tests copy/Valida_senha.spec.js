// @ts-check
const { test, expect } = require('@playwright/test');
const DatabaseHelper = require('../utils/database');

test('Login, criação de dados e consulta no banco - Email com IdentificadorPremiado fixo', async ({ request }) => {
  // 1. Login (se necessário)
  const loginResponse = await request.post('https://api.payx.firedev.com.br/auth', {
    data: {
      username: '47102615043',
      password: 'PayX!!2025'
    }
  });
  expect(loginResponse.status()).toBe(200);
  const loginBody = await loginResponse.json();
  const tokenAuth = loginBody.token;

  // 2. Solicita token de verificação de email
  const email = 'teste@firedev.com.br';
  const telefone = '11989878760';

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
    throw new Error('Nenhum registro do tipo EMAIL_VERIFICATION encontrado para o email informado.');
  }

  // Usa o registro mais recente
  const registro = registros[0];
  const tokenVerificacao = registro.Token;

  // 3. Validação final com IdentificadorPremiado fixo (email)
  const terceiraResponse = await request.post('https://api.payx.firedev.com.br/public/token/register/verify-email/validate-token', {
    data: {
      token: tokenVerificacao,
      email: email,
      telefone: telefone,
      identificadorPremiado: 'teste@firedev.com.br' // Fixo
    }
  });

  const terceiraBody = await terceiraResponse.json();
  console.log('Resposta da validação:', terceiraBody);

  expect(terceiraResponse.status()).toBe(200);
}); 