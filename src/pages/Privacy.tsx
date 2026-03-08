import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, ChevronDown, Eye, Database, Lock, Users, Cookie, FileText, Mail, Trash2, Globe
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { cn } from '@/lib/utils';

const sections = [
  {
    id: 'introducao',
    icon: Shield,
    title: '1. Introdução e Controlador dos Dados',
    content: [
      {
        subtitle: '1.1 Quem Somos',
        text: 'A AutoBid BR Leilões S.A. ("AutoBid BR", "nós", "nosso") é a controladora dos seus dados pessoais, responsável por determinar como e por que eles são utilizados. Nosso site é autobidbr.com e nosso e-mail de contato para assuntos de privacidade é privacidade@autobidbr.com.br.',
      },
      {
        subtitle: '1.2 Esta Política',
        text: 'Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos, compartilhamos e protegemos seus dados pessoais ao utilizar nossa plataforma. Ela está em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018).',
      },
      {
        subtitle: '1.3 Aceitação',
        text: 'Ao criar uma conta ou utilizar nossos serviços, você declara ter lido e compreendido esta Política. Caso não concorde com qualquer disposição, recomendamos que não utilize a plataforma.',
      },
    ],
  },
  {
    id: 'dados-coletados',
    icon: Database,
    title: '2. Dados que Coletamos',
    content: [
      {
        subtitle: '2.1 Dados de Cadastro',
        text: 'Ao criar sua conta, coletamos: nome completo, CPF (para verificação de identidade), data de nascimento, endereço de e-mail, número de telefone e senha (armazenada de forma criptografada).',
      },
      {
        subtitle: '2.2 Documentos de Verificação',
        text: 'Para habilitação nos leilões, solicitamos documentos de identidade (RG ou CNH, frente e verso) e selfie com documento. Esses dados são utilizados exclusivamente para verificação de identidade e conformidade legal.',
      },
      {
        subtitle: '2.3 Dados de Uso',
        text: 'Coletamos automaticamente informações sobre como você utiliza a plataforma: leilões visitados, lotes visualizados, lances realizados, favoritos adicionados, horários de acesso e dispositivo utilizado.',
      },
      {
        subtitle: '2.4 Dados de Navegação',
        text: 'Utilizamos cookies e tecnologias similares para coletar: endereço IP, tipo de navegador, sistema operacional, páginas acessadas e duração das visitas. Consulte nossa seção de Cookies para mais detalhes.',
      },
      {
        subtitle: '2.5 Dados de Pagamento',
        text: 'Informações financeiras relacionadas às transações realizadas. Dados de cartão de crédito não são armazenados em nossos servidores — são processados diretamente pelo gateway de pagamento certificado PCI DSS.',
      },
    ],
  },
  {
    id: 'uso-dados',
    icon: Eye,
    title: '3. Como Utilizamos seus Dados',
    content: [
      {
        subtitle: '3.1 Prestação do Serviço',
        text: 'Utilizamos seus dados para: criar e gerenciar sua conta, processar lances e transações, enviar notificações sobre leilões e lotes de interesse, verificar sua identidade para habilitação nos leilões e fornecer suporte ao cliente.',
      },
      {
        subtitle: '3.2 Comunicações',
        text: 'Podemos usar seu e-mail e telefone para: confirmar cadastro e transações, notificar sobre lances superados ou vencidos, enviar alertas de leilões com veículos de seu interesse e comunicados operacionais importantes.',
      },
      {
        subtitle: '3.3 Marketing (com consentimento)',
        text: 'Somente com seu consentimento explícito, utilizamos seus dados para: enviar newsletters com ofertas e novidades, personalizar anúncios em plataformas como Google e Meta, e realizar análises de comportamento para melhorar a experiência. Você pode retirar esse consentimento a qualquer momento.',
      },
      {
        subtitle: '3.4 Segurança e Prevenção de Fraudes',
        text: 'Analisamos padrões de uso para identificar e prevenir fraudes, uso não autorizado de contas, comportamentos suspeitos nos leilões e outras atividades ilícitas.',
      },
      {
        subtitle: '3.5 Obrigações Legais',
        text: 'Podemos tratar seus dados para cumprir obrigações legais, regulatórias ou por ordem judicial, incluindo reportes a autoridades competentes quando exigido por lei.',
      },
    ],
  },
  {
    id: 'compartilhamento',
    icon: Users,
    title: '4. Compartilhamento de Dados',
    content: [
      {
        subtitle: '4.1 Com Quem Compartilhamos',
        text: 'Seus dados pessoais podem ser compartilhados com: (a) Fornecedores de serviço — empresas que nos auxiliam na operação da plataforma (ex: processadores de pagamento, hospedagem em nuvem, serviços de e-mail), vinculados por contratos de proteção de dados; (b) Parceiros comerciais — comitentes e leiloeiros responsáveis pelos veículos leiloados, apenas com os dados necessários para a transação; (c) Autoridades — órgãos governamentais, judiciais ou regulatórios quando exigido por lei.',
      },
      {
        subtitle: '4.2 Transferência Internacional',
        text: 'Alguns de nossos fornecedores podem estar localizados fora do Brasil (ex: servidores em nuvem nos EUA). Nesses casos, garantimos que essas transferências ocorram em conformidade com a LGPD, com salvaguardas adequadas como cláusulas contratuais padrão.',
      },
      {
        subtitle: '4.3 O que Não Fazemos',
        text: 'Nunca vendemos, alugamos ou cedemos seus dados pessoais a terceiros para fins comerciais não autorizados. Nunca compartilhamos seus dados sem base legal adequada.',
      },
    ],
  },
  {
    id: 'seguranca',
    icon: Lock,
    title: '5. Segurança dos Dados',
    content: [
      {
        subtitle: '5.1 Medidas Técnicas',
        text: 'Adotamos medidas técnicas e organizacionais para proteger seus dados: criptografia SSL/TLS em todas as transmissões, senhas armazenadas com hash (nunca em texto puro), controle de acesso por autenticação forte, monitoramento contínuo de atividades suspeitas e backups regulares com criptografia.',
      },
      {
        subtitle: '5.2 Infraestrutura',
        text: 'Nossa plataforma é hospedada na Supabase (com infraestrutura AWS), que mantém certificações de segurança SOC 2 Tipo II. Os dados são armazenados em servidores na região de São Paulo, Brasil.',
      },
      {
        subtitle: '5.3 Incidentes de Segurança',
        text: 'Em caso de incidente de segurança que possa afetar seus direitos, notificaremos você e a Autoridade Nacional de Proteção de Dados (ANPD) dentro dos prazos estabelecidos pela LGPD.',
      },
    ],
  },
  {
    id: 'cookies',
    icon: Cookie,
    title: '6. Cookies e Tecnologias de Rastreamento',
    content: [
      {
        subtitle: '6.1 O que são Cookies',
        text: 'Cookies são pequenos arquivos de texto armazenados em seu dispositivo que nos ajudam a lembrar suas preferências, entender como você usa o site e personalizar sua experiência.',
      },
      {
        subtitle: '6.2 Tipos que Utilizamos',
        text: 'Utilizamos: (a) Cookies essenciais — necessários para o funcionamento básico da plataforma (autenticação, segurança); (b) Cookies analíticos — para entender padrões de uso (ex: Google Analytics); (c) Cookies de marketing — para personalizar anúncios (ex: Meta Pixel, Google Ads); (d) Cookies de preferência — para lembrar suas configurações na plataforma.',
      },
      {
        subtitle: '6.3 Controle de Cookies',
        text: 'Você pode configurar seu navegador para recusar todos ou alguns cookies, ou para alertar você quando cookies estão sendo enviados. No entanto, se você desabilitar cookies essenciais, partes da plataforma podem não funcionar corretamente.',
      },
      {
        subtitle: '6.4 Pixels de Rastreamento',
        text: 'Utilizamos o Meta Pixel (Facebook/Instagram) e tags do Google para mensurar a eficácia de nossos anúncios e otimizar campanhas. Esses terceiros possuem suas próprias políticas de privacidade, acessíveis em seus respectivos sites.',
      },
    ],
  },
  {
    id: 'direitos',
    icon: FileText,
    title: '7. Seus Direitos (LGPD)',
    content: [
      {
        subtitle: '7.1 Direitos Garantidos',
        text: 'Conforme a LGPD (Art. 18), você tem direito a: (a) Confirmação — saber se tratamos seus dados; (b) Acesso — obter cópia dos dados que temos sobre você; (c) Correção — corrigir dados incompletos, inexatos ou desatualizados; (d) Anonimização ou Exclusão — quando os dados forem desnecessários ou tratados em desconformidade com a lei; (e) Portabilidade — receber seus dados em formato estruturado; (f) Informação — sobre com quem compartilhamos seus dados; (g) Revogação do Consentimento — retirar consentimento a qualquer momento; (h) Oposição — opor-se ao tratamento quando não houver base legal adequada.',
      },
      {
        subtitle: '7.2 Como Exercer seus Direitos',
        text: 'Para exercer qualquer um dos direitos acima, entre em contato pelo e-mail privacidade@autobidbr.com.br ou pela página de suporte da plataforma. Responderemos em até 15 dias úteis conforme exigido pela LGPD.',
      },
      {
        subtitle: '7.3 Reclamações',
        text: 'Se você acredita que seus direitos não foram respeitados, pode contatar a Autoridade Nacional de Proteção de Dados (ANPD) pelo site gov.br/anpd.',
      },
    ],
  },
  {
    id: 'retencao',
    icon: Trash2,
    title: '8. Retenção e Exclusão de Dados',
    content: [
      {
        subtitle: '8.1 Período de Retenção',
        text: 'Mantemos seus dados pelo tempo necessário para os fins para os quais foram coletados: dados de conta — enquanto sua conta estiver ativa; dados de transações — até 5 anos após a transação (obrigação fiscal e legal); documentos de KYC — até 5 anos conforme regulamentação de combate à lavagem de dinheiro.',
      },
      {
        subtitle: '8.2 Exclusão de Conta',
        text: 'Ao solicitar a exclusão de sua conta, eliminaremos seus dados pessoais, exceto aqueles que somos obrigados a manter por lei. A exclusão pode levar até 30 dias para ser concluída em todos os sistemas.',
      },
    ],
  },
  {
    id: 'contato',
    icon: Mail,
    title: '9. Contato e DPO',
    content: [
      {
        subtitle: '9.1 Encarregado de Dados (DPO)',
        text: 'Nomeamos um Encarregado de Proteção de Dados (DPO) responsável por supervisionar nossas práticas de privacidade e ser o ponto de contato com a ANPD.',
      },
      {
        subtitle: '9.2 Como nos Contatar',
        text: 'Para qualquer questão sobre privacidade, proteção de dados ou para exercer seus direitos: E-mail: privacidade@autobidbr.com.br | Telefone: 0800 123 4567 | Horário: Segunda a Sexta, 09h às 18h',
      },
      {
        subtitle: '9.3 Atualizações desta Política',
        text: 'Esta Política pode ser atualizada periodicamente. Notificaremos você sobre mudanças significativas por e-mail ou mediante aviso em destaque na plataforma. A data da última atualização está indicada no final deste documento.',
      },
    ],
  },
];

const SectionItem = ({ section }: { section: typeof sections[0] }) => {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="bg-orange-50 p-2.5 rounded-xl">
            <Icon size={20} className="text-orange-500" />
          </div>
          <span className="font-bold text-slate-900 text-base">{section.title}</span>
        </div>
        <ChevronDown
          size={20}
          className={cn(
            'text-slate-400 transition-transform duration-200 shrink-0',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-5 border-t border-slate-100 pt-5">
          {section.content.map((item, i) => (
            <div key={i}>
              <h4 className="font-bold text-slate-800 text-sm mb-1.5">{item.subtitle}</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Privacy = () => {
  return (
    <>
      <SEO
        title="Política de Privacidade — AutoBid BR"
        description="Saiba como a AutoBid BR coleta, utiliza e protege seus dados pessoais em conformidade com a LGPD."
      />
      <Navbar />

      <main className="min-h-screen bg-slate-50">
        {/* Hero */}
        <div className="bg-slate-900 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wider">
              <Shield size={14} />
              Privacidade &amp; LGPD
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
              Política de Privacidade
            </h1>
            <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
              Seu dado pessoal é um ativo valioso. Explicamos aqui como coletamos, usamos e protegemos suas informações na plataforma AutoBid BR.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Globe size={14} className="text-orange-500" />
                Aplicável a todos os usuários
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={14} className="text-orange-500" />
                Em conformidade com a LGPD
              </span>
              <span className="flex items-center gap-1.5">
                <FileText size={14} className="text-orange-500" />
                Última atualização: 08/03/2026
              </span>
            </div>
          </div>
        </div>

        {/* Resumo rápido */}
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 mb-10">
            <h2 className="font-black text-slate-900 text-base mb-3 flex items-center gap-2">
              <Eye size={18} className="text-orange-500" />
              Resumo em linguagem simples
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: Database,
                  title: 'Coletamos',
                  desc: 'Nome, CPF, e-mail, documentos de identidade e dados de uso da plataforma',
                },
                {
                  icon: Eye,
                  title: 'Usamos para',
                  desc: 'Criar sua conta, processar lances, verificar identidade e melhorar a plataforma',
                },
                {
                  icon: Lock,
                  title: 'Protegemos com',
                  desc: 'Criptografia SSL, hash de senhas e infraestrutura certificada em São Paulo',
                },
              ].map((item, i) => {
                const ItemIcon = item.icon;
                return (
                  <div key={i} className="bg-white rounded-xl p-4 border border-orange-100">
                    <div className="flex items-center gap-2 mb-2">
                      <ItemIcon size={16} className="text-orange-500" />
                      <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seções */}
          <div className="space-y-3">
            {sections.map((section) => (
              <SectionItem key={section.id} section={section} />
            ))}
          </div>

          {/* Rodapé legal */}
          <div className="mt-12 pt-8 border-t border-slate-200 text-center space-y-3">
            <p className="text-xs text-slate-400">
              Esta Política de Privacidade é regida pelas leis da República Federativa do Brasil.
              Última atualização: 08 de março de 2026.
            </p>
            <p className="text-xs text-slate-400">
              Dúvidas?{' '}
              <a href="mailto:privacidade@autobidbr.com.br" className="text-orange-500 font-semibold hover:underline">
                privacidade@autobidbr.com.br
              </a>{' '}
              ou acesse nossa{' '}
              <Link to="/contact" className="text-orange-500 font-semibold hover:underline">
                página de suporte
              </Link>
              .
            </p>
            <p className="text-xs text-slate-400">
              Veja também:{' '}
              <Link to="/terms" className="text-orange-500 font-semibold hover:underline">
                Termos e Condições
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Privacy;
