const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const SERVICE_MAP = {
  facility: '시설 설계 컨설팅',
  equipment: '장비 구축 컨설팅',
  legal: '법규 검토 컨설팅',
  license: '인허가 절차 대행',
  total: '종합 컨설팅 (전체)',
};

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '허용되지 않는 요청 방식입니다.' });
  }

  const { name, company, phone, email, service, message } = req.body;

  // Validate required fields
  if (!name || !phone) {
    return res.status(400).json({ error: '성함과 연락처는 필수 항목입니다.' });
  }

  const serviceName = SERVICE_MAP[service] || '선택 안 함';
  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const recipientEmail = process.env.RECIPIENT_EMAIL || 'jaiwshim@gmail.com';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ko">
    <head><meta charset="utf-8"></head>
    <body>
    <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0a2647 0%, #144272 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px;">새로운 상담 신청</h1>
        <p style="color: #7ec8e3; margin: 8px 0 0; font-size: 14px;">첨단재생의료 인허가 컨설팅</p>
      </div>
      <div style="background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; color: #666; width: 120px; font-weight: 600;">성함</td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; color: #333;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; color: #666; font-weight: 600;">기관/회사명</td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; color: #333;">${escapeHtml(company || '-')}</td>
          </tr>
          <tr>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; color: #666; font-weight: 600;">연락처</td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; color: #333;">${escapeHtml(phone)}</td>
          </tr>
          <tr>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; color: #666; font-weight: 600;">이메일</td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; color: #333;">${escapeHtml(email || '-')}</td>
          </tr>
          <tr>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; color: #666; font-weight: 600;">관심 서비스</td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; color: #333;">${serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; color: #666; font-weight: 600;">문의 내용</td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; color: #333; white-space: pre-wrap;">${escapeHtml(message || '-')}</td>
          </tr>
          <tr>
            <td style="padding: 12px 8px; color: #666; font-weight: 600;">신청 시간</td>
            <td style="padding: 12px 8px; color: #333;">${now}</td>
          </tr>
        </table>
        <div style="margin-top: 24px; text-align: center;">
          <a href="tel:${escapeHtml(phone)}" style="display: inline-block; background: #0a2647; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; margin: 6px;">&#9742; 전화 걸기</a>
          ${email ? `<a href="mailto:${escapeHtml(email)}" style="display: inline-block; background: #144272; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; margin: 6px;">&#9993; 이메일 답장</a>` : ''}
          <a href="https://consulting-website-swart.vercel.app" style="display: inline-block; background: #2C74B3; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; margin: 6px;">&#127760; 웹사이트 방문</a>
        </div>
      </div>
      <p style="text-align: center; color: #999; font-size: 12px; margin-top: 16px;">
        이 메일은 첨단재생의료 컨설팅 웹사이트 상담 신청 폼에서 자동 발송되었습니다.
      </p>
    </div>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: '첨단재생의료 컨설팅 <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: `[첨단재생의료] 새로운 상담 신청 - ${escapeHtml(name)}`,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: '이메일 전송에 실패했습니다.' });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

function escapeHtml(text) {
  let result = '';
  for (const char of String(text)) {
    const code = char.codePointAt(0);
    if (code > 127) {
      result += `&#${code};`;
    } else {
      switch (char) {
        case '&': result += '&amp;'; break;
        case '<': result += '&lt;'; break;
        case '>': result += '&gt;'; break;
        case '"': result += '&quot;'; break;
        case "'": result += '&#039;'; break;
        default: result += char;
      }
    }
  }
  return result;
}
