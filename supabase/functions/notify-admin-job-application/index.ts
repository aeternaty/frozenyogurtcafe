import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = 'info@getyocafe.com'

serve(async (req) => {
  try {
    const { record } = await req.json()

    const emailData = {
      from: 'FrozenYogurtCafe <onboarding@resend.dev>',
      to: ADMIN_EMAIL,
      subject: `New Job Application - ${record.applicant_name}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #FF8A3D 0%, #FF6B35 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">FrozenYogurtCafe</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">New Job Application Received</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #FF8A3D;">
              <h2 style="color: #FF8A3D; margin: 0 0 20px 0; font-size: 20px;">Applicant Information</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                    <strong style="color: #495057;">Name:</strong>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6; text-align: right;">
                    <span style="color: #212529; font-weight: 600;">${record.applicant_name}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                    <strong style="color: #495057;">Age:</strong>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6; text-align: right;">
                    <span style="color: #212529;">${record.applicant_age}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                    <strong style="color: #495057;">Email:</strong>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6; text-align: right;">
                    <a href="mailto:${record.applicant_email}" style="color: #0066cc; text-decoration: none;">${record.applicant_email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                    <strong style="color: #495057;">Phone:</strong>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6; text-align: right;">
                    <a href="tel:${record.applicant_phone}" style="color: #0066cc; text-decoration: none;">${record.applicant_phone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                    <strong style="color: #495057;">Location:</strong>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6; text-align: right;">
                    <span style="color: #212529; text-transform: capitalize;">${record.preferred_location.replace('-', ' ')}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                    <strong style="color: #495057;">Position:</strong>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6; text-align: right;">
                    <span style="color: #212529; text-transform: capitalize;">${record.position_type.replace('-', ' ')}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <strong style="color: #495057;">Availability:</strong>
                  </td>
                  <td style="padding: 10px 0; text-align: right;">
                    <span style="color: #212529; text-transform: capitalize;">${record.availability}</span>
                  </td>
                </tr>
              </table>
            </div>
            
            ${record.experience ? `
            <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">Experience</h3>
              <p style="color: #856404; margin: 0; line-height: 1.6;">${record.experience}</p>
            </div>
            ` : ''}
            
            <div style="background: #d1ecf1; padding: 20px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #17a2b8;">
              <h3 style="color: #0c5460; margin: 0 0 10px 0; font-size: 16px;">Why Join Us?</h3>
              <p style="color: #0c5460; margin: 0; line-height: 1.6;">${record.why_join}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://frozenyogurtcafe.com/admin.html" 
                 style="display: inline-block; background: linear-gradient(135deg, #FF8A3D 0%, #FF6B35 100%); 
                        color: white; padding: 15px 40px; text-decoration: none; border-radius: 10px; 
                        font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 138, 61, 0.4);">
                View in Admin Panel
              </a>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; font-size: 12px; margin: 0;">
              Submitted on: ${new Date(record.created_at).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}
            </p>
            <p style="color: #6c757d; font-size: 11px; margin: 10px 0 0 0;">
              IP: ${record.ip_address || 'N/A'}
            </p>
          </div>
        </div>
      `
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify(emailData)
    })

    const responseData = await resendResponse.json()

    if (!resendResponse.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(responseData)}`)
    }

    console.log('Email sent successfully:', responseData)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin notified successfully',
        emailId: responseData.id
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error sending notification:', error)

    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})