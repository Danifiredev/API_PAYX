// @ts-check
import { test, expect } from '@playwright/test';

test('POST login - deve autenticar com sucesso', async ({ request }) => {
  const response = await request.post('https://api.payx.firedev.com.br/auth', {
    data: {
      username: '47102615043',
      password: 'PayX!!2025'
    }
  });

  // Verifica se o status é 200 
  expect(response.status()).toBe(200);

  // (Opcional) Verifica se o corpo da resposta tem algum campo esperado
  const body = await response.json();
  console.log(body);
});

// @ts-check

test('POST - Captura Token', async ({ request }) => {
  const response = await request.post('https://api.payx.firedev.com.br/auth', {
    data: {
      username: '47102615043',
      password: 'PayX!!2025'
    }
  });

  // Verifica se o status é 200 
  expect(response.status()).toBe(200);

  // Captura o corpo da resposta
  const body = await response.json();
  console.log(body);

  // Armazena o token em uma variável
  const token = body.token; // ajuste 'token' para o nome correto do campo retornado pela sua API
  console.log('Token:', token);

  // Agora você pode usar a variável 'token' em outras requisições
});

// @ts-check

test('Login e uso do token em nova requisição', async ({ request }) => {
  // 1. Login e captura do token
  const loginResponse = await request.post('https://api.payx.firedev.com.br/auth', {
    data: {
      username: '47102615043',
      password: 'PayX!!2025'
    }
  });
  expect(loginResponse.status()).toBe(200);
  const loginBody = await loginResponse.json();
  const token = loginBody.token; // ajuste conforme o nome do campo retornado

  // 2. Nova requisição usando o token
  const response = await request.post('https://api.payx.firedev.com.br/public/token/register/verify-phone/request-token', {
    data: {
      email: 'teste@firedev.com.br',
      telefone: '11989878760'
    },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  // Verifica o status da resposta
  expect(response.status()).toBe(200); // ou o status esperado
  const body = await response.json();
  console.log(body);
});










// @ts-check
const DatabaseHelper = require('../utils/database');

test('Login, criação de dados e consulta no banco - Telefone', async ({ request }) => {
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

  // 2. Solicita token de verificação de telefone
  const telefone = '11989878760';
  const email = 'teste@firedev.com.br';

  const response = await request.post('https://api.payx.firedev.com.br/public/token/register/verify-phone/request-token', {
    data: {
      email,
      telefone
    }
  });
  expect(response.status()).toBe(200);

  // Aguarda 5 segundos para garantir que o token foi persistido
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Consulta no banco para pegar o token gerado
  const registros = await DatabaseHelper.buscarTokensRecentesPorIdentificador(telefone);
  console.log('Registros encontrados:', registros);

  // Verifica se encontrou algum registro antes de acessar o primeiro
  if (!registros || registros.length === 0) {
    throw new Error('Nenhum registro encontrado no banco para o telefone informado.');
  }

  // Usa o registro mais recente
  const registro = registros[0];
  const tokenVerificacao = registro.Token;
  const identificadorPremiado = registro.IdentificadorPremiado;

  // 3. Validação final com todos os campos necessários
  const terceiraResponse = await request.post('https://api.payx.firedev.com.br/public/token/register/verify-phone/validate-token', {
    data: {
      token: tokenVerificacao,
      email: email,
      telefone: telefone,
      identificadorPremiado: identificadorPremiado
    }
  });

  const terceiraBody = await terceiraResponse.json();
  console.log('Resposta da validação:', terceiraBody);

  expect(terceiraResponse.status()).toBe(200);
});