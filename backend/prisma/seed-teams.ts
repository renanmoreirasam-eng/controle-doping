import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const teams = [
  // Brasileirão Série A
  { name: 'Atlético Mineiro', shortName: 'Atlético-MG', city: 'Belo Horizonte', state: 'MG', category: 'BRASILEIRAO_SERIE_A' },
  { name: 'Bahia', shortName: 'Bahia', city: 'Salvador', state: 'BA', category: 'BRASILEIRAO_SERIE_A' },
  { name: 'Botafogo', shortName: 'Botafogo', city: 'Rio de Janeiro', state: 'RJ', category: 'BRASILEIRAO_SERIE_A' },
  { name: 'Corinthians', shortName: 'Corinthians', city: 'São Paulo', state: 'SP', category: 'BRASILEIRAO_SERIE_A' },
  { name: 'Cruzeiro', shortName: 'Cruzeiro', city: 'Belo Horizonte', state: 'MG', category: 'BRASILEIRAO_SERIE_A' },
  { name: 'Flamengo', shortName: 'Flamengo', city: 'Rio de Janeiro', state: 'RJ', category: 'BRASILEIRAO_SERIE_A' },
  { name: 'Fluminense', shortName: 'Fluminense', city: 'Rio de Janeiro', state: 'RJ', category: 'BRASILEIRAO_SERIE_A' },
  { name: 'Fortaleza', shortName: 'Fortaleza', city: 'Fortaleza', state: 'CE', category: 'BRASILEIRAO_SERIE_A' },
  { name: 'Grêmio', shortName: 'Grêmio', city: 'Porto Alegre', state: 'RS', category: 'BRASILEIRAO_SERIE_A' },
  { name: 'Internacional', shortName: 'Internacional', city: 'Porto Alegre', state: 'RS', category: 'BRASILEIRAO_SERIE_A' },
  { name: 'Palmeiras', shortName: 'Palmeiras', city: 'São Paulo', state: 'SP', category: 'BRASILEIRAO_SERIE_A' },
  { name: 'Santos', shortName: 'Santos', city: 'Santos', state: 'SP', category: 'BRASILEIRAO_SERIE_A' },
  { name: 'São Paulo', shortName: 'São Paulo', city: 'São Paulo', state: 'SP', category: 'BRASILEIRAO_SERIE_A' },
  { name: 'Vasco da Gama', shortName: 'Vasco', city: 'Rio de Janeiro', state: 'RJ', category: 'BRASILEIRAO_SERIE_A' },
  { name: 'Vitória', shortName: 'Vitória', city: 'Salvador', state: 'BA', category: 'BRASILEIRAO_SERIE_A' },

  // Paulistão Série A1
  { name: 'Botafogo-SP', shortName: 'Botafogo-SP', city: 'Ribeirão Preto', state: 'SP', category: 'PAULISTAO_SERIE_A1' },
  { name: 'Capivariano', shortName: 'Capivariano', city: 'Capivari', state: 'SP', category: 'PAULISTAO_SERIE_A1' },
  { name: 'Guarani', shortName: 'Guarani', city: 'Campinas', state: 'SP', category: 'PAULISTAO_SERIE_A1' },
  { name: 'Mirassol', shortName: 'Mirassol', city: 'Mirassol', state: 'SP', category: 'PAULISTAO_SERIE_A1' },
  { name: 'Noroeste', shortName: 'Noroeste', city: 'Bauru', state: 'SP', category: 'PAULISTAO_SERIE_A1' },
  { name: 'Novorizontino', shortName: 'Novorizontino', city: 'Novo Horizonte', state: 'SP', category: 'PAULISTAO_SERIE_A1' },
  { name: 'Ponte Preta', shortName: 'Ponte Preta', city: 'Campinas', state: 'SP', category: 'PAULISTAO_SERIE_A1' },
  { name: 'Portuguesa', shortName: 'Portuguesa', city: 'São Paulo', state: 'SP', category: 'PAULISTAO_SERIE_A1' },
  { name: 'Primavera', shortName: 'Primavera', city: 'Indaiatuba', state: 'SP', category: 'PAULISTAO_SERIE_A1' },
  { name: 'Red Bull Bragantino', shortName: 'Bragantino', city: 'Bragança Paulista', state: 'SP', category: 'PAULISTAO_SERIE_A1' },
  { name: 'São Bernardo', shortName: 'São Bernardo', city: 'São Bernardo do Campo', state: 'SP', category: 'PAULISTAO_SERIE_A1' },
  { name: 'Velo Clube', shortName: 'Velo Clube', city: 'Rio Claro', state: 'SP', category: 'PAULISTAO_SERIE_A1' },
];

async function main() {
  for (const team of teams) {
    await prisma.team.upsert({
      where: {
        name_state: {
          name: team.name,
          state: team.state,
        },
      },
      update: team,
      create: team,
    });
  }

  console.log('✅ Times carregados com sucesso!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });