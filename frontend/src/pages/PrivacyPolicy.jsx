export default function PrivacyPolicy() {
  return (
    <div className="page-content container">
      <div className="card">
        <h2 className="text-2xl mb-lg">Privacy Policy</h2>
        
        <div className="text-muted flex-col gap-md" style={{ lineHeight: '1.6' }}>
          <p>
            This Privacy Policy describes how we collect, use, and handle your information when you use our corporate helpdesk platform.
          </p>
          
          <h3 className="text-lg mt-sm" style={{ color: 'var(--text-main)' }}>1. Information Collection</h3>
          <p>
            We collect the information you provide when submitting a ticket, including your email address, department, and any files you attach to your requests.
          </p>

          <h3 className="text-lg mt-sm" style={{ color: 'var(--text-main)' }}>2. Use of Information</h3>
          <p>
            Your information is used strictly to provide support services, resolve your technical issues, and improve our internal IT processes. We do not sell or share your data with external third parties.
          </p>

          <h3 className="text-lg mt-sm" style={{ color: 'var(--text-main)' }}>3. Data Security</h3>
          <p>
            We implement industry-standard security measures to protect your submitted data. All attachments and communications are encrypted at rest and in transit.
          </p>
        </div>
      </div>
    </div>
  );
}
