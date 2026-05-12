import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set - email notifications disabled')
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@procommerce.com'

export class EmailService {

    /**
     * Send payout approval email to vendor
     */
    static async sendPayoutApproved(
        vendorEmail: string,
        vendorName: string,
        amount: number,
        payoutId: string
    ) {
        if (!resend) {
            console.log('[EMAIL DISABLED] Payout approved:', { vendorEmail, amount })
            return
        }

        try {
            await resend.emails.send({
                from: FROM_EMAIL,
                to: vendorEmail,
                subject: '✅ Saque Aprovado - ProCommerce',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">✅ Saque Aprovado!</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <p style="font-size: 16px; color: #333;">Olá <strong>${vendorName}</strong>,</p>
              <p style="font-size: 16px; color: #555;">
                Temos boas notícias! Seu pedido de saque foi <strong style="color: #10b981;">aprovado</strong> e está sendo processado.
              </p>
              <div style="background: white; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <p style="margin: 0; color: #666; font-size: 14px;">Valor do Saque</p>
                <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #10b981;">
                  ${amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </p>
                <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">Referência: #${payoutId.slice(-8)}</p>
              </div>
              <p style="font-size: 14px; color: #666;">
                O valor será transferido para sua conta bancária nos próximos dias úteis.
              </p>
              <p style="font-size: 14px; color: #666;">
                Obrigado por fazer parte da ProCommerce! 🎉
              </p>
            </div>
            <div style="padding: 20px; background: #e5e7eb; text-align: center; font-size: 12px; color: #666;">
              <p>ProCommerce Global © 2024</p>
            </div>
          </div>
        `
            })

            console.log(`✅ Payout approved email sent to ${vendorEmail}`)
        } catch (error) {
            console.error('Failed to send payout approval email:', error)
        }
    }

    /**
     * Send payout rejection email to vendor
     */
    static async sendPayoutRejected(
        vendorEmail: string,
        vendorName: string,
        amount: number,
        reason?: string
    ) {
        if (!resend) {
            console.log('[EMAIL DISABLED] Payout rejected:', { vendorEmail, amount })
            return
        }

        try {
            await resend.emails.send({
                from: FROM_EMAIL,
                to: vendorEmail,
                subject: '❌ Saque Rejeitado - ProCommerce',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">❌ Saque Rejeitado</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <p style="font-size: 16px; color: #333;">Olá <strong>${vendorName}</strong>,</p>
              <p style="font-size: 16px; color: #555;">
                Lamentamos informar que seu pedido de saque foi <strong style="color: #ef4444;">rejeitado</strong>.
              </p>
              <div style="background: white; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <p style="margin: 0; color: #666; font-size: 14px;">Valor Solicitado</p>
                <p style="margin: 10px 0; font-size: 24px; font-weight: bold; color: #ef4444;">
                  ${amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </p>
                ${reason ? `<p style="margin: 10px 0 0 0; color: #666; font-size: 14px;"><strong>Motivo:</strong> ${reason}</p>` : ''}
              </div>
              <p style="font-size: 14px; color: #666;">
                O valor foi devolvido ao seu saldo disponível. Você pode tentar novamente ou entrar em contato com o suporte.
              </p>
            </div>
            <div style="padding: 20px; background: #e5e7eb; text-align: center; font-size: 12px; color: #666;">
              <p>ProCommerce Global © 2024</p>
            </div>
          </div>
        `
            })

            console.log(`📧 Payout rejected email sent to ${vendorEmail}`)
        } catch (error) {
            console.error('Failed to send payout rejection email:', error)
        }
    }

    /**
     * Send sale notification to vendor
     */
    static async sendSaleCredited(
        vendorEmail: string,
        vendorName: string,
        saleAmount: number,
        commission: number,
        netAmount: number,
        orderId: string
    ) {
        if (!resend) {
            console.log('[EMAIL DISABLED] Sale credited:', { vendorEmail, netAmount })
            return
        }

        try {
            await resend.emails.send({
                from: FROM_EMAIL,
                to: vendorEmail,
                subject: '💰 Nova Venda Creditada - ProCommerce',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">💰 Nova Venda!</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <p style="font-size: 16px; color: #333;">Parabéns <strong>${vendorName}</strong>! 🎉</p>
              <p style="font-size: 16px; color: #555;">
                Você acabou de fazer uma venda e o valor foi creditado à sua carteira.
              </p>
              <div style="background: white; border: 2px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 10px;">
                <p style="margin: 0; color: #666; font-size: 14px;">Valor Bruto</p>
                <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #333;">
                  ${saleAmount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;" />
                <p style="margin: 5px 0; color: #666; font-size: 14px;">Comissão da Plataforma</p>
                <p style="margin: 5px 0; font-size: 16px; color: #ef4444;">
                  - ${commission.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;" />
                <p style="margin: 5px 0; color: #666; font-size: 14px;">Valor Líquido Creditado</p>
                <p style="margin: 5px 0; font-size: 28px; font-weight: bold; color: #10b981;">
                  ${netAmount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </p>
                <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">Pedido: #${orderId.slice(-8)}</p>
              </div>
              <p style="font-size: 14px; color: #666;">
                O valor já está disponível na sua carteira para saque!
              </p>
            </div>
            <div style="padding: 20px; background: #e5e7eb; text-align: center; font-size: 12px; color: #666;">
              <p>ProCommerce Global © 2024</p>
            </div>
          </div>
        `
            })

            console.log(`💰 Sale credited email sent to ${vendorEmail}`)
        } catch (error) {
            console.error('Failed to send sale notification:', error)
        }
    }
}
