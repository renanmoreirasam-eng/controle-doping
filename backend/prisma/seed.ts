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
    'Campeonato Brasileiro Série B',
    'Campeonato Brasileiro Série C',
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
      name: 'Ligga Arena',
      address: 'Rua Buenos Aires, 1260',
      cep: '80250-070',
      city: 'Curitiba',
      state: 'PR',
    },
    {
      name: 'Arena MRV',
      address: 'Rua Cristina Maria de Assis, 202',
      cep: '30515-000',
      city: 'Belo Horizonte',
      state: 'MG',
    },
    {
      name: 'Arena Fonte Nova',
      address: 'Ladeira da Fonte das Pedras, s/n',
      cep: '40050-565',
      city: 'Salvador',
      state: 'BA',
    },
    {
      name: 'Estádio Nilton Santos',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    {
      name: 'Arena Condá',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Chapecó',
      state: 'SC',
    },
    {
      name: 'Neo Química Arena',
      address: 'Avenida Miguel Ignácio Curi, 111',
      cep: '08295-005',
      city: 'São Paulo',
      state: 'SP',
    },
    {
      name: 'Estádio Couto Pereira',
      address: 'Rua Ubaldino do Amaral, 37',
      cep: '80060-190',
      city: 'Curitiba',
      state: 'PR',
    },
    {
      name: 'Mineirão',
      address: 'Avenida Antônio Abrahão Caram, 1001',
      cep: '31275-000',
      city: 'Belo Horizonte',
      state: 'MG',
    },
    {
      name: 'Maracanã',
      address: 'Rua Professor Eurico Rabelo, s/n',
      cep: '20271-150',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    {
      name: 'Arena do Grêmio',
      address: 'Avenida Padre Leopoldo Brentano, 110',
      cep: '90250-590',
      city: 'Porto Alegre',
      state: 'RS',
    },
    {
      name: 'Estádio Beira-Rio',
      address: 'Avenida Padre Cacique, 891',
      cep: '90810-240',
      city: 'Porto Alegre',
      state: 'RS',
    },
    {
      name: 'Estádio José Maria de Campos Maia',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Mirassol',
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
      name: 'Estádio Nabi Abi Chedid',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Bragança Paulista',
      state: 'SP',
    },
    {
      name: 'Estádio Baenão',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Belém',
      state: 'PA',
    },
    {
      name: 'Vila Belmiro',
      address: 'Rua Princesa Isabel, s/n',
      cep: '11075-501',
      city: 'Santos',
      state: 'SP',
    },
    {
      name: 'São Januário',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    {
      name: 'Estádio Barradão',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Salvador',
      state: 'BA',
    },
    {
      name: 'MorumBIS',
      address: 'Praça Roberto Gomes Pedrosa, 1',
      cep: '05653-070',
      city: 'São Paulo',
      state: 'SP',
    },
    {
      name: 'Arena Independência',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Belo Horizonte',
      state: 'MG',
    },
    {
      name: 'Arena Sicredi',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'São João del-Rei',
      state: 'MG',
    },
    {
      name: 'Estádio Antônio Accioly',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Goiânia',
      state: 'GO',
    },
    {
      name: 'Estádio da Ressacada',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Florianópolis',
      state: 'SC',
    },
    {
      name: 'Estádio Santa Cruz',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Ribeirão Preto',
      state: 'SP',
    },
    {
      name: 'Arena Castelão',
      address: 'Avenida Alberto Craveiro, 2901',
      cep: '60860-000',
      city: 'Fortaleza',
      state: 'CE',
    },
    {
      name: 'Estádio Rei Pelé',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Maceió',
      state: 'AL',
    },
    {
      name: 'Estádio Heriberto Hülse',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Criciúma',
      state: 'SC',
    },
    {
      name: 'Arena Pantanal',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Cuiabá',
      state: 'MT',
    },
    {
      name: 'Estádio Hailé Pinheiro',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Goiânia',
      state: 'GO',
    },
    {
      name: 'Estádio Alfredo Jaconi',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Caxias do Sul',
      state: 'RS',
    },
    {
      name: 'Estádio do Café',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Londrina',
      state: 'PR',
    },
    {
      name: 'Estádio dos Aflitos',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Recife',
      state: 'PE',
    },
    {
      name: 'Estádio Jorge Ismael de Biasi',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Novo Horizonte',
      state: 'SP',
    },
    {
      name: 'Estádio Germano Krüger',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Ponta Grossa',
      state: 'PR',
    },
    {
      name: 'Estádio Moisés Lucarelli',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Campinas',
      state: 'SP',
    },
    {
      name: 'Estádio Primeiro de Maio',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'São Bernardo do Campo',
      state: 'SP',
    },
    {
      name: 'Ilha do Retiro',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Recife',
      state: 'PE',
    },
    {
      name: 'Estádio Onésio Brasileiro Alvarenga',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Goiânia',
      state: 'GO',
    },
    {
      name: 'Arena da Amazônia',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Manaus',
      state: 'AM',
    },
    {
      name: 'Estádio Jonas Duarte',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Anápolis',
      state: 'GO',
    },
    {
      name: 'Arena Barra FC',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Balneário Camboriú',
      state: 'SC',
    },
    {
      name: 'Estádio Almeidão',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'João Pessoa',
      state: 'PB',
    },
    {
      name: 'Estádio Augusto Bauer',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Brusque',
      state: 'SC',
    },
    {
      name: 'Estádio Centenário',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Caxias do Sul',
      state: 'RS',
    },
    {
      name: 'Arena Batistão',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Aracaju',
      state: 'SE',
    },
    {
      name: 'Arena Fonte Luminosa',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Araraquara',
      state: 'SP',
    },
    {
      name: 'Estádio Orlando Scarpelli',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Florianópolis',
      state: 'SC',
    },
    {
      name: 'Estádio Presidente Vargas',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Fortaleza',
      state: 'CE',
    },
    {
      name: 'Estádio Brinco de Ouro',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Campinas',
      state: 'SP',
    },
    {
      name: 'Estádio Major José Levy Sobrinho',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Limeira',
      state: 'SP',
    },
    {
      name: 'Estádio Etelvino Mendonça',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Itabaiana',
      state: 'SE',
    },
    {
      name: 'Estádio Novelli Júnior',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Itu',
      state: 'SP',
    },
    {
      name: 'Estádio Castelão',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'São Luís',
      state: 'MA',
    },
    {
      name: 'Estádio Willie Davids',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Maringá',
      state: 'PR',
    },
    {
      name: 'Estádio da Curuzu',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Belém',
      state: 'PA',
    },
    {
      name: 'Estádio do Arruda',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Recife',
      state: 'PE',
    },
    {
      name: 'Estádio Raulino de Oliveira',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Volta Redonda',
      state: 'RJ',
    },
    {
      name: 'Estádio Colosso da Lagoa',
      address: 'Endereço não informado',
      cep: '00000-000',
      city: 'Erechim',
      state: 'RS',
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
    // Série A 2026
    {
      name: 'Athletico-PR',
      shortName: 'Athletico',
      city: 'Curitiba',
      state: 'PR',
    },
    {
      name: 'Atlético-MG',
      shortName: 'Atlético-MG',
      city: 'Belo Horizonte',
      state: 'MG',
    },
    {
      name: 'Bahia',
      shortName: 'Bahia',
      city: 'Salvador',
      state: 'BA',
    },
    {
      name: 'Botafogo',
      shortName: 'Botafogo',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    {
      name: 'Chapecoense',
      shortName: 'Chapecoense',
      city: 'Chapecó',
      state: 'SC',
    },
    {
      name: 'Corinthians',
      shortName: 'Corinthians',
      city: 'São Paulo',
      state: 'SP',
    },
    {
      name: 'Coritiba',
      shortName: 'Coritiba',
      city: 'Curitiba',
      state: 'PR',
    },
    {
      name: 'Cruzeiro',
      shortName: 'Cruzeiro',
      city: 'Belo Horizonte',
      state: 'MG',
    },
    {
      name: 'Flamengo',
      shortName: 'Flamengo',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    {
      name: 'Fluminense',
      shortName: 'Fluminense',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    {
      name: 'Grêmio',
      shortName: 'Grêmio',
      city: 'Porto Alegre',
      state: 'RS',
    },
    {
      name: 'Internacional',
      shortName: 'Inter',
      city: 'Porto Alegre',
      state: 'RS',
    },
    {
      name: 'Mirassol',
      shortName: 'Mirassol',
      city: 'Mirassol',
      state: 'SP',
    },
    {
      name: 'Palmeiras',
      shortName: 'Palmeiras',
      city: 'São Paulo',
      state: 'SP',
    },
    {
      name: 'Red Bull Bragantino',
      shortName: 'Bragantino',
      city: 'Bragança Paulista',
      state: 'SP',
    },
    {
      name: 'Remo',
      shortName: 'Remo',
      city: 'Belém',
      state: 'PA',
    },
    {
      name: 'Santos',
      shortName: 'Santos',
      city: 'Santos',
      state: 'SP',
    },
    {
      name: 'São Paulo',
      shortName: 'São Paulo',
      city: 'São Paulo',
      state: 'SP',
    },
    {
      name: 'Vasco',
      shortName: 'Vasco',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    {
      name: 'Vitória',
      shortName: 'Vitória',
      city: 'Salvador',
      state: 'BA',
    },
    // Série B 2026
    {
      name: 'América-MG',
      shortName: 'América-MG',
      city: 'Belo Horizonte',
      state: 'MG',
    },
    {
      name: 'Athletic Club',
      shortName: 'Athletic',
      city: 'São João del-Rei',
      state: 'MG',
    },
    {
      name: 'Atlético-GO',
      shortName: 'Atlético-GO',
      city: 'Goiânia',
      state: 'GO',
    },
    {
      name: 'Avaí',
      shortName: 'Avaí',
      city: 'Florianópolis',
      state: 'SC',
    },
    {
      name: 'Botafogo-SP',
      shortName: 'Botafogo-SP',
      city: 'Ribeirão Preto',
      state: 'SP',
    },
    {
      name: 'Ceará',
      shortName: 'Ceará',
      city: 'Fortaleza',
      state: 'CE',
    },
    {
      name: 'CRB',
      shortName: 'CRB',
      city: 'Maceió',
      state: 'AL',
    },
    {
      name: 'Criciúma',
      shortName: 'Criciúma',
      city: 'Criciúma',
      state: 'SC',
    },
    {
      name: 'Cuiabá',
      shortName: 'Cuiabá',
      city: 'Cuiabá',
      state: 'MT',
    },
    {
      name: 'Fortaleza',
      shortName: 'Fortaleza',
      city: 'Fortaleza',
      state: 'CE',
    },
    {
      name: 'Goiás',
      shortName: 'Goiás',
      city: 'Goiânia',
      state: 'GO',
    },
    {
      name: 'Juventude',
      shortName: 'Juventude',
      city: 'Caxias do Sul',
      state: 'RS',
    },
    {
      name: 'Londrina',
      shortName: 'Londrina',
      city: 'Londrina',
      state: 'PR',
    },
    {
      name: 'Náutico',
      shortName: 'Náutico',
      city: 'Recife',
      state: 'PE',
    },
    {
      name: 'Novorizontino',
      shortName: 'Novorizontino',
      city: 'Novo Horizonte',
      state: 'SP',
    },
    {
      name: 'Operário-PR',
      shortName: 'Operário',
      city: 'Ponta Grossa',
      state: 'PR',
    },
    {
      name: 'Ponte Preta',
      shortName: 'Ponte Preta',
      city: 'Campinas',
      state: 'SP',
    },
    {
      name: 'São Bernardo',
      shortName: 'São Bernardo',
      city: 'São Bernardo do Campo',
      state: 'SP',
    },
    {
      name: 'Sport',
      shortName: 'Sport',
      city: 'Recife',
      state: 'PE',
    },
    {
      name: 'Vila Nova',
      shortName: 'Vila Nova',
      city: 'Goiânia',
      state: 'GO',
    },
    // Série C 2026
    {
      name: 'Amazonas FC',
      shortName: 'Amazonas',
      city: 'Manaus',
      state: 'AM',
    },
    {
      name: 'Anápolis',
      shortName: 'Anápolis',
      city: 'Anápolis',
      state: 'GO',
    },
    {
      name: 'Barra-SC',
      shortName: 'Barra-SC',
      city: 'Balneário Camboriú',
      state: 'SC',
    },
    {
      name: 'Botafogo-PB',
      shortName: 'Botafogo-PB',
      city: 'João Pessoa',
      state: 'PB',
    },
    {
      name: 'Brusque',
      shortName: 'Brusque',
      city: 'Brusque',
      state: 'SC',
    },
    {
      name: 'Caxias',
      shortName: 'Caxias',
      city: 'Caxias do Sul',
      state: 'RS',
    },
    {
      name: 'Confiança',
      shortName: 'Confiança',
      city: 'Aracaju',
      state: 'SE',
    },
    {
      name: 'Ferroviária',
      shortName: 'Ferroviária',
      city: 'Araraquara',
      state: 'SP',
    },
    {
      name: 'Figueirense',
      shortName: 'Figueirense',
      city: 'Florianópolis',
      state: 'SC',
    },
    {
      name: 'Floresta',
      shortName: 'Floresta',
      city: 'Fortaleza',
      state: 'CE',
    },
    {
      name: 'Guarani',
      shortName: 'Guarani',
      city: 'Campinas',
      state: 'SP',
    },
    {
      name: 'Inter de Limeira',
      shortName: 'Inter de Limeira',
      city: 'Limeira',
      state: 'SP',
    },
    {
      name: 'Itabaiana',
      shortName: 'Itabaiana',
      city: 'Itabaiana',
      state: 'SE',
    },
    {
      name: 'Ituano',
      shortName: 'Ituano',
      city: 'Itu',
      state: 'SP',
    },
    {
      name: 'Maranhão',
      shortName: 'Maranhão',
      city: 'São Luís',
      state: 'MA',
    },
    {
      name: 'Maringá',
      shortName: 'Maringá',
      city: 'Maringá',
      state: 'PR',
    },
    {
      name: 'Paysandu',
      shortName: 'Paysandu',
      city: 'Belém',
      state: 'PA',
    },
    {
      name: 'Santa Cruz',
      shortName: 'Santa Cruz',
      city: 'Recife',
      state: 'PE',
    },
    {
      name: 'Volta Redonda',
      shortName: 'Volta Redonda',
      city: 'Volta Redonda',
      state: 'RJ',
    },
    {
      name: 'Ypiranga-RS',
      shortName: 'Ypiranga',
      city: 'Erechim',
      state: 'RS',
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