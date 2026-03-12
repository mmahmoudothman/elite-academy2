// Telegram Bot Notification Service
// Sends notifications to a configured Telegram chat via Bot API

import { getSiteConfig } from './firestoreService';

interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  notifications: {
    newRegistration: boolean;
    newEnrollment: boolean;
    newPayment: boolean;
    newContact: boolean;
  };
}

async function getConfig(): Promise<TelegramConfig | null> {
  try {
    const config = await getSiteConfig();
    const tg = config?.telegram;
    if (tg?.enabled && tg?.botToken && tg?.chatId) {
      return tg;
    }
  } catch { /* ignore */ }
  return null;
}

async function sendMessage(text: string, config?: TelegramConfig | null): Promise<boolean> {
  const cfg = config || await getConfig();
  if (!cfg || !cfg.botToken || !cfg.chatId) return false;

  try {
    const url = `https://api.telegram.org/bot${cfg.botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cfg.chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error('Telegram API error:', data);
    }
    return response.ok;
  } catch (err) {
    console.error('Telegram notification failed:', err);
    return false;
  }
}

export async function notifyNewRegistration(name: string, email: string): Promise<boolean> {
  const config = await getConfig();
  if (!config?.notifications.newRegistration) return false;

  return sendMessage(
    `🎓 <b>New Registration</b>\n\n` +
    `<b>Name:</b> ${name}\n` +
    `<b>Email:</b> ${email}\n` +
    `<b>Time:</b> ${new Date().toLocaleString()}`
  );
}

export async function notifyNewEnrollment(studentName: string, courseTitle: string, amount: number, currency: string): Promise<boolean> {
  const config = await getConfig();
  if (!config?.notifications.newEnrollment) return false;

  return sendMessage(
    `📚 <b>New Enrollment</b>\n\n` +
    `<b>Student:</b> ${studentName}\n` +
    `<b>Course:</b> ${courseTitle}\n` +
    `<b>Amount:</b> ${amount.toLocaleString()} ${currency}\n` +
    `<b>Time:</b> ${new Date().toLocaleString()}`
  );
}

export async function notifyNewPayment(studentName: string, amount: number, currency: string, method: string): Promise<boolean> {
  const config = await getConfig();
  if (!config?.notifications.newPayment) return false;

  return sendMessage(
    `💳 <b>Payment Received</b>\n\n` +
    `<b>Student:</b> ${studentName}\n` +
    `<b>Amount:</b> ${amount.toLocaleString()} ${currency}\n` +
    `<b>Method:</b> ${method}\n` +
    `<b>Time:</b> ${new Date().toLocaleString()}`
  );
}

export async function notifyNewContact(name: string, subject: string, inquiryType?: string): Promise<boolean> {
  const config = await getConfig();
  if (!config?.notifications.newContact) return false;

  return sendMessage(
    `📩 <b>New Contact Message</b>\n\n` +
    `<b>From:</b> ${name}\n` +
    `<b>Subject:</b> ${subject}\n` +
    (inquiryType ? `<b>Type:</b> ${inquiryType}\n` : '') +
    `<b>Time:</b> ${new Date().toLocaleString()}`
  );
}

export async function sendTestMessage(telegramConfig?: TelegramConfig): Promise<boolean> {
  const config = telegramConfig || await getConfig();
  if (!config || !config.botToken || !config.chatId) return false;

  return sendMessage(
    `✅ <b>Elite Academy - Test Notification</b>\n\n` +
    `Telegram notifications are working correctly!\n` +
    `<b>Time:</b> ${new Date().toLocaleString()}`,
    config
  );
}
