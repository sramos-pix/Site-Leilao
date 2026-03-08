import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ChevronDown, ShieldCheck, Gavel, CreditCard, Car, AlertTriangle, Scale, Phone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { cn } from '@/lib/utils';

const sections = [
  {
    id: 'aceitacao',
    icon: FileText,
    title: '1. Aceitação dos Termos',
    content: [
      {
        subtitle: '1.1 Concordância',
        text: 'Ao acessar, navegar ou utilizar a plataforma AutoBid BR (autobidbr.com), você declara ter lido, compreendido e aceito integralmente os presentes Termos e Condições de Uso. Caso não concorde com qualquer disposição aqui contida, abstenha-se de utilizar os serviços.',
      },
      {
        subtitle: '1.2 Capacidade Legal',
        text: 'O uso da plataforma é restrito a pessoas físicas maiores de 18 (dezoito) anos e plenamente capazes nos termos da lei civil brasileira, ou pessoas jurídicas devidamente constituídas e representadas. Ao se cadastrar, você confirma que atende a esses requisitos.',
      },
      {
        subtitle: '1.3 Alterações',
        text: 'A AutoBid BR reserva-se o direito de modificar estes Termos a qualquer momento. As alterações entram em vigor imediatamente após publicação. O uso continuado da plataforma após qualquer modificação constitui aceitação das novas condições. Recomendamos a leitura periódica deste documento.',
      },
    ],
  },
  {
    id: 'cadastro',
    icon: ShieldCheck,
    title: '2. Cadastro e Conta de Usuário',
    content: [
      {
        subtitle: '2.1 Registro',
        text: 'Para participar dos leilões, é obrigatório criar uma conta na plataforma, fornecendo informações verdadeiras, completas e atualizadas. O usuário é responsável por manter seus dados cadastrais atualizados.',
      },
      {
        subtitle: '2.2 Verificação de Identidade',
        text: 'A AutoBid BR exige a verificação de identidade para habilitação em leilões. O usuário deverá enviar documentos oficiais com foto (RG ou CNH, frente e verso) e uma selfie segurando o documento. A verificação é realizada em até 24 horas úteis.',
      },
      {
        subtitle: '2.3 Segurança da Conta',
        text: 'O usuário é responsável pela confidencialidade de suas credenciais de acesso (login e senha). Qualquer atividade realizada com sua conta será de sua inteira responsabilidade. Em caso de uso não autorizado, notifique imediatamente a AutoBid BR.',
      },
      {
        subtitle: '2.4 Vedações',
        text: 'É expressamente proibido: (a) criar contas falsas ou em nome de terceiros sem autorização; (b) utilizar sistemas automatizados para acesso; (c) compartilhar credenciais com terceiros; (d) criar múltiplas contas para um mesmo usuário.',
      },
    ],
  },
  {
    id: 'leiloes',
    icon: Gavel,
    title: '3. Participação nos Leilões',
    content: [
      {
        subtitle: '3.1 Habilitação',
        text: 'Para participar de um leilão específico, o usuário deve se habilitar dentro do prazo estabelecido no edital. A habilitação implica na concordância com as regras específicas daquele leilão, conforme publicadas no edital.',
      },
      {
        subtitle: '3.2 Lances',
        text: 'Os lances são ofertas firmes, definitivas e irrevogáveis. Uma vez confirmado, o lance não pode ser cancelado ou alterado. O usuário deve verificar o valor antes de confirmar qualquer lance. O maior lance ao término do pregão sagra o vencedor.',
      },
      {
        subtitle: '3.4 Empate',
        text: 'Em caso de ofertas de mesmo valor, prevalece aquela registrada primeiro no sistema, conforme o timestamp exato de cada lance. A decisão do sistema é definitiva e não passível de recurso.',
      },
      {
        subtitle: '3.5 Encerramento',
        text: 'Os leilões têm data e hora de encerramento fixadas no edital. A plataforma pode estender automaticamente o prazo do leilão (prorrogação) caso um lance seja ofertado nos últimos minutos, conforme regras de cada edital.',
      },
    ],
  },
  {
    id: 'pagamento',
    icon: CreditCard,
    title: '4. Pagamento e Taxas',
    content: [
      {
        subtitle: '4.1 Obrigação de Pagamento',
        text: 'O arrematante assume obrigação legal de efetuar o pagamento integral do valor do arremate, acrescido de todas as taxas previstas no edital, dentro do prazo estabelecido. O não pagamento constitui infração grave.',
      },
      {
        subtitle: '4.2 Taxa do Comprador',
        text: 'Sobre o valor do arremate incidirá a taxa do comprador (comissão do leiloeiro), cujo percentual está claramente indicado no edital de cada leilão. Essa taxa é parte integrante do preço total e está sujeita a tributação conforme legislação vigente.',
      },
      {
        subtitle: '4.3 Forma de Pagamento',
        text: 'O pagamento deverá ser realizado exclusivamente via Pix Bancário Judicial, nos dados informados após o arremate. Não são aceitas outras formas de pagamento, como dinheiro em espécie, cheque, financiamento ou parcelamento.',
      },
      {
        subtitle: '4.4 Prazo e Consequências do Inadimplemento',
        text: 'O prazo para pagamento é definido no edital de cada leilão (em geral, 24 a 72 horas). O não pagamento no prazo acarretará: (a) perda do direito ao arremate; (b) multa contratual; (c) suspensão ou cancelamento da conta na plataforma; (d) as demais consequências legais previstas em lei e no edital.',
      },
    ],
  },
  {
    id: 'veiculos',
    icon: Car,
    title: '5. Veículos e Responsabilidades',
    content: [
      {
        subtitle: '5.1 Estado dos Veículos',
        text: 'Os veículos são vendidos no estado em que se encontram ("as is"), conforme descritos nos editais e fotos disponibilizadas. O arrematante declara ter avaliado todas as informações disponíveis antes de ofertar.',
      },
      {
        subtitle: '5.2 Vistoria',
        text: 'A AutoBid BR disponibiliza fotos detalhadas e descrição do estado de conservação de cada veículo. Quando indicado no edital, vistorias presenciais podem ser agendadas. Após o arremate, não serão aceitas reclamações sobre o estado do veículo.',
      },
      {
        subtitle: '5.3 Documentação',
        text: 'Após quitação integral, a AutoBid BR providenciará a documentação necessária para transferência do veículo, conforme previsto em cada edital. O prazo para transferência e eventuais custos estão descritos no edital de cada leilão.',
      },
      {
        subtitle: '5.4 Retirada',
        text: 'O veículo deve ser retirado no local, data e horário indicados no edital, após confirmação do pagamento. A não retirada no prazo pode acarretar cobrança de diárias de pátio, conforme previsto no edital.',
      },
    ],
  },
  {
    id: 'responsabilidades',
    icon: AlertTriangle,
    title: '6. Limitação de Responsabilidade',
    content: [
      {
        subtitle: '6.1 Disponibilidade da Plataforma',
        text: 'A AutoBid BR não garante disponibilidade ininterrupta da plataforma. Manutenções, falhas técnicas ou eventos de força maior podem ocasionar indisponibilidades. A AutoBid BR não se responsabiliza por perdas decorrentes de eventual indisponibilidade.',
      },
      {
        subtitle: '6.2 Informações dos Lotes',
        text: 'As informações sobre os veículos são fornecidas pelos depositários ou órgãos responsáveis. A AutoBid BR atua como intermediária e não se responsabiliza por eventuais divergências entre as informações descritas e o estado real dos bens.',
      },
      {
        subtitle: '6.3 Danos Indiretos',
        text: 'Em nenhuma hipótese a AutoBid BR será responsável por danos indiretos, lucros cessantes, danos emergentes ou qualquer outra perda consequencial decorrente do uso ou impossibilidade de uso da plataforma.',
      },
    ],
  },
  {
    id: 'lgpd',
    icon: Scale,
    title: '7. Privacidade e LGPD',
    content: [
      {
        subtitle: '7.1 Tratamento de Dados',
        text: 'O tratamento de dados pessoais pela AutoBid BR é realizado em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). Para detalhes sobre como coletamos, usamos e protegemos seus dados, consulte nossa Política de Privacidade.',
      },
      {
        subtitle: '7.2 Consentimento',
        text: 'Ao criar sua conta, você consente com o tratamento de seus dados pessoais para as finalidades descritas na Política de Privacidade, incluindo verificação de identidade, operação da plataforma e comunicações relacionadas ao serviço.',
      },
      {
        subtitle: '7.3 Seus Direitos',
        text: 'Você tem direito a: acessar seus dados, corrigir informações incorretas, solicitar a exclusão de dados (quando aplicável), revogar consentimento e portabilidade de dados, conforme previsto na LGPD. Para exercer esses direitos, entre em contato pelo e-mail contato@autobidbr.com.',
      },
    ],
  },
  {
    id: 'disposicoes',
    icon: FileText,
    title: '8. Disposições Gerais',
    content: [
      {
        subtitle: '8.1 Lei Aplicável e Foro',
        text: 'Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer controvérsias decorrentes destes Termos, com renúncia expressa a qualquer outro, por mais privilegiado que seja.',
      },
      {
        subtitle: '8.2 Invalidade Parcial',
        text: 'Caso qualquer disposição destes Termos seja considerada inválida ou inexequível, as demais disposições permanecerão em pleno vigor e efeito.',
      },
      {
        subtitle: '8.3 Contato',
        text: 'Dúvidas, solicitações ou reclamações relacionadas a estes Termos podem ser encaminhadas pelo e-mail contato@autobidbr.com ou pelo telefone indicado no rodapé do site, nos horários de atendimento disponíveis.',
      },
    ],
  },
];

const SectionItem = ({
  section,
  isActive,
  onToggle,
}: {
  section: (typeof sections)[0];
  isActive: boolean;
  onToggle: () => void;
}) => (
  <div
    className={cn(
      'border rounded-2xl overflow-hidden transition-all duration-200',
      isActive
        ? 'border-orange-200 bg-white shadow-md'
        : 'border-slate-100 bg-white hover:border-orange-100'
    )}
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 p-6 text-left"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors',
            isActive ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'
          )}
        >
          <section.icon size={18} />
        </div>
        <span className="font-bold text-slate-900">{section.title}</span>
      </div>
      <ChevronDown
        size={20}
        className={cn(
          'text-orange-500 shrink-0 transition-transform duration-300',
          isActive && 'rotate-180'
        )}
      />
    </button>

    {isActive && (
      <div className="px-6 pb-6 border-t border-slate-100">
        <div className="pt-4 space-y-5">
          {section.content.map((item, i) => (
            <div key={i}>
              <h4 className="text-sm font-bold text-slate-800 mb-1">{item.subtitle}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const Terms = () => {
  const [activeSection, setActiveSection] = useState<string | null>('aceitacao');

  const toggle = (id: string) =>
    setActiveSection((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SEO
        title="Termos e Condições | AutoBid BR — Leilões de Veículos"
        description="Leia os Termos e Condições de Uso da plataforma AutoBid BR. Saiba seus direitos e deveres ao participar de leilões de veículos online."
        keywords="termos e condições leilão de veículos, contrato leilão online, regras leilão AutoBid, termos de uso leilão carro"
      />
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-500/5 blur-[100px]" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
              <Scale size={14} />
              Documento Legal
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6">
              Termos e <span className="text-orange-500">Condições</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Leia com atenção antes de utilizar a plataforma. Ao criar sua conta,
              você concorda com todas as condições descritas abaixo.
            </p>
            <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-400 px-4 py-2 rounded-full text-xs">
              <FileText size={13} />
              Última atualização: março de 2026
            </div>
          </div>
        </section>

        {/* Conteúdo */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">

              {/* Sidebar — índice */}
              <aside className="lg:w-64 shrink-0">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 lg:sticky lg:top-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-3">
                    Seções
                  </p>
                  <nav className="flex flex-col gap-1">
                    {sections.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setActiveSection(s.id);
                          document
                            .getElementById(s.id)
                            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left',
                          activeSection === s.id
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                            : 'text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        <s.icon size={15} className="shrink-0" />
                        <span className="leading-tight">
                          {s.title.replace(/^\d+\.\s/, '')}
                        </span>
                      </button>
                    ))}
                  </nav>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <Link
                      to="/privacy"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all"
                    >
                      <ShieldCheck size={15} />
                      Política de Privacidade
                    </Link>
                  </div>
                </div>
              </aside>

              {/* Seções */}
              <div className="flex-1 min-w-0">
                {/* Aviso */}
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex gap-3 mb-6">
                  <AlertTriangle size={20} className="text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-orange-800 mb-1">
                      Leitura recomendada
                    </p>
                    <p className="text-xs text-orange-700 leading-relaxed">
                      Estes Termos constituem um contrato legal entre você e a AutoBid BR.
                      A participação em qualquer leilão implica aceitação integral de todas
                      as cláusulas aqui descritas.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {sections.map((s) => (
                    <div key={s.id} id={s.id}>
                      <SectionItem
                        section={s}
                        isActive={activeSection === s.id}
                        onToggle={() => toggle(s.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-orange-500">
          <div className="container mx-auto px-4 text-center text-white">
            <Phone size={40} className="mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Ficou com alguma dúvida?
            </h2>
            <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
              Nossa equipe jurídica e de suporte está disponível para esclarecer
              qualquer ponto destes Termos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <button className="bg-white text-orange-600 hover:bg-slate-100 px-10 py-4 rounded-2xl font-bold text-lg w-full sm:w-auto transition-colors">
                  Falar com o Suporte
                </button>
              </Link>
              <Link to="/faq">
                <button className="border-2 border-white/40 text-white hover:bg-white/10 px-10 py-4 rounded-2xl font-bold text-lg w-full sm:w-auto transition-colors">
                  Ver Perguntas Frequentes
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
