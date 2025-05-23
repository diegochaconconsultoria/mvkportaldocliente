import nodemailer from 'nodemailer';
import multer from 'multer';

const upload = multer();
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    upload.array('anexos')(req, {}, async (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro no upload de arquivos' });
        }

        const { nota, observacoes } = req.body;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const anexos = (req.files || []).map((file) => ({
            filename: file.originalname,
            content: file.buffer,
        }));

        const ano = new Date().getFullYear();
        const htmlEmail = `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Solicitação SAC - Portal MVK</title>
    <style>
      body {
        background-color: #f8fafc;
        font-family: 'Inter', sans-serif;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        padding: 24px;
      }
      .header {
        background-color: #9f2441;
        color: #ffffff;
        padding: 16px;
        border-radius: 8px 8px 0 0;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 20px;
      }
      .content {
        padding: 16px 0;
      }
      .content h2 {
        color: #111827;
        font-size: 18px;
      }
      .info-box {
        background-color: #f9fafb;
        padding: 16px;
        border-radius: 6px;
        border: 1px solid #e5e7eb;
        margin-bottom: 16px;
      }
      .info-box strong {
        color: #111827;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #6b7280;
        margin-top: 24px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Solicitação de Atendimento - Portal do Cliente MVK</h1>
      </div>

      <div class="content">
        <h2>Detalhes da Solicitação</h2>

        <div class="info-box">
          <p><strong>Nota / Pedido / Proposta:</strong> {{nota}}</p>
          <p><strong>Observações:</strong><br />{{observacoes}}</p>
        </div>

        <p>
          Esta solicitação foi enviada através do Portal do Cliente MVK.
          Por favor, analise as informações e entre em contato com o cliente se necessário.
        </p>

        <p>
          <strong>Arquivos anexados:</strong> {{qtdAnexos}} arquivo(s) enviado(s).
        </p>
      </div>

      <div class="footer">
        © {{ano}} MVK - Todos os direitos reservados.
      </div>
    </div>
  </body>
</html>
`.replace('{{nota}}', nota)
            .replace('{{observacoes}}', observacoes.replace(/\n/g, '<br>'))
            .replace('{{qtdAnexos}}', anexos.length)
            .replace('{{ano}}', ano);

        try {
            await transporter.sendMail({
                from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
                to: process.env.SAC_DESTINO,
                subject: `Solicitação SAC - ${nota}`,
                html: htmlEmail,
                attachments: anexos,
            });

            return res.status(200).json({ message: 'Email enviado com sucesso' });
        } catch (error) {
            console.error('Erro ao enviar email:', error);
            return res.status(500).json({ error: 'Erro ao enviar email' });
        }
    });
}
