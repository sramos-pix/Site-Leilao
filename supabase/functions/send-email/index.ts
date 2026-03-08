// supabase/functions/send-email/index.ts
// AutoBid BR — Sistema de Emails Automatizados via Resend
//
// Deploy: npx supabase functions deploy send-email
// Segredos: npx supabase secrets set RESEND_API_KEY=re_xxxxx
//
// Tipos suportados:
//   welcome          → boas-vindas após cadastro
//   docs-reminder    → lembrete para enviar documentos (24h/72h sem envio)
//   docs-approved    → documentos aprovados, usuário liberado
//   bid-confirmed    → confirmação de lance realizado
//   bid-outbid       → seu lance foi superado
//   auto-bid-fired   → lance automático foi acionado
//   auction-won      → parabéns, você arrematou!
//   favorite-ending  → leilão favorito encerrando em breve
//   reengagement     → usuário inativo há 30 dias

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
// Email enviado pelo domínio autobidbr.com.br (verificado no Resend)
// Site principal corre em autobidbr.com — SITE_URL abaixo já correto
const FROM_EMAIL = "AutoBid BR <noreply@autobidbr.com.br>";
const SITE_URL = "https://autobidbr.com";

// ─────────────────────────────────────────────
// UTILITÁRIOS
// ─────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// ─────────────────────────────────────────────
// TEMPLATES HTML
// ─────────────────────────────────────────────

function baseTemplate(content: string, previewText: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AutoBid BR</title>
  <meta name="x-apple-disable-message-reformatting" />
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <!-- Preview text -->
  <div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#0f172a;border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
              <a href="${SITE_URL}" style="text-decoration:none;">
                <span style="font-size:28px;font-weight:900;letter-spacing:-1px;">
                  <span style="color:#f97316;">AUTO</span><span style="color:#ffffff;">BID</span>
                </span>
                <div style="color:#64748b;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-top:4px;">Leilões de Veículos</div>
              </a>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f172a;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
              <p style="color:#475569;font-size:12px;margin:0 0 8px;">
                © ${new Date().getFullYear()} AutoBid BR Leilões S.A. — Todos os direitos reservados.
              </p>
              <p style="margin:0;">
                <a href="${SITE_URL}/privacy" style="color:#64748b;font-size:11px;text-decoration:none;margin:0 8px;">Privacidade</a>
                <a href="${SITE_URL}/terms" style="color:#64748b;font-size:11px;text-decoration:none;margin:0 8px;">Termos</a>
                <a href="${SITE_URL}/contact" style="color:#64748b;font-size:11px;text-decoration:none;margin:0 8px;">Suporte</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function primaryButton(text: string, url: string): string {
  return `
    <div style="text-align:center;margin:32px 0;">
      <a href="${url}"
         style="display:inline-block;background:#f97316;color:#ffffff;font-size:16px;font-weight:700;
                padding:16px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;">
        ${text}
      </a>
    </div>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />`;
}

// ─────────────────────────────────────────────
// EMAILS INDIVIDUAIS
// ─────────────────────────────────────────────

function welcomeEmail(name: string): { subject: string; html: string } {
  const content = `
    <h1 style="color:#0f172a;font-size:26px;font-weight:900;margin:0 0 8px;">
      Bem-vindo à AutoBid BR, ${name}! 🎉
    </h1>
    <p style="color:#64748b;font-size:15px;margin:0 0 24px;">
      Sua conta foi criada com sucesso. Você está a um passo de participar dos melhores leilões de veículos do Brasil.
    </p>

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px;margin:0 0 28px;">
      <p style="color:#9a3412;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">
        📋 Próximos Passos
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;color:#1e293b;font-size:14px;">
            <span style="color:#f97316;font-weight:700;margin-right:10px;">1</span> Envie seus documentos para habilitação
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#1e293b;font-size:14px;">
            <span style="color:#f97316;font-weight:700;margin-right:10px;">2</span> Aguarde a aprovação (até 24h úteis)
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#1e293b;font-size:14px;">
            <span style="color:#f97316;font-weight:700;margin-right:10px;">3</span> Explore os leilões e dê seus lances!
          </td>
        </tr>
      </table>
    </div>

    ${primaryButton("Completar Meu Cadastro", `${SITE_URL}/app/verify`)}

    ${divider()}
    <p style="color:#94a3b8;font-size:13px;text-align:center;">
      Dúvidas? Fale com nosso suporte em
      <a href="${SITE_URL}/contact" style="color:#f97316;text-decoration:none;">autobidbr.com/contact</a>
    </p>`;

  return {
    subject: `Bem-vindo à AutoBid BR, ${name}! 🚗`,
    html: baseTemplate(content, `Sua conta foi criada! Complete o cadastro para participar dos leilões.`),
  };
}

function docsReminderEmail(name: string, hours: number): { subject: string; html: string } {
  const isUrgent = hours >= 72;
  const content = `
    <h1 style="color:#0f172a;font-size:24px;font-weight:900;margin:0 0 8px;">
      ${isUrgent ? "⚠️" : "📎"} Seus documentos ainda não foram enviados
    </h1>
    <p style="color:#64748b;font-size:15px;margin:0 0 24px;">
      Olá, <strong>${name}</strong>! Notamos que você ainda não enviou os documentos necessários para se habilitar nos leilões.
    </p>

    <div style="background:${isUrgent ? "#fef2f2" : "#eff6ff"};border:1px solid ${isUrgent ? "#fecaca" : "#bfdbfe"};border-radius:12px;padding:20px;margin:0 0 24px;">
      <p style="color:${isUrgent ? "#991b1b" : "#1e40af"};font-size:14px;font-weight:600;margin:0;">
        ${isUrgent
    ? "Não fique de fora! Leilões imperdíveis estão acontecendo agora."
    : "O processo de aprovação leva apenas 24 horas úteis após o envio."}
      </p>
    </div>

    <p style="color:#475569;font-size:14px;margin:0 0 8px;"><strong>O que você precisa enviar:</strong></p>
    <ul style="color:#64748b;font-size:14px;padding-left:20px;margin:0 0 24px;">
      <li style="margin-bottom:8px;">RG ou CNH (frente e verso)</li>
      <li style="margin-bottom:8px;">Selfie segurando o documento</li>
    </ul>

    ${primaryButton("Enviar Documentos Agora", `${SITE_URL}/app/verify`)}`;

  return {
    subject: isUrgent
      ? `⚠️ ${name}, seus documentos ainda estão pendentes`
      : `📎 Complete seu cadastro, ${name} — falta pouco!`,
    html: baseTemplate(content, `Envie seus documentos e participe dos leilões em 24h.`),
  };
}

function docsApprovedEmail(name: string): { subject: string; html: string } {
  const content = `
    <div style="text-align:center;margin:0 0 32px;">
      <div style="display:inline-block;background:#f0fdf4;border:2px solid #86efac;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">
        ✅
      </div>
    </div>
    <h1 style="color:#0f172a;font-size:26px;font-weight:900;text-align:center;margin:0 0 8px;">
      Documentos Aprovados!
    </h1>
    <p style="color:#64748b;font-size:15px;text-align:center;margin:0 0 32px;">
      Parabéns, <strong>${name}</strong>! Sua conta foi verificada e você já está habilitado para participar de todos os leilões da AutoBid BR.
    </p>

    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px;margin:0 0 28px;text-align:center;">
      <p style="color:#166534;font-size:15px;font-weight:700;margin:0;">
        🎉 Você pode dar lances agora mesmo!
      </p>
    </div>

    ${primaryButton("Ver Leilões Disponíveis", `${SITE_URL}/auctions`)}`;

  return {
    subject: `✅ Conta verificada! Você já pode dar lances, ${name}`,
    html: baseTemplate(content, `Seus documentos foram aprovados. Participe dos leilões agora!`),
  };
}

function bidConfirmedEmail(
  name: string,
  vehicleName: string,
  amount: number,
  lotId: string
): { subject: string; html: string } {
  const content = `
    <h1 style="color:#0f172a;font-size:24px;font-weight:900;margin:0 0 8px;">
      🔨 Lance Registrado!
    </h1>
    <p style="color:#64748b;font-size:15px;margin:0 0 24px;">
      Seu lance foi confirmado com sucesso, <strong>${name}</strong>.
    </p>

    <div style="background:#0f172a;border-radius:12px;padding:24px;margin:0 0 28px;">
      <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Veículo</p>
      <p style="color:#ffffff;font-size:16px;font-weight:700;margin:0 0 20px;">${vehicleName}</p>
      <div style="border-top:1px solid #1e293b;padding-top:16px;">
        <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Seu Lance</p>
        <p style="color:#f97316;font-size:32px;font-weight:900;margin:0;">${formatCurrency(amount)}</p>
      </div>
    </div>

    <p style="color:#475569;font-size:14px;margin:0 0 24px;">
      Fique de olho — você será notificado imediatamente se seu lance for superado. Você também pode configurar o <strong>Lance Automático</strong> para cobrir lances automaticamente até um valor máximo.
    </p>

    ${primaryButton("Acompanhar o Leilão", `${SITE_URL}/lots/${lotId}`)}`;

  return {
    subject: `🔨 Lance de ${formatCurrency(amount)} confirmado — ${vehicleName}`,
    html: baseTemplate(content, `Seu lance em ${vehicleName} foi registrado com sucesso!`),
  };
}

function bidOutbidEmail(
  name: string,
  vehicleName: string,
  yourAmount: number,
  newAmount: number,
  lotId: string
): { subject: string; html: string } {
  const content = `
    <h1 style="color:#0f172a;font-size:24px;font-weight:900;margin:0 0 8px;">
      ⚡ Seu lance foi superado!
    </h1>
    <p style="color:#64748b;font-size:15px;margin:0 0 24px;">
      <strong>${name}</strong>, alguém deu um lance maior no veículo que você está disputando.
    </p>

    <div style="border:2px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:0 0 24px;">
      <div style="background:#f8fafc;padding:16px 20px;border-bottom:1px solid #e2e8f0;">
        <p style="color:#475569;font-size:13px;margin:0;font-weight:600;">${vehicleName}</p>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:16px 20px;">
        <tr>
          <td style="padding:8px 0;">
            <p style="color:#94a3b8;font-size:12px;margin:0;">Seu lance</p>
            <p style="color:#64748b;font-size:18px;font-weight:700;margin:4px 0 0;text-decoration:line-through;">${formatCurrency(yourAmount)}</p>
          </td>
          <td style="padding:8px 0;text-align:right;">
            <p style="color:#94a3b8;font-size:12px;margin:0;">Lance atual</p>
            <p style="color:#f97316;font-size:22px;font-weight:900;margin:4px 0 0;">${formatCurrency(newAmount)}</p>
          </td>
        </tr>
      </table>
    </div>

    <p style="color:#475569;font-size:14px;margin:0 0 24px;">
      💡 Ative o <strong>Lance Automático</strong> para nunca perder um lote — ele cobre lances automaticamente até o seu limite máximo.
    </p>

    ${primaryButton("Dar Novo Lance", `${SITE_URL}/lots/${lotId}`)}`;

  return {
    subject: `⚡ Seu lance em ${vehicleName} foi superado! Responda agora.`,
    html: baseTemplate(content, `Alguém superou seu lance. Acesse agora para dar um novo lance.`),
  };
}

function auctionWonEmail(
  name: string,
  vehicleName: string,
  finalAmount: number,
  lotId: string
): { subject: string; html: string } {
  const content = `
    <div style="text-align:center;margin:0 0 32px;">
      <div style="display:inline-block;font-size:56px;">🏆</div>
    </div>
    <h1 style="color:#0f172a;font-size:26px;font-weight:900;text-align:center;margin:0 0 8px;">
      Parabéns! Você arrematou!
    </h1>
    <p style="color:#64748b;font-size:15px;text-align:center;margin:0 0 32px;">
      <strong>${name}</strong>, você foi o vencedor do leilão!
    </p>

    <div style="background:#0f172a;border-radius:12px;padding:28px;margin:0 0 28px;text-align:center;">
      <p style="color:#64748b;font-size:13px;margin:0 0 8px;">Veículo arrematado</p>
      <p style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 16px;">${vehicleName}</p>
      <div style="border-top:1px solid #1e293b;padding-top:16px;">
        <p style="color:#64748b;font-size:12px;margin:0 0 4px;">Valor Final</p>
        <p style="color:#f97316;font-size:36px;font-weight:900;margin:0;">${formatCurrency(finalAmount)}</p>
      </div>
    </div>

    <p style="color:#475569;font-size:14px;margin:0 0 24px;">
      Nossa equipe entrará em contato em breve com as instruções de pagamento e transferência do veículo. Acesse seu painel para acompanhar os próximos passos.
    </p>

    ${primaryButton("Acessar Meu Painel", `${SITE_URL}/app/dashboard`)}`;

  return {
    subject: `🏆 Você arrematou! ${vehicleName} por ${formatCurrency(finalAmount)}`,
    html: baseTemplate(content, `Parabéns! Você foi o vencedor do leilão.`),
  };
}

function reengagementEmail(name: string): { subject: string; html: string } {
  const content = `
    <h1 style="color:#0f172a;font-size:24px;font-weight:900;margin:0 0 8px;">
      🚗 Novidades na AutoBid BR, ${name}!
    </h1>
    <p style="color:#64748b;font-size:15px;margin:0 0 24px;">
      Faz um tempo que não te vemos por aqui. Enquanto isso, novos veículos incríveis chegaram aos nossos leilões!
    </p>

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px;margin:0 0 24px;">
      <p style="color:#9a3412;font-size:14px;font-weight:700;margin:0 0 8px;">🔥 O que você está perdendo:</p>
      <ul style="color:#7c2d12;font-size:14px;margin:0;padding-left:20px;">
        <li style="margin-bottom:6px;">Carros com desconto de até 40% abaixo da FIPE</li>
        <li style="margin-bottom:6px;">Novos lotes adicionados toda semana</li>
        <li style="margin-bottom:6px;">Lance Automático para não perder nenhum lote</li>
      </ul>
    </div>

    ${primaryButton("Ver Leilões Agora", `${SITE_URL}/auctions`)}

    ${divider()}
    <p style="color:#94a3b8;font-size:12px;text-align:center;">
      Não quer mais receber esses emails?
      <a href="${SITE_URL}/app/profile" style="color:#f97316;text-decoration:none;">Gerencie suas preferências</a>
    </p>`;

  return {
    subject: `🚗 ${name}, novos veículos te esperam na AutoBid BR`,
    html: baseTemplate(content, `Voltamos para te lembrar das oportunidades que você está perdendo.`),
  };
}

// ─────────────────────────────────────────────
// HANDLER PRINCIPAL
// ─────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
      },
    });
  }

  try {
    const body = await req.json();
    const { type, to, payload } = body;

    if (!type || !to) {
      return new Response(JSON.stringify({ error: "type e to são obrigatórios" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let emailContent: { subject: string; html: string } | null = null;

    switch (type) {
      case "welcome":
        emailContent = welcomeEmail(payload.name);
        break;

      case "docs-reminder":
        emailContent = docsReminderEmail(payload.name, payload.hours || 24);
        break;

      case "docs-approved":
        emailContent = docsApprovedEmail(payload.name);
        break;

      case "bid-confirmed":
        emailContent = bidConfirmedEmail(payload.name, payload.vehicleName, payload.amount, payload.lotId);
        break;

      case "bid-outbid":
        emailContent = bidOutbidEmail(payload.name, payload.vehicleName, payload.yourAmount, payload.newAmount, payload.lotId);
        break;

      case "auction-won":
        emailContent = auctionWonEmail(payload.name, payload.vehicleName, payload.finalAmount, payload.lotId);
        break;

      case "reengagement":
        emailContent = reengagementEmail(payload.name);
        break;

      default:
        return new Response(JSON.stringify({ error: `Tipo de email desconhecido: ${type}` }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
    }

    // Envia via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Erro Resend:", resendData);
      return new Response(JSON.stringify({ error: "Falha ao enviar email", details: resendData }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Email ${type} enviado para ${to} — ID: ${resendData.id}`);
    return new Response(JSON.stringify({ success: true, id: resendData.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro na Edge Function send-email:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
