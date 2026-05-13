const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const sesClient = new SESClient({});
const Sentry = require("@sentry/aws-serverless");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
Sentry.setTag("module", "notificaciones");
Sentry.setTag("team", "backend");


const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

exports.handler = Sentry.wrapHandler(async (event) => {
    try {
        console.log("Notificaciones Lambda triggered by Stream");
        
        for (const record of event.Records) {
            if (record.eventName === "INSERT") {
                const newImage = record.dynamodb.NewImage;
                const userId = newImage.user_id ? newImage.user_id.S : "Usuario";
                const total = newImage.total ? newImage.total.N : "0";
                const purchaseId = newImage.purchase_id ? newImage.purchase_id.S : "Desconocido";

                // En un entorno de producción enviaríamos al correo del usuario (userId).
                // Al estar en el Sandbox de SES, enviamos al ADMIN_EMAIL verificado.
                
                const htmlBody = `
                    <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
                                .container { background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                                h1 { color: #6366f1; }
                                .total { font-size: 24px; font-weight: bold; color: #10b981; }
                                .footer { margin-top: 20px; font-size: 12px; color: #94a3b8; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1>¡Gracias por tu compra en Mega Store!</h1>
                                <p>Hola <strong>${userId}</strong>,</p>
                                <p>Hemos procesado tu orden con éxito.</p>
                                <p><strong>ID de Compra:</strong> ${purchaseId}</p>
                                <p class="total">Total pagado: $${total}</p>
                                <p>Tu pedido está siendo preparado y pronto recibirás más detalles sobre el envío.</p>
                                <div class="footer">Este es un correo automático de Mega Store Serverless.</div>
                            </div>
                        </body>
                    </html>
                `;

                const params = {
                    Destination: { ToAddresses: [ADMIN_EMAIL] },
                    Message: {
                        Body: { Html: { Charset: "UTF-8", Data: htmlBody } },
                        Subject: { Charset: "UTF-8", Data: `Recibo de Compra - Mega Store [${purchaseId}]` }
                    },
                    Source: ADMIN_EMAIL
                };

                console.log(`Enviando email para la compra ${purchaseId} a ${ADMIN_EMAIL}`);
                
                if (ADMIN_EMAIL && ADMIN_EMAIL !== "admin@megastore.local") {
                    await sesClient.send(new SendEmailCommand(params));
                } else {
                    console.log("Simulando envío de email (ADMIN_EMAIL no configurado)");
                }
            }
        }
        return { statusCode: 200, body: "Notificaciones procesadas exitosamente." };
    } catch (error) {
        console.error("Error processing stream:", error);
        throw error;
    }
});
