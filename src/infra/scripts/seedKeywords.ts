import { prismaClient } from '@infra/clients/prismaClient';
import { uuidv7 } from 'uuidv7';

const categorizedKeywords = [
  // --- 1. CASA, COZINHA & ORGANIZAÇÃO ---
  { keyword: 'organizador casa', category: 'casa' },
  { keyword: 'cozinha utencilios', category: 'casa' },
  { keyword: 'decoracao sala', category: 'casa' },
  { keyword: 'luminaria led', category: 'casa' },
  { keyword: 'mimos para casa', category: 'casa' },
  { keyword: 'achadinhos quarto', category: 'casa' },
  { keyword: 'organizador gaveta', category: 'casa' },
  { keyword: 'achados utilidades', category: 'casa' },
  { keyword: 'mop limpeza', category: 'casa' },
  { keyword: 'panos microfibra', category: 'casa' },
  { keyword: 'organizador geladeira', category: 'casa' },
  { keyword: 'porta tempero', category: 'casa' },
  { keyword: 'parede', category: 'casa' },
  { keyword: 'quadro decorativo', category: 'casa' },
  { keyword: 'almofada decorativa', category: 'casa' },
  { keyword: 'tapete banheiro', category: 'casa' },
  { keyword: 'varal retratil', category: 'casa' },
  { keyword: 'organizador sapatos', category: 'casa' },
  { keyword: 'cabide silicone', category: 'casa' },
  { keyword: 'lixeira automatica', category: 'casa' },
  { keyword: 'difusor ambiente', category: 'casa' },
  { keyword: 'vela aromatica', category: 'casa' },
  { keyword: 'cozinha', category: 'casa' },
  { keyword: 'escorredor pratos', category: 'casa' },
  { keyword: 'potes hermeticos', category: 'casa' },

  // --- 2. ELETRÔNICOS, TECH & GAMER ---
  { keyword: 'celular', category: 'tech' },
  { keyword: 'fone bluetooth', category: 'tech' },
  { keyword: 'relogio smart', category: 'tech' },
  { keyword: 'carregador inducao', category: 'tech' },
  { keyword: 'caixa de som', category: 'tech' },
  { keyword: 'teclado mecanico', category: 'tech' },
  { keyword: 'mouse gamer', category: 'tech' },
  { keyword: 'suporte celular', category: 'tech' },
  { keyword: 'ring light', category: 'tech' },
  { keyword: 'mini projetor', category: 'tech' },
  { keyword: 'fita led rgb', category: 'tech' },
  { keyword: 'headset gamer', category: 'tech' },
  { keyword: 'microfone lapela', category: 'tech' },
  { keyword: 'power bank', category: 'tech' },
  { keyword: 'cabo iphone', category: 'tech' },
  { keyword: 'hub usb', category: 'tech' },
  { keyword: 'relogio inteligente', category: 'tech' },
  { keyword: 'alexa echo', category: 'tech' },
  { keyword: 'humidificador ar', category: 'tech' },
  { keyword: 'mini ventilador', category: 'tech' },
  { keyword: 'carregador portatil', category: 'tech' },
  { keyword: 'caixa som jbl', category: 'tech' },
  { keyword: 'fone gamer', category: 'tech' },
  { keyword: 'mouse pad grande', category: 'tech' },
  { keyword: 'adaptador bluetooth', category: 'tech' },

  // --- 3. BELEZA, ESTILO & CUIDADO PESSOAL ---
  { keyword: 'maquiagem', category: 'beleza' },
  { keyword: 'skincare', category: 'beleza' },
  { keyword: 'protetor solar', category: 'beleza' },
  { keyword: 'perfume importado', category: 'beleza' },
  { keyword: 'lip gloss', category: 'beleza' },
  { keyword: 'organizador maquiagem', category: 'beleza' },
  { keyword: 'escova secadora', category: 'beleza' },
  { keyword: 'paleta sombras', category: 'beleza' },
  { keyword: 'rimel cilios', category: 'beleza' },
  { keyword: 'batom matte', category: 'beleza' },
  { keyword: 'base facial', category: 'beleza' },
  { keyword: 'corretivo alta cobertura', category: 'beleza' },
  { keyword: 'pincel maquiagem', category: 'beleza' },
  { keyword: 'esponja blender', category: 'beleza' },
  { keyword: 'curvex cilios', category: 'beleza' },
  { keyword: 'serum facial', category: 'beleza' },
  { keyword: 'hidratante cerave', category: 'beleza' },
  { keyword: 'mascara argila', category: 'beleza' },
  { keyword: 'agua micelar', category: 'beleza' },
  { keyword: 'oleo capilar', category: 'beleza' },
  { keyword: 'esfoliante corporal', category: 'beleza' },
  { keyword: 'kit unhas em gel', category: 'beleza' },
  { keyword: 'cabine uv unhas', category: 'beleza' },
  { keyword: 'modelador cachos', category: 'beleza' },
  { keyword: 'chapinha ceramica', category: 'beleza' },

  // --- 4. GADGETS CRIATIVOS, INOVAÇÕES & ACHADOS ---
  { keyword: 'garrafa termica', category: 'gadgets' },
  { keyword: 'mini processador', category: 'gadgets' },
  { keyword: 'aspirador po po', category: 'gadgets' },
  { keyword: 'mimos baratinhos', category: 'gadgets' },
  { keyword: 'achados tiktok', category: 'gadgets' },
  { keyword: 'mini selador sacolas', category: 'gadgets' },
  { keyword: 'acendedor eletrico', category: 'gadgets' },
  { keyword: 'mini ferro passar', category: 'gadgets' },
  { keyword: 'balanca digital cozinha', category: 'gadgets' },
  { keyword: 'triturador alho', category: 'gadgets' },
  { keyword: 'bomba agua galao', category: 'gadgets' },
  { keyword: 'esponja eletrica facial', category: 'gadgets' },
  { keyword: 'removedor fiapos', category: 'gadgets' },
  { keyword: 'mini maquina lavar', category: 'gadgets' },
  { keyword: 'projetor galaxia', category: 'gadgets' },
  { keyword: 'luminaria astronauta', category: 'gadgets' },
  { keyword: 'kit ferramentas casa', category: 'gadgets' },
  { keyword: 'fita dupla face forte', category: 'gadgets' },
  { keyword: 'organizador cabos', category: 'gadgets' },
  { keyword: 'camera seguranca wifi', category: 'gadgets' },

  // --- 5. MODA, ACESSÓRIOS & SAZONAIS ---
  { keyword: 'oculos escuros', category: 'moda' },
  { keyword: 'relogio masculino', category: 'moda' },
  { keyword: 'relogio feminino', category: 'moda' },
  { keyword: 'corrente prata', category: 'moda' },
  { keyword: 'brinco argola', category: 'moda' },
  { keyword: 'mochila impermeavel', category: 'moda' },
  { keyword: 'carteira couro', category: 'moda' },
  { keyword: 'bone aba curva', category: 'moda' },
  { keyword: 'meias cano alto', category: 'moda' },
  { keyword: 'shoulder bag', category: 'moda' },
  { keyword: 'bolsa tiracolo', category: 'moda' },
  { keyword: 'necessaire viagem', category: 'moda' },
  { keyword: 'anel regulavel', category: 'moda' },
  { keyword: 'pulseira de miçangas', category: 'moda' },
  { keyword: 'touca cetim', category: 'moda' },

  // --- 6. PETS, AUTOMOTIVO & OUTROS ---
  { keyword: 'brinquedo pet', category: 'outros' },
  { keyword: 'comedouro automatico', category: 'outros' },
  { keyword: 'cama cachorro', category: 'outros' },
  { keyword: 'arranhador gato', category: 'outros' },
  { keyword: 'fonte agua pet', category: 'outros' },
  { keyword: 'suporte celular carro', category: 'outros' },
  { keyword: 'aspirador po portatil carro', category: 'outros' },
  { keyword: 'som automotivo', category: 'outros' },
  { keyword: 'organizador porta malas', category: 'outros' },
  { keyword: 'led automotivo', category: 'outros' },
];

async function main() {
  // eslint-disable-next-line no-console
  console.log('🌱 [Seed] Iniciando população da tabela search_keywords categorizadas...');

  let insertedCount = 0;

  for (const item of categorizedKeywords) {
    // Usando upsert para atualizar a categoria caso o registro já exista sem ela
    await prismaClient.searchKeyword.upsert({
      where: { keyword: item.keyword },
      update: {
        category: item.category,
      },
      create: {
        id: uuidv7(),
        keyword: item.keyword,
        category: item.category,
        isActive: true,
      },
    });
    insertedCount++;
  }

  // eslint-disable-next-line no-console
  console.log(
    `✅ [Seed] Concluído! ${insertedCount} palavras-chave prontas e categorizadas para o rodízio.`,
  );
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('❌ [Seed] Erro ao popular banco de dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
