import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured. Set it in Supabase Edge Function secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Busca usuários que se cadastraram há 1h+ mas não verificaram documentos
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Primeiro e-mail: 1 hora após cadastro sem verificação
    const { data: firstEmailUsers } = await supabase
      .from("profiles")
      .select("id, email, full_name, created_at")
      .eq("kyc_status", "pending")
      .lte("created_at", oneHourAgo)
      .gte("created_at", twentyFourHoursAgo)
      .is("reengagement_1h_sent", null);

    // Segundo e-mail: 24 horas após cadastro sem verificação
    const { data: secondEmailUsers } = await supabase
      .from("profiles")
      .select("id, email, full_name, created_at")
      .eq("kyc_status", "pending")
      .lte("created_at", twentyFourHoursAgo)
      .is("reengagement_24h_sent", null);

    // Busca o veículo mais visualizado / com mais lances (destaque)
    const { data: featuredLots } = await supabase
      .from("lots")
      .select("id, title, cover_image_url, current_bid, start_bid, ends_at")
      .eq("status", "active")
      .order("current_bid", { ascending: false })
      .limit(2);

    const lot1 = featuredLots?.[0];
    const lot2 = featuredLots?.[1] || lot1;

    const results = { firstEmail: 0, secondEmail: 0, errors: [] as string[] };

    // Envio do primeiro e-mail (1 hora)
    for (const user of firstEmailUsers || []) {
      if (!user.email) continue;
      try {
        const hoursLeft = lot1?.ends_at
          ? Math.max(0, Math.round((new Date(lot1.ends_at).getTime() - Date.now()) / 3600000))
          : 24;

        const lotPrice = lot1
          ? `R$ ${Number(lot1.current_bid || lot1.start_bid || 0).toLocaleString("pt-BR")}`
          : "valores incríveis";

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "AutoBid <noreply@autobidbr.com>",
            to: [user.email],
            subject: "Seu lance está esperando por você 🏆",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #0f172a; font-size: 24px; margin: 0;">Auto<span style="color: #f97316;">Bid</span></h1>
                </div>

                <h2 style="color: #0f172a; font-size: 20px;">Olá${user.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}!</h2>

                <p style="color: #64748b; font-size: 15px; line-height: 1.6;">
                  Você está a um passo de participar dos melhores leilões de veículos do Brasil.
                  Complete sua verificação e comece a dar lances agora mesmo!
                </p>

                ${lot1 ? `
                <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
                  <p style="color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: bold; margin: 0 0 8px 0;">EM DESTAQUE AGORA</p>
                  ${lot1.cover_image_url ? `<img src="${lot1.cover_image_url}" style="width: 100%; border-radius: 8px; margin-bottom: 12px;" alt="${lot1.title}" />` : ""}
                  <h3 style="color: #0f172a; margin: 0 0 8px 0;">${lot1.title}</h3>
                  <p style="color: #f97316; font-size: 22px; font-weight: bold; margin: 0 0 8px 0;">Lance atual: ${lotPrice}</p>
                  <p style="color: #ef4444; font-size: 13px; font-weight: bold; margin: 0;">⏰ Encerra em ${hoursLeft} horas</p>
                </div>
                ` : ""}

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://autobidbr.com/app/verify" style="background: #f97316; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                    Completar verificação agora
                  </a>
                </div>

                <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                  É rápido, gratuito e você poderá dar lances imediatamente após a aprovação.
                </p>
              </div>
            `,
          }),
        });

        // Marca como enviado
        await supabase
          .from("profiles")
          .update({ reengagement_1h_sent: new Date().toISOString() })
          .eq("id", user.id);

        results.firstEmail++;
      } catch (err: any) {
        results.errors.push(`1h: ${user.email}: ${err.message}`);
      }
    }

    // Envio do segundo e-mail (24 horas)
    for (const user of secondEmailUsers || []) {
      if (!user.email) continue;
      try {
        const vehicle = lot2 || lot1;
        const lotPrice = vehicle
          ? `R$ ${Number(vehicle.current_bid || vehicle.start_bid || 0).toLocaleString("pt-BR")}`
          : "preços imperdíveis";

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "AutoBid <noreply@autobidbr.com>",
            to: [user.email],
            subject: "Última chance: leilões encerrando hoje! ⚡",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #0f172a; font-size: 24px; margin: 0;">Auto<span style="color: #f97316;">Bid</span></h1>
                </div>

                <h2 style="color: #0f172a; font-size: 20px;">${user.full_name ? `${user.full_name.split(" ")[0]}, não` : "Não"} perca essa oportunidade!</h2>

                <p style="color: #64748b; font-size: 15px; line-height: 1.6;">
                  Vários leilões estão encerrando e você ainda pode participar.
                  A verificação leva menos de 2 minutos — comece agora!
                </p>

                ${vehicle ? `
                <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
                  <p style="color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: bold; margin: 0 0 8px 0;">OPORTUNIDADE DO DIA</p>
                  ${vehicle.cover_image_url ? `<img src="${vehicle.cover_image_url}" style="width: 100%; border-radius: 8px; margin-bottom: 12px;" alt="${vehicle.title}" />` : ""}
                  <h3 style="color: #0f172a; margin: 0 0 8px 0;">${vehicle.title}</h3>
                  <p style="color: #f97316; font-size: 22px; font-weight: bold; margin: 0;">A partir de ${lotPrice}</p>
                </div>
                ` : ""}

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://autobidbr.com/app/verify" style="background: #0f172a; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                    Verificar e começar a dar lances
                  </a>
                </div>

                <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                  Milhares de pessoas já economizaram até 40% comprando veículos na AutoBid.
                </p>
              </div>
            `,
          }),
        });

        await supabase
          .from("profiles")
          .update({ reengagement_24h_sent: new Date().toISOString() })
          .eq("id", user.id);

        results.secondEmail++;
      } catch (err: any) {
        results.errors.push(`24h: ${user.email}: ${err.message}`);
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
