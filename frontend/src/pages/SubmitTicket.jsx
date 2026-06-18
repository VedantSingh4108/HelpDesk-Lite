import { useState } from 'react';

export default function SubmitTicket() {
  // --- Ticket Form State ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null); // <-- NEW: State for the file
  const [alertMsg, setAlertMsg] = useState(null); // To show success or error

  // --- Backend API Submission Logic ---
  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setAlertMsg(null);

    const token = localStorage.getItem('helpdeskToken');

    if (!token) {
      setAlertMsg({ type: 'error', text: 'You must be logged in to submit a ticket.' });
      return;
    }

    // NEW: We must use FormData instead of JSON when sending files
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (file) {
      formData.append('attachment', file); // 'attachment' matches upload.single('attachment') in your backend
    }

    try {
      // CHANGED: Pointing to localhost for local testing. Change back to render later!
      const response = await fetch('https://helpdesk-backend-aer8.onrender.com/api/tickets', {
        method: 'POST',
        headers: {
          // IMPORTANT: Do NOT manually set 'Content-Type' when sending FormData.
          // The browser automatically sets it to 'multipart/form-data' with the correct boundary.
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setTitle('');
        setDescription('');
        setFile(null); // Clear the file after success
        setAlertMsg({ type: 'success', text: 'Ticket successfully submitted!' });
      } else {
        setAlertMsg({ type: 'error', text: data.message || 'Failed to submit ticket.' });
      }
    } catch (error) {
      setAlertMsg({ type: 'error', text: 'Server error. Is the local backend running?' });
    }
  };

  return (
    <div className="page-content container" style={{ position: 'relative', height: '100%', paddingBottom: '100px' }}>
      <h2 className="text-2xl mb-lg text-center" style={{ textAlign: 'center' }}>Submit a Request</h2>

      <div className="flex justify-center w-full">
        {/* Main Form Area */}
        <div className="card w-full" style={{ maxWidth: '800px' }}>

          {/* Alert Message Display */}
          {alertMsg && (
            <div style={{
              padding: '12px',
              marginBottom: '20px',
              borderRadius: '8px',
              backgroundColor: alertMsg.type === 'error' ? '#fee2e2' : '#dcfce7',
              color: alertMsg.type === 'error' ? '#991b1b' : '#166534',
              textAlign: 'center',
              border: `1px solid ${alertMsg.type === 'error' ? '#f87171' : '#86efac'}`
            }}>
              {alertMsg.text}
            </div>
          )}

          <form className="flex-col gap-md" onSubmit={handleTicketSubmit}>

            {/* Added a subtle UI hint that the AI is working */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ✨ AI Auto-Categorized
              </span>
            </div>

            <div className="flex-col gap-xs">
              <label className="label">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="Brief summary of the issue"
              />
            </div>

            <div className="flex-col gap-xs">
              <label className="label">Description</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
                rows="6"
                placeholder="Provide detailed information about the problem..."
                style={{ resize: 'vertical' }}
              ></textarea>
            </div>

            <div className="flex-col gap-xs">
              <label className="label">Attachments (Optional)</label>

              {/* NEW: Changed div to a <label> so clicking the box opens the file dialog automatically */}
              <label style={{
                border: '1px dashed var(--border)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-std)',
                textAlign: 'center',
                backgroundColor: 'var(--background)',
                display: 'block', // Ensures the label acts like a full-width block
                cursor: 'pointer' // Shows the user they can click it
              }}>
                <p className="text-muted" style={{ fontSize: '14px', margin: 0 }}>
                  {/* NEW: Show the selected file name so the user knows it worked */}
                  {file ? `📄 ${file.name}` : 'Drag and drop files here, or click to browse'}
                </p>
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => setFile(e.target.files[0])} // Captures the file into state
                />
              </label>
            </div>

            <div className="flex justify-end gap-sm mt-md">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setTitle(''); setDescription(''); setFile(null); }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">Submit Ticket</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}