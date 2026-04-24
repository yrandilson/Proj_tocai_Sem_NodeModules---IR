<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# ?? Relat�rio Completo: Conceitos de Testes Automatizados

## �ndice
1. [Introdu��o aos Testes](#1-introdu��o-aos-testes)
2. [Ferramentas e Bibliotecas](#2-ferramentas-e-bibliotecas)
3. [Estrutura de Testes](#3-estrutura-de-testes)
4. [Conceitos Fundamentais](#4-conceitos-fundamentais)
5. [Padr�es e Boas Pr�ticas](#5-padr�es-e-boas-pr�ticas)
6. [Configura��o do Ambiente](#6-configura��o-do-ambiente)
7. [Casos de Uso Pr�ticos](#7-casos-de-uso-pr�ticos)
8. [Resolu��o de Problemas](#8-resolu��o-de-problemas)

---

## 1. Introdu��o aos Testes

### 1.1 O que s�o Testes Automatizados?

**Defini��o:** Testes automatizados s�o scripts de c�digo que verificam se o software funciona conforme o esperado, executando cen�rios pr�-definidos e validando os resultados.

**Benef�cios:**
- ??? **Confiabilidade:** Detecta bugs antes de chegarem � produ��o
- ? **Velocidade:** Executa centenas de testes em segundos
- ?? **Documenta��o:** Os testes servem como documenta��o viva do c�digo
- ?? **Refatora��o Segura:** Permite modificar c�digo com confian�a
- ?? **Economia:** Reduz custos de manuten��o e corre��o de bugs

### 1.2 Pir�mide de Testes

```
        /\
       /  \      E2E (End-to-End) - Poucos e lentos
      /____\     
     /      \    Integration - Quantidade m�dia
    /________\   
   /          \  Unit - Muitos e r�pidos
  /____________\ 
```

**Nosso projeto implementa:**
- ? **Testes de Unidade:** `item.service.test.ts` (testam servi�os isoladamente)
- ? **Testes de Integra��o:** `item.test.ts`, `proposal.test.ts` (testam API completa)
- ? **Testes E2E:** `user.test.ts` (testam fluxo completo do usu�rio)

---

## 2. Ferramentas e Bibliotecas

### 2.1 Jest - Framework de Testes

**O que �:** Jest � um framework de testes JavaScript criado pelo Facebook, otimizado para simplicidade e velocidade.

**Caracter�sticas:**
```javascript
// Zero configura��o necess�ria (na maioria dos casos)
// Suporte nativo para TypeScript via ts-jest
// Execu��o paralela de testes
// Mocking integrado
// Coverage reports autom�ticos
```

**Por que usar Jest?**
- ?? F�cil de configurar e usar
- ?? R�pido e eficiente
- ?? Tudo inclu�do (assertions, mocks, coverage)
- ?? Excelente debug e mensagens de erro
- ?? Amplamente adotado pela comunidade

### 2.2 Supertest - Testes de API

**O que �:** Biblioteca para testar APIs HTTP de forma simples e expressiva.

**Exemplo Pr�tico:**
```typescript
// Sem Supertest (complexo)
const http = require('http');
const request = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/users',
  method: 'POST'
}, (response) => {
  // processar resposta...
});

// Com Supertest (simples)
await request(app)
  .post('/api/users')
  .send({ name: 'Jo�o' })
  .expect(201);
```

**Vantagens:**
- ?? Simula requisi��es HTTP sem iniciar servidor
- ?? Encadeia assertions de forma fluente
- ? Valida��es autom�ticas de status code
- ?? C�digo mais leg�vel e expressivo

### 2.3 TypeORM com Transa��es

**O que �:** ORM (Object-Relational Mapping) que facilita intera��o com bancos de dados.

**Transa��es em Testes:**
```typescript
// O que � uma transa��o?
// � como uma "bolha" isolada de opera��es no banco

beforeEach(async () => {
  await queryRunner.startTransaction(); // Inicia a bolha
  // Todas as opera��es ficam dentro da bolha
});

afterEach(async () => {
  await queryRunner.rollbackTransaction(); // Desfaz tudo
  // A bolha desaparece, banco volta ao estado original
});
```

**Analogia:** Pense numa transa��o como um rascunho no Google Docs:
- ?? Voc� escreve e testa suas mudan�as
- ??? Se n�o gostar, descarta tudo (rollback)
- ? Se gostar, salva definitivamente (commit)

---

## 3. Estrutura de Testes

### 3.1 Anatomia de um Teste

```typescript
// ESTRUTURA B�SICA
describe('Nome do Grupo', () => {  // Agrupa testes relacionados
  
  beforeAll(() => {});    // Executa UMA VEZ antes de todos os testes
  beforeEach(() => {});   // Executa ANTES de CADA teste
  afterEach(() => {});    // Executa DEPOIS de CADA teste
  afterAll(() => {});     // Executa UMA VEZ depois de todos os testes

  it('deve fazer algo espec�fico', () => {  // Um teste individual
    // Arrange (Preparar)
    const input = 'dados de entrada';
    
    // Act (Agir)
    const result = funcaoParaTestar(input);
    
    // Assert (Verificar)
    expect(result).toBe('resultado esperado');
  });
});
```

### 3.2 Ciclo de Vida dos Testes

```
+-------------------------------------+
�  1. beforeAll()                     � ? Executa 1x no in�cio
+-------------------------------------�
�  +-------------------------------+  �
�  � 2. beforeEach()               �  � ? Antes do teste 1
�  � 3. it('teste 1')              �  �
�  � 4. afterEach()                �  � ? Depois do teste 1
�  +-------------------------------+  �
�  +-------------------------------+  �
�  � 5. beforeEach()               �  � ? Antes do teste 2
�  � 6. it('teste 2')              �  �
�  � 7. afterEach()                �  � ? Depois do teste 2
�  +-------------------------------+  �
+-------------------------------------�
�  8. afterAll()                      � ? Executa 1x no final
+-------------------------------------+
```

### 3.3 Padr�o AAA (Arrange-Act-Assert)

**O que �:** Padr�o de organiza��o de c�digo de teste em 3 fases claras.

```typescript
it('deve calcular o total do carrinho corretamente', () => {
  // ARRANGE (Preparar)
  // Configure o cen�rio e os dados necess�rios
  const carrinho = new Carrinho();
  carrinho.adicionarItem({ nome: 'Livro', preco: 50 });
  carrinho.adicionarItem({ nome: 'Caneta', preco: 5 });
  
  // ACT (Agir)
  // Execute a a��o que voc� quer testar
  const total = carrinho.calcularTotal();
  
  // ASSERT (Verificar)
  // Verifique se o resultado � o esperado
  expect(total).toBe(55);
});
```

**Por que usar AAA?**
- ?? Torna os testes mais leg�veis
- ?? Separa claramente cada responsabilidade
- ?? Facilita identificar problemas no teste
- ?? Padr�o reconhecido internacionalmente

---

## 4. Conceitos Fundamentais

### 4.1 Assertions (Verifica��es)

**O que s�o:** Declara��es que verificam se uma condi��o � verdadeira.

```typescript
// COMPARA��ES B�SICAS
expect(2 + 2).toBe(4);                    // Igualdade estrita (===)
expect({ nome: 'Jo�o' }).toEqual({        // Igualdade de conte�do
  nome: 'Jo�o'
});

// VERIFICA��ES DE TIPO
expect(resultado).toBeDefined();          // N�o � undefined
expect(resultado).toBeNull();             // � null
expect(array).toHaveLength(3);            // Array tem 3 elementos

// VERIFICA��ES DE OBJETO
expect(objeto).toHaveProperty('id');      // Tem a propriedade
expect(array).toContain('item');          // Array cont�m valor

// VERIFICA��ES DE N�MERO
expect(idade).toBeGreaterThan(18);        // Maior que
expect(nota).toBeLessThanOrEqual(10);     // Menor ou igual

// VERIFICA��ES DE STRING
expect(email).toMatch(/.*@.*\.com/);      // Match com regex
expect(texto).toContain('palavra');       // Cont�m substring

// VERIFICA��ES DE BOOLEAN
expect(isAtivo).toBe(true);               // � verdadeiro
expect(isInativo).toBeFalsy();            // � falsy (false, 0, '', null, undefined)

// VERIFICA��ES ASS�NCRONAS
await expect(promise).resolves.toBe(10);  // Promise resolve com valor
await expect(promise).rejects.toThrow();  // Promise rejeita
```

### 4.2 Mocks e Stubs

**Defini��es:**

**Mock:** Objeto falso que simula comportamento real e registra como foi usado.
```typescript
// Exemplo: Mock de servi�o de email
const emailService = {
  enviar: jest.fn().mockResolvedValue(true)
};

// Usar
await emailService.enviar('teste@email.com');

// Verificar
expect(emailService.enviar).toHaveBeenCalledWith('teste@email.com');
expect(emailService.enviar).toHaveBeenCalledTimes(1);
```

**Stub:** Objeto que retorna dados pr�-definidos sem l�gica.
```typescript
// Exemplo: Stub de banco de dados
const dbStub = {
  findUser: () => ({ id: 1, nome: 'Jo�o' })
};

// Sempre retorna o mesmo dado, sem verificar chamadas
```

**Quando usar:**
- ?? **Mock:** Quando precisa verificar intera��es (quantas vezes foi chamado, com quais argumentos)
- ?? **Stub:** Quando s� precisa de dados de retorno fake

### 4.3 Testes Ass�ncronos

**Por que s�o importantes:** JavaScript � ass�ncrono, muitas opera��es levam tempo (API, banco de dados).

```typescript
// ? ERRADO - Teste termina antes da Promise resolver
it('busca usu�rio', () => {
  getUserFromAPI().then(user => {
    expect(user.name).toBe('Jo�o');  // Nunca executa!
  });
});

// ? CORRETO - Usando async/await
it('busca usu�rio', async () => {
  const user = await getUserFromAPI();
  expect(user.name).toBe('Jo�o');
});

// ? CORRETO - Retornando a Promise
it('busca usu�rio', () => {
  return getUserFromAPI().then(user => {
    expect(user.name).toBe('Jo�o');
  });
});

// ? CORRETO - Usando done callback
it('busca usu�rio', (done) => {
  getUserFromAPI().then(user => {
    expect(user.name).toBe('Jo�o');
    done();  // Sinaliza que terminou
  });
});
```

### 4.4 Isolamento de Testes

**Princ�pio:** Cada teste deve ser completamente independente dos outros.

```typescript
// ? MAU EXEMPLO - Testes dependentes
let userId;

it('cria usu�rio', () => {
  userId = criarUsuario();  // Teste 1 afeta teste 2
});

it('busca usu�rio', () => {
  buscarUsuario(userId);  // Depende do teste 1
});

// ? BOM EXEMPLO - Testes isolados
it('cria usu�rio', () => {
  const userId = criarUsuario();
  expect(userId).toBeDefined();
});

it('busca usu�rio', () => {
  const userId = criarUsuario();  // Cria pr�prio setup
  const user = buscarUsuario(userId);
  expect(user).toBeDefined();
});
```

**Por que isolar?**
- ?? Testes podem rodar em qualquer ordem
- ?? Um teste falho n�o afeta os outros
- ? Permite execu��o paralela
- ?? Facilita identificar causa de falhas

---

## 5. Padr�es e Boas Pr�ticas

### 5.1 Nomenclatura de Testes

**Padr�o recomendado:** `describe` = contexto, `it` = comportamento esperado

```typescript
// ? BOM - Descritivo e claro
describe('UserService', () => {
  describe('register()', () => {
    it('deve criar um novo usu�rio com email �nico', () => {});
    it('deve rejeitar registro com email duplicado', () => {});
    it('deve criptografar a senha antes de salvar', () => {});
  });
  
  describe('login()', () => {
    it('deve retornar token JWT para credenciais v�lidas', () => {});
    it('deve rejeitar login com senha incorreta', () => {});
  });
});

// ? RUIM - Vago e pouco descritivo
describe('Tests', () => {
  it('test1', () => {});
  it('works', () => {});
});
```

**Conven��es:**
- ?? Use `deve` ou `should` no in�cio
- ?? Descreva o comportamento, n�o a implementa��o
- ?? Agrupe testes relacionados com `describe` aninhado
- ?? Escreva em portugu�s OU ingl�s, mas seja consistente

### 5.2 Test Data Builders

**O que �:** Padr�o para criar dados de teste de forma limpa e reutiliz�vel.

```typescript
// ? SEM Builder - Repetitivo e confuso
it('teste 1', () => {
  const user = {
    nome: 'Jo�o',
    email: 'joao@email.com',
    idade: 25,
    ativo: true,
    role: 'USER'
  };
});

it('teste 2', () => {
  const user = {  // Duplica��o!
    nome: 'Maria',
    email: 'maria@email.com',
    idade: 30,
    ativo: true,
    role: 'USER'
  };
});

// ? COM Builder - Limpo e reutiliz�vel
class UserBuilder {
  private user = {
    nome: 'Usu�rio Teste',
    email: 'teste@email.com',
    idade: 25,
    ativo: true,
    role: 'USER'
  };
  
  comNome(nome: string) {
    this.user.nome = nome;
    return this;
  }
  
  comEmail(email: string) {
    this.user.email = email;
    return this;
  }
  
  admin() {
    this.user.role = 'ADMIN';
    return this;
  }
  
  build() {
    return this.user;
  }
}

// Uso
it('teste 1', () => {
  const user = new UserBuilder()
    .comNome('Jo�o')
    .build();
});

it('teste 2', () => {
  const admin = new UserBuilder()
    .comNome('Admin')
    .admin()
    .build();
});
```

### 5.3 Testes de Caixa Preta vs Caixa Branca

**Caixa Preta:** Testa o comportamento sem conhecer implementa��o interna.
```typescript
// ? Caixa Preta - N�o importa COMO funciona
it('deve retornar soma de dois n�meros', () => {
  expect(soma(2, 3)).toBe(5);  // S� testa entrada/sa�da
});
```

**Caixa Branca:** Testa detalhes internos da implementa��o.
```typescript
// ?? Caixa Branca - Testa detalhes internos
it('deve usar operador + para somar', () => {
  const spy = jest.spyOn(Math, 'operator+');
  soma(2, 3);
  expect(spy).toHaveBeenCalled();
});
```

**Recomenda��o:** Prefira caixa preta - mais resiliente a refatora��es.

### 5.4 Coverage (Cobertura)

**O que �:** Porcentagem do c�digo executada pelos testes.

```bash
# Gerar relat�rio de cobertura
npm run test:coverage
```

**M�tricas:**
- **Statements:** % de linhas executadas
- **Branches:** % de condi��es if/else testadas
- **Functions:** % de fun��es chamadas
- **Lines:** % de linhas de c�digo cobertas

**Meta recomendada:**
- ?? **80-90%** � excelente
- ?? **< 50%** � preocupante
- ? **100%** nem sempre � necess�rio ou pr�tico

**Exemplo de relat�rio:**
```
File      | % Stmts | % Branch | % Funcs | % Lines |
----------|---------|----------|---------|---------|
user.ts   |   85.71 |    75.00 |   83.33 |   85.71 |
item.ts   |   92.30 |    83.33 |  100.00 |   92.30 |
----------|---------|----------|---------|---------|
Total     |   89.00 |    79.17 |   91.67 |   89.00 |
```

---

## 6. Configura��o do Ambiente

### 6.1 jest.config.js Explicado

```javascript
module.exports = {
  // Framework de testes
  preset: 'ts-jest',
  
  // Ambiente onde os testes rodam (Node.js, browser, etc)
  testEnvironment: 'node',
  
  // Diret�rios onde procurar testes
  roots: ['<rootDir>/src'],
  
  // Padr�o de nome dos arquivos de teste
  testMatch: ['**/__tests__/**/*.test.ts'],
  
  // Extens�es de arquivo reconhecidas
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Arquivos para cobertura
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',  // Excluir testes
  ],
  
  // Arquivos executados antes dos testes
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/jest.setup.ts',
    '<rootDir>/src/__tests__/setup.ts'
  ],
  
  // Transforma��o de arquivos TypeScript
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      isolatedModules: false,
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      }
    }]
  },
  
  // Timeout padr�o (30 segundos)
  testTimeout: 30000,
  
  // CR�TICO: Executa testes sequencialmente
  // Evita problemas com SQLite
  maxWorkers: 1,
  
  // Desabilita cache para evitar problemas
  cache: false,
};
```

### 6.2 jest.setup.ts - Por que existe?

**Problema:** Jest carrega m�dulos antes de definir vari�veis de ambiente.

```typescript
// ? N�o funciona - JWT_SECRET ainda � undefined
process.env.JWT_SECRET = 'test-key';
import { UserService } from './user.service';  // L� JWT_SECRET aqui!

// ? Funciona - jest.setup.ts roda ANTES de importar
// jest.setup.ts
process.env.JWT_SECRET = 'test-key';

// Depois Jest importa os arquivos de teste
```

**O que configuramos:**
```typescript
// Vari�veis de ambiente para testes
process.env.JWT_SECRET = 'test-secret-key-for-jest-tests';
process.env.NODE_ENV = 'test';
process.env.DB_DATABASE = ':memory:';

// Timeout aumentado para opera��es lentas
jest.setTimeout(30000);  // 30 segundos
```

### 6.3 setup.ts - Inicializa��o do Banco

**Responsabilidades:**
1. ? Inicializar conex�o com banco
2. ? Criar tabelas (synchronize)
3. ? Criar usu�rio admin padr�o
4. ? Limpar recursos ao final

```typescript
let isSetupComplete = false;  // Previne reinicializa��o

beforeAll(async () => {
  // Roda UMA VEZ antes de TODOS os testes
  if (isSetupComplete) return;
  
  // Destruir conex�o anterior
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  
  // Inicializar nova conex�o
  await AppDataSource.initialize();
  
  // Criar tabelas
  await AppDataSource.synchronize(true);
  
  // Criar admin
  // ...
  
  isSetupComplete = true;
});

afterAll(async () => {
  // Roda UMA VEZ depois de TODOS os testes
  await AppDataSource.destroy();
  isSetupComplete = false;
});
```

### 6.4 Database Config para Testes

**Estrat�gia:** Banco em mem�ria para testes.

```typescript
const isTest = process.env.NODE_ENV === 'test';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  
  // Banco em mem�ria = mais r�pido, isolado, limpo
  database: isTest ? ':memory:' : './database.sqlite',
  
  // Desabilitar logs em testes
  logging: isTest ? false : ['error', 'warn'],
  
  // Pool de 1 conex�o = evita locks
  ...(isTest && {
    poolSize: 1,
  }),
});
```

**Vantagens do :memory::**
- ? **R�pido:** Tudo na RAM
- ?? **Limpo:** Recria do zero a cada execu��o
- ?? **Isolado:** N�o interfere com banco de desenvolvimento
- ?? **Sem arquivos:** N�o deixa rastros no sistema

---

## 7. Casos de Uso Pr�ticos

### 7.1 Teste de Endpoint (API)

```typescript
describe('POST /api/auth/register', () => {
  it('deve criar novo usu�rio com sucesso', async () => {
    // ARRANGE
    const userData = {
      nome: 'Jo�o Silva',
      email: 'joao@email.com',
      senha: 'senha123'
    };
    
    // ACT
    const response = await request(httpServer)
      .post('/api/auth/register')
      .send(userData);
    
    // ASSERT
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe(userData.email);
    expect(response.body.user.senha).toBeUndefined();  // N�o retorna senha!
  });
  
  it('deve rejeitar email duplicado', async () => {
    // ARRANGE - Criar primeiro usu�rio
    const email = 'duplicado@email.com';
    await criarUsuario({ email });
    
    // ACT - Tentar criar com mesmo email
    const response = await request(httpServer)
      .post('/api/auth/register')
      .send({ nome: 'Outro', email, senha: '123' });
    
    // ASSERT
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('j� existe');
  });
  
  it('deve validar formato do email', async () => {
    // ACT
    const response = await request(httpServer)
      .post('/api/auth/register')
      .send({
        nome: 'Teste',
        email: 'email-invalido',  // Sem @
        senha: '123'
      });
    
    // ASSERT
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('email');
  });
});
```

### 7.2 Teste de Servi�o (Business Logic)

```typescript
describe('ItemService', () => {
  let itemService: ItemService;
  let queryRunner: QueryRunner;
  
  beforeEach(async () => {
    // ARRANGE - Setup para cada teste
    queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.startTransaction();
    itemService = new ItemService(queryRunner.manager);
  });
  
  afterEach(async () => {
    // CLEANUP - Desfaz mudan�as
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });
  
  it('deve criar item com status DISPONIVEL por padr�o', async () => {
    // ACT
    const item = await itemService.create(
      'Livro',
      'Descri��o do livro',
      'LIVROS',
      userId
    );
    
    // ASSERT
    expect(item.status).toBe(ItemStatus.DISPONIVEL);
    expect(item.titulo).toBe('Livro');
  });
  
  it('deve rejeitar t�tulo muito curto', async () => {
    // ACT & ASSERT
    await expect(
      itemService.create('Ab', 'Descri��o', 'LIVROS', userId)
    ).rejects.toThrow('T�tulo muito curto');
  });
});
```

### 7.3 Teste com Autentica��o

```typescript
describe('Protected Routes', () => {
  let token: string;
  
  beforeAll(async () => {
    // Criar usu�rio e obter token
    const response = await request(httpServer)
      .post('/api/auth/register')
      .send({
        nome: 'Teste',
        email: `test-${Date.now()}@email.com`,
        senha: 'senha123'
      });
    
    token = response.body.token;
  });
  
  it('deve permitir acesso com token v�lido', async () => {
    const response = await request(httpServer)
      .get('/api/items/my-items')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
  });
  
  it('deve bloquear acesso sem token', async () => {
    const response = await request(httpServer)
      .get('/api/items/my-items');
    
    expect(response.status).toBe(401);
  });
  
  it('deve bloquear token inv�lido', async () => {
    const response = await request(httpServer)
      .get('/api/items/my-items')
      .set('Authorization', 'Bearer token-invalido');
    
    expect(response.status).toBe(401);
  });
});
```

### 7.4 Teste de Transa��es

```typescript
describe('Transaction Rollback', () => {
  it('n�o deve persistir dados ap�s rollback', async () => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.startTransaction();
    
    try {
      // Criar item dentro da transa��o
      const item = await queryRunner.manager.save(Item, {
        titulo: 'Item Tempor�rio',
        descricao: 'Ser� desfeito',
        categoria: 'TESTE',
        ownerId: userId
      });
      
      // Verificar que existe na transa��o
      const itemNaTransacao = await queryRunner.manager.findOne(
        Item,
        { where: { id: item.id } }
      );
      expect(itemNaTransacao).toBeDefined();
      
      // Desfazer transa��o
      await queryRunner.rollbackTransaction();
      
      // Verificar que N�O existe no banco real
      const itemNoBanco = await AppDataSource.manager.findOne(
        Item,
        { where: { id: item.id } }
      );
      expect(itemNoBanco).toBeNull();
      
    } finally {
      await queryRunner.release();
    }
  });
});
```

---

## 8. Resolu��o de Problemas

### 8.1 Problema: JWT_SECRET n�o configurado

**Sintoma:**
```
Error: JWT_SECRET n�o est� configurado nas vari�veis de ambiente
```

**Causa:** Vari�vel de ambiente n�o definida antes do c�digo executar.

**Solu��o:**
```typescript
// Criar jest.setup.ts
process.env.JWT_SECRET = 'test-secret-key';

// Adicionar no jest.config.js
setupFilesAfterEnv: ['<rootDir>/src/__tests__/jest.setup.ts']
```

### 8.2 Problema: SQLITE_BUSY - Database Locked

**Sintoma:**
```
QueryFailedError: SQLITE_BUSY: database is locked
```

**Causas:**
1. M�ltiplas conex�es simult�neas
2. Testes rodando em paralelo
3. Conex�es n�o liberadas

**Solu��es:**
```javascript
// 1. jest.config.js - For�ar execu��o sequencial
maxWorkers: 1,

// 2. package.json - Flag --runInBand
"test": "jest --runInBand"

// 3. database.ts - Pool limitado
poolSize: 1,

// 4. Sempre liberar conex�es
afterEach(async () => {
  if (!queryRunner.isReleased) {
    await queryRunner.release();
  }
});
```

**Causa:** Banco n�o foi sincronizado no ambiente de teste.

**Solu��o:**
```typescript
// setup.ts
beforeAll(async () => {
  await AppDataSource.initialize();
  
  // CR�TICO: Sincronizar = criar tabelas
  await AppDataSource.synchronize(true);  // true = drop + create
  
  // Agora criar dados iniciais...
});
```

### 8.4 Problema: Testes Falhando Aleatoriamente

**Sintoma:** Testes passam �s vezes e falham outras vezes.

**Causas:**
1. Execu��o paralela com estado compartilhado
2. Depend�ncia entre testes
3. Dados n�o limpos entre testes

**Solu��es:**
```javascript
// 1. Executar sequencialmente
// jest.config.js
maxWorkers: 1,

// 2. Limpar dados entre testes
afterEach(async () => {
  await queryRunner.rollbackTransaction();
});

// 3. Usar timestamps em dados �nicos
const email = `test-${Date.now()}@email.com`;
```

### 8.5 Problema: Timeout nos Testes

**Sintoma:**
```
Timeout - Async callback was not invoked within 5000ms
```

**Solu��es:**
```typescript
// 1. Global - jest.setup.ts
jest.setTimeout(30000);  // 30 segundos

// 2. Por arquivo - no topo do teste
jest.setTimeout(10000);

// 3. Por teste individual
it('teste demorado', async () => {
  // ...
}, 10000);  // 10 segundos
```

---

## 9. An�lise da L�gica JWT_SECRET

### 9.1 O Problema Detalhado

**Contexto:** Quando voc� executa `npm test`, o Jest cria um ambiente Node.js isolado.

**Fluxo do Erro:**
```
1. Jest inicia ambiente de teste
   ?
2. N�O executa server.ts (onde est� dotenv.config())
   ?
3. Teste chama userService.register()
   ?
4. userService precisa gerar JWT
   ?
5. Chama getJWTSecret() ? l� process.env.JWT_SECRET
   ?
6. ? ERRO: JWT_SECRET � undefined!
```

**Diagrama do Problema:**
```
Desenvolvimento (npm run dev):
server.ts ? dotenv.config() ? carrega .env ? JWT_SECRET definido ?

Testes (npm test):
Jest ? N�O executa server.ts ? .env N�O carregado ? JWT_SECRET undefined ?
```

### 9.2 A Solu��o Correta (Gemini estava certo!)

**Observa��o Importante:** O Gemini sugeriu usar `setupFiles` em vez de `setupFilesAfterEnv`. Vamos entender a diferen�a:

```javascript
module.exports = {
  // ? OP��O 1: setupFiles (executa ANTES de tudo)
  setupFiles: ['<rootDir>/src/__tests__/jest.setup.ts'],
  
  // ? OP��O 2: setupFilesAfterEnv (executa depois do Jest carregar)
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/jest.setup.ts'],
};
```

**Diferen�a:**
| Caracter�stica | setupFiles | setupFilesAfterEnv |
|----------------|------------|-------------------|
| Quando executa | ANTES do Jest configurar | DEPOIS do Jest configurar |
| Acesso ao Jest | ? N�o tem acesso | ? Tem acesso (expect, describe, etc) |
| Vari�veis de ambiente | ? Ideal | ? Funciona tamb�m |
| Ordem de execu��o | 1� | 2� |

**Conclus�o:** Ambas funcionam para definir vari�veis de ambiente, mas `setupFiles` � tecnicamente mais correto pois executa mais cedo.

### 9.3 Implementa��o Recomendada

**Op��o A - Usando setupFiles (Recomenda��o do Gemini):**
```javascript
// jest.config.js
module.exports = {
  // Para vari�veis de ambiente
  setupFiles: ['<rootDir>/src/__tests__/jest.setup.ts'],
  
  // Para inicializa��o do banco
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
};
```

**Op��o B - Tudo em setupFilesAfterEnv (Nossa implementa��o atual):**
```javascript
// jest.config.js
module.exports = {
  // Tudo junto (funciona, mas tecnicamente menos correto)
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/jest.setup.ts',
    '<rootDir>/src/__tests__/setup.ts'
  ],
};
```

### 9.4 Por que Nossa Solu��o Funciona?

```typescript
// jest.setup.ts � executado ANTES de qualquer import
process.env.JWT_SECRET = 'test-secret-key';

// Quando o Jest importa os arquivos de teste...
import { UserService } from './services/user.service';

// E o UserService importa...
import { getJWTSecret } from './config/jwt';

// A fun��o getJWTSecret() j� encontra JWT_SECRET definido! ?
export const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET;  // Agora existe!
  if (!secret) {
    throw new Error('JWT_SECRET n�o configurado');
  }
  return secret;
};
```

### 9.5 Melhor Pr�tica: Ambos os Arquivos

**Estrutura recomendada:**
```
src/__tests__/
+-- jest.setup.ts        ? Vari�veis de ambiente (setupFiles)
+-- setup.ts             ? Banco de dados (setupFilesAfterEnv)
+-- user.test.ts
+-- item.test.ts
+-- proposal.test.ts
```

**jest.setup.ts** (executa primeiro):
```typescript
// Configura��es que precisam estar prontas ANTES de qualquer c�digo
process.env.JWT_SECRET = 'test-secret-key-for-jest-tests';
process.env.NODE_ENV = 'test';
process.env.DB_DATABASE = ':memory:';

// Configura��es globais do Jest
jest.setTimeout(30000);
```

**setup.ts** (executa depois):
```typescript
// Inicializa��o que precisa de acesso ao Jest e suas APIs
beforeAll(async () => {
  await AppDataSource.initialize();
  await AppDataSource.synchronize(true);
  // Criar dados iniciais...
});

afterAll(async () => {
  await AppDataSource.destroy();
});
```

### 9.6 Verifica��o: Est� Funcionando?

**Teste se JWT_SECRET est� definido:**
```typescript
it('deve ter JWT_SECRET configurado', () => {
  expect(process.env.JWT_SECRET).toBeDefined();
  expect(process.env.JWT_SECRET).toBe('test-secret-key-for-jest-tests');
});
```

---

## 10. Conclus�o

### 10.1 Li��es Aprendidas

1. ? **Isolamento � rei:** Testes devem ser independentes
2. ? **Transa��es s�o suas amigas:** Use rollback para limpar dados
3. ? **Banco em mem�ria:** Mais r�pido e isolado
4. ? **Execu��o sequencial:** Evita problemas com SQLite
5. ? **Setup correto:** Vari�veis de ambiente ANTES de imports
6. ? **AAA Pattern:** Arrange, Act, Assert = clareza
7. ? **Testes descritivos:** Documentam o comportamento esperado

### 10.2 Checklist Final

Antes de considerar seus testes prontos:

- [ ] Todos os testes passam consistentemente
- [ ] Testes podem rodar em qualquer ordem
- [ ] Cada teste � independente
- [ ] N�o h� logs desnecess�rios
- [ ] Dados de teste s�o �nicos (timestamps)
- [ ] Conex�es s�o sempre liberadas
- [ ] Coverage > 80% em c�digo cr�tico
- [ ] Testes s�o r�pidos (< 1min total)
- [ ] Documenta��o existe (README_TESTS.md)
- [ ] CI/CD configurado (opcional)

### 10.3 Recursos Adicionais

**Documenta��o Oficial:**
- [Jest](https://jestjs.io/docs/getting-started)
- [Supertest](https://github.com/visionmedia/supertest)
- [TypeORM Testing](https://typeorm.io/testing)

**Artigos Recomendados:**
- "Test Doubles: Mocks, Stubs and Fakes" - Martin Fowler
- "The Practical Test Pyramid" - Ham Vocke
- "Testing Best Practices" - Yoni Goldberg

**Livros:**
- "Test Driven Development" - Kent Beck
- "The Art of Unit Testing" - Roy Osherove

---

## 11. Gloss�rio de Termos

| Termo | Significado |
|-------|-------------|
| **AAA** | Arrange-Act-Assert: padr�o de organiza��o de testes |
| **Assertion** | Verifica��o de uma condi��o esperada |
| **Coverage** | Porcentagem do c�digo coberta por testes |
| **E2E** | End-to-End: testa aplica��o completa |
| **Fixture** | Dados de teste pr�-configurados |
| **Integration Test** | Testa m�ltiplos componentes juntos |
| **Mock** | Objeto falso que simula comportamento |
| **Rollback** | Desfazer transa��o do banco |
| **Setup** | Prepara��o antes dos testes |
| **Stub** | Objeto que retorna dados fixos |
| **Teardown** | Limpeza depois dos testes |
| **Unit Test** | Testa unidade isolada de c�digo |

---

**Relat�rio elaborado em:** Outubro de 2025  
**Vers�o:** 2.0  
**Projeto:** TrocaAi Backend  
**Tecnologias:** Jest, Supertest, TypeORM, SQLite, TypeScript



