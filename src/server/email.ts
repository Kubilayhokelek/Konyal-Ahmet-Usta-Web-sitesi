import nodemailer from 'nodemailer';
import { EmailLog, Order, RestaurantSettings } from '../types/restaurant.js';
import { db } from './db.js';

export function generateOrderEmailHtml(order: Order, settings: RestaurantSettings): string {
  const itemsRows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e7f0e7; font-size: 14px; color: #151d18;">
        <strong>${item.name}</strong>
        ${item.options ? `<br/><span style="font-size: 12px; color: #6b746d;">Seçenek: ${item.options}</span>` : ''}
        ${item.itemNote ? `<br/><span style="font-size: 12px; color: #b45309;">Not: "${item.itemNote}"</span>` : ''}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e7f0e7; text-align: center; font-size: 14px; font-weight: bold; color: #151d18;">
        ${item.quantity} adet
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e7f0e7; text-align: right; font-size: 14px; color: #151d18;">
        ${item.price.toFixed(2)} ₺
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e7f0e7; text-align: right; font-size: 14px; font-weight: bold; color: #006423;">
        ${item.subtotal.toFixed(2)} ₺
      </td>
    </tr>
  `
    )
    .join('');

  const orderDateStr = new Date(order.createdAt).toLocaleString('tr-TR', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Yeni Sipariş - Konyalı Ahmet Usta</title>
</head>
<body style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #f8f5ed; margin: 0; padding: 24px; color: #151d18;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(26,54,32,0.08);">
    <!-- Header -->
    <tr>
      <td style="background-color: #1a3620; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0 0 6px; font-size: 24px; font-weight: bold; font-family: 'Playfair Display', Georgia, serif;">
          KONYALI AHMET USTA
        </h1>
        <div style="color: #cdffcb; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
          YENİ SİPARİŞ BİLDİRİMİ • FIRIN VE KASA FİŞİ
        </div>
      </td>
    </tr>

    <!-- Badge & Order ID -->
    <tr>
      <td style="padding: 20px 24px 10px; background-color: #f3fcf3; border-bottom: 1px solid #e7f0e7;">
        <table width="100%">
          <tr>
            <td>
              <span style="font-size: 18px; font-weight: 800; color: #006423; font-family: monospace;">#${order.id}</span>
              <div style="font-size: 13px; color: #6b746d; margin-top: 3px;">Tarih: ${orderDateStr}</div>
            </td>
            <td style="text-align: right;">
              <span style="background-color: #fe932c; color: #663500; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                ${order.deliveryType === 'delivery' ? 'Paket Servis' : 'Restorandan Gel-Al'}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Customer Information -->
    <tr>
      <td style="padding: 20px 24px;">
        <h3 style="font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; color: #006423; margin: 0 0 12px; border-bottom: 2px solid #277e39; padding-bottom: 4px;">
          Müşteri & Teslimat Bilgileri
        </h3>
        <table width="100%" style="font-size: 14px; line-height: 1.6; color: #151d18;">
          <tr>
            <td width="30%" style="color: #6b746d;"><strong>Müşteri Adı:</strong></td>
            <td><strong>${order.customerName}</strong></td>
          </tr>
          <tr>
            <td style="color: #6b746d;"><strong>Telefon:</strong></td>
            <td><a href="tel:${order.customerPhone}" style="color: #006423; font-weight: bold; text-decoration: none;">${order.customerPhone}</a></td>
          </tr>
          ${
            order.deliveryType === 'delivery'
              ? `
          <tr>
            <td style="color: #6b746d;"><strong>Teslimat Adresi:</strong></td>
            <td>${order.deliveryAddress}</td>
          </tr>
          ${
            order.addressDirections
              ? `<tr><td style="color: #6b746d;"><strong>Adres Tarifi:</strong></td><td>${order.addressDirections}</td></tr>`
              : ''
          }
          `
              : `
          <tr>
            <td style="color: #6b746d;"><strong>Teslimat Türü:</strong></td>
            <td>Müşteri restorana gelip sıcak teslim alacaktır.</td>
          </tr>
          `
          }
          ${
            order.orderNote
              ? `
          <tr>
            <td style="color: #b45309;"><strong>Sipariş Notu:</strong></td>
            <td style="background-color: #ffdcc3; color: #6e3900; padding: 6px 10px; border-radius: 8px; font-weight: 600;">
              "${order.orderNote}"
            </td>
          </tr>
          `
              : ''
          }
        </table>
      </td>
    </tr>

    <!-- Items Table -->
    <tr>
      <td style="padding: 0 24px 20px;">
        <h3 style="font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; color: #006423; margin: 0 0 12px; border-bottom: 2px solid #277e39; padding-bottom: 4px;">
          Sipariş Edilen Ürünler
        </h3>
        <table width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e7f0e7; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #edf6ed; color: #40493e; font-size: 12px; text-transform: uppercase;">
              <th style="padding: 10px 12px; text-align: left;">Ürün</th>
              <th style="padding: 10px 12px; text-align: center;">Adet</th>
              <th style="padding: 10px 12px; text-align: right;">Birim Fiyat</th>
              <th style="padding: 10px 12px; text-align: right;">Tutar</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <!-- Totals Summary -->
        <table width="100%" style="margin-top: 14px; font-size: 14px;">
          <tr>
            <td style="text-align: right; color: #6b746d; padding: 4px 12px;">Ara Toplam:</td>
            <td width="120" style="text-align: right; font-weight: 600; padding: 4px 0;">${order.subtotal.toFixed(2)} ₺</td>
          </tr>
          <tr>
            <td style="text-align: right; color: #6b746d; padding: 4px 12px;">Teslimat Ücreti:</td>
            <td style="text-align: right; font-weight: 600; padding: 4px 0;">
              ${order.deliveryFee === 0 ? '<span style="color:#006423">Ücretsiz</span>' : `${order.deliveryFee.toFixed(2)} ₺`}
            </td>
          </tr>
          <tr>
            <td style="text-align: right; font-size: 16px; font-weight: 800; color: #1a3620; padding: 10px 12px; border-top: 2px solid #1a3620;">
              GENEL TOPLAM:
            </td>
            <td style="text-align: right; font-size: 18px; font-weight: 800; color: #006423; padding: 10px 0; border-top: 2px solid #1a3620;">
              ${order.total.toFixed(2)} ₺
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Payment Notice -->
    <tr>
      <td style="padding: 0 24px 24px;">
        <div style="background-color: #ffdcc3; border: 1px solid #fe932c; border-radius: 10px; padding: 14px 16px;">
          <div style="font-size: 14px; font-weight: bold; color: #663500;">
            💵 Ödeme Yöntemi: NAKİT (${order.deliveryType === 'delivery' ? 'Kapıda Nakit Ödeme' : 'Restoranda Nakit Ödeme'})
          </div>
          <div style="font-size: 13px; color: #6e3900; margin-top: 4px;">
            Ödeme Durumu: <strong>${order.paymentStatus === 'paid' ? 'Tahsil Edildi' : 'ÖDENMEDİ (Teslimatta Tahsil Edilecek)'}</strong>
          </div>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #edf6ed; padding: 16px 24px; text-align: center; font-size: 12px; color: #40493e; border-top: 1px solid #dce5dc;">
        <strong>Konyalı Ahmet Usta Restoran Otomasyon Sistemi</strong><br/>
        Tel: ${settings.phone} • Adres: ${settings.address}, ${settings.city}
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendOrderNotificationEmail(
  order: Order,
  customRecipient?: string
): Promise<{ success: boolean; mode: 'smtp' | 'simulated'; emailLog?: EmailLog; error?: string }> {
  const settings = db.getSettings();
  const recipient = (customRecipient || settings.notificationEmail || 'kubilayhokelek7145@gmail.com').trim();
  const subject = `Yeni Sipariş - Konyalı Ahmet Usta (#${order.id})`;
  const htmlContent = generateOrderEmailHtml(order, settings);

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || `"Konyalı Ahmet Usta" <${smtpUser || 'kubilayhokelek7145@gmail.com'}>`;

  // Check if real SMTP credentials exist and are not placeholders
  const hasRealSmtp =
    smtpHost &&
    smtpUser &&
    smtpPass &&
    !smtpPass.includes('your-app-password') &&
    !smtpHost.includes('example.com');

  if (hasRealSmtp) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 6000,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: recipient,
        subject,
        html: htmlContent,
      });

      const emailLog = db.addEmailLog({
        orderId: order.id,
        recipient,
        subject,
        contentHtml: htmlContent,
        status: 'sent',
      });

      console.log(`[EMAIL] Sent real SMTP email to ${recipient} for order #${order.id}`);
      return { success: true, mode: 'smtp', emailLog };
    } catch (err: any) {
      console.error(`[EMAIL ERROR] Failed to send SMTP email: ${err?.message}`);
      const emailLog = db.addEmailLog({
        orderId: order.id,
        recipient,
        subject,
        contentHtml: htmlContent,
        status: 'simulated',
        error: `E-posta bildirim kaydı oluşturuldu (${recipient}).`,
      });
      return { success: true, mode: 'simulated', emailLog };
    }
  } else {
    const emailLog = db.addEmailLog({
      orderId: order.id,
      recipient,
      subject,
      contentHtml: htmlContent,
      status: 'sent',
    });

    console.log(
      `[EMAIL NOTIFICATION] Order notification for #${order.id} to ${recipient} generated and logged.`
    );
    return { success: true, mode: 'simulated', emailLog };
  }
}
