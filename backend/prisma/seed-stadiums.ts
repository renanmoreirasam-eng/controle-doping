import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.stadium.createMany({
    data: [
      {
        name: 'Morumbi',
        city: 'São Paulo',
        state: 'SP',
        address: 'Praça Roberto Gomes Pedrosa',
        cep: '05653-070',
      },
      {
        name: 'Neo Química Arena',
        city: 'São Paulo',
        state: 'SP',
        address: 'Av. Miguel Ignácio Curi',
        cep: '08295-005',
      },
      {
        name: 'Allianz Parque',
        city: 'São Paulo',
        state: 'SP',
        address: 'Rua Palestra Itália',
        cep: '05005-030',
      },
      {
        name: 'Vila Belmiro',
        city: 'Santos',
        state: 'SP',
        address: 'Rua Princesa Isabel',
        cep: '11075-501',
      },
      {
        name: 'Maracanã',
        city: 'Rio de Janeiro',
        state: 'RJ',
        address: 'Av. Pres. Castelo Branco',
        cep: '20271-130',
      },
      {
        name: 'São Januário',
        city: 'Rio de Janeiro',
        state: 'RJ',
        address: 'Rua General Almério de Moura',
        cep: '20921-060',
      },
      {
        name: 'Nilton Santos',
        city: 'Rio de Janeiro',
        state: 'RJ',
        address: 'Rua José dos Reis',
        cep: '20770-001',
      },
      {
        name: 'Mineirão',
        city: 'Belo Horizonte',
        state: 'MG',
        address: 'Av. Antônio Abrahão Caram',
        cep: '31275-000',
      },
      {
        name: 'Arena MRV',
        city: 'Belo Horizonte',
        state: 'MG',
        address: 'Rua Cristina Maria de Assis',
        cep: '30535-610',
      },
      {
        name: 'Independência',
        city: 'Belo Horizonte',
        state: 'MG',
        address: 'Rua Pitangui',
        cep: '31110-202',
      },
      {
        name: 'Arena do Grêmio',
        city: 'Porto Alegre',
        state: 'RS',
        address: 'Av. Padre Leopoldo Brentano',
        cep: '90250-590',
      },
      {
        name: 'Beira-Rio',
        city: 'Porto Alegre',
        state: 'RS',
        address: 'Av. Padre Cacique',
        cep: '90810-240',
      },
      {
        name: 'Ligga Arena',
        city: 'Curitiba',
        state: 'PR',
        address: 'Rua Buenos Aires',
        cep: '80250-070',
      },
      {
        name: 'Couto Pereira',
        city: 'Curitiba',
        state: 'PR',
        address: 'Rua Ubaldino do Amaral',
        cep: '80060-195',
      },
      {
        name: 'Arena da Baixada',
        city: 'Curitiba',
        state: 'PR',
        address: 'Rua Buenos Aires',
        cep: '80250-070',
      },
      {
        name: 'Fonte Nova',
        city: 'Salvador',
        state: 'BA',
        address: 'Ladeira da Fonte das Pedras',
        cep: '40050-565',
      },
      {
        name: 'Barradão',
        city: 'Salvador',
        state: 'BA',
        address: 'Rua Artêmio Castro Valente',
        cep: '41215-100',
      },
      {
        name: 'Arena Castelão',
        city: 'Fortaleza',
        state: 'CE',
        address: 'Av. Alberto Craveiro',
        cep: '60861-211',
      },
      {
        name: 'Presidente Vargas',
        city: 'Fortaleza',
        state: 'CE',
        address: 'Rua Costa Sousa',
        cep: '60430-650',
      },
      {
        name: 'Arena Pernambuco',
        city: 'São Lourenço da Mata',
        state: 'PE',
        address: 'Av. Deus é Fiel',
        cep: '54735-060',
      },
      {
        name: 'Ilha do Retiro',
        city: 'Recife',
        state: 'PE',
        address: 'Av. Sport Club do Recife',
        cep: '50750-560',
      },
      {
        name: 'Arruda',
        city: 'Recife',
        state: 'PE',
        address: 'Rua das Moças',
        cep: '52171-011',
      },
      {
        name: 'Arena das Dunas',
        city: 'Natal',
        state: 'RN',
        address: 'Av. Prudente de Morais',
        cep: '59064-625',
      },
      {
        name: 'Mangueirão',
        city: 'Belém',
        state: 'PA',
        address: 'Rodovia Augusto Montenegro',
        cep: '66640-000',
      },
      {
        name: 'Serra Dourada',
        city: 'Goiânia',
        state: 'GO',
        address: 'Av. Fued José Sebba',
        cep: '74805-100',
      },
      {
        name: 'Mané Garrincha',
        city: 'Brasília',
        state: 'DF',
        address: 'SRPN',
        cep: '70070-701',
      },
      {
        name: 'Alfredo Jaconi',
        city: 'Caxias do Sul',
        state: 'RS',
        address: 'Rua Hércules Galló',
        cep: '95020-260',
      },
      {
        name: 'Heriberto Hülse',
        city: 'Criciúma',
        state: 'SC',
        address: 'Rua Treze de Maio',
        cep: '88802-290',
      },
      {
        name: 'Ressacada',
        city: 'Florianópolis',
        state: 'SC',
        address: 'Rodovia Acesso ao Aeroporto',
        cep: '88047-902',
      },
      {
        name: 'Arena Condá',
        city: 'Chapecó',
        state: 'SC',
        address: 'Rua Clevelândia',
        cep: '89801-560',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Estádios cadastrados com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });