import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import EditableText from '../EditableText';

export default function ContactFormSection({ content, siteSettings, onUpdate }) {
  const fontH = siteSettings?.font_heading || 'Outfit';
  const primary = siteSettings?.brand_colors?.primary || '#6366f1';
  const secondary = siteSettings?.brand_colors?.secondary || '#1e293b';
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const destEmail = siteSettings?.footer?.email || '';
    
    if (!destEmail || destEmail === 'hello@yourcompany.com') {
      // If it's the default mock email, just simulate submission success
      setSent(true);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${destEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          Name: form.name,
          Email: form.email,
          Phone: form.phone,
          Message: form.message,
          _subject: 'New Website Inquiry (SiteCraft)'
        })
      });
      if (response.ok) {
        setSent(true);
      } else {
        alert('Could not submit form. Please verify the destination email.');
      }
    } catch (err) {
      console.error(err);
      alert('Error sending message. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ padding: '80px 24px', background: secondary }}>
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <EditableText
          tag="h2"
          value={content.heading || 'Contact Us'}
          onSave={(v) => onUpdate?.({ heading: v })}
          style={{ fontFamily: `'${fontH}', sans-serif`, fontSize: '2.25rem', fontWeight: 800, color: 'white', margin: '0 0 12px' }}
        />
        <EditableText
          tag="p"
          value={content.subheading || "We'd love to hear from you."}
          onSave={(v) => onUpdate?.({ subheading: v })}
          style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 40, display: 'block' }}
        />
        {sent ? (
          <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 16, padding: '32px', color: '#86efac' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <CheckCircle2 size={40} color="#86efac" />
            </div>
            <p style={{ margin: 0, fontSize: '1.1rem' }}>Thank you! We'll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[['name','text','Your Name'],['email','email','Email Address'],['phone','tel','Phone Number']].map(([name,type,ph]) => (
              <input key={name} name={name} type={type} placeholder={ph} value={form[name]} onChange={handleChange}
                style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'white', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none' }} />
            ))}
            <textarea name="message" placeholder="Your Message" rows={5} value={form.message} onChange={handleChange}
              style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'white', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} />
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                background: primary, 
                border: '1px solid rgba(255, 255, 255, 0.25)', 
                borderRadius: 10, 
                color: 'white', 
                padding: '14px', 
                fontWeight: 700, 
                fontSize: '1rem', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                fontFamily: 'inherit', 
                boxShadow: `0 8px 24px ${primary}44`,
                transition: 'all 0.2s ease',
                opacity: loading ? 0.8 : 1
              }}
              onMouseEnter={(e) => {
                if (loading) return;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 12px 30px ${primary}66`;
                e.currentTarget.style.filter = 'brightness(1.1)';
              }}
              onMouseLeave={(e) => {
                if (loading) return;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${primary}44`;
                e.currentTarget.style.filter = 'none';
              }}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
            {siteSettings?.whatsapp_number && (
              <a
                href={`https://wa.me/${siteSettings.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#25D366', color: 'white', textDecoration: 'none',
                  padding: '14px', borderRadius: 10, fontWeight: 700, fontSize: '1rem',
                  boxShadow: '0 8px 24px rgba(37,211,102,0.3)', transition: 'transform 0.15s',
                  fontFamily: 'inherit'
                }}
              >
                <svg style={{ width: 18, height: 18, fill: 'currentColor' }} viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.023 14.053.977 11.993.977c-5.442 0-9.87 4.372-9.874 9.802-.001 1.77.463 3.5 1.34 5.043L2.453 20.3l4.194-1.146zm11.233-5.232c-.3-.15-1.771-.875-2.04-.972-.27-.099-.467-.15-.663.15-.195.3-.757.972-.929 1.171-.173.199-.347.223-.647.073-.3-.15-1.268-.467-2.414-1.488-.891-.795-1.492-1.778-1.667-2.078-.175-.3-.019-.461.13-.61.135-.133.3-.347.45-.52.15-.173.2-.3.3-.5.1-.199.05-.375-.025-.524-.075-.15-.663-1.6-.908-2.188-.24-.575-.483-.497-.663-.506-.17-.008-.367-.01-.563-.01-.197 0-.518.073-.789.375-.271.3-.103.972-.103.972s-.1.654-.055.942c.046.29.176.435.31.57.133.136.27.27.42.42m10.1-2.28c-.1-.1-.3-.2-.5-.3"></path></svg>
                Chat on WhatsApp
              </a>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
