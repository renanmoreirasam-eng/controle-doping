import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando carga inicial...');

  const password = await bcrypt.hash('123456', 10);

  await prisma.user.upsert({
    where: { email: 'admin@teste.com' },
    update: {
      name: 'Admin Sistema',
      role: UserRole.ADMIN,
    },
    create: {
      name: 'Admin Sistema',
      email: 'admin@teste.com',
      password,
      role: UserRole.ADMIN,
    },
  });

  const officialUsers = [
    {
      name: 'DCO Oficial 1',
      email: 'dco1@teste.com',
      phone: '11999990001',
      pixKey: 'dco1@teste.com',
      role: UserRole.OFFICIAL,
    },
    {
      name: 'DCO Oficial 2',
      email: 'dco2@teste.com',
      phone: '11999990002',
      pixKey: 'dco2@teste.com',
      role: UserRole.OFFICIAL,
    },
    {
      name: 'Coordenador Operacional',
      email: 'coordenador@teste.com',
      phone: '11999990003',
      pixKey: 'coordenador@teste.com',
      role: UserRole.COORDINATOR,
    },
  ];

  for (const item of officialUsers) {
    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {
        name: item.name,
        role: item.role,
      },
      create: {
        name: item.name,
        email: item.email,
        password,
        role: item.role,
      },
    });

    await prisma.official.upsert({
      where: { userId: user.id },
      update: {
        phone: item.phone,
        pixKey: item.pixKey,
        active: true,
      },
      create: {
        userId: user.id,
        phone: item.phone,
        pixKey: item.pixKey,
        active: true,
      },
    });
  }

  const championships = [
    'Campeonato Brasileiro Série A',
    'Campeonato Paulista Série A1',
    'Copa do Brasil',
    'CONMEBOL Libertadores',
    'CONMEBOL Sul-Americana',
  ];

  for (const name of championships) {
    const existingChampionship =
      await prisma.championship.findFirst({
        where: { name },
      });

    if (existingChampionship) {
      await prisma.championship.update({
        where: { id: existingChampionship.id },
        data: { name },
      });
    } else {
      await prisma.championship.create({
        data: { name },
      });
    }
  }

  const stadiums = [
    {
      name: 'Maracanã',
      address: 'Rua Professor Eurico Rabelo, s/n',
      cep: '20271-150',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    {
      name: 'Neo Química Arena',
      address: 'Avenida Miguel Ignácio Curi, 111',
      cep: '08295-005',
      city: 'São Paulo',
      state: 'SP',
    },
    {
      name: 'Allianz Parque',
      address: 'Avenida Francisco Matarazzo, 1705',
      cep: '05001-200',
      city: 'São Paulo',
      state: 'SP',
    },
    {
      name: 'Morumbis',
      address: 'Praça Roberto Gomes Pedrosa, 1',
      cep: '05653-070',
      city: 'São Paulo',
      state: 'SP',
    },
    {
      name: 'Vila Belmiro',
      address: 'Rua Princesa Isabel, s/n',
      cep: '11075-501',
      city: 'Santos',
      state: 'SP',
    },
    {
      name: 'Mineirão',
      address: 'Avenida Antônio Abrahão Caram, 1001',
      cep: '31275-000',
      city: 'Belo Horizonte',
      state: 'MG',
    },
    {
      name: 'Arena MRV',
      address: 'Rua Cristina Maria de Assis, 202',
      cep: '30515-000',
      city: 'Belo Horizonte',
      state: 'MG',
    },
    {
      name: 'Arena do Grêmio',
      address: 'Avenida Padre Leopoldo Brentano, 110',
      cep: '90250-590',
      city: 'Porto Alegre',
      state: 'RS',
    },
    {
      name: 'Beira-Rio',
      address: 'Avenida Padre Cacique, 891',
      cep: '90810-240',
      city: 'Porto Alegre',
      state: 'RS',
    },
    {
      name: 'Arena Fonte Nova',
      address: 'Ladeira da Fonte das Pedras, s/n',
      cep: '40050-565',
      city: 'Salvador',
      state: 'BA',
    },
    {
      name: 'Arena Castelão',
      address: 'Avenida Alberto Craveiro, 2901',
      cep: '60860-000',
      city: 'Fortaleza',
      state: 'CE',
    },
    {
      name: 'Couto Pereira',
      address: 'Rua Ubaldino do Amaral, 37',
      cep: '80060-190',
      city: 'Curitiba',
      state: 'PR',
    },
    {
      name: 'Ligga Arena',
      address: 'Rua Buenos Aires, 1260',
      cep: '80250-070',
      city: 'Curitiba',
      state: 'PR',
    },
    {
      name: 'Serra Dourada',
      address: 'Avenida Fued José Sebba, 1170',
      cep: '74805-100',
      city: 'Goiânia',
      state: 'GO',
    },
    {
      name: 'Mané Garrincha',
      address: 'SRPN, Asa Norte',
      cep: '70070-701',
      city: 'Brasília',
      state: 'DF',
    },
  ];

  for (const stadium of stadiums) {
    const existingStadium =
      await prisma.stadium.findFirst({
        where: {
          name: stadium.name,
          city: stadium.city,
          state: stadium.state,
        },
      });

    if (existingStadium) {
      await prisma.stadium.update({
        where: { id: existingStadium.id },
        data: stadium,
      });
    } else {
      await prisma.stadium.create({
        data: stadium,
      });
    }
  }

  const teams = [
    {
      name: 'Flamengo',
      shortName: 'FLA',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    {
      name: 'Fluminense',
      shortName: 'FLU',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    {
      name: 'Vasco da Gama',
      shortName: 'VAS',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    {
      name: 'Botafogo',
      shortName: 'BOT',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    {
      name: 'Corinthians',
      shortName: 'COR',
      city: 'São Paulo',
      state: 'SP',
    },
    {
      name: 'Palmeiras',
      shortName: 'PAL',
      city: 'São Paulo',
      state: 'SP',
    },
    {
      name: 'São Paulo',
      shortName: 'SAO',
      city: 'São Paulo',
      state: 'SP',
    },
    {
      name: 'Santos',
      shortName: 'SAN',
      city: 'Santos',
      state: 'SP',
    },
    {
      name: 'Red Bull Bragantino',
      shortName: 'RBB',
      city: 'Bragança Paulista',
      state: 'SP',
    },
    {
      name: 'Mirassol',
      shortName: 'MIR',
      city: 'Mirassol',
      state: 'SP',
    },
    {
      name: 'Cruzeiro',
      shortName: 'CRU',
      city: 'Belo Horizonte',
      state: 'MG',
    },
    {
      name: 'Atlético Mineiro',
      shortName: 'CAM',
      city: 'Belo Horizonte',
      state: 'MG',
    },
    {
      name: 'Grêmio',
      shortName: 'GRE',
      city: 'Porto Alegre',
      state: 'RS',
    },
    {
      name: 'Internacional',
      shortName: 'INT',
      city: 'Porto Alegre',
      state: 'RS',
    },
    {
      name: 'Bahia',
      shortName: 'BAH',
      city: 'Salvador',
      state: 'BA',
    },
    {
      name: 'Vitória',
      shortName: 'VIT',
      city: 'Salvador',
      state: 'BA',
    },
    {
      name: 'Fortaleza',
      shortName: 'FOR',
      city: 'Fortaleza',
      state: 'CE',
    },
    {
      name: 'Ceará',
      shortName: 'CEA',
      city: 'Fortaleza',
      state: 'CE',
    },
    {
      name: 'Sport',
      shortName: 'SPT',
      city: 'Recife',
      state: 'PE',
    },
    {
      name: 'Juventude',
      shortName: 'JUV',
      city: 'Caxias do Sul',
      state: 'RS',
    },
    {
      name: 'Cuiabá',
      shortName: 'CUI',
      city: 'Cuiabá',
      state: 'MT',
    },
    {
      name: 'Goiás',
      shortName: 'GOI',
      city: 'Goiânia',
      state: 'GO',
    },
    {
      name: 'Coritiba',
      shortName: 'CFC',
      city: 'Curitiba',
      state: 'PR',
    },
    {
      name: 'Athletico Paranaense',
      shortName: 'CAP',
      city: 'Curitiba',
      state: 'PR',
    },
    {
      name: 'Ponte Preta',
      shortName: 'PON',
      city: 'Campinas',
      state: 'SP',
    },
    {
      name: 'Guarani',
      shortName: 'GUA',
      city: 'Campinas',
      state: 'SP',
    },
    {
      name: 'Novorizontino',
      shortName: 'NOV',
      city: 'Novo Horizonte',
      state: 'SP',
    },
    {
      name: 'Botafogo-SP',
      shortName: 'BSP',
      city: 'Ribeirão Preto',
      state: 'SP',
    },
    {
      name: 'Ituano',
      shortName: 'ITU',
      city: 'Itu',
      state: 'SP',
    },
    {
      name: 'Portuguesa',
      shortName: 'POR',
      city: 'São Paulo',
      state: 'SP',
    },
    {
      name: 'São Bernardo',
      shortName: 'SBE',
      city: 'São Bernardo do Campo',
      state: 'SP',
    },
    {
      name: 'Água Santa',
      shortName: 'AGS',
      city: 'Diadema',
      state: 'SP',
    },
    {
      name: 'Inter de Limeira',
      shortName: 'IDL',
      city: 'Limeira',
      state: 'SP',
    },
    {
      name: 'Noroeste',
      shortName: 'NOR',
      city: 'Bauru',
      state: 'SP',
    },
  ];

  for (const team of teams) {
    const existingTeam =
      await prisma.team.findFirst({
        where: {
          name: team.name,
          state: team.state,
        },
      });

    if (existingTeam) {
      await prisma.team.update({
        where: { id: existingTeam.id },
        data: {
          shortName: team.shortName,
          city: team.city,
          state: team.state,
          isActive: true,
        },
      });
    } else {
      await prisma.team.create({
        data: {
          ...team,
          isActive: true,
        },
      });
    }
  }

  console.log('Carga inicial finalizada com sucesso.');
}

main()
  .catch((error) => {
    console.error('Erro na carga inicial:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });