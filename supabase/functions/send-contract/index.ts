import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContractEmailRequest {
  to: string;
  employeeName: string;
  contractTitle: string;
  pdfBase64: string;
  fileName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, employeeName, contractTitle, pdfBase64, fileName }: ContractEmailRequest = await req.json();

    if (!to || !employeeName || !contractTitle || !pdfBase64 || !fileName) {
      throw new Error("Missing required fields");
    }

    const emailResponse = await resend.emails.send({
      from: "HR Department <onboarding@resend.dev>",
      to: [to],
      subject: `Your Contract: ${contractTitle}`,
      html: `
        <h1>Hello ${employeeName},</h1>
        <p>Please find attached your employment contract: <strong>${contractTitle}</strong></p>
        <p>Please review the contract carefully. If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>HR Department</p>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
        },
      ],
    });

    console.log("Contract email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contract function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
