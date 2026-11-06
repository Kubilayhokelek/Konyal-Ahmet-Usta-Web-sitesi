import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { EmailLog, Order, RestaurantSettings } from '../types/restaurant.js';
import { db } from './db.js';

export function generateOrderEmailHtml(order: Order, settings: RestaurantSettings): string {
  const itemsRows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e7f0e7; font-size: 14px; color: #151d18;">
        <strong>${item.name}</strong>
        ${item.options ? `<br/><span style="font-size: 12px; color: #6b746d;">Porsiyon/Seçenek: ${item.options}</span>` : ''}
        ${item.itemNote ? `<br/><span style="font-size: 12px; color: #b45309;">Ürün Notu: "${item.itemNote}"</span>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e7f0e7; text-align: center; font-size: 14px; font-weight: bold; color: #151d18;">
        ${item.quantity} Adet
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e7f0e7; text-align: right; font-size: 14px; color: #151d18;">
        ${item.price.toFixed(2)} ₺
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e7f0e7; text-align: right; font-size: 14px; font-weight: bold; color: #006423;">
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

  const paymentMethodLabel =
    order.deliveryType === 'delivery'
      ? 'Kapıda Nakit Ödeme'
      : 'Restoranda Nakit Ödeme (Gel-Al)';

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeni Sipariş Bildirimi - #${order.id}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f4f7f4; margin: 0; padding: 16px; color: #151d18;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 660px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(26,54,32,0.08); border: 1px solid #dce5dc;">
    <!-- Kurumsal Üst Başlık -->
    <tr>
      <td style="background-color: #1a3620; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0 0 6px; font-size: 24px; font-weight: bold; font-family: Georgia, serif;">
          ${settings.restaurantName.toUpperCase()}
        </h1>
        <div style="color: #cdffcb; font-size: 13px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase;">
          YENİ ONLINE SİPARİŞ BİLDİRİMİ • FIRIN & KASA FİŞİ
        </div>
      </td>
    </tr>

    <!-- Sipariş Numarası & Tarih/Saat -->
    <tr>
      <td style="padding: 18px 24px; background-color: #f3fcf3; border-bottom: 1px solid #e7f0e7;">
        <table width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <div style="font-size: 11px; text-transform: uppercase; color: #6b746d; font-weight: bold;">Sipariş Numarası</div>
              <div style="font-size: 20px; font-weight: 800; color: #006423; font-family: monospace;">#${order.id}</div>
              <div style="font-size: 12px; color: #40493e; margin-top: 4px;">
                <strong>Sipariş Tarihi ve Saati:</strong> ${orderDateStr}
              </div>
            </td>
            <td style="text-align: right; vertical-align: top;">
              <span style="display: inline-block; background-color: #fe932c; color: #663500; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                ${order.deliveryType === 'delivery' ? 'Paket Servis' : 'Restorandan Gel-Al'}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Müşteri & Teslimat Bilgileri -->
    <tr>
      <td style="padding: 22px 24px;">
        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #006423; margin: 0 0 12px; border-bottom: 2px solid #277e39; padding-bottom: 6px;">
          Müşteri ve Teslimat Bilgileri
        </h3>
        <table width="100%" cellspacing="0" cellpadding="4" style="font-size: 14px; line-height: 1.5; color: #151d18;">
          <tr>
            <td width="35%" style="color: #6b746d; font-weight: 600;">Müşteri Adı Soyadı:</td>
            <td><strong>${order.customerName}</strong></td>
          </tr>
          <tr>
            <td style="color: #6b746d; font-weight: 600;">Telefon Numarası:</td>
            <td><a href="tel:${order.customerPhone}" style="color: #006423; font-weight: bold; text-decoration: none;">${order.customerPhone}</a></td>
          </tr>
          <tr>
            <td style="color: #6b746d; font-weight: 600;">E-Posta Adresi:</td>
            <td>${order.customerEmail ? `<a href="mailto:${order.customerEmail}" style="color: #006423; text-decoration: none;">${order.customerEmail}</a>` : 'Belirtilmedi'}</td>
          </tr>
          <tr>
            <td style="color: #6b746d; font-weight: 600; vertical-align: top;">Teslimat Adresi:</td>
            <td>
              <strong>${order.deliveryType === 'delivery' ? order.deliveryAddress : 'Restorandan Gel-Al (Müşteri şubeden teslim alacak)'}</strong>
              ${order.addressDirections ? `<br/><span style="font-size: 12px; color: #40493e;">Adres Tarifi: ${order.addressDirections}</span>` : ''}
            </td>
          </tr>
          <tr>
            <td style="color: #6b746d; font-weight: 600; vertical-align: top;">Sipariş Notu:</td>
            <td>
              ${
                order.orderNote
                  ? `<span style="display: inline-block; background-color: #ffdcc3; color: #6e3900; padding: 4px 10px; border-radius: 6px; font-weight: 600;">"${order.orderNote}"</span>`
                  : '<span style="color: #6b746d;">Sipariş notu belirtilmedi.</span>'
              }
            </td>
          </tr>
          <tr>
            <td style="color: #6b746d; font-weight: 600;">Ödeme Yöntemi:</td>
            <td><strong style="color: #b45309;">${paymentMethodLabel}</strong></td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Sipariş Edilen Ürünler Tablosu -->
    <tr>
      <td style="padding: 0 24px 20px;">
        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #006423; margin: 0 0 12px; border-bottom: 2px solid #277e39; padding-bottom: 6px;">
          Sipariş Edilen Ürünler
        </h3>
        <table width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e7f0e7; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #edf6ed; color: #1a3620; font-size: 12px; text-transform: uppercase;">
              <th style="padding: 10px 12px; text-align: left;">Ürün</th>
              <th style="padding: 10px 12px; text-align: center;">Adet</th>
              <th style="padding: 10px 12px; text-align: right;">Birim Fiyat</th>
              <th style="padding: 10px 12px; text-align: right;">Toplam</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <!-- Fiyat Özeti (Ara Toplam, Teslimat Ücreti, Genel Toplam) -->
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 16px; font-size: 14px;">
          <tr>
            <td style="text-align: right; color: #6b746d; padding: 4px 12px;">Ara Toplam:</td>
            <td width="130" style="text-align: right; font-weight: 600; padding: 4px 0;">${order.subtotal.toFixed(2)} ₺</td>
          </tr>
          <tr>
            <td style="text-align: right; color: #6b746d; padding: 4px 12px;">Teslimat Ücreti:</td>
            <td style="text-align: right; font-weight: 600; padding: 4px 0;">
              ${order.deliveryFee === 0 ? '<span style="color:#006423">Ücretsiz (0.00 ₺)</span>' : `${order.deliveryFee.toFixed(2)} ₺`}
            </td>
          </tr>
          <tr>
            <td style="text-align: right; font-size: 16px; font-weight: 800; color: #1a3620; padding: 12px 12px 4px; border-top: 2px solid #1a3620;">
              GENEL TOPLAM:
            </td>
            <td style="text-align: right; font-size: 18px; font-weight: 800; color: #006423; padding: 12px 0 4px; border-top: 2px solid #1a3620;">
              ${order.total.toFixed(2)} ₺
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Alt Bilgi -->
    <tr>
      <td style="background-color: #edf6ed; padding: 16px 24px; text-align: center; font-size: 12px; color: #40493e; border-top: 1px solid #dce5dc;">
        <strong>${settings.restaurantName} Online Sipariş Otomasyonu</strong><br/>
        Tel: ${settings.phone} • Adres: ${settings.address}
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function generateCustomerConfirmationEmailHtml(
  order: Order,
  settings: RestaurantSettings
): string {
  const itemsRows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e7f0e7; font-size: 14px; color: #151d18;">
        <strong>${item.name}</strong>
        ${item.options ? `<br/><span style="font-size: 12px; color: #6b746d;">${item.options}</span>` : ''}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e7f0e7; text-align: center; font-size: 14px; font-weight: bold;">
        ${item.quantity}x
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e7f0e7; text-align: right; font-size: 14px; color: #6b746d;">
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
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const paymentMethodLabel =
    order.deliveryType === 'delivery'
      ? 'Kapıda Nakit Ödeme'
      : 'Restoranda Nakit Ödeme (Gel-Al)';

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Siparişiniz Alındı - #${order.id}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f4f7f4; margin: 0; padding: 16px; color: #151d18;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(26,54,32,0.08); border: 1px solid #dce5dc;">
    <!-- Header -->
    <tr>
      <td style="background-color: #1a3620; padding: 28px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0 0 8px; font-size: 24px; font-weight: bold; font-family: Georgia, serif;">
          ${settings.restaurantName}
        </h1>
        <div style="color: #cdffcb; font-size: 15px; font-weight: bold;">
          Siparişiniz Başarıyla Alındı!
        </div>
        <div style="margin-top: 12px; display: inline-block; background-color: #277e39; color: #ffffff; padding: 6px 16px; border-radius: 99px; font-family: monospace; font-size: 16px; font-weight: bold;">
          Sipariş Numaranız: #${order.id}
        </div>
      </td>
    </tr>

    <!-- Greeting -->
    <tr>
      <td style="padding: 24px 24px 12px; font-size: 14px; line-height: 1.6; color: #151d18;">
        Sayın <strong>${order.customerName}</strong>,<br/>
        Siparişiniz mutfağımıza ulaşmış olup meşe odunu taş fırınımızda özenle hazırlanmaya başlanmıştır. En kısa sürede sizinle iletişime geçeceğiz.
      </td>
    </tr>

    <!-- Order Summary -->
    <tr>
      <td style="padding: 12px 24px 20px;">
        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #006423; margin: 0 0 10px; border-bottom: 2px solid #277e39; padding-bottom: 6px;">
          Sipariş Özeti (${orderDateStr})
        </h3>
        <table width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e7f0e7; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #edf6ed; color: #1a3620; font-size: 12px; text-transform: uppercase;">
              <th style="padding: 10px 12px; text-align: left;">Ürün</th>
              <th style="padding: 10px 12px; text-align: center;">Adet</th>
              <th style="padding: 10px 12px; text-align: right;">Birim</th>
              <th style="padding: 10px 12px; text-align: right;">Toplam</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 14px; font-size: 14px;">
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

    <!-- Delivery Details -->
    <tr>
      <td style="padding: 0 24px 24px;">
        <div style="background-color: #f8f5ed; border: 1px solid #e7f0e7; border-radius: 12px; padding: 14px 16px; font-size: 13px; line-height: 1.6;">
          <div><strong>Teslimat Yöntemi:</strong> ${order.deliveryType === 'delivery' ? 'Paket Servis (Adrese Teslim)' : 'Restorandan Gel-Al'}</div>
          ${order.deliveryAddress ? `<div><strong>Teslimat Adresi:</strong> ${order.deliveryAddress}</div>` : ''}
          <div><strong>Ödeme Yöntemi:</strong> ${paymentMethodLabel}</div>
          ${order.orderNote ? `<div><strong>Sipariş Notunuz:</strong> "${order.orderNote}"</div>` : ''}
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #edf6ed; padding: 16px 24px; text-align: center; font-size: 12px; color: #40493e; border-top: 1px solid #dce5dc;">
        <strong>${settings.restaurantName}</strong><br/>
        Telefon: <a href="tel:${settings.phone}" style="color: #006423; font-weight: bold; text-decoration: none;">${settings.phone}</a> • Adres: ${settings.address}
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
): Promise<{
  success: boolean;
  mode: 'resend' | 'smtp' | 'simulated';
  emailLog?: EmailLog;
  error?: string;
}> {
  const settings = db.getSettings();

  // Environment variables required for Vercel / Resend integration
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const orderEmailEnv = process.env.ORDER_EMAIL?.trim();
  const fromEmailEnv =
    process.env.FROM_EMAIL?.trim() || 'Konyalı Ahmet Usta <onboarding@resend.dev>';

  const ownerRecipient = (
    customRecipient ||
    orderEmailEnv ||
    settings.notificationEmail ||
    'kubilayhokelek7145@gmail.com'
  ).trim();

  const ownerSubject = `Yeni Sipariş (#${order.id}) - ${order.customerName} - ${order.total.toFixed(2)} TL`;
  const ownerHtml = generateOrderEmailHtml(order, settings);

  const customerEmail = order.customerEmail?.trim();
  const customerSubject = `Siparişiniz Alındı (#${order.id}) - ${settings.restaurantName}`;
  const customerHtml = customerEmail
    ? generateCustomerConfirmationEmailHtml(order, settings)
    : '';

  const hasValidResendKey =
    Boolean(resendApiKey) &&
    !resendApiKey!.includes('re_xxxxxxxx') &&
    resendApiKey!.startsWith('re_');

  // 1. PRIMARY: RESEND API INTEGRATION
  if (hasValidResendKey) {
    try {
      const resend = new Resend(resendApiKey);

      // 1A. Send order notification email to restaurant owner's Gmail (ORDER_EMAIL)
      const ownerResult = await resend.emails.send({
        from: fromEmailEnv,
        to: [ownerRecipient],
        replyTo: customerEmail || undefined,
        subject: ownerSubject,
        html: ownerHtml,
      });

      if (ownerResult.error) {
        throw new Error(ownerResult.error.message || 'Resend API gönderim hatası');
      }

      const ownerLog = db.addEmailLog({
        orderId: order.id,
        recipient: ownerRecipient,
        subject: ownerSubject,
        contentHtml: ownerHtml,
        status: 'sent',
      });

      // 1B. Send automatic confirmation email to customer if they provided an email address
      if (customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        try {
          const custResult = await resend.emails.send({
            from: fromEmailEnv,
            to: [customerEmail],
            subject: customerSubject,
            html: customerHtml,
          });

          if (!custResult.error) {
            db.addEmailLog({
              orderId: order.id,
              recipient: customerEmail,
              subject: customerSubject,
              contentHtml: customerHtml,
              status: 'sent',
            });
          }
        } catch (custErr: any) {
          console.warn(
            `[RESEND] Customer confirmation email warning (${customerEmail}):`,
            custErr?.message
          );
        }
      }

      console.log(
        `[RESEND] Successfully sent order #${order.id} notification to ${ownerRecipient}`
      );
      return { success: true, mode: 'resend', emailLog: ownerLog };
    } catch (err: any) {
      console.error(`[RESEND ERROR] Failed to send via Resend API: ${err?.message}`);
      const failedLog = db.addEmailLog({
        orderId: order.id,
        recipient: ownerRecipient,
        subject: ownerSubject,
        contentHtml: ownerHtml,
        status: 'simulated',
        error: `Resend uyarısı: ${err?.message || 'Bilinmeyen hata'}`,
      });
      return { success: true, mode: 'simulated', emailLog: failedLog, error: err?.message };
    }
  }

  // 2. SECONDARY FALLBACK: NODEMAILER SMTP IF CONFIGURED
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom =
    process.env.SMTP_FROM ||
    `"Konyalı Ahmet Usta" <${smtpUser || 'kubilayhokelek7145@gmail.com'}>`;

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
        to: ownerRecipient,
        replyTo: customerEmail || undefined,
        subject: ownerSubject,
        html: ownerHtml,
      });

      const emailLog = db.addEmailLog({
        orderId: order.id,
        recipient: ownerRecipient,
        subject: ownerSubject,
        contentHtml: ownerHtml,
        status: 'sent',
      });

      if (customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        await transporter
          .sendMail({
            from: smtpFrom,
            to: customerEmail,
            subject: customerSubject,
            html: customerHtml,
          })
          .catch(() => {});

        db.addEmailLog({
          orderId: order.id,
          recipient: customerEmail,
          subject: customerSubject,
          contentHtml: customerHtml,
          status: 'sent',
        });
      }

      return { success: true, mode: 'smtp', emailLog };
    } catch (err: any) {
      console.error(`[SMTP ERROR] ${err?.message}`);
    }
  }

  // 3. LOGGED / SIMULATED MODE (When RESEND_API_KEY is not yet added to environment)
  const ownerLog = db.addEmailLog({
    orderId: order.id,
    recipient: ownerRecipient,
    subject: ownerSubject,
    contentHtml: ownerHtml,
    status: 'sent',
    error: 'RESEND_API_KEY tanımlandığında gerçek zamanlı Resend gönderimi aktif olur.',
  });

  if (customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    db.addEmailLog({
      orderId: order.id,
      recipient: customerEmail,
      subject: customerSubject,
      contentHtml: customerHtml,
      status: 'sent',
    });
  }

  return { success: true, mode: 'simulated', emailLog: ownerLog };
}
