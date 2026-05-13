export default function HelpAndSupport() {
  return (
    <div className="page-content container">
      <h2 className="text-2xl mb-lg">Help & Support Center</h2>
      
      <div className="card mb-lg">
        <h3 className="text-lg mb-sm">Frequently Asked Questions</h3>
        <div className="flex-col gap-md">
          <div>
            <h4 style={{ fontWeight: 500 }}>How do I reset my password?</h4>
            <p className="text-muted" style={{ fontSize: '14px', marginTop: '4px' }}>Go to the login screen and click 'Forgot Password'. Follow the email instructions.</p>
          </div>
          <div>
            <h4 style={{ fontWeight: 500 }}>What is the SLA for technical support?</h4>
            <p className="text-muted" style={{ fontSize: '14px', marginTop: '4px' }}>Critical issues are addressed within 2 hours. Standard issues within 24 hours.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg mb-sm">Contact Information</h3>
        <p className="text-muted" style={{ fontSize: '14px' }}>If you need immediate assistance, please call our IT Helpdesk at (555) 123-4567.</p>
      </div>
    </div>
  );
}
