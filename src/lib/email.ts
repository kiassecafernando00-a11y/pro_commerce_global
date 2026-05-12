
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(
    to: string,
    orderId: string,
    total: number,
    items: { name: string, quantity: number, price: number }[],
    address: string
) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("⚠️ RESEND_API_KEY missing. Email not sent.");
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'ProCommerce <onboarding@resend.dev>', // In production, use your domain
            to: [to],
            subject: `Confirmação de Pedido #${orderId}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #333;">Obrigado pela sua compra!</h1>
                    <p>Seu pedido <strong>#${orderId}</strong> foi recebido com sucesso.</p>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Resumo do Pedido</h3>
                        <ul style="padding-left: 20px;">
                            ${items.map(item => `
                                <li>
                                    <strong>${item.quantity}x ${item.name}</strong> - 
                                    ${new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(item.price)}
                                </li>
                            `).join('')}
                        </ul>
                        <div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px;">
                            <strong>Total: ${new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(total)}</strong>
                        </div>
                    </div>

                    <p><strong>Endereço de Entrega:</strong><br>${address}</p>

                    <p style="color: #666; font-size: 14px;">
                        Assim que o pagamento for confirmado (se aplicável) e o pedido enviado, você receberá outra notificação.
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error("Resend Error:", error);
            return { error };
        }

        console.log("Email sent successfully:", data);
        return { success: true, data };
    } catch (e) {
        console.error("Email sending failed:", e);
        return { error: e };
    }
}
