import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """Send an HTML email via SMTP."""
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "msrtechhub1@gmail.com")
    smtp_pass = os.getenv("SMTP_PASSWORD", "hbyrxainnublovpi")
    from_email = os.getenv("SMTP_FROM_EMAIL", smtp_user)
    from_name = os.getenv("SMTP_FROM_NAME", "MSR TECH HUB")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{from_email}>"
    msg["To"] = to_email

    html_part = MIMEText(html_content, "html")
    msg.attach(html_part)

    try:
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=10) as server:
                server.login(smtp_user, smtp_pass)
                server.sendmail(from_email, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(smtp_server, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(from_email, [to_email], msg.as_string())
        logger.info(f"✅ Email successfully sent to {to_email} (Subject: {subject})")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to send email to {to_email}: {e}")
        return False


def send_password_reset_email(to_email: str, reset_otp: str) -> bool:
    """Send Password Reset Link / OTP Token email."""
    subject = "🔑 MSR TECH HUB — Password Reset Verification Code"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }}
            .card {{ max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }}
            .header {{ background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%); padding: 32px 24px; text-align: center; color: #ffffff; }}
            .header h1 {{ margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }}
            .content {{ padding: 32px 28px; color: #334155; line-height: 1.6; }}
            .otp-box {{ background: #f1f5f9; border: 2px dashed #0D9488; border-radius: 8px; padding: 18px; text-align: center; font-size: 28px; font-weight: 800; color: #0F766E; letter-spacing: 6px; margin: 24px 0; }}
            .footer {{ background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">
                <h1>MSR TECH HUB</h1>
            </div>
            <div class="content">
                <h2 style="color: #0F766E; margin-top: 0;">Password Reset Verification Code</h2>
                <p>Hello,</p>
                <p>We received a request to reset your MSR Tech Hub account password. Enter the 6-digit verification code below to reset your password:</p>
                <div class="otp-box">{reset_otp}</div>
                <p style="font-size: 13px; color: #64748b;">This code will expire in 15 minutes. If you did not request this password reset, please ignore this email or contact support.</p>
            </div>
            <div class="footer">
                &copy; MSR TECH HUB &middot; All Rights Reserved &middot; Official Automated Notification
            </div>
        </div>
    </body>
    </html>
    """
    return send_email(to_email, subject, html_content)


def send_otp_verification_email(to_email: str, otp_code: str) -> bool:
    """Send OTP Account Verification email."""
    subject = "🛡️ MSR TECH HUB — Account Signup OTP Verification"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }}
            .card {{ max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }}
            .header {{ background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%); padding: 32px 24px; text-align: center; color: #ffffff; }}
            .header h1 {{ margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }}
            .content {{ padding: 32px 28px; color: #334155; line-height: 1.6; }}
            .otp-box {{ background: #f1f5f9; border: 2px dashed #0D9488; border-radius: 8px; padding: 18px; text-align: center; font-size: 30px; font-weight: 800; color: #0F766E; letter-spacing: 8px; margin: 24px 0; }}
            .footer {{ background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">
                <h1>MSR TECH HUB</h1>
            </div>
            <div class="content">
                <h2 style="color: #0F766E; margin-top: 0;">Verify Your Account</h2>
                <p>Welcome to MSR Tech Hub! Enter the 6-digit One-Time Password (OTP) below to complete your registration:</p>
                <div class="otp-box">{otp_code}</div>
                <p style="font-size: 13px; color: #64748b;">This OTP code is valid for 15 minutes. Never share this code with anyone.</p>
            </div>
            <div class="footer">
                &copy; MSR TECH HUB &middot; All Rights Reserved
            </div>
        </div>
    </body>
    </html>
    """
    return send_email(to_email, subject, html_content)
